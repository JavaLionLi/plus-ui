import { DeleteOutlined, DownloadOutlined, EyeOutlined, WarningOutlined } from '@ant-design/icons';
import { PageContainer, ProTable, type ActionType, type ProColumns } from '@ant-design/pro-components';
import { useBoolean } from 'ahooks';
import { Button, Descriptions, message, Modal, Popconfirm } from 'antd';
import { useMemo, useRef, useState } from 'react';
import type { OperLogQuery, OperLogVO } from '@/api/monitor/operlog/types';
import type { DictData } from '@/api/system/dict/data/types';
import { cleanOperlog, delOperlog, listOperlog } from '@/api/monitor/operlog';
import DictTag from '@/components/common/DictTag';
import EllipsisText from '@/components/common/EllipsisText';
import JsonViewer from '@/components/common/JsonViewer';
import RowActions from '@/components/common/RowActions';
import { useDateRangeQuery } from '@/hooks/useDateRangeQuery';
import { useDict } from '@/hooks/useDict';
import { useTableExport } from '@/hooks/useTableExport';
import { useTableSelection } from '@/hooks/useTableSelection';
import { useTableScroll } from '@/hooks/useTableScroll';
import { useUserStore } from '@/stores/userStore';
import { dictOptions } from '@/utils/dict';
import { hasPermi } from '@/utils/permission';
import { toPageQuery, toTableData, withTableSort } from '@/utils/ruoyi';


function dictText(dicts: DictData[] | undefined, value?: string | number) {
  const normalized = value === undefined || value === null ? undefined : String(value);
  return dicts?.find(item => item.dictValue === normalized)?.dictLabel || normalized || '-';
}

