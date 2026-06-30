import { DeleteOutlined } from '@ant-design/icons';
import { PageContainer, ProTable, type ActionType, type ProColumns } from '@ant-design/pro-components';
import { message } from 'antd';
import { useMemo, useRef } from 'react';
import type { OnlineQuery, OnlineVO } from '@/api/monitor/online/types';
import { forceLogout, listOnline } from '@/api/monitor/online';
import DictTag from '@/components/common/DictTag';
import EllipsisText from '@/components/common/EllipsisText';
import RowActions from '@/components/common/RowActions';
import { useDict } from '@/hooks/useDict';
import { useTableScroll } from '@/hooks/useTableScroll';
import { useUserStore } from '@/stores/userStore';
import { dictOptions } from '@/utils/dict';
import { hasPermi } from '@/utils/permission';
import { toPageQuery, toTableData } from '@/utils/ruoyi';


export default function MonitorOnlinePage() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { tableScroll } = useTableScroll(1320);
  const userInfo = useUserStore(state => state.userInfo);
  const dicts = useDict('sys_device_type');
  const canForceLogout = hasPermi(userInfo, ['monitor:online:forceLogout']);
  const deviceOptions = useMemo(() => dictOptions(dicts.sys_device_type), [dicts.sys_device_type]);

  const force = async (row: OnlineVO) => {
    await forceLogout(row.tokenId);
    message.success('强退成功');
    actionRef.current?.reload();
  };

  const columns: ProColumns<OnlineVO>[] = [
    {
      title: '会话编号',
      dataIndex: 'tokenId',
      search: false,
      width: 180,
      render: (_, row) => <EllipsisText value={row.tokenId} maxWidth={160} />
    },
    {
      title: '登录名称',
      dataIndex: 'userName',
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
      title: '所属部门',
      dataIndex: 'deptName',
      search: false,
      width: 150,
      render: (_, row) => <EllipsisText value={row.deptName} maxWidth={130} />
    },
    {
      title: '主机',
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
    { title: '登录时间', dataIndex: 'loginTime', valueType: 'dateTime', search: false, width: 170 },
    {
      title: '操作',
      valueType: 'option',
      width: 90,
      fixed: 'right',
      render: (_, row) => (
        <RowActions
          actions={[
            canForceLogout && {
              key: 'force',
              label: '强退',
              icon: <DeleteOutlined />,
              danger: true,
              confirm: `是否确认强退名称为"${row.userName}"的用户？`,
              onClick: () => force(row)
            }
          ]}
        />
      )
    }
  ];

  return (
    <PageContainer title="在线用户">
      <ProTable<OnlineVO, OnlineQuery>
        actionRef={actionRef}
        rowKey="tokenId"
        columns={columns}
        scroll={tableScroll}
        search={{ labelWidth: 90 }}
        request={async params => {
          const res = await listOnline(toPageQuery(params));
          return toTableData(res);
        }}
        toolbar={{ title: '在线用户列表' }}
      />
    </PageContainer>
  );
}
