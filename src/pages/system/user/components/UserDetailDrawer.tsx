import { ProDescriptions } from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import { Divider, Drawer, Switch } from 'antd';
import { useEffect, useMemo } from 'react';
import type { DictData } from '@/api/system/dict/data/types';
import { getUser } from '@/api/system/user';

interface UserDetailDrawerProps {
  open: boolean;
  userId?: string | number;
  genderOptions?: DictData[];
  onClose: () => void;
}

export default function UserDetailDrawer({ open, userId, genderOptions, onClose }: UserDetailDrawerProps) {
  const { data, loading, runAsync: loadUser, mutate } = useRequest(getUser, { manual: true });

  useEffect(() => {
    if (open && userId) {
      loadUser(userId);
    }
  }, [loadUser, open, userId]);

  const user = data?.data.user;
  const postIds = useMemo(() => (data?.data.postIds || []).map(String), [data?.data.postIds]);
  const roleIds = useMemo(() => (data?.data.roleIds || []).map(String), [data?.data.roleIds]);
  const postNames = (data?.data.posts || [])
    .filter(post => postIds.includes(String(post.postId)))
    .map(post => post.postName)
    .join('、');
  const roleNames = (data?.data.roles || [])
    .filter(role => roleIds.includes(String(role.roleId)))
    .map(role => role.roleName)
    .join('、');
  const genderDisplay = genderOptions?.find(item => item.dictValue === user?.gender)?.dictLabel || '-';

  const closeDrawer = () => {
    onClose();
    mutate(undefined);
  };

  return (
    <Drawer title="用户信息详情" open={open} size={680} onClose={closeDrawer} destroyOnHidden>
      <ProDescriptions
        loading={loading}
        column={2}
        bordered
        dataSource={{
          ...user,
          deptDisplay: user?.deptName || user?.dept?.deptName || '-',
          statusDisplay: user?.status === '0' ? '正常' : '停用',
          postNames: postNames || '-',
          roleNames: roleNames || '-',
          genderDisplay
        }}
        columns={[
          { title: '用户名称', dataIndex: 'nickName' },
          { title: '归属部门', dataIndex: 'deptDisplay' },
          { title: '手机号码', dataIndex: 'phoneNumber' },
          { title: '邮箱', dataIndex: 'email' },
          { title: '登录账号', dataIndex: 'userName' },
          {
            title: '用户状态',
            dataIndex: 'statusDisplay',
            render: (_, record) => (
              <Switch checked={record.status === '0'} checkedChildren="正常" unCheckedChildren="停用" disabled />
            )
          },
          { title: '岗位', dataIndex: 'postNames' },
          { title: '用户性别', dataIndex: 'genderDisplay' },
          { title: '角色', dataIndex: 'roleNames', span: 2 }
        ]}
      />
      <Divider />
      <ProDescriptions
        column={2}
        bordered
        dataSource={user}
        columns={[
          { title: '创建时间', dataIndex: 'createTime', valueType: 'dateTime' },
          { title: '更新时间', dataIndex: 'updateTime', valueType: 'dateTime' },
          { title: '最后登录IP', dataIndex: 'loginIp' },
          { title: '最后登录时间', dataIndex: 'loginDate', valueType: 'dateTime' },
          { title: '备注', dataIndex: 'remark', span: 2 }
        ]}
      />
    </Drawer>
  );
}
