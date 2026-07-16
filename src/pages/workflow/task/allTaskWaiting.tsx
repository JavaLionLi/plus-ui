import { BellOutlined, EyeOutlined, SettingOutlined, SwapOutlined, UserAddOutlined } from '@ant-design/icons';
import { ModalForm, PageContainer, ProTable, type ActionType, type ProColumns } from '@ant-design/pro-components';
import { useBoolean } from 'ahooks';
import { Badge, Button, Form, message, Tabs } from 'antd';
import { useCallback, useMemo, useRef, useState, type Key } from 'react';
import type { UserVO } from '@/api/system/user/types';
import type { PageResult, R } from '@/api/types';
import type { FlowTaskVO, TaskQuery } from '@/api/workflow/task/types';
import { pageByAllTaskFinish, pageByAllTaskWait, updateAssignee, urgeTask } from '@/api/workflow/task';
import workflowCommon from '@/api/workflow/workflowCommon';
import DictTag from '@/components/common/DictTag';
import EllipsisText from '@/components/common/EllipsisText';
import RowActions from '@/components/common/RowActions';
import UserSelect from '@/components/common/UserSelect';
import MessageType from '@/components/workflow/MessageType';
import ProcessMeddle from '@/components/workflow/ProcessMeddle';
import UserNameDisplay from '@/components/workflow/UserNameDisplay';
import { useDict } from '@/hooks/useDict';
import { useSearchReset } from '@/hooks/useSearchReset';
import { useTableScroll } from '@/hooks/useTableScroll';
import { dictOptions } from '@/utils/dict';
import { confirmTitleSafe } from '@/utils/modal';
import { toPageQuery, toTableData } from '@/utils/ruoyi';
type AllTaskTab = 'waiting' | 'finish';
type UserSelectMode = 'applicant' | 'assignee';
type TaskTableRow = FlowTaskVO & {
  tableRowKey: string;
};

function requestAllTaskList(tab: AllTaskTab, query: TaskQuery): Promise<R<PageResult<FlowTaskVO>>> {
  if (tab === 'waiting') return pageByAllTaskWait(query);
  return pageByAllTaskFinish(query);
}

function openBusinessForm(row: FlowTaskVO) {
  workflowCommon.routerJump({
    businessId: row.businessId,
    taskId: row.id,
    type: 'view',
    formCustom: row.formCustom || 'N',
    formPath: row.formPath || '/workflow/leaveEdit/index'
  });
}

