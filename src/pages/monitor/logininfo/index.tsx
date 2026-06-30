import { DeleteOutlined, DownloadOutlined, UnlockOutlined } from '@ant-design/icons';
import { PageContainer, ProTable, type ActionType, type ProColumns } from '@ant-design/pro-components';
import { Button, message, Popconfirm } from 'antd';
import { useMemo, useRef } from 'react';
import type { LoginInfoQuery, LoginInfoVO } from '@/api/monitor/logininfo/types';
import { cleanLoginInfo, delLoginInfo, listLoginInfo, unlockLoginInfo } from '@/api/monitor/logininfo';
import DictTag from '@/components/common/DictTag';
import EllipsisText from '@/components/common/EllipsisText';
import { useDateRangeQuery } from '@/hooks/useDateRangeQuery';
import { useDict } from '@/hooks/useDict';
import { useTableExport } from '@/hooks/useTableExport';
import { useTableSelection } from '@/hooks/useTableSelection';
import { useTableScroll } from '@/hooks/useTableScroll';
import { useUserStore } from '@/stores/userStore';
import { dictOptions } from '@/utils/dict';
import { hasPermi } from '@/utils/permission';
import { toPageQuery, toTableData, withTableSort } from '@/utils/ruoyi';


export default function MonitorLoginInfoPage() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { tableScroll } = useTableScroll(1352);
  const userInfo = useUserStore(state => state.userInfo);
  const dicts = useDict('sys_device_type', 'sys_common_status');
  const { ids, selectedRows, selectedOne, handleSelectionChange, clearSelection } = useTableSelection<LoginInfoVO>(
    row => row.infoId
  );
  const { updateExportParams, exportFile } = useTableExport();
  const { applyDateRange: applyLoginTimeDateRange } = useDateRangeQuery();

  const canRemove = hasPermi(userInfo, ['monitor:logininfo:remove']);
  const canUnlock = hasPermi(userInfo, ['monitor:logininfo:unlock']);
  const canExport = hasPermi(userInfo, ['monitor:logininfo:export']);
  const deviceOptions = useMemo(() => dictOptions(dicts.sys_device_type), [dicts.sys_device_type]);
  const statusOptions = useMemo(() => dictOptions(dicts.sys_common_status), [dicts.sys_common_status]);

  const remove = async (row?: LoginInfoVO) => {
    await delLoginInfo(row?.infoId || ids);
    message.success('删除成功');
    clearSelection();
    actionRef.current?.reloadAndRest?.();
  };

  const clean = async () => {
    await cleanLoginInfo();
    message.success('清空成功');
    clearSelection();
    actionRef.current?.reloadAndRest?.();
  };

  const unlock = async () => {
    const names = selectedRows.map(item => item.userName);
    await unlockLoginInfo(names);
    message.success(`用户${names}解锁成功`);
    clearSelection();
    actionRef.current?.reloadAndRest?.();
  };

  const columns: ProColumns<LoginInfoVO>[] = [
    { title: '访问编号', dataIndex: 'infoId', search: false, width: 112 },
    {
      title: '用户名称',
      dataIndex: 'userName',
      sorter: true,
      width: 140,
      render: (_, row) => <EllipsisText value={row.userName} maxWidth={120} />
    },
    {
      title: '客户端',
      dataIndex: 'clientKey',
      search: false,
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
      title: '地址',
      dataIndex: 'ipaddr',
      width: 140,
      render: (_, row) => <EllipsisText value={row.ipaddr} maxWidth={120} />
    },
    {
      title: '登录地点',
      dataIndex: 'loginLocation',
      search: false,
      width: 140,
      render: (_, row) => <EllipsisText value={row.loginLocation} maxWidth={120} />
    },
    {
      title: '操作系统',
      dataIndex: 'os',
      search: false,
      width: 150,
      render: (_, row) => <EllipsisText value={row.os} maxWidth={130} />
    },
    {
      title: '浏览器',
      dataIndex: 'browser',
      search: false,
      width: 150,
      render: (_, row) => <EllipsisText value={row.browser} maxWidth={130} />
    },
    {
      title: '登录状态',
      dataIndex: 'status',
      valueType: 'select',
      width: 120,
      fieldProps: { options: statusOptions },
      render: (_, row) => <DictTag options={dicts.sys_common_status} value={row.status} />
    },
    {
      title: '描述',
      dataIndex: 'msg',
      search: false,
      width: 200,
      render: (_, row) => <EllipsisText value={row.msg} maxWidth={180} />
    },
    { title: '登录时间', dataIndex: 'loginTimeRange', valueType: 'dateTimeRange', hideInTable: true },
    { title: '访问时间', dataIndex: 'loginTime', valueType: 'dateTime', search: false, width: 170, sorter: true }
  ];

  return (
    <PageContainer title="登录日志">
      <ProTable<LoginInfoVO, LoginInfoQuery & { loginTimeRange?: [string, string] }>
        actionRef={actionRef}
        rowKey="infoId"
        columns={columns}
        scroll={tableScroll}
        search={{ labelWidth: 90 }}
        rowSelection={{ selectedRowKeys: ids, onChange: handleSelectionChange }}
        request={async (params, sort) => {
          const { loginTimeRange, ...tableParams } = params;
          const query = applyLoginTimeDateRange(
            withTableSort(toPageQuery(tableParams), sort, { orderByColumn: 'loginTime', isAsc: 'descending' }),
            loginTimeRange
          );
          updateExportParams(query);
          const res = await listLoginInfo(query);
          return toTableData(res);
        }}
        toolbar={{ title: '登录日志列表' }}
        toolBarRender={() => [
          canRemove && (
            <Popconfirm key="delete" title={`是否确认删除访问编号为"${ids}"的数据项？`} onConfirm={() => remove()}>
              <Button danger disabled={!ids.length} icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          ),
          canRemove && (
            <Popconfirm key="clean" title="是否确认清空所有登录日志数据项？" onConfirm={clean}>
              <Button danger icon={<DeleteOutlined />}>
                清空
              </Button>
            </Popconfirm>
          ),
          canUnlock && (
            <Popconfirm
              key="unlock"
              title={`是否确认解锁用户"${selectedRows.map(item => item.userName)}"数据项？`}
              onConfirm={unlock}
            >
              <Button type="primary" disabled={!selectedOne} icon={<UnlockOutlined />}>
                解锁
              </Button>
            </Popconfirm>
          ),
          canExport && (
            <Button
              key="export"
              icon={<DownloadOutlined />}
              onClick={() => exportFile('/monitor/loginInfo/export', () => `logininfo_${Date.now()}.xlsx`)}
            >
              导出
            </Button>
          )
        ]}
      />
    </PageContainer>
  );
}
