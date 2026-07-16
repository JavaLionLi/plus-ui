import { CloseCircleOutlined, DeleteOutlined, EyeOutlined, FileTextOutlined, UserAddOutlined } from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProFormTextArea,
  ProTable,
  type ActionType,
  type ProColumns
} from '@ant-design/pro-components';
import { useBoolean } from 'ahooks';
import { Badge, Button, Card, Form, Input, message, Modal, Popconfirm, Tabs, Tag } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { UserVO } from '@/api/system/user/types';
import type { PageResult, R } from '@/api/types';
import type { CategoryTreeVO } from '@/api/workflow/category/types';
import type { FlowInstanceQuery, FlowInstanceVO } from '@/api/workflow/instance/types';
import { categoryTree } from '@/api/workflow/category';
import {
  deleteByInstanceIds,
  deleteHisByInstanceIds,
  instanceVariable,
  invalid,
  pageByFinish,
  pageByRunning,
  updateVariable
} from '@/api/workflow/instance';
import workflowCommon from '@/api/workflow/workflowCommon';
import DictTag from '@/components/common/DictTag';
import EllipsisText from '@/components/common/EllipsisText';
import JsonViewer from '@/components/common/JsonViewer';
import RowActions from '@/components/common/RowActions';
import TreePanel from '@/components/common/TreePanel';
import UserSelect from '@/components/common/UserSelect';
import { useDict } from '@/hooks/useDict';
import { useLoading } from '@/hooks/useLoading';
import { useSearchReset } from '@/hooks/useSearchReset';
import { useTableScroll } from '@/hooks/useTableScroll';
import { useUserStore } from '@/stores/userStore';
import { dictOptions } from '@/utils/dict';
import { confirmAction } from '@/utils/modal';
import { hasPermi } from '@/utils/permission';
import { toPageQuery, toTableData } from '@/utils/ruoyi';

type InstanceTab = 'running' | 'finish';

function requestInstanceList(tab: InstanceTab, query: FlowInstanceQuery): Promise<R<PageResult<FlowInstanceVO>>> {
  if (tab === 'running') return pageByRunning(query);
  return pageByFinish(query);
}

function openBusinessForm(row: FlowInstanceVO) {
  workflowCommon.routerJump({
    businessId: row.businessId,
    taskId: row.id,
    type: 'view',
    formCustom: row.formCustom || 'N',
    formPath: row.formPath || '/workflow/leaveEdit/index'
  });
}

