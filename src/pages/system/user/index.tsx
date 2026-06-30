import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  KeyOutlined,
  LockOutlined,
  PlusOutlined,
  UploadOutlined,
  UserSwitchOutlined
} from '@ant-design/icons';
import { PageContainer, ProTable, type ActionType, type ProColumns } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { useBoolean } from 'ahooks';
import { Button, Form, Input, message, Modal, Popconfirm, Switch } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { DeptTreeVO } from '@/api/system/dept/types';
import type { PostVO } from '@/api/system/post/types';
import type { RoleVO } from '@/api/system/role/types';
import type { UserForm, UserQuery, UserVO } from '@/api/system/user/types';
import { getConfigKey } from '@/api/system/config';
import { optionSelect as optionSelectPost } from '@/api/system/post';
import {
  addUser,
  changeUserStatus,
  delUser,
  deptTreeSelect,
  getUser,
  listUser,
  resetUserPwd,
  unlockUser,
  updateUser
} from '@/api/system/user';
import RowActions from '@/components/common/RowActions';
import TreePanel from '@/components/common/TreePanel';
import { useDateRangeQuery } from '@/hooks/useDateRangeQuery';
import { useDict } from '@/hooks/useDict';
import { useTableExport } from '@/hooks/useTableExport';
import { useTableSelection } from '@/hooks/useTableSelection';
import { useTableScroll } from '@/hooks/useTableScroll';
import { useUserStore } from '@/stores/userStore';
import { dictOptions } from '@/utils/dict';
import { confirmAction } from '@/utils/modal';
import { hasPermi } from '@/utils/permission';
import { filterTree, toPageQuery, toTableData } from '@/utils/ruoyi';
import UserDetailDrawer from './components/UserDetailDrawer';
import UserFormModal from './components/UserFormModal';
import UserImportModal from './components/UserImportModal';

const defaultForm: UserForm = {
  status: '0',
  postIds: [],
  roleIds: []
};

interface TreeSelectNode {
  title: string;
  value: string | number;
  disabled?: boolean;
  children?: TreeSelectNode[];
}

function toTreeSelectData(depts: DeptTreeVO[]): TreeSelectNode[] {
  return depts.map(dept => ({
    title: dept.label,
    value: dept.id,
    disabled: dept.disabled,
    children: dept.children ? toTreeSelectData(dept.children) : undefined
  }));
}


