import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  RollbackOutlined
} from '@ant-design/icons';
import { PageContainer, ProTable, type ActionType, type ProColumns } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { Button, message, Tag } from 'antd';
import { useMemo, useRef } from 'react';
import type { LeaveQuery, LeaveVO } from '@/api/workflow/leave/types';
import { cancelProcessApply } from '@/api/workflow/instance';
import { delLeave, listLeave } from '@/api/workflow/leave';
import DictTag from '@/components/common/DictTag';
import EllipsisText from '@/components/common/EllipsisText';
import RowActions from '@/components/common/RowActions';
import { useDict } from '@/hooks/useDict';
import { useTableExport } from '@/hooks/useTableExport';
import { useTableSelection } from '@/hooks/useTableSelection';
import { useTableScroll } from '@/hooks/useTableScroll';
import { useUserStore } from '@/stores/userStore';
import { dictOptions } from '@/utils/dict';
import { hasPermi } from '@/utils/permission';
import { toPageQuery, toTableData } from '@/utils/ruoyi';

const leaveTypeOptions = [
  { value: '1', label: '事假' },
  { value: '2', label: '调休' },
  { value: '3', label: '病假' },
  { value: '4', label: '婚假' }
];


function leaveTypeLabel(value?: string) {
  return leaveTypeOptions.find(item => item.value === value)?.label || value || '-';
}

function editableStatus(status?: string) {
  return status === 'draft' || status === 'cancel' || status === 'back';
}

export default function WorkflowLeavePage() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { tableScroll } = useTableScroll(1160);
  const userInfo = useUserStore(state => state.userInfo);
  const dicts = useDict('wf_business_status');
  const { ids, handleSelectionChange, clearSelection } = useTableSelection<LeaveVO>(row => row.id);
  const { updateExportParams, exportFile } = useTableExport();

  const canAdd = hasPermi(userInfo, ['workflow:leave:add']);
  const canEdit = hasPermi(userInfo, ['workflow:leave:edit']);
  const canRemove = hasPermi(userInfo, ['workflow:leave:remove']);
  const canExport = hasPermi(userInfo, ['workflow:leave:export']);
  const canCancel = hasPermi(userInfo, ['workflow:instance:cancel']);
  const businessStatusOptions = useMemo(() => dictOptions(dicts.wf_business_status), [dicts.wf_business_status]);

  const openEdit = (row?: LeaveVO, type: 'add' | 'update' | 'view' = 'update') => {
    const search = new URLSearchParams();
    search.set('type', type);
    if (row?.id) search.set('id', String(row.id));
    history.push(`/workflow/leaveEdit/index?${search.toString()}`);
  };

  const remove = async (row?: LeaveVO) => {
    await delLeave(row?.id || ids);
    message.success('删除成功');
    clearSelection();
    actionRef.current?.reloadAndRest?.();
  };

  const cancelApply = async (row: LeaveVO) => {
    await cancelProcessApply({ businessId: row.id, message: '申请人撤销流程！' });
    message.success('撤销成功');
    clearSelection();
    actionRef.current?.reload();
  };

  const columns: ProColumns<LeaveVO>[] = [
    { title: '请假天数起', dataIndex: 'startLeaveDays', valueType: 'digit', hideInTable: true },
    { title: '请假天数止', dataIndex: 'endLeaveDays', valueType: 'digit', hideInTable: true },
    {
      title: '请假类型',
      dataIndex: 'leaveType',
      search: false,
      width: 120,
      render: (_, row) => <Tag>{leaveTypeLabel(row.leaveType)}</Tag>
    },
    { title: '开始时间', dataIndex: 'startDate', valueType: 'date', search: false, width: 130 },
    { title: '结束时间', dataIndex: 'endDate', valueType: 'date', search: false, width: 130 },
    { title: '请假天数', dataIndex: 'leaveDays', search: false, width: 120 },
    {
      title: '请假原因',
      dataIndex: 'remark',
      search: false,
      width: 220,
      render: (_, row) => <EllipsisText value={row.remark} maxWidth={200} />
    },
    {
      title: '流程状态',
      dataIndex: 'status',
      valueType: 'select',
      width: 120,
      fieldProps: { options: businessStatusOptions },
      render: (_, row) => <DictTag options={dicts.wf_business_status} value={row.status} />
    },
    {
      title: '操作',
      valueType: 'option',
      width: 150,
      fixed: 'right',
      render: (_, row) => (
        <RowActions
          actions={[
            canEdit &&
              editableStatus(row.status) && {
                key: 'edit',
                label: '修改',
                icon: <EditOutlined />,
                onClick: () => openEdit(row, 'update')
              },
            canRemove &&
              editableStatus(row.status) && {
                key: 'delete',
                label: '删除',
                icon: <DeleteOutlined />,
                danger: true,
                confirm: `是否确认删除请假编号为"${row.id}"的数据项？`,
                onClick: () => remove(row)
              },
            { key: 'view', label: '查看', icon: <EyeOutlined />, onClick: () => openEdit(row, 'view') },
            canCancel &&
              row.status === 'waiting' && {
                key: 'cancel',
                label: '撤销',
                icon: <RollbackOutlined />,
                confirm: '是否确认撤销当前单据？',
                onClick: () => cancelApply(row)
              }
          ]}
        />
      )
    }
  ];

  return (
    <PageContainer title="请假列表">
      <ProTable<LeaveVO, LeaveQuery>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        scroll={tableScroll}
        search={{ labelWidth: 100 }}
        rowSelection={{ selectedRowKeys: ids, onChange: handleSelectionChange }}
        request={async params => {
          const query = toPageQuery(params);
          updateExportParams(query);
          const res = await listLeave(query);
          return toTableData(res);
        }}
        toolbar={{ title: '请假列表' }}
        toolBarRender={() => [
          canAdd && (
            <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => openEdit(undefined, 'add')}>
              新增
            </Button>
          ),
          canExport && (
            <Button
              key="export"
              icon={<DownloadOutlined />}
              onClick={() => exportFile('/workflow/leave/export', () => `leave_${Date.now()}.xlsx`)}
            >
              导出
            </Button>
          )
        ]}
      />
    </PageContainer>
  );
}
