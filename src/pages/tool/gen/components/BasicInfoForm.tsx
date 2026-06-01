import { Col, Form, Input, Row } from 'antd';

export default function BasicInfoForm() {
  return (
    <Row gutter={16}>
      <Col xs={24} md={12}>
        <Form.Item name="tableName" label="表名称" rules={[{ required: true, message: '请输入表名称' }]}>
          <Input />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item name="tableComment" label="表描述" rules={[{ required: true, message: '请输入表描述' }]}>
          <Input />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item name="className" label="实体类名称" rules={[{ required: true, message: '请输入实体类名称' }]}>
          <Input />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item name="functionAuthor" label="作者" rules={[{ required: true, message: '请输入作者' }]}>
          <Input />
        </Form.Item>
      </Col>
      <Col span={24}>
        <Form.Item name="remark" label="备注">
          <Input.TextArea rows={3} />
        </Form.Item>
      </Col>
    </Row>
  );
}
