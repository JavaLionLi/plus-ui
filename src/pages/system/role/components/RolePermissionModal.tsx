import { ModalForm, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { Checkbox, Form, Space, Tabs, Tree } from 'antd';
import type { RoleForm } from '@/api/system/role/types';
import { dataScopeOptions, defaultRoleForm, useRolePermission } from './useRolePermission';

interface RolePermissionModalProps {
  open: boolean;
  roleId?: string | number;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function RolePermissionModal({ open, roleId, onCancel, onSuccess }: RolePermissionModalProps) {
  const [form] = Form.useForm<RoleForm>();
  const permission = useRolePermission({ open, roleId, form, onSuccess });

  const closeModal = () => {
    onCancel();
    permission.resetPermission();
  };

  return (
    <ModalForm<RoleForm>
      title="分配权限"
      open={open}
      width={780}
      form={form}
      layout="vertical"
      initialValues={defaultRoleForm}
      modalProps={{ destroyOnHidden: true, onCancel: closeModal }}
      submitter={{ submitButtonProps: { loading: permission.loading } }}
      onOpenChange={nextOpen => !nextOpen && closeModal()}
      onFinish={permission.submitPermission}
    >
      <ProFormText name="roleId" hidden />
      <ProFormText name="roleName" label="角色名称" fieldProps={{ disabled: true }} />
      <Tabs
        activeKey={permission.activeTab}
        onChange={permission.setActiveTab}
        items={[
          {
            key: 'menu',
            label: '菜单权限',
            children: (
              <>
                <Space style={{ marginBottom: 8 }}>
                  <Checkbox
                    checked={permission.menuExpandAll}
                    onChange={event => permission.setMenuExpandAll(event.target.checked)}
                  >
                    展开/折叠
                  </Checkbox>
                  <Checkbox
                    checked={permission.menuAllChecked}
                    onChange={event => permission.checkAllMenus(event.target.checked)}
                  >
                    全选/全不选
                  </Checkbox>
                  <Checkbox
                    checked={permission.menuConnect}
                    onChange={event => permission.toggleMenuConnect(event.target.checked)}
                  >
                    父子联动
                  </Checkbox>
                </Space>
                <Tree
                  className="permission-tree"
                  checkable
                  selectable={false}
                  defaultExpandAll={permission.menuExpandAll}
                  key={String(permission.menuExpandAll)}
                  treeData={permission.menuTreeData}
                  checkedKeys={permission.menuCheckedKeys}
                  checkStrictly={!permission.menuConnect}
                  onCheck={(keys, info) => permission.handleMenuCheck(keys, info.node.key, info.checked)}
                />
              </>
            )
          },
          {
            key: 'data',
            label: '数据权限',
            children: (
              <>
                <ProFormSelect name="dataScope" label="权限范围" options={dataScopeOptions} />
                <Form.Item shouldUpdate={(prev, current) => prev.dataScope !== current.dataScope} noStyle>
                  {({ getFieldValue }) =>
                    getFieldValue('dataScope') === '2' ? (
                      <>
                        <Space style={{ marginBottom: 8 }}>
                          <Checkbox
                            checked={permission.deptExpandAll}
                            onChange={event => permission.setDeptExpandAll(event.target.checked)}
                          >
                            展开/折叠
                          </Checkbox>
                          <Checkbox
                            checked={permission.deptAllChecked}
                            onChange={event => permission.checkAllDepts(event.target.checked)}
                          >
                            全选/全不选
                          </Checkbox>
                          <Checkbox
                            checked={permission.deptConnect}
                            onChange={event => permission.toggleDeptConnect(event.target.checked)}
                          >
                            父子联动
                          </Checkbox>
                        </Space>
                        <Tree
                          className="permission-tree"
                          checkable
                          selectable={false}
                          defaultExpandAll={permission.deptExpandAll}
                          key={String(permission.deptExpandAll)}
                          treeData={permission.deptTreeData}
                          checkedKeys={permission.deptCheckedKeys}
                          checkStrictly={!permission.deptConnect}
                          onCheck={permission.handleDeptCheck}
                        />
                      </>
                    ) : null
                  }
                </Form.Item>
              </>
            )
          }
        ]}
      />
    </ModalForm>
  );
}
