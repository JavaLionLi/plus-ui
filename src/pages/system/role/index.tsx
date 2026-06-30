import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  TeamOutlined
} from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProFormDigit,
  ProFormRadio,
  ProFormText,
  ProFormTextArea,
  ProTable,
  type ActionType,
  type ProColumns
} from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { useBoolean } from 'ahooks';
import { Button, Form, message, Popconfirm, Switch } from 'antd';
import { useRef, useState } from 'react';
import type { RoleForm, RoleQuery, RoleVO } from '@/api/system/role/types';
import { roleMenuTreeselect } from '@/api/system/menu';
import { addRole, changeRoleStatus, delRole, getRole, listRole, updateRole } from '@/api/system/role';
import RowActions from '@/components/common/RowActions';
import { useDateRangeQuery } from '@/hooks/useDateRangeQuery';
import { useDict } from '@/hooks/useDict';
import { useTableExport } from '@/hooks/useTableExport';
import { useTableSelection } from '@/hooks/useTableSelection';
import { useTableScroll } from '@/hooks/useTableScroll';
import { useUserStore } from '@/stores/userStore';
import { dictOptions } from '@/utils/dict';
import { confirmAction } from '@/utils/modal';
import { hasPermi } from '@/utils/permission';
import { toPageQuery, toTableData } from '@/utils/ruoyi';
import RolePermissionModal from './components/RolePermissionModal';

const defaultRoleForm: RoleForm = {
  roleSort: 1,
  status: '0',
  menuCheckStrictly: true,
  deptCheckStrictly: true,
  dataScope: '1',
  menuIds: [],
  deptIds: []
};