export default function WorkflowProcessInstancePage() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { tableScroll } = useTableScroll(1430);
  const [invalidForm] = Form.useForm<{ comment?: string }>();
  const [variableForm] = Form.useForm<{ key?: string; value?: string }>();
  const userInfo = useUserStore(state => state.userInfo);
  const dicts = useDict('wf_business_status', 'sys_normal_disable');
  const [categoryOptions, setCategoryOptions] = useState<CategoryTreeVO[]>([]);
  const [category, setCategory] = useState<string | number>();
  const [activeTab, setActiveTab] = useState<InstanceTab>('running');
  const [selectedRows, setSelectedRows] = useState<FlowInstanceVO[]>([]);
  const [selectedApplicants, setSelectedApplicants] = useState<UserVO[]>([]);
  const [userModalOpen, { setTrue: openUserModal, setFalse: closeUserModal }] = useBoolean(false);
  const [invalidOpen, { setTrue: openInvalidModal, setFalse: closeInvalidModal }] = useBoolean(false);
  const [invalidRow, setInvalidRow] = useState<FlowInstanceVO>();
  const [variableOpen, { setTrue: openVariableModal, setFalse: closeVariableModal }] = useBoolean(false);
  const { loading: variableLoading, withLoading: withVariableLoading } = useLoading();
  const [variableRow, setVariableRow] = useState<FlowInstanceVO>();
  const [variableText, setVariableText] = useState('');

  const canRemove = hasPermi(userInfo, ['workflow:instance:remove']);
  const canQuery = hasPermi(userInfo, ['workflow:instance:query']);
  const canInvalid = hasPermi(userInfo, ['workflow:instance:invalid']);
  const canVariableQuery = hasPermi(userInfo, ['workflow:instance:variableQuery']);
  const canVariable = hasPermi(userInfo, ['workflow:instance:variable']);

  const businessStatusOptions = useMemo(() => dictOptions(dicts.wf_business_status), [dicts.wf_business_status]);
  const selectedIds = selectedRows.map(item => item.id).filter(Boolean);
  const selectedApplicantIds = selectedApplicants.map(item => item.userId).filter(Boolean) as Array<string | number>;
  const resetSearch = useSearchReset(
    actionRef,
    useCallback(() => {
      setCategory(undefined);
      setSelectedApplicants([]);
    }, [])
  );

  useEffect(() => {
    categoryTree().then(res => setCategoryOptions(res.data || []));
  }, []);

  const changeTab = (key: string) => {
    setActiveTab(key as InstanceTab);
    setSelectedRows([]);
    setTimeout(() => actionRef.current?.reloadAndRest?.(), 0);
  };

  const openApplicantSelect = () => {
    openUserModal();
  };

  const submitUserSelect = (users: UserVO[]) => {
    setSelectedApplicants(users);
    closeUserModal();
    actionRef.current?.reloadAndRest?.();
  };

  const clearApplicantFilter = () => {
    setSelectedApplicants([]);
    actionRef.current?.reloadAndRest?.();
  };

  const handleDelete = async (row?: FlowInstanceVO) => {
    const ids = row?.id ? [row.id] : selectedIds;
    if (!ids.length) return;
    if (activeTab === 'running') {
      await deleteByInstanceIds(ids);
    } else {
      await deleteHisByInstanceIds(ids);
    }
    message.success('删除成功');
    setSelectedRows([]);
    actionRef.current?.reloadAndRest?.();
  };

  const openInvalid = (row: FlowInstanceVO) => {
    setInvalidRow(row);
    invalidForm.resetFields();
    openInvalidModal();
  };

  const submitInvalid = async (values: { comment?: string }) => {
    if (!invalidRow?.id) return;
    await confirmAction('是否确认作废？');
    await invalid({ id: invalidRow.id, comment: values.comment });
    message.success('操作成功');
    actionRef.current?.reload();
    return true;
  };

  const openVariable = async (row: FlowInstanceVO) => {
    setVariableRow(row);
    openVariableModal();
    if (canVariable) variableForm.resetFields();
    await withVariableLoading(async () => {
      const res = await instanceVariable(row.id);
      setVariableText(res.data.variable || '');
    });
  };

  const submitVariable = async () => {
    if (!variableRow?.id) return;
    const values = await variableForm.validateFields();
    await confirmAction('是否确认提交？');
    await updateVariable({ ...values, instanceId: variableRow.id });
    message.success('操作成功');
    const res = await instanceVariable(variableRow.id);
    setVariableText(res.data.variable || '');
    variableForm.resetFields();
  };

  const columns: ProColumns<FlowInstanceVO>[] = [
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
      width: 190,
      render: (_, row) => <EllipsisText value={`${row.flowName || '-'}v${row.version || '-'}`} maxWidth={170} />
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
    {
      title: '任务名称',
      dataIndex: 'nodeName',
      fieldProps: { id: 'workflow-process-instance-node-name' },
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
      title: '版本号',
      dataIndex: 'version',
      search: false,
      width: 100,
      render: (_, row) => (row.version ? `v${row.version}.0` : '-')
    },
    ...(activeTab === 'running'
      ? [
          {
            title: '状态',
            dataIndex: 'isSuspended',
            search: false,
            width: 100,
            render: (_: unknown, row: FlowInstanceVO) =>
              row.isSuspended ? <Tag color="red">挂起</Tag> : <Tag color="green">激活</Tag>
          }
        ]
      : []),
    {
      title: '流程状态',
      dataIndex: 'flowStatus',
      valueType: 'select',
      width: 120,
      fieldProps: { options: businessStatusOptions },
      render: (_, row) => <DictTag options={dicts.wf_business_status} value={row.flowStatus} />
    },
    { title: '启动时间', dataIndex: 'createTime', valueType: 'dateTime', search: false, width: 170 },
    ...(activeTab === 'finish'
      ? [{ title: '结束时间', dataIndex: 'updateTime', valueType: 'dateTime' as const, search: false, width: 170 }]
      : []),
    {
      title: '操作',
      valueType: 'option',
      width: 150,
      fixed: 'right',
      render: (_, row) => (
        <RowActions
          actions={[
            activeTab === 'running' &&
              canInvalid && {
                key: 'invalid',
                label: '作废',
                icon: <CloseCircleOutlined />,
                danger: true,
                onClick: () => openInvalid(row)
              },
            canRemove && {
              key: 'delete',
              label: '删除',
              icon: <DeleteOutlined />,
              danger: true,
              confirm: '是否确认删除？',
              onClick: () => handleDelete(row)
            },
            canQuery && { key: 'view', label: '查看', icon: <EyeOutlined />, onClick: () => openBusinessForm(row) },
            canVariableQuery && {
              key: 'variable',
              label: '变量',
              icon: <FileTextOutlined />,
              onClick: () => openVariable(row)
            }
          ]}
        />
      )
    }
  ];

  return (
    <PageContainer title="流程实例">
      <div className="tree-table-page">
        <TreePanel<CategoryTreeVO>
          title="流程分类"
          placeholder="请输入流程分类名"
          data={categoryOptions}
          fieldNames={{ title: 'label', key: 'id', children: 'children' }}
          filterField="label"
          onNodeClick={node => {
            setCategory(node.id === '0' ? undefined : node.id);
            setTimeout(() => actionRef.current?.reloadAndRest?.(), 0);
          }}
        />
        <main className="table-panel">
          <Tabs
            activeKey={activeTab}
            onChange={changeTab}
            items={[
              { key: 'running', label: '运行中' },
              { key: 'finish', label: '已完成' }
            ]}
          />
          <ProTable<FlowInstanceVO, FlowInstanceQuery>
            key={activeTab}
            actionRef={actionRef}
            rowKey="id"
            columns={columns}
            scroll={tableScroll}
            search={{ labelWidth: 110 }}
            form={{ onReset: resetSearch }}
            pagination={{ defaultPageSize: 10, showSizeChanger: true }}
            rowSelection={{
              selectedRowKeys: selectedIds,
              onChange: (_, rows) => setSelectedRows(rows)
            }}
            request={async params => {
              const query = toPageQuery(params);
              const res = await requestInstanceList(activeTab, {
                ...query,
                category,
                createByIds: selectedApplicantIds
              });
              return toTableData(res);
            }}
            toolbar={{ title: '流程实例' }}
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
              canRemove && (
                <Popconfirm key="delete" title="是否确认删除选中的流程实例？" onConfirm={() => handleDelete()}>
                  <Button danger icon={<DeleteOutlined />} disabled={!selectedIds.length}>
                    删除
                  </Button>
                </Popconfirm>
              )
            ]}
          />
        </main>
      </div>

      <UserSelect
        title="选择申请人"
        open={userModalOpen}
        onOpenChange={open => (open ? openUserModal() : closeUserModal())}
        value={selectedApplicants}
        onConfirm={submitUserSelect}
      />

      <ModalForm<{ comment?: string }>
        title="作废"
        open={invalidOpen}
        form={invalidForm}
        layout="vertical"
        modalProps={{ forceRender: true, onCancel: closeInvalidModal }}
        onOpenChange={open => !open && closeInvalidModal()}
        onFinish={submitInvalid}
      >
        <ProFormTextArea
          name="comment"
          label="作废原因"
          fieldProps={{ rows: 4 }}
          rules={[{ required: true, message: '请输入作废原因' }]}
        />
      </ModalForm>

      <Modal title="流程变量" open={variableOpen} width={800} forceRender onCancel={closeVariableModal} footer={null}>
        <Card
          loading={variableLoading}
          title={variableRow?.flowName ? `流程定义名称：${variableRow.flowName}` : '流程变量'}
          size="small"
        >
          <JsonViewer value={variableText} emptyText="暂无变量" />
        </Card>
        {canVariable && (
          <Form form={variableForm} layout="inline" style={{ marginTop: 16 }} onFinish={submitVariable}>
            <Form.Item name="key" label="变量KEY" rules={[{ required: true, message: '请输入KEY' }]}>
              <Input placeholder="请输入变量KEY" />
            </Form.Item>
            <Form.Item name="value" label="变量值" rules={[{ required: true, message: '请输入变量值' }]}>
              <Input placeholder="请输入变量值" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                确认
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </PageContainer>
  );
}