export default function SystemUserPage() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { tableScroll } = useTableScroll(1220);
  const [form] = Form.useForm<UserForm>();
  const userInfo = useUserStore(state => state.userInfo);
  const dicts = useDict('sys_normal_disable', 'sys_user_gender');
  const [deptOptions, setDeptOptions] = useState<DeptTreeVO[]>([]);
  const [enabledDeptOptions, setEnabledDeptOptions] = useState<DeptTreeVO[]>([]);
  const [deptId, setDeptId] = useState<string | number>();
  const {
    ids: selectedIds,
    selectedOne,
    handleSelectionChange,
    clearSelection
  } = useTableSelection<UserVO>(row => row.userId);
  const [modalOpen, { setTrue: openModal, setFalse: closeModal }] = useBoolean(false);
  const [modalTitle, setModalTitle] = useState('');
  const [postOptions, setPostOptions] = useState<PostVO[]>([]);
  const [roleOptions, setRoleOptions] = useState<RoleVO[]>([]);
  const [initPassword, setInitPassword] = useState('');
  const [importOpen, { setTrue: openImportModal, setFalse: closeImportModal }] = useBoolean(false);
  const [viewOpen, { setTrue: openViewDrawer, setFalse: closeViewDrawer }] = useBoolean(false);
  const [viewUserId, setViewUserId] = useState<string | number>();
  const { updateExportParams, exportFile } = useTableExport();
  const { applyDateRange: applyCreateTimeDateRange } = useDateRangeQuery();

  const canAdd = hasPermi(userInfo, ['system:user:add']);
  const canEdit = hasPermi(userInfo, ['system:user:edit']);
  const canRemove = hasPermi(userInfo, ['system:user:remove']);
  const canResetPwd = hasPermi(userInfo, ['system:user:resetPwd']);
  const canExport = hasPermi(userInfo, ['system:user:export']);
  const canImport = hasPermi(userInfo, ['system:user:import']);

  useEffect(() => {
    Promise.all([deptTreeSelect(), getConfigKey('sys.user.initPassword')]).then(([deptRes, configRes]) => {
      setDeptOptions(deptRes.data || []);
      setEnabledDeptOptions(filterTree(deptRes.data || [], dept => !dept.disabled));
      setInitPassword(configRes.data || '');
    });
  }, []);

  const deptSelectTreeData = useMemo(() => toTreeSelectData(enabledDeptOptions), [enabledDeptOptions]);
  const currentUserId = userInfo?.user?.userId;

  const openAdd = async () => {
    const res = await getUser();
    setModalTitle('新增用户');
    setPostOptions(res.data.posts || []);
    setRoleOptions(res.data.roles || []);
    form.resetFields();
    form.setFieldsValue({
      ...defaultForm,
      password: initPassword
    });
    openModal();
  };

  const openEdit = async (row?: UserVO) => {
    const target = row || selectedOne;
    if (!target?.userId) return;
    const res = await getUser(target.userId);
    const user = res.data.user || {};
    setModalTitle('修改用户');
    setPostOptions(res.data.posts || []);
    setRoleOptions(
      Array.from(new Map([...(res.data.roles || []), ...(user.roles || [])].map(role => [role.roleId, role])).values())
    );
    form.resetFields();
    form.setFieldsValue({
      ...user,
      password: '',
      postIds: res.data.postIds || [],
      roleIds: res.data.roleIds || []
    });
    openModal();
  };

  const openView = async (row: UserVO) => {
    if (!row.userId) return;
    setViewUserId(row.userId);
    openViewDrawer();
  };

  const submitForm = async (values: UserForm) => {
    const submitValues = { ...values };
    if (submitValues.userId && String(submitValues.userId) === String(currentUserId)) {
      submitValues.deptId = undefined;
      submitValues.postIds = undefined;
      submitValues.roleIds = undefined;
    }
    if (submitValues.userId) {
      await updateUser(submitValues);
    } else {
      await addUser(submitValues);
    }
    message.success('操作成功');
    form.resetFields();
    actionRef.current?.reload();
    return true;
  };

  const handleDelete = async (row?: UserVO) => {
    const ids = row?.userId || selectedIds;
    if (!ids || (Array.isArray(ids) && ids.length === 0)) return;
    await delUser(ids);
    message.success('删除成功');
    clearSelection();
    actionRef.current?.reloadAndRest?.();
  };

  const handleUnlock = async () => {
    if (!selectedOne?.userId) return;
    await confirmAction(`是否确认解锁用户编号为"${selectedOne.userId}"的数据项?`);
    await unlockUser(selectedOne.userId);
    message.success(`用户编号"${selectedOne.userId}"解锁成功`);
    clearSelection();
    actionRef.current?.reloadAndRest?.();
  };

  const handleResetPwd = (row: UserVO) => {
    let password = '';
    Modal.confirm({
      title: `请输入"${row.userName}"的新密码`,
      content: (
        <Input.Password
          autoFocus
          placeholder="新密码"
          onChange={event => {
            password = event.target.value;
          }}
        />
      ),
      onOk: async () => {
        if (!/^.{5,20}$/.test(password)) {
          message.warning('用户密码长度必须介于 5 和 20 之间');
          return Promise.reject();
        }
        if (/<|>|"|'|\||\\/.test(password)) {
          message.warning('不能包含非法字符：< > " \' \\ |');
          return Promise.reject();
        }
        if (!row.userId) return;
        await resetUserPwd(row.userId, password);
        message.success(`修改成功，新密码是：${password}`);
      }
    });
  };

  const handleStatusChange = async (row: UserVO, checked: boolean) => {
    if (!row.userId) return;
    const status = checked ? '0' : '1';
    const text = status === '0' ? '启用' : '停用';
    const previousStatus = row.status;
    try {
      await confirmAction(`确认要"${text}""${row.userName}"用户吗?`);
      await changeUserStatus(row.userId, status);
      message.success(`${text}成功`);
      actionRef.current?.reload();
    } catch {
      row.status = previousStatus;
      actionRef.current?.reload();
    }
  };

  const handleExport = () => {
    exportFile('/system/user/export', () => `user_${Date.now()}.xlsx`);
  };

  const columns: ProColumns<UserVO>[] = [
    {
      title: '用户编号',
      dataIndex: 'userId',
      width: 110,
      search: false,
      hideInTable: true
    },
    {
      title: '用户名称',
      dataIndex: 'userName',
      render: (_, row) => (
        <Button type="link" size="small" onClick={() => openView(row)}>
          {row.userName}
        </Button>
      )
    },
    {
      title: '用户昵称',
      dataIndex: 'nickName'
    },
    {
      title: '部门',
      dataIndex: 'deptName',
      search: false
    },
    {
      title: '手机号码',
      dataIndex: 'phoneNumber'
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      width: 100,
      fieldProps: {
        options: dictOptions(dicts.sys_normal_disable)
      },
      render: (_, row) => (
        <Switch
          checked={row.status === '0'}
          checkedChildren="启用"
          unCheckedChildren="停用"
          disabled={!canEdit}
          onChange={checked => handleStatusChange(row, checked)}
        />
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
      search: false,
      width: 170
    },
    {
      title: '创建时间',
      dataIndex: 'createTimeRange',
      valueType: 'dateTimeRange',
      hideInTable: true
    },
    {
      title: '操作',
      valueType: 'option',
      width: 160,
      fixed: 'right',
      render: (_, row) => {
        if (row.userId === '1761100000000000001') return null;
        return (
          <RowActions
            actions={[
              canEdit && { key: 'edit', label: '修改', icon: <EditOutlined />, onClick: () => openEdit(row) },
              canRemove && {
                key: 'delete',
                label: '删除',
                icon: <DeleteOutlined />,
                danger: true,
                confirm: `是否确认删除用户编号为"${row.userId}"的数据项？`,
                onClick: () => handleDelete(row)
              },
              canResetPwd && {
                key: 'resetPwd',
                label: '重置密码',
                icon: <KeyOutlined />,
                onClick: () => handleResetPwd(row)
              },
              canEdit && {
                key: 'authRole',
                label: '分配角色',
                icon: <UserSwitchOutlined />,
                onClick: () => history.push(`/system/user-auth/role/${row.userId}`)
              }
            ]}
          />
        );
      }
    }
  ];

  return (
    <PageContainer title="用户管理">
      <div className="tree-table-page">
        <TreePanel
          title="部门结构"
          placeholder="请输入部门名称"
          data={deptOptions}
          fieldNames={{ title: 'label', key: 'id', children: 'children' }}
          onNodeClick={node => {
            setDeptId(node.id as string | number);
            setTimeout(() => actionRef.current?.reload(), 0);
          }}
        />
        <main className="table-panel">
          <ProTable<UserVO, UserQuery & { createTimeRange?: [string, string] }>
            actionRef={actionRef}
            rowKey="userId"
            columns={columns}
            scroll={tableScroll}
            search={{ labelWidth: 90 }}
            pagination={{ defaultPageSize: 10, showSizeChanger: true }}
            rowSelection={{
              selectedRowKeys: selectedIds,
              onChange: handleSelectionChange
            }}
            request={async params => {
              const { createTimeRange, ...tableParams } = params;
              const query = applyCreateTimeDateRange(
                {
                  ...toPageQuery(tableParams),
                  deptId
                },
                createTimeRange
              );
              updateExportParams(query);
              const res = await listUser(query);
              return toTableData(res);
            }}
            toolbar={{
              title: '用户列表'
            }}
            toolBarRender={() => [
              canAdd && (
                <Button key="add" type="primary" icon={<PlusOutlined />} onClick={openAdd}>
                  新增
                </Button>
              ),
              canEdit && (
                <Button key="edit" disabled={!selectedOne} icon={<EditOutlined />} onClick={() => openEdit()}>
                  修改
                </Button>
              ),
              canRemove && (
                <Popconfirm
                  key="delete"
                  title={`是否确认删除用户编号为"${selectedIds}"的数据项？`}
                  onConfirm={() => handleDelete()}
                >
                  <Button danger disabled={!selectedIds.length} icon={<DeleteOutlined />}>
                    删除
                  </Button>
                </Popconfirm>
              ),
              canEdit && (
                <Button key="unlock" disabled={!selectedOne} icon={<LockOutlined />} onClick={handleUnlock}>
                  解锁
                </Button>
              ),
              canImport && (
                <Button key="import" icon={<UploadOutlined />} onClick={openImportModal}>
                  导入数据
                </Button>
              ),
              canExport && (
                <Button key="export" icon={<DownloadOutlined />} onClick={handleExport}>
                  导出数据
                </Button>
              )
            ]}
          />
        </main>
      </div>

      <UserFormModal
        open={modalOpen}
        title={modalTitle}
        form={form}
        initialValues={defaultForm}
        currentUserId={currentUserId}
        deptTreeData={deptSelectTreeData}
        postOptions={postOptions}
        roleOptions={roleOptions}
        genderOptions={dictOptions(dicts.sys_user_gender)}
        statusOptions={dictOptions(dicts.sys_normal_disable)}
        onDeptChange={async value => {
          const res = await optionSelectPost(value);
          setPostOptions(res.data || []);
        }}
        onClose={closeModal}
        onFinish={submitForm}
      />

      <UserImportModal open={importOpen} onClose={closeImportModal} onSuccess={() => actionRef.current?.reload()} />

      <UserDetailDrawer
        open={viewOpen}
        userId={viewUserId}
        genderOptions={dicts.sys_user_gender}
        onClose={closeViewDrawer}
      />
    </PageContainer>
  );
}
