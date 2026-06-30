import { PageContainer, ProTable, type ProColumns } from '@ant-design/pro-components';
import { history, useLocation } from '@umijs/max';
import { Button, Descriptions, message, Space, Tag } from 'antd';
import { type MouseEvent, useEffect, useMemo, useState } from 'react';
import type { RoleVO } from '@/api/system/role/types';
import type { UserVO } from '@/api/system/user/types';
import { getAuthRole, updateAuthRole } from '@/api/system/user';
import { useTableScroll } from '@/hooks/useTableScroll';
function getUserId(pathname: string) {
  return pathname.split('/').filter(Boolean).at(-1) || '';
}

function isSelectionControl(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    !!target.closest('button,a,input,.ant-checkbox-wrapper,.ant-table-selection-column')
  );
}

export default function UserAuthRolePage() {
  const location = useLocation();
  const userId = getUserId(location.pathname);
  const { tableScroll } = useTableScroll(1010);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserVO>();
  const [roles, setRoles] = useState<RoleVO[]>([]);
  const [roleIds, setRoleIds] = useState<Array<string | number>>([]);

  useEffect(() => {
    setLoading(true);
    getAuthRole(userId)
      .then(res => {
        setUser(res.data.user);
        setRoles(res.data.roles || []);
        setRoleIds((res.data.roles || []).filter(role => role.flag).map(role => role.roleId));
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const columns: ProColumns<RoleVO>[] = useMemo(
    () => [
      { title: '角色编号', dataIndex: 'roleId', search: false, width: 120 },
      { title: '角色名称', dataIndex: 'roleName' },
      { title: '权限字符', dataIndex: 'roleKey' },
      {
        title: '状态',
        dataIndex: 'status',
        search: false,
        width: 100,
        render: (_, row) => (
          <Tag color={row.status === '0' ? 'green' : 'red'}>{row.status === '0' ? '正常' : '停用'}</Tag>
        )
      },
      { title: '创建时间', dataIndex: 'createTime', valueType: 'dateTime', search: false, width: 170 }
    ],
    []
  );

  const submit = async () => {
    await updateAuthRole({ userId, roleIds: roleIds.join(',') });
    message.success('授权成功');
    history.push('/system/user');
  };

  const toggleRole = (record: RoleVO, event: MouseEvent) => {
    if (record.status !== '0' || !record.roleId || isSelectionControl(event.target)) {
      return;
    }
    setRoleIds(prev =>
      prev.includes(record.roleId) ? prev.filter(roleId => roleId !== record.roleId) : [...prev, record.roleId]
    );
  };

  return (
    <PageContainer title="分配角色">
      <Descriptions
        bordered
        column={2}
        style={{ marginBottom: 16 }}
        items={[
          { key: 'nickName', label: '用户昵称', children: user?.nickName },
          { key: 'userName', label: '登录账号', children: user?.userName }
        ]}
      />
      <ProTable<RoleVO>
        loading={loading}
        rowKey="roleId"
        columns={columns}
        scroll={tableScroll}
        dataSource={roles}
        search={false}
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
        rowSelection={{
          selectedRowKeys: roleIds,
          getCheckboxProps: record => ({ disabled: record.status !== '0' }),
          onChange: keys => setRoleIds(keys as Array<string | number>)
        }}
        onRow={record => ({
          onClick: event => toggleRole(record, event),
          style: record.status === '0' ? { cursor: 'pointer' } : undefined
        })}
        toolbar={{
          title: '角色信息'
        }}
        toolBarRender={() => [
          <Space key="actions">
            <Button type="primary" onClick={submit}>
              提交
            </Button>
            <Button onClick={() => history.push('/system/user')}>返回</Button>
          </Space>
        ]}
      />
    </PageContainer>
  );
}