export default function MonitorOperlogPage() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { tableScroll } = useTableScroll(1680);
  const userInfo = useUserStore(state => state.userInfo);
  const dicts = useDict('sys_oper_type', 'sys_common_status', 'sys_device_type');
  const { ids, handleSelectionChange, clearSelection } = useTableSelection<OperLogVO>(row => row.operId);
  const [detailOpen, { setTrue: openDetailModal, setFalse: closeDetailModal }] = useBoolean(false);
  const [detail, setDetail] = useState<OperLogVO>();
  const { updateExportParams, exportFile } = useTableExport();
  const { applyDateRange: applyOperTimeDateRange } = useDateRangeQuery();

  const canQuery = hasPermi(userInfo, ['monitor:operlog:query']);
  const canRemove = hasPermi(userInfo, ['monitor:operlog:remove']);
  const canExport = hasPermi(userInfo, ['monitor:operlog:export']);
  const operTypeOptions = useMemo(() => dictOptions(dicts.sys_oper_type), [dicts.sys_oper_type]);
  const statusOptions = useMemo(() => dictOptions(dicts.sys_common_status), [dicts.sys_common_status]);
  const deviceOptions = useMemo(() => dictOptions(dicts.sys_device_type), [dicts.sys_device_type]);

  const remove = async (row?: OperLogVO) => {
    await delOperlog(row?.operId || ids);
    message.success('删除成功');
    clearSelection();
    actionRef.current?.reloadAndRest?.();
  };

  const clean = async () => {
    await cleanOperlog();
    message.success('清空成功');
    clearSelection();
    actionRef.current?.reloadAndRest?.();
  };

  const openDetail = (row: OperLogVO) => {
    setDetail(row);
    openDetailModal();
  };

  const columns: ProColumns<OperLogVO>[] = [
    { title: '日志编号', dataIndex: 'operId', search: false, width: 112 },
    {
      title: '系统模块',
      dataIndex: 'title',
      width: 140,
      render: (_, row) => <EllipsisText value={row.title} maxWidth={120} />
    },
    {
      title: '操作类型',
      dataIndex: 'businessType',
      valueType: 'select',
      width: 120,
      fieldProps: { options: operTypeOptions },
      render: (_, row) => <DictTag options={dicts.sys_oper_type} value={row.businessType} />
    },
    {
      title: '操作人员',
      dataIndex: 'operName',
      sorter: true,
      width: 130,
      render: (_, row) => <EllipsisText value={row.operName} maxWidth={110} />
    },
    {
      title: '部门',
      dataIndex: 'deptName',
      search: false,
      width: 140,
      render: (_, row) => <EllipsisText value={row.deptName} maxWidth={120} />
    },
    {
      title: '客户端',
      dataIndex: 'clientKey',
      width: 150,
      render: (_, row) => <EllipsisText value={row.clientKey} maxWidth={130} />
    },
    {
      title: '设备类型',
      dataIndex: 'deviceType',
      valueType: 'select',
      width: 120,
      fieldProps: { options: deviceOptions },
      render: (_, row) => <DictTag options={dicts.sys_device_type} value={row.deviceType} />
    },
    {
      title: '浏览器',
      dataIndex: 'browser',
      width: 140,
      render: (_, row) => <EllipsisText value={row.browser} maxWidth={120} />
    },
    {
      title: '操作系统',
      dataIndex: 'os',
      width: 140,
      render: (_, row) => <EllipsisText value={row.os} maxWidth={120} />
    },
    {
      title: '操作地址',
      dataIndex: 'operIp',
      width: 140,
      render: (_, row) => <EllipsisText value={row.operIp} maxWidth={120} />
    },
    {
      title: '操作状态',
      dataIndex: 'status',
      valueType: 'select',
      width: 120,
      fieldProps: { options: statusOptions },
      render: (_, row) => <DictTag options={dicts.sys_common_status} value={row.status} />
    },
    { title: '操作时间', dataIndex: 'operTimeRange', valueType: 'dateTimeRange', hideInTable: true },
    { title: '操作日期', dataIndex: 'operTime', valueType: 'dateTime', search: false, width: 170, sorter: true },
    {
      title: '消耗时间',
      dataIndex: 'costTime',
      search: false,
      width: 120,
      sorter: true,
      render: (_, row) => `${row.costTime ?? 0}毫秒`
    },
    {
      title: '操作',
      valueType: 'option',
      width: 90,
      fixed: 'right',
      render: (_, row) => (
        <RowActions
          actions={[
            canQuery && { key: 'detail', label: '详细', icon: <EyeOutlined />, onClick: () => openDetail(row) }
          ]}
        />
      )
    }
  ];

  return (
    <PageContainer title="操作日志">
      <ProTable<OperLogVO, OperLogQuery & { operTimeRange?: [string, string] }>
        actionRef={actionRef}
        rowKey="operId"
        columns={columns}
        search={{ labelWidth: 90 }}
        scroll={tableScroll}
        rowSelection={{ selectedRowKeys: ids, onChange: handleSelectionChange }}
        request={async (params, sort) => {
          const { operTimeRange, ...tableParams } = params;
          const query = applyOperTimeDateRange(
            withTableSort(toPageQuery(tableParams), sort, { orderByColumn: 'operTime', isAsc: 'descending' }),
            operTimeRange
          );
          updateExportParams(query);
          const res = await listOperlog(query);
          return toTableData(res);
        }}
        toolbar={{ title: '操作日志列表' }}
        toolBarRender={() => [
          canRemove && (
            <Popconfirm key="delete" title={`是否确认删除日志编号为"${ids}"的数据项？`} onConfirm={() => remove()}>
              <Button danger disabled={!ids.length} icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          ),
          canRemove && (
            <Popconfirm key="clean" title="是否确认清空所有操作日志数据项？" onConfirm={clean}>
              <Button danger icon={<WarningOutlined />}>
                清空
              </Button>
            </Popconfirm>
          ),
          canExport && (
            <Button
              key="export"
              icon={<DownloadOutlined />}
              onClick={() => exportFile('/monitor/operlog/export', () => `operlog_${Date.now()}.xlsx`)}
            >
              导出
            </Button>
          )
        ]}
      />

      <Modal
        title="操作日志详细"
        open={detailOpen}
        width={900}
        footer={null}
        onCancel={closeDetailModal}
        destroyOnHidden
      >
        <Descriptions
          column={1}
          bordered
          styles={{ label: { width: 110 } }}
          items={[
            {
              key: 'status',
              label: '操作状态',
              children: <DictTag options={dicts.sys_common_status} value={detail?.status} />
            },
            {
              key: 'login',
              label: '登录信息',
              children: `${detail?.operName || '-'} / ${detail?.deptName || '-'} / ${detail?.clientKey || '-'} / ${dictText(dicts.sys_device_type, detail?.deviceType)} / ${detail?.browser || '-'} / ${detail?.os || '-'} / ${detail?.operIp || '-'} / ${detail?.operLocation || '-'}`
            },
            {
              key: 'request',
              label: '请求信息',
              children: `${detail?.requestMethod || '-'} ${detail?.operUrl || '-'}`
            },
            {
              key: 'module',
              label: '操作模块',
              children: `${detail?.title || '-'} / ${dictText(dicts.sys_oper_type, detail?.businessType)}`
            },
            { key: 'method', label: '操作方法', children: detail?.method || '-' },
            { key: 'operParam', label: '请求参数', children: <JsonViewer value={detail?.operParam} maxHeight={300} /> },
            {
              key: 'jsonResult',
              label: '返回参数',
              children: <JsonViewer value={detail?.jsonResult} maxHeight={300} />
            },
            { key: 'costTime', label: '消耗时间', children: `${detail?.costTime ?? 0}ms` },
            { key: 'operTime', label: '操作时间', children: detail?.operTime || '-' },
            ...(String(detail?.status) === '1'
              ? [{ key: 'errorMsg', label: '异常信息', children: detail?.errorMsg || '-' }]
              : [])
          ]}
        />
      </Modal>
    </PageContainer>
  );
}
