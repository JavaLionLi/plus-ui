import { BellOutlined, CheckOutlined, ReloadOutlined } from '@ant-design/icons';
import { history } from '@umijs/max';
import { useBoolean, useRequest } from 'ahooks';
import { Badge, Button, Empty, List, Popover, Space, Spin, Tabs, Tag, Tooltip, Typography, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import type { MessageVO } from '@/api/system/message/types';
import { getMessageBox } from '@/api/system/message';
import { useNoticeStore, type NoticeItem } from '@/stores/noticeStore';
import { getReadMessageIds, markMessageRead, markMessageReadBatch } from '@/utils/messageRead';
import { isHttp } from '@/utils/ruoyi';

type MessageCategory = 'system' | 'notice' | 'workflow';

interface MessageBoxProps {
  userId?: string | number;
}

const categoryMeta: Record<MessageCategory, { label: string; empty: string }> = {
  system: { label: '系统', empty: '暂无系统消息' },
  notice: { label: '通知', empty: '暂无通知公告消息' },
  workflow: { label: '工作', empty: '暂无工作流消息' }
};

function formatTime(value?: string) {
  if (!value) return '';
  const time = new Date(value);
  if (Number.isNaN(time.getTime())) return value;
  return time.toLocaleString();
}

function withReadState(userId: string | number | undefined, category: MessageCategory, list?: MessageVO[]) {
  const readIds = getReadMessageIds(userId);
  return (list || []).map(item => ({
    ...item,
    category,
    read: item.messageId !== undefined && item.messageId !== null ? readIds.has(String(item.messageId)) : false,
    timestamp: item.createTime ? new Date(item.createTime).getTime() : Date.now(),
    time: formatTime(item.createTime)
  }));
}

export default function MessageBox({ userId }: MessageBoxProps) {
  const [open, { set: setOpen, setFalse: closePopover }] = useBoolean(false);
  const [tooltipOpen, { set: setTooltipOpen, setFalse: closeTooltip }] = useBoolean(false);
  const [activeKey, setActiveKey] = useState<MessageCategory>('system');
  const items = useNoticeStore(state => state.notices);
  const setNotices = useNoticeStore(state => state.setNotices);
  const markRead = useNoticeStore(state => state.markRead);
  const markReadBatch = useNoticeStore(state => state.markReadBatch);

  const { loading, run: loadMessages } = useRequest(
    async () => {
      const res = await getMessageBox();
      return [
        ...withReadState(userId, 'system', res.data?.systemList),
        ...withReadState(userId, 'notice', res.data?.noticeList),
        ...withReadState(userId, 'workflow', res.data?.workflowList)
      ] as NoticeItem[];
    },
    {
      manual: true,
      onSuccess: data => setNotices(data),
      onError: error => {
        message.error((error as Error).message || '加载消息失败');
      }
    }
  );

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const unreadCount = items.filter(item => !item.read).length;
  const grouped = useMemo(
    () => ({
      system: items.filter(item => item.category === 'system'),
      notice: items.filter(item => item.category === 'notice'),
      workflow: items.filter(item => item.category === 'workflow')
    }),
    [items]
  );

  const currentItems = grouped[activeKey];

  const readMessage = (item: NoticeItem) => {
    markMessageRead(userId, item.messageId);
    markRead(item.messageId);
    if (item.path) {
      closePopover();
      if (isHttp(item.path)) {
        window.open(item.path, '_blank', 'noopener,noreferrer');
        return;
      }
      history.push(item.path);
    }
  };

  const readAll = () => {
    markMessageReadBatch(
      userId,
      items.map(item => item.messageId)
    );
    markReadBatch(items.map(item => item.messageId));
  };

  const content = (
    <div className="message-box-popover">
      <div className="message-box-head">
        <Typography.Text strong>消息盒子</Typography.Text>
        <Space size={4}>
          <Button type="link" size="small" icon={<ReloadOutlined />} onClick={loadMessages}>
            刷新
          </Button>
          <Button type="link" size="small" icon={<CheckOutlined />} onClick={readAll}>
            全部已读
          </Button>
        </Space>
      </div>
      <Tabs
        activeKey={activeKey}
        onChange={key => setActiveKey(key as MessageCategory)}
        size="small"
        items={(Object.keys(categoryMeta) as MessageCategory[]).map(key => ({
          key,
          label: `${categoryMeta[key].label} ${grouped[key].length}`
        }))}
      />
      <Spin spinning={loading}>
        <div className="message-box-list">
          {currentItems.length ? (
            <List
              dataSource={currentItems}
              rowKey={item => String(item.messageId)}
              renderItem={item => (
                <List.Item className="message-box-item" onClick={() => readMessage(item)}>
                  <div className="message-box-item-main">
                    <div className="message-box-item-title">{item.title || '消息'}</div>
                    <div className="message-box-item-message">{item.message}</div>
                    {item.content && <div className="message-box-item-content">{item.content}</div>}
                    <div className="message-box-item-time">{item.time || formatTime(item.createTime)}</div>
                  </div>
                  <Tag color={item.read ? 'success' : 'error'}>{item.read ? '已读' : '未读'}</Tag>
                </List.Item>
              )}
            />
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={categoryMeta[activeKey].empty} />
          )}
        </div>
      </Spin>
    </div>
  );

  return (
    <Popover
      open={open}
      onOpenChange={next => {
        setOpen(next);
        if (next) closeTooltip();
        if (next) loadMessages();
      }}
      placement="bottomRight"
      trigger="click"
      content={content}
      arrow={false}
      styles={{ container: { width: 340 } }}
    >
      <Tooltip title="消息盒子" open={tooltipOpen && !open} onOpenChange={setTooltipOpen}>
        <Badge className="message-box-badge" count={unreadCount} size="small" overflowCount={99} offset={[-5, 5]}>
          <Button
            type="text"
            className="layout-action-button message-box-trigger"
            icon={<BellOutlined />}
            onClick={closeTooltip}
          />
        </Badge>
      </Tooltip>
    </Popover>
  );
}