export default function WorkflowAllTaskWaitingPage() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { tableScroll } = useTableScroll(1464);
  const [urgeForm] = Form.useForm<{ message: string; messageType: string[] }>();
  const dicts = useDict('wf_business_status', 'wf_task_status', 'sys_normal_disable');
  const [activeTab, setActiveTab] = useState<AllTaskTab>('waiting');
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<TaskTableRow[]>([]);
  const [selectedApplicants, setSelectedApplicants] = useState<UserVO[]>([]);
  const [userModalOpen, { setTrue: openUserModal, setFalse: closeUserModal }] = useBoolean(false);
  const [userSelectMode, setUserSelectMode] = useState<UserSelectMode>('applicant');
  const [urgeOpen, { setTrue: openUrgeModal, setFalse: closeUrgeModal }] = useBoolean(false);
  const [meddleOpen, { setTrue: openMeddleModal, setFalse: closeMeddleModal }] = useBoolean(false);
  const [meddleTaskId, setMeddleTaskId] = useState<string | number>();

  const businessStatusOptions = useMemo(() => dictOptions(dicts.wf_business_status), [dicts.wf_business_status]);
  const taskStatusOptions = useMemo(() => dictOptions(dicts.wf_task_status), [dicts.wf_task_status]);
  const selectedTaskIds = [...new Set(selectedRows.map(item => item.id).filter(Boolean))];
  const selectedApplicantIds = selectedApplicants.map(item => item.userId).filter(Boolean) as Array<string | number>;
  const resetSearch = useSearchReset(
    actionRef,
    useCallback(() => setSelectedApplicants([]), [])
  );

  const changeTab = (key: string) => {
    setActiveTab(key as AllTaskTab);
    setSelectedRowKeys([]);
    setSelectedRows([]);
    setTimeout(() => actionRef.current?.reloadAndRest?.(), 0);
  };

  const openApplicantSelect = () => {
    setUserSelectMode('applicant');
    openUserModal();
  };

  const openAssigneeSelect = () => {
    if (!selectedTaskIds.length) {
      message.warning('请选择任务');
      return;
    }
    setUserSelectMode('assignee');
    openUserModal();
  };

  const submitUserSelect = async (users: UserVO[]) => {
    if (userSelectMode === 'applicant') {
      setSelectedApplicants(users);
      closeUserModal();
      actionRef.current?.reloadAndRest?.();
      return;
    }

    if (userSelectMode === 'assignee') {
      const user = users[0];
      if (!user?.userId) {
        message.warning('请选择用户');
        return;
      }
      const userId = user.userId;
      if (!(await confirmTitleSafe('是否确认提交？'))) return;
      await updateAssignee(selectedTaskIds, userId);
      message.success('操作成功');
      closeUserModal();
      setSelectedRowKeys([]);
      setSelectedRows([]);
      actionRef.current?.reload();
      return;
    }
  };

  const clearApplicantFilter = () => {
    setSelectedApplicants([]);
    actionRef.current?.reloadAndRest?.();
  };

  const submitUrge = async (values: { message: string; messageType: string[] }) => {
    if (!(await confirmTitleSafe('是否确认提交？'))) return false;
    await urgeTask({ ...values, taskIdList: selectedTaskIds });
    message.success('操作成功');
    urgeForm.resetFields();
    setSelectedRowKeys([]);
    setSelectedRows([]);
    actionRef.current?.reload();
    return true;
  };

  const openMeddle = (row: FlowTaskVO) => {
    setMeddleTaskId(row.id);
    openMeddleModal();
  };

  const columns: ProColumns<TaskTableRow>[] = [
    {
      title: '业务编码',
      dataIndex: 'businessCode',
      search: false,
      width: 160,
      render: (_, row) => <EllipsisText value={row.businessCode} maxWidth={140} />
    },
    {
      title: '业务标题',
      dataIndex: 'businessTitle',
      search: false,
      width: 180,
      render: (_, row) => <EllipsisText value={row.businessTitle} maxWidth={160} />
    },
    {
      title: '流程定义名称',
      dataIndex: 'flowName',
      width: 180,
      render: (_, row) => <EllipsisText value={row.flowName} maxWidth={160} />
    },
    {
      title: '流程定义编码',
      dataIndex: 'flowCode',
      search: false,
      width: 170,
      render: (_, row) => <EllipsisText value={row.flowCode} maxWidth={150} />
    },
    {
      title: '流程分类',
      dataIndex: 'categoryName',
      search: false,
      width: 150,
      render: (_, row) => <EllipsisText value={row.categoryName} maxWidth={130} />
    },
    {
      title: '版本号',
      dataIndex: 'version',
      search: false,
      width: 100,
      render: (_, row) => (row.version ? `v${row.version}.0` : '-')
    },
    {
      title: '任务名称',
      dataIndex: 'nodeName',
      fieldProps: { id: 'workflow-all-task-node-name' },
      width: 150,
      render: (_, row) => <EllipsisText value={row.nodeName} maxWidth={130} />
    },
    {
      title: '申请人',
      dataIndex: 'createByName',
      search: false,
      width: 130,
      render: (_, row) => <EllipsisText value={row.createByName} maxWidth={110} />
    },
    {
      title: '办理人',
      dataIndex: activeTab === 'waiting' ? 'assigneeNames' : 'approverName',
      search: false,
      ellipsis: true,
      width: 180,
      render: (_, row) => <UserNameDisplay content={activeTab === 'waiting' ? row.assigneeNames : row.approverName} />
    },
    {
      title: '流程状态',
      dataIndex: 'flowStatus',
      valueType: 'select',
      search: false,
      width: 120,
      fieldProps: { options: businessStatusOptions },
      render: (_, row) => <DictTag options={dicts.wf_business_status} value={row.flowStatus} />
    },
    ...(activeTab === 'finish'
      ? [
          {
            title: '任务状态',
            dataIndex: 'flowTaskStatus',
            valueType: 'select' as const,
            search: false,
            width: 120,
            fieldProps: { options: taskStatusOptions },
            render: (_: unknown, row: TaskTableRow) => (
              <DictTag options={dicts.wf_task_status} value={row.flowTaskStatus} />
            )
          }
        ]
      : []),
    { title: '创建时间', dataIndex: 'createTime', valueType: 'dateTime', search: false, width: 170 },
    {
      title: '操作',
      valueType: 'option',
      width: activeTab === 'waiting' ? 120 : 104,
      fixed: 'right',
      render: (_, row) => (
        <RowActions
          actions={[
            { key: 'view', label: '查看', icon: <EyeOutlined />, onClick: () => openBusinessForm(row) },
            activeTab === 'waiting' && {
              key: 'meddle',
              label: '流程干预',
              icon: <SettingOutlined />,
              onClick: () => openMeddle(row)
            }
          ]}
        />
      )
    }
  ];

  return (
    <PageContainer title="全部任务">
      <Tabs
        activeKey={activeTab}
        onChange={changeTab}
        items={[
          { key: 'waiting', label: '待办任务' },
          { key: 'finish', label: '已办任务' }
        ]}
      />
      <ProTable<TaskTableRow, TaskQuery>
        actionRef={actionRef}
        rowKey="tableRowKey"
        columns={columns}
        scroll={tableScroll}
        search={{ labelWidth: 100 }}
        form={{ onReset: resetSearch }}
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys, rows) => {
            setSelectedRowKeys(keys);
            setSelectedRows(rows);
          }
        }}
        request={async params => {
          const query = toPageQuery(params);
          const res = await requestAllTaskList(activeTab, {
            ...query,
            createByIds: selectedApplicantIds
          });
          const tableData = toTableData(res);
          return {
            ...tableData,
            data: tableData.data.map((row, index) => ({
              ...row,
              tableRowKey: `${activeTab}:${query.pageNum || 1}:${index}`
            }))
          };
        }}
        toolbar={{ title: activeTab === 'waiting' ? '全部待办任务' : '全部已办任务' }}
        toolBarRender={() => [
          <Badge key="applicant" count={selectedApplicantIds.length} size="small">
            <Button icon={<UserAddOutlined />} onClick={openApplicantSelect}>
              选择申请人
            </Button>
          </Badge>,
          selectedApplicantIds.length > 0 && (
            <Button key="clearApplicant" onClick={clearApplicantFilter}>
              清空申请人
            </Button>
          ),
          activeTab === 'waiting' && (
            <Button
              key="assignee"
              icon={<SwapOutlined />}
              disabled={!selectedTaskIds.length}
              onClick={openAssigneeSelect}
            >
              修改办理人
            </Button>
          ),
          activeTab === 'waiting' && (
            <Button
              key="urge"
              icon={<BellOutlined />}
              disabled={!selectedTaskIds.length}
              onClick={() => {
                urgeForm.setFieldsValue({ message: '', messageType: ['1'] });
                openUrgeModal();
              }}
            >
              催办
            </Button>
          )
        ]}
      />

      <UserSelect
        title={userSelectMode === 'applicant' ? '选择申请人' : '选择办理人'}
        open={userModalOpen}
        onOpenChange={open => (open ? openUserModal() : closeUserModal())}
        value={userSelectMode === 'applicant' ? selectedApplicants : undefined}
        multiple={userSelectMode !== 'assignee'}
        onConfirm={submitUserSelect}
      />

      <ModalForm<{ message: string; messageType: string[] }>
        title="催办"
        open={urgeOpen}
        form={urgeForm}
        layout="vertical"
        initialValues={{ messageType: ['1'] }}
        modalProps={{ forceRender: true, onCancel: closeUrgeModal }}
        onOpenChange={open => !open && closeUrgeModal()}
        onFinish={submitUrge}
      >
        <MessageType messageRules={[{ required: true, message: '请输入消息内容' }]} />
      </ModalForm>

      <ProcessMeddle
        open={meddleOpen}
        taskId={meddleTaskId}
        onOpenChange={open => (open ? openMeddleModal() : closeMeddleModal())}
        onSuccess={() => actionRef.current?.reload()}
      />
    </PageContainer>
  );
}
