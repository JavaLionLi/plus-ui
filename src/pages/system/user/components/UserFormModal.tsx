import type { FormInstance } from 'antd';
import { ModalForm, ProFormSelect, ProFormText, ProFormTextArea, ProFormTreeSelect } from '@ant-design/pro-components';
import { Form } from 'antd';
import type { PostVO } from '@/api/system/post/types';
import type { RoleVO } from '@/api/system/role/types';
import type { UserForm } from '@/api/system/user/types';

interface TreeSelectNode {
  title: string;
  value: string | number;
  disabled?: boolean;
  children?: TreeSelectNode[];
}

interface UserFormModalProps {
  open: boolean;
  title: string;
  form: FormInstance<UserForm>;
  initialValues: UserForm;
  currentUserId?: string | number;
  deptTreeData: TreeSelectNode[];
  postOptions: PostVO[];
  roleOptions: RoleVO[];
  genderOptions: Array<{ label: string; value: string }>;
  statusOptions: Array<{ label: string; value: string }>;
  onDeptChange: (deptId?: string | number) => Promise<void>;
  onClose: () => void;
  onFinish: (values: UserForm) => Promise<boolean>;
}

export default function UserFormModal({
  open,
  title,
  form,
  initialValues,
  currentUserId,
  deptTreeData,
  postOptions,
  roleOptions,
  genderOptions,
  statusOptions,
  onDeptChange,
  onClose,
  onFinish
}: UserFormModalProps) {
  const editingUserId = Form.useWatch('userId', form);
  const editingSelf = !!editingUserId && String(editingUserId) === String(currentUserId);

  return (
    <ModalForm<UserForm>
      title={title}
      open={open}
      width={720}
      form={form}
      layout="vertical"
      initialValues={initialValues}
      modalProps={{
        destroyOnHidden: true,
        onCancel: () => {
          onClose();
          form.resetFields();
        }
      }}
      onOpenChange={nextOpen => !nextOpen && onClose()}
      onFinish={onFinish}
    >
      <ProFormText name="userId" hidden />
      <div className="form-grid">
        <ProFormText
          name="nickName"
          label="用户昵称"
          fieldProps={{ maxLength: 30 }}
          placeholder="请输入用户昵称"
          rules={[{ required: true, message: '用户昵称不能为空' }]}
        />
        {!editingSelf && (
          <ProFormTreeSelect
            name="deptId"
            label="归属部门"
            fieldProps={{
              allowClear: true,
              treeDefaultExpandAll: true,
              placeholder: '请选择归属部门',
              treeData: deptTreeData,
              onChange: async value => {
                await onDeptChange(value);
                form.setFieldValue('postIds', []);
              }
            }}
          />
        )}
        <ProFormText
          name="phoneNumber"
          label="手机号码"
          fieldProps={{ maxLength: 11 }}
          placeholder="请输入手机号码"
          rules={[{ pattern: /^1[3456789][0-9]\d{8}$/, message: '请输入正确的手机号码' }]}
        />
        <ProFormText
          name="email"
          label="邮箱"
          fieldProps={{ maxLength: 50 }}
          placeholder="请输入邮箱"
          rules={[{ type: 'email', message: '请输入正确的邮箱地址' }]}
        />
        {!editingUserId && (
          <>
            <ProFormText
              name="userName"
              label="用户名称"
              fieldProps={{ maxLength: 30 }}
              placeholder="请输入用户名称"
              rules={[
                { required: true, message: '用户名称不能为空' },
                { min: 2, max: 20, message: '用户名称长度必须介于 2 和 20 之间' }
              ]}
            />
            <ProFormText.Password
              name="password"
              label="用户密码"
              fieldProps={{ maxLength: 20 }}
              placeholder="请输入用户密码"
              rules={[
                { required: true, message: '用户密码不能为空' },
                { min: 5, max: 20, message: '用户密码长度必须介于 5 和 20 之间' },
                { pattern: /^[^<>"'|\\]+$/, message: `不能包含非法字符：< > " ' \\ |` }
              ]}
            />
          </>
        )}
        <ProFormSelect name="gender" label="用户性别" allowClear options={genderOptions} placeholder="请选择" />
        <ProFormSelect name="status" label="状态" options={statusOptions} placeholder="请选择" />
        {!editingSelf && (
          <>
            <ProFormSelect
              name="postIds"
              label="岗位"
              mode="multiple"
              allowClear
              options={postOptions.map(item => ({
                label: item.postName,
                value: item.postId,
                disabled: item.status === '1'
              }))}
              placeholder="请选择"
            />
            <ProFormSelect
              name="roleIds"
              label="角色"
              mode="multiple"
              allowClear
              options={roleOptions.map(item => ({
                label: item.roleName,
                value: item.roleId,
                disabled: item.status === '1'
              }))}
              placeholder="请选择"
              rules={[{ required: true, message: '用户角色不能为空' }]}
            />
          </>
        )}
      </div>
      <ProFormTextArea name="remark" label="备注" fieldProps={{ rows: 3 }} placeholder="请输入内容" />
    </ModalForm>
  );
}
