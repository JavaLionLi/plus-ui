import { EditOutlined, EyeOutlined, UserAddOutlined } from '@ant-design/icons';
import { PageContainer, ProTable, type ActionType, type ProColumns } from '@ant-design/pro-components';
import { useBoolean } from 'ahooks';
import { Badge, Button } from 'antd';
import { useMemo, useRef, useState } from 'react';
import type { UserVO } from '@/api/system/user/types';
import type { PageResult, R } from '@/api/types';
import type { FlowTaskVO, TaskQuery } from '@/api/workflow/task/types';
import { pageByTaskCopy, pageByTaskFinish, pageByTaskWait } from '@/api/workflow/task';
import workflowCommon from '@/api/workflow/workflowCommon';
import DictTag from '@/components/common/DictTag';
import EllipsisText from '@/components/common/EllipsisText';
import RowActions from '@/components/common/RowActions';
import UserSelect from '@/components/common/UserSelect';
import UserNameDisplay from '@/components/workflow/UserNameDisplay';
import { useDict } from '@/hooks/useDict';
import { useTableScroll } from '@/hooks/useTableScroll';
import { dictOptions } from '@/utils/dict';
import { toPageQuery, toTableData } from '@/utils/ruoyi';

type TaskListType = 'wait' | 'finish' | 'copy';

interface WorkflowTaskListPageProps {
  type: TaskListType;
}

const pageTitle: Record<TaskListType, string> = {
  wait: '待办任务',
  finish: '已办任务',
  copy: '抄送任务'
};

function requestTaskList(type: TaskListType, query: TaskQuery): Promise<R<PageResult<FlowTaskVO>>> {
  if (type === 'wait') return pageByTaskWait(query);
  if (type === 'finish') return pageByTaskFinish(query);
  return pageByTaskCopy(query);
}

function openBusinessForm(row: FlowTaskVO, type: 'approval' | 'view') {
  workflowCommon.routerJump({
    businessId: row.businessId,
    taskId: row.id,
    type,
    formCustom: row.formCustom || 'N',
    formPath: row.formPath || '/workflow/leaveEdit/index'
  });
}

export default function WorkflowTaskListPage({ type }: WorkflowTaskListPageProps) {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { tableScroll } = useTableScroll(1460);
  const dicts = useDict('wf_business_status', 'wf_task_status');
  const [selectedApplicants, setSelectedApplicants] = useState<UserVO[]>([]);
  const [applicantOpen, { setTrue: openApplicantModal, setFalse: closeApplicantModal }] = useBoolean(false);
  const businessStatusOptions = useMemo(() => dictOptions(dicts.wf_business_status), [dicts.wf_business_status]);
  const taskStatusOptions = useMemo(() => dictOptions(dicts.wf_task_status), [dicts.wf_task_status]);
  const showApplicantFilter = type !== 'copy';
  const selectedApplicantIds = selectedApplicants.map(item => item.userId).filter(Boolean) as Array<string | number>;

  const openApplicantSelect = () => {
    openApplicantModal();
  };

  const submitApplicantSelect = (users: UserVO[]) => {
    setSelectedApplicants(users);
    closeApplicantModal();
    actionRef.current?.reloadAndRest?.();
  };

  const clearApplicantFilter = () => {
    setSelectedApplicants([]);
    actionRef.current?.reloadAndRest?.();
  };

  const resetSearch = () => {
    if (showApplicantFilter) {
      setSelectedApplicants([]);
      setTimeout(() => actionRef.current?.reloadAndRest?.(), 0);
    }
  };

  const columns: ProColumns<FlowTaskVO>[] = [
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
      title: '任务名称',
      dataIndex: 'nodeName',
      fieldProps: { id: `workflow-task-${type}-node-name` },
      width: 150,
      render: (_, row) => <EllipsisText value={row.nodeName} maxWidth={130} />
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
    ...(type !== 'wait'
      ? [
          {
            title: '版本号',
            dataIndex: 'version',
            search: false,
            width: 100,
            render: (_: unknown, row: FlowTaskVO) => (row.version ? `v${row.version}.0` : '-')
          }
        ]
      : []),
    ...(type !== 'copy'
      ? [
          {
            title: '申请人',
            dataIndex: 'createByName',
            search: false,
            width: 130,
            render: (_: unknown, row: FlowTaskVO) => <EllipsisText value={row.createByName} maxWidth={110} />
          },
          type === 'wait'
            ? {
                title: '办理人',
                dataIndex: 'assigneeNames',
                search: false,
                width: 180,
                render: (_: unknown, row: FlowTaskVO) => <UserNameDisplay content={row.assigneeNames} />
              }
            : {
                title: '办理人',
                dataIndex: 'approverName',
                search: false,
                width: 180,
                render: (_: unknown, row: FlowTaskVO) => <UserNameDisplay content={row.approverName} />
              }
        ]
      : []),
    {
      title: '流程状态',
      dataIndex: 'flowStatus',
      valueType: 'select',
      search: false,
      width: 120,
      fieldProps: { options: businessStatusOptions },
      render: (_, row) => <DictTag options={dicts.wf_business_status} value={row.flowStatus} />
    },
    ...(type === 'finish'
      ? [
          {
            title: '任务状态',
            dataIndex: 'flowTaskStatus',
            valueType: 'select' as const,
            search: false,
            width: 120,
            fieldProps: { options: taskStatusOptions },
            render: (_: unknown, row: FlowTaskVO) => (
              <DictTag options={dicts.wf_task_status} value={row.flowTaskStatus} />
            )
          }
        ]
      : []),
    ...(type !== 'copy'
      ? [{ title: '创建时间', dataIndex: 'createTime', valueType: 'dateTime' as const, search: false, width: 170 }]
      : []),
    {
      title: '操作',
      valueType: 'option',
      width: 110,
      fixed: 'right',
      render: (_, row) => (
        <RowActions
          actions={[
            type === 'wait'
              ? {
                  key: 'approval',
                  label: '办理',
                  icon: <EditOutlined />,
                  onClick: () => openBusinessForm(row, 'approval')
                }
              : { key: 'view', label: '查看', icon: <EyeOutlined />, onClick: () => openBusinessForm(row, 'view') }
          ]}
        />
      )
    }
  ];

  return (
    <PageContainer title={pageTitle[type]}>
      <ProTable<FlowTaskVO, TaskQuery>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        scroll={tableScroll}
        search={{ labelWidth: 100 }}
        form={{ onReset: resetSearch }}
        request={async params => {
          const query = toPageQuery(params);
          const res = await requestTaskList(type, {
            ...query,
            createByIds: showApplicantFilter ? selectedApplicantIds : undefined
          });
          return toTableData(res);
        }}
        toolbar={{ title: `${pageTitle[type]}列表` }}
        toolBarRender={() => [
          showApplicantFilter && (
            <Badge key="applicant" count={selectedApplicantIds.length} size="small">
              <Button icon={<UserAddOutlined />} onClick={openApplicantSelect}>
                选择申请人
              </Button>
            </Badge>
          ),
          showApplicantFilter && selectedApplicantIds.length > 0 && (
            <Button key="clearApplicant" onClick={clearApplicantFilter}>
              清空申请人
            </Button>
          )
        ]}
      />

      <UserSelect
        title="选择申请人"
        open={applicantOpen}
        onOpenChange={open => (open ? openApplicantModal() : closeApplicantModal())}
        value={selectedApplicants}
        onConfirm={submitApplicantSelect}
      />
    </PageContainer>
  );
}
