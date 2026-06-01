import { Checkbox, Form, Input, Space, type FormItemProps } from 'antd';

interface MessageTypeProps {
  typeName?: string;
  messageName?: string;
  messageLabel?: string;
  messageRules?: FormItemProps['rules'];
}

export default function MessageType({
  typeName = 'messageType',
  messageName = 'message',
  messageLabel = '消息内容',
  messageRules
}: MessageTypeProps) {
  return (
    <>
      <Form.Item name={typeName} label="消息提醒" rules={[{ required: true, message: '请选择消息提醒' }]}>
        <Checkbox.Group>
          <Space>
            <Checkbox value="1" disabled>
              站内信
            </Checkbox>
            <Checkbox value="2">邮件</Checkbox>
            <Checkbox value="3">短信</Checkbox>
          </Space>
        </Checkbox.Group>
      </Form.Item>
      <Form.Item name={messageName} label={messageLabel} rules={messageRules}>
        <Input.TextArea rows={4} />
      </Form.Item>
    </>
  );
}