export default function SystemRolePage() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { tableScroll } = useTableScroll(1132);
  const [form] = Form.useForm<RoleForm>();
  const userInfo = useUserStore(state => state.userInfo);
  const dicts = useDict('sys_normal_disable');
  const {
    ids: selectedIds,
    selectedOne,
    handleSelectionChange,
    clearSelection
  } = useTableSelection<RoleVO>(row => row.roleId);
  const [modalOpen, { setTrue: openModal, setFalse: closeModal }] = useBoolean(false);
  const [modalTitle, setModalTitle] = useState('');
  const [permissionOpen, { setTrue: openPermissionModal, setFalse: closePermissionModal }] = useBoolean(false);
  const [permissionRoleId, setPermissionRoleId] = useState<string | number>();
  const { updateExportParams, exportFile } = useTableExport();
  const { applyDateRange: applyCreateTimeDateRange } = useDateRangeQuery();

  const canAdd = hasPermi(userInfo, ['system:role:add']);
  const canEdit = hasPermi(userInfo, ['system:role:edit']);
  const canRemove = hasPermi(userInfo, ['system:role:remove']);
  const canExport = hasPermi(userInfo, ['system:role:export']);

  const openAdd = () => {
    form.resetFields();
    setModalTitle('添加角色');
    form.setFieldsValue(defaultRoleForm);
    openModal();
  };

  const openEdit = async (row?: RoleVO) => {
    const target = row || selectedOne;
    if (!target?.roleId) return;
    const [res, menuRes] = await Promise.all([getRole(target.roleId), roleMenuTreeselect(target.roleId)]);
    form.resetFields();
    setModalTitle('修改角色');
    form.setFieldsValue({
      ...defaultRoleForm,
      ...res.data,
      roleSort: Number(res.data.roleSort),
      menuIds: menuRes.data.checkedKeys
    });
    openModal();
  };

  const submitForm = async (fields: RoleForm) => {
    const values = { ...form.getFieldsValue(true), ...fields };
    if (values.roleId) {
      await updateRole(values);
    } else {
      await addRole(values);
    }
    message.success('操作成功');
    form.resetFields();
    actionRef.current?.reload();
    return true;
  };

  const handleDelete = async (row?: RoleVO) => {
    const ids = row?.roleId || selectedIds;
    if (!ids || (Array.isArray(ids) && ids.length === 0)) return;
    await delRole(ids);
    message.success('删除成功');
    clearSelection();
    actionRef.current?.reloadAndRest?.();
  };

  const handleStatusChange = async (row: RoleVO, checked: boolean) => {
    const status = checked ? '0' : '1';
    const text = status === '0' ? '启用' : '停用';
    try {
      await confirmAction(`确认要"${text}""${row.roleName}"角色吗?`);
      await changeRoleStatus(row.roleId, status);
      message.success(`${text}成功`);
      actionRef.current?.reload();
    } catch {
      actionRef.current?.reload();
    }
  };

  const openPermission = (row: RoleVO) => {
    setPermissionRoleId(row.roleId);
    openPermissionModal();
  };

  const handleExport = () => {
    exportFile('/system/role/export', () => `role_${Date.now()}.xlsx`);
  };

  const columns: ProColumns<RoleVO>[] = [
    {
      title: '角色编号',
      dataIndex: 'roleId',
      search: false,
      hideInTable: true
    },
    {
      title: '角色名称',
      dataIndex: 'roleName',
      width: 160
    },
    {
      title: '权限字符',
      dataIndex: 'roleKey',
      width: 200
    },
    {
      title: '显示顺序',
      dataIndex: 'roleSort',
      search: false,
      width: 112
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
        if (String(row.roleId) === '1761300000000000001') return null;
        return (
          <RowActions
            actions={[
              canEdit && { key: 'edit', label: '修改', icon: <EditOutlined />, onClick: () => openEdit(row) },
              canRemove && {
                key: 'delete',
                label: '删除',
                icon: <DeleteOutlined />,
                danger: true,
                confirm: `是否确认删除角色编号为"${row.roleId}"的数据项？`,
                onClick: () => handleDelete(row)
              },
              canEdit && {
                key: 'permission',
                label: '分配权限',
                icon: <SafetyCertificateOutlined />,
                onClick: () => openPermission(row)
              },
              canEdit && {
                key: 'users',
                label: '分配用户',
                icon: <TeamOutlined />,
                onClick: () => history.push(`/system/role-auth/user/${row.roleId}`)
              }
            ]}
          />
        );
      }
    }
  ];

  return (
    <PageContainer title="角色管理">
      <ProTable<RoleVO, RoleQuery & { createTimeRange?: [string, string] }>
        actionRef={actionRef}
        rowKey="roleId"
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
          const query = applyCreateTimeDateRange(toPageQuery(tableParams), createTimeRange);
          updateExportParams(query);
          const res = await listRole(query);
          return toTableData(res);
        }}
        toolbar={{ title: '角色列表' }}
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
              title={`是否确认删除角色编号为"${selectedIds}"的数据项？`}
              onConfirm={() => handleDelete()}
            >
              <Button danger disabled={!selectedIds.length} icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          ),
          canExport && (
            <Button key="export" icon={<DownloadOutlined />} onClick={handleExport}>
              导出
            </Button>
          )
        ]}
      />

      <ModalForm<RoleForm>
        title={modalTitle}
        open={modalOpen}
        width={720}
        form={form}
        layout="vertical"
        initialValues={defaultRoleForm}
        modalProps={{
          destroyOnHidden: true,
          onCancel: () => {
            closeModal();
            form.resetFields();
          }
        }}
        onOpenChange={open => !open && closeModal()}
        onFinish={submitForm}
      >
        <ProFormText name="roleId" hidden />
        <div className="form-grid">
          <ProFormText
            name="roleName"
            label="角色名称"
            placeholder="请输入角色名称"
            rules={[{ required: true, message: '角色名称不能为空' }]}
          />
          <ProFormText
            name="roleKey"
            label="权限字符"
            placeholder="请输入权限字符"
            rules={[{ required: true, message: '权限字符不能为空' }]}
          />
          <ProFormDigit
            name="roleSort"
            label="角色顺序"
            min={0}
            rules={[{ required: true, message: '角色顺序不能为空' }]}
          />
          <ProFormRadio.Group name="status" label="状态" options={dictOptions(dicts.sys_normal_disable)} />
        </div>
        <ProFormTextArea name="remark" label="备注" placeholder="请输入内容" fieldProps={{ rows: 3 }} />
      </ModalForm>

      <RolePermissionModal
        open={permissionOpen}
        roleId={permissionRoleId}
        onCancel={closePermissionModal}
        onSuccess={() => {
          closePermissionModal();
          actionRef.current?.reload();
        }}
      />
    </PageContainer>
  );
}
