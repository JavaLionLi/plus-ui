import type { FormInstance } from 'antd';
import { ModalForm, ProFormText, ProFormTreeSelect } from '@ant-design/pro-components';
import { Checkbox, Form, Radio } from 'antd';
import type { CategoryTreeVO } from '@/api/workflow/category/types';
import type { FlowDefinitionForm } from '@/api/workflow/definition/types';

interface DefinitionFormModalProps {
  open: boolean;
  title: string;
  form: FormInstance<FlowDefinitionForm>;
  categoryOptions: CategoryTreeVO[];
  autoPass: boolean;
  onAutoPassChange: (autoPass: boolean) => void;
  onCancel: () => void;
  onFinish: (fields: FlowDefinitionForm) => Promise<boolean>;
}

export default function DefinitionFormModal({
  open,
  title,
  form,
  categoryOptions,
  autoPass,
  onAutoPassChange,
  onCancel,
  onFinish
}: DefinitionFormModalProps) {
  const editId = Form.useWatch('id', form);

  return (
    <ModalForm<FlowDefinitionForm>
      title={title}
      open={open}
      form={form}
      layout="vertical"
      modalProps={{ destroyOnHidden: true, onCancel }}
      onOpenChange={nextOpen => !nextOpen && onCancel()}
      onFinish={onFinish}
    >
      <ProFormText name="id" hidden />
      <ProFormTreeSelect
        name="category"
        label="流程类别"
        rules={[{ required: true, message: '分类名称不能为空' }]}
        fieldProps={{
          treeData: categoryOptions,
          fieldNames: { label: 'label', value: 'id', children: 'children' },
          treeDefaultExpandAll: true,
          allowClear: true
        }}
      />
      <ProFormText
        name="flowCode"
        label="流程编码"
        fieldProps={{ maxLength: 40, showCount: true }}
        placeholder="请输入流程编码"
        rules={[{ required: true, message: '流程定义编码不能为空' }]}
      />
      <ProFormText
        name="flowName"
        label="流程名称"
        fieldProps={{ maxLength: 100, showCount: true }}
        placeholder="请输入流程名称"
        rules={[{ required: true, message: '流程定义名称不能为空' }]}
      />
      <Form.Item name="modelValue" label="设计器模式" rules={[{ required: true, message: '设计器模式不能为空' }]}>
        <Radio.Group disabled={!!editId}>
          <Radio.Button value="CLASSICS">经典模式</Radio.Button>
          <Radio.Button value="MIMIC">仿钉钉模式</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item label="流程配置">
        <Checkbox checked={autoPass} onChange={event => onAutoPassChange(event.target.checked)}>
          下一节点执行人是当前任务处理人自动审批
        </Checkbox>
      </Form.Item>
      <Form.Item name="formCustom" label="是否动态表单" rules={[{ required: true, message: '请选择是否动态表单' }]}>
        <Radio.Group>
          <Radio.Button value="Y" disabled>
            是
          </Radio.Button>
          <Radio.Button value="N">否</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <ProFormText
        name="formPath"
        label="表单路径"
        fieldProps={{ maxLength: 100, showCount: true }}
        placeholder="请输入表单路径"
      />
    </ModalForm>
  );
}
