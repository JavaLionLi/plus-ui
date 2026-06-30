import { CloseOutlined, PlusOutlined, StopOutlined } from '@ant-design/icons';
import { PageContainer, ProTable, type ActionType, type ProColumns } from '@ant-design/pro-components';
import { history, useLocation } from '@umijs/max';
import { useBoolean } from 'ahooks';
import { Button, message, Popconfirm, Tag } from 'antd';
import { useRef, useState } from 'react';
import type { UserQuery, UserVO } from '@/api/system/user/types';
import { allocatedUserList, authUserCancel, authUserCancelAll } from '@/api/system/role';
import { useTableScroll } from '@/hooks/useTableScroll';
import { useUserStore } from '@/stores/userStore';
import { hasPermi } from '@/utils/permission';
import { toPageQuery, toTableData } from '@/utils/ruoyi';
import SelectUserModal from './components/SelectUserModal';

function getRoleId(pathname: string) {
  return pathname.split('/').filter(Boolean).at(-1) || '';
}

export default function RoleAuthUserPage() {
  const location = useLocation();
  const roleId = getRoleId(location.pathname);
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { tableScroll } = useTableScroll(1210);
  const userInfo = useUserStore(state => state.userInfo);
  const [selectedRows, setSelectedRows] = useState<UserVO[]>([]);
  const [selectOpen, { setTrue: openSelectModal, setFalse: closeSelectModal }] = useBoolean(false);

  const canAdd = hasPermi(userInfo, ['system:role:add']);
  const canRemove = hasPermi(userInfo, ['system:role:remove']);
  const selectedIds = selectedRows.map(item => item.userId).filter(Boolean) as Array<string | number>;

  const cancelAuth = async (row: UserVO) => {
    if (!row.userId) return;
    await authUserCancel({ userId: row.userId, roleId });
    message.success('取消授权成功');
    actionRef.current?.reload();
  };

  const cancelAuthAll = async () => {
    await authUserCancelAll({ roleId, userIds: selectedIds.join(',') });
    message.success('取消授权成功');
    setSelectedRows([]);
    actionRef.current?.reload();
  };

  const columns: ProColumns<UserVO>[] = [
    { title: '用户名称', dataIndex: 'userName' },
    { title: '用户昵称', dataIndex: 'nickName', search: false },
    { title: '邮箱', dataIndex: 'email', search: false },
    { title: '手机号码', dataIndex: 'phoneNumber' },
    {
      title: '状态',
      dataIndex: 'status',
      search: false,
      width: 100,
      render: (_, row) => <Tag color={row.status === '0' ? 'green' : 'red'}>{row.status === '0' ? '正常' : '停用'}</Tag>
    },
    { title: '创建时间', dataIndex: 'createTime', valueType: 'dateTime', search: false, width: 170 },
    {
      title: '操作',
      valueType: 'option',
      width: 120,
      fixed: 'right',
      render: (_, row) =>
        canRemove ? (
          <Popconfirm title={`确认要取消该用户"${row.userName}"角色吗？`} onConfirm={() => cancelAuth(row)}>
            <Button type="link" danger size="small" icon={<StopOutlined />}>
              取消授权
            </Button>
          </Popconfirm>
        ) : null
    }
  ];

  return (
    <PageContainer title="分配用户">
      <ProTable<UserVO, UserQuery>
        actionRef={actionRef}
        rowKey="userId"
        columns={columns}
        scroll={tableScroll}
        search={{ labelWidth: 90 }}
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
        rowSelection={{
          selectedRowKeys: selectedIds,
          onChange: (_, rows) => setSelectedRows(rows)
        }}
        request={async params => {
          const res = await allocatedUserList({
            ...toPageQuery(params),
            roleId
          });
          return toTableData(res);
        }}
        toolbar={{ title: '已授权用户' }}
        toolBarRender={() => [
          canAdd && (
            <Button key="add" type="primary" icon={<PlusOutlined />} onClick={openSelectModal}>
              添加用户
            </Button>
          ),
          canRemove && (
            <Popconfirm key="cancel" title="是否取消选中用户授权数据项？" onConfirm={cancelAuthAll}>
              <Button danger disabled={!selectedIds.length} icon={<StopOutlined />}>
                批量取消授权
              </Button>
            </Popconfirm>
          ),
          <Button key="close" icon={<CloseOutlined />} onClick={() => history.push('/system/role')}>
            关闭
          </Button>
        ]}
      />

      <SelectUserModal
        open={selectOpen}
        roleId={roleId}
        onCancel={closeSelectModal}
        onSuccess={() => {
          closeSelectModal();
          actionRef.current?.reload();
        }}
      />
    </PageContainer>
  );
}
