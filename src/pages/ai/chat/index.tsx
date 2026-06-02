import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Bubble, Conversations, Prompts, Sender, type BubbleItemType } from '@ant-design/x';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Avatar, Button, Empty, message, Space, Spin, Typography } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  AgentChatSyncResponse,
  AgentItem,
  ConversationMessage,
  ConversationSummaryItem
} from '@/api/ai/agent/types';
import {
  createConversation,
  deleteConversation,
  fetchAgentChat,
  fetchAgentChatSync,
  fetchAgentConversations,
  fetchChatMode,
  fetchConversationMessages,
  fetchMyAgents,
  registerCurrentSnailUser
} from '@/api/ai/agent';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const aiChatKeys = {
  bootstrap: ['ai-chat', 'bootstrap'] as const,
  conversations: (agentId?: number) => ['ai-chat', 'conversations', agentId] as const,
  messages: (agentId?: number, conversationId?: string) => ['ai-chat', 'messages', agentId, conversationId] as const
};

function getList<T>(payload: unknown): T[] {
  const container = (payload as { data?: unknown })?.data ?? payload;
  if (Array.isArray(container)) return container as T[];
  const record = container as { rows?: T[]; list?: T[]; records?: T[] };
  if (Array.isArray(record?.rows)) return record.rows;
  if (Array.isArray(record?.list)) return record.list;
  if (Array.isArray(record?.records)) return record.records;
  return [];
}

function normalizeAgentList(payload: unknown): AgentItem[] {
  return getList<Record<string, unknown>>(payload)
    .map(item => ({
      id: Number(item.id ?? item.agentId),
      name: String(item.name ?? item.title ?? ''),
      description: item.description as string | undefined,
      avatar: item.avatar as string | undefined,
      greeting: item.greeting as string | undefined,
      status: item.status as number | undefined,
      presetQuestions: Array.isArray(item.presetQuestions) ? item.presetQuestions.map(String) : []
    }))
    .filter(item => Number.isFinite(item.id) && !!item.name);
}

function normalizeConversationList(payload: unknown): ConversationSummaryItem[] {
  return getList<Record<string, unknown>>(payload)
    .map(item => ({
      conversationId: String(item.conversationId ?? item.id ?? ''),
      title: String(item.title ?? item.name ?? ''),
      lastMessageDt: item.lastMessageDt as string | undefined,
      createDt: (item.createDt ?? item.createTime) as string | undefined,
      updateDt: (item.updateDt ?? item.updateTime) as string | undefined
    }))
    .filter(item => !!item.conversationId)
    .sort(
      (a, b) =>
        new Date(b.lastMessageDt || b.createDt || 0).getTime() - new Date(a.lastMessageDt || a.createDt || 0).getTime()
    );
}

function normalizeMessageList(payload: unknown): ChatMessage[] {
  return getList<ConversationMessage>(payload)
    .map(item => {
      const role = String(item.role || item.messageType || item.senderType || '').toLowerCase();
      return {
        role: role === 'user' ? 'user' : 'assistant',
        content: String(item.content ?? item.message ?? item.text ?? '')
      } as ChatMessage;
    })
    .filter(item => !!item.content);
}

function normalizeStreamChunk(chunk: string) {
  const text = String(chunk || '');
  if (!text.trim()) return '';
  const tryParse = (raw: string) => {
    try {
      const obj = JSON.parse(raw) as { content?: string };
      return typeof obj.content === 'string' ? obj.content : null;
    } catch {
      return null;
    }
  };
  const single = tryParse(text);
  if (single !== null) return single;
  const lines = text
    .replace(/}\s*{/g, '}\n{')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
  if (!lines.length) return text;
  let merged = '';
  for (const line of lines) {
    const parsed = tryParse(line);
    if (parsed === null) return text;
    merged += parsed;
  }
  return merged;
}

function extractSyncReply(payload: AgentChatSyncResponse) {
  const candidates = [
    payload.content,
    payload.text,
    payload.message,
    payload.answer,
    payload.reply,
    payload.outputText,
    payload.result
  ];
  const hit = candidates.find(item => typeof item === 'string' && item.trim());
  if (hit) return normalizeStreamChunk(String(hit)) || String(hit);
  if (Array.isArray(payload.messages)) {
    return (
      normalizeMessageList(payload.messages)
        .filter(item => item.role === 'assistant')
        .at(-1)?.content || ''
    );
  }
  return '';
}

export default function AiChatPage() {
  const queryClient = useQueryClient();
  const [currentAgentId, setCurrentAgentId] = useState<number>();
  const [currentConversationId, setCurrentConversationId] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const bootstrapQuery = useQuery({
    queryKey: aiChatKeys.bootstrap,
    queryFn: async () => {
      const [userRes, agentsRes, modeRes] = await Promise.all([
        registerCurrentSnailUser(),
        fetchMyAgents(),
        fetchChatMode()
      ]);
      return {
        nickname: userRes.data?.nickname || '',
        agents: normalizeAgentList(agentsRes.data),
        sendMode: modeRes.data?.mode === 'sync' ? ('sync' as const) : ('stream' as const)
      };
    }
  });

  const agents = bootstrapQuery.data?.agents || [];
  const currentAgent = useMemo(
    () => agents.find(agent => agent.id === currentAgentId) || agents[0] || null,
    [agents, currentAgentId]
  );
  const sendMode = bootstrapQuery.data?.sendMode || 'stream';
  const nickname = bootstrapQuery.data?.nickname || '';

  const conversationsQuery = useQuery({
    queryKey: aiChatKeys.conversations(currentAgent?.id),
    enabled: !!currentAgent?.id,
    queryFn: async () => {
      if (!currentAgent?.id) return [];
      const res = await fetchAgentConversations(currentAgent.id, { page: 1, size: 50 });
      return normalizeConversationList(res.data);
    }
  });

  const conversationMessagesQuery = useQuery({
    queryKey: aiChatKeys.messages(currentAgent?.id, currentConversationId),
    enabled: !!currentAgent?.id && !!currentConversationId,
    queryFn: async () => {
      if (!currentAgent?.id) return [];
      const res = await fetchConversationMessages(currentAgent.id, currentConversationId);
      return normalizeMessageList(res.data);
    }
  });

  const presetQuestions = useMemo(() => (currentAgent?.presetQuestions || []).filter(Boolean), [currentAgent]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const finishSending = useCallback(() => {
    setSending(false);
    clearTimer();
    abortRef.current = null;
  }, [clearTimer]);

  useEffect(() => {
    if (!currentAgentId && agents[0]) {
      setCurrentAgentId(agents[0].id);
    }
  }, [agents, currentAgentId]);

  useEffect(() => {
    if (currentConversationId && conversationMessagesQuery.data && !sending) {
      setMessages(conversationMessagesQuery.data);
    }
  }, [conversationMessagesQuery.data, currentConversationId, sending]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      clearTimer();
    };
  }, [clearTimer]);

  const refreshConversationData = useCallback(
    async (agentId: number, conversationId?: string) => {
      await queryClient.invalidateQueries({ queryKey: aiChatKeys.conversations(agentId) });
      if (conversationId) {
        await queryClient.invalidateQueries({ queryKey: aiChatKeys.messages(agentId, conversationId) });
      }
    },
    [queryClient]
  );

  const selectAgent = (agentId: string | number) => {
    const nextAgentId = Number(agentId);
    if (currentAgentId === nextAgentId) return;
    abortRef.current?.abort();
    finishSending();
    setCurrentAgentId(nextAgentId);
    setCurrentConversationId('');
    setMessages([]);
  };

  const startNewConversation = () => {
    abortRef.current?.abort();
    finishSending();
    setCurrentConversationId('');
    setMessages([]);
  };

  const selectConversation = (conversationId: string | number) => {
    const nextConversationId = String(conversationId);
    if (currentConversationId === nextConversationId) return;
    abortRef.current?.abort();
    finishSending();
    setCurrentConversationId(nextConversationId);
    setMessages([]);
  };

  const removeConversation = async (conversationId: string) => {
    if (!currentAgent) return;
    await deleteConversation(currentAgent.id, conversationId);
    message.success('删除成功');
    if (currentConversationId === conversationId) {
      abortRef.current?.abort();
      finishSending();
      setCurrentConversationId('');
      setMessages([]);
    }
    await refreshConversationData(currentAgent.id);
  };

  const sendMessage = async (value?: string) => {
    const text = (value ?? content).trim();
    if (!currentAgent || !text || sending) return;
    setContent('');
    setSending(true);
    clearTimer();
    timerRef.current = setTimeout(() => {
      abortRef.current?.abort();
      finishSending();
      message.warning('响应超时，已恢复发送按钮，请重试');
    }, 300000);

    let targetConversationId = currentConversationId;
    if (!targetConversationId) {
      try {
        const res = await createConversation(currentAgent.id, { title: text.slice(0, 20) });
        if (!res.data?.conversationId) {
          finishSending();
          message.error('创建会话失败，请稍后重试');
          return;
        }
        targetConversationId = res.data.conversationId;
        setCurrentConversationId(targetConversationId);
        await refreshConversationData(currentAgent.id);
      } catch (error) {
        finishSending();
        message.error((error as Error).message || '创建会话失败，请稍后重试');
        return;
      }
    }

    setMessages(items => [...items, { role: 'user', content: text }]);
    if (sendMode === 'sync') {
      try {
        const res = await fetchAgentChatSync(currentAgent.id, { conversationId: targetConversationId, content: text });
        setMessages(items => [
          ...items,
          { role: 'assistant', content: extractSyncReply(res.data) || '（后端已返回空消息）' }
        ]);
        await refreshConversationData(currentAgent.id, targetConversationId);
      } catch (error) {
        message.error((error as Error).message || '对话失败，请稍后重试');
      } finally {
        finishSending();
      }
      return;
    }

    setMessages(items => [...items, { role: 'assistant', content: '' }]);
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    await fetchAgentChat(
      currentAgent.id,
      { conversationId: targetConversationId, content: text },
      {
        signal: abortRef.current.signal,
        onMessage(chunk) {
          setMessages(items => {
            const next = [...items];
            const index = next.length - 1;
            next[index] = { ...next[index], content: `${next[index]?.content || ''}${normalizeStreamChunk(chunk)}` };
            return next;
          });
        },
        async onDone() {
          setMessages(items => {
            const next = [...items];
            const index = next.length - 1;
            if (next[index]?.role === 'assistant' && !next[index].content.trim()) {
              next[index] = { ...next[index], content: '（后端已返回空消息）' };
            }
            return next;
          });
          finishSending();
          await refreshConversationData(currentAgent.id, targetConversationId);
        },
        onError(error) {
          setMessages(items => items.filter((_, index) => index !== items.length - 1));
          finishSending();
          message.error(error.message || '对话失败，请稍后重试');
        }
      }
    );
  };

  const agentItems = useMemo(
    () =>
      agents.map(agent => ({
        key: String(agent.id),
        label: agent.name,
        icon: (
          <Avatar size={20} src={agent.avatar}>
            {agent.name.slice(0, 1)}
          </Avatar>
        )
      })),
    [agents]
  );

  const conversationItems = useMemo(
    () =>
      (conversationsQuery.data || []).map(conv => ({
        key: conv.conversationId,
        label: conv.title || '未命名会话'
      })),
    [conversationsQuery.data]
  );

  const bubbleItems = useMemo<BubbleItemType[]>(
    () =>
      messages.map((item, index) => ({
        key: `${item.role}-${index}`,
        role: item.role === 'user' ? 'user' : 'ai',
        content: item.content || '正在生成...',
        loading: item.role === 'assistant' && !item.content
      })),
    [messages]
  );

  return (
    <PageContainer className="ai-chat-container" title={false}>
      <div className="ai-chat-page">
        <header className="ai-chat-header">
          <div className="ai-chat-brand">
            <span className="ai-chat-brand-dot" />
            Snail AI
          </div>
        </header>
        <div className="ai-chat-body">
          <aside className="ai-chat-sidebar">
            <div className="ai-chat-side-block">
              <Button
                type="primary"
                block
                icon={<PlusOutlined />}
                disabled={!agents.length}
                onClick={startNewConversation}
              >
                新对话
              </Button>
            </div>
            <Spin spinning={bootstrapQuery.isLoading || conversationsQuery.isLoading}>
              <div className="ai-chat-side-scroll">
                <div className="ai-chat-side-block">
                  <div className="ai-chat-block-title">我的智能体</div>
                  {!agents.length ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无智能体" /> : null}
                  <Conversations
                    className="ai-chat-conversations"
                    items={agentItems}
                    activeKey={currentAgent ? String(currentAgent.id) : undefined}
                    onActiveChange={selectAgent}
                  />
                </div>
                <div className="ai-chat-side-block">
                  <div className="ai-chat-block-title">对话记录</div>
                  {!conversationItems.length ? (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无会话" />
                  ) : null}
                  <Conversations
                    className="ai-chat-conversations"
                    items={conversationItems}
                    activeKey={currentConversationId}
                    onActiveChange={selectConversation}
                    menu={item => ({
                      items: [{ key: 'delete', label: '删除', icon: <DeleteOutlined />, danger: true }],
                      onClick: ({ domEvent }) => {
                        domEvent.stopPropagation();
                        removeConversation(item.key);
                      }
                    })}
                  />
                </div>
              </div>
            </Spin>
            <div className="ai-chat-user">
              <Avatar>{(nickname || 'U').slice(0, 1)}</Avatar>
              <div>
                <div className="ai-chat-user-name">{nickname || '已登录用户'}</div>
                <div className="ai-chat-user-status">已登录</div>
              </div>
            </div>
          </aside>
          <main className="ai-chat-main">
            {!currentAgent ? (
              <div className="ai-chat-empty">请先选择一个智能体开始对话</div>
            ) : (
              <>
                <div className="ai-chat-scroll">
                  <div className="ai-chat-content">
                    {!currentConversationId && !messages.length && (
                      <div className="ai-chat-welcome">
                        <Space align="start">
                          <Avatar size={40} src={currentAgent.avatar}>
                            {currentAgent.name.slice(0, 1)}
                          </Avatar>
                          <div>
                            <Typography.Title level={4} style={{ margin: 0 }}>
                              {currentAgent.name}
                            </Typography.Title>
                            <Typography.Text type="secondary">{currentAgent.description || '暂无描述'}</Typography.Text>
                          </div>
                        </Space>
                        <p>{currentAgent.greeting || '你好，我是你的智能助手。'}</p>
                        {presetQuestions.length > 0 && (
                          <Prompts
                            wrap
                            items={presetQuestions.map(question => ({
                              key: question,
                              label: question,
                              disabled: sending
                            }))}
                            onItemClick={({ data }) => sendMessage(String(data.key))}
                          />
                        )}
                      </div>
                    )}
                    <Spin
                      spinning={conversationMessagesQuery.isFetching && !!currentConversationId && !messages.length}
                    >
                      <Bubble.List
                        className="ai-chat-bubble-list"
                        autoScroll
                        items={bubbleItems}
                        role={{
                          user: { placement: 'end', variant: 'filled' },
                          ai: {
                            placement: 'start',
                            variant: 'outlined',
                            avatar: <Avatar src={currentAgent.avatar}>{currentAgent.name.slice(0, 1)}</Avatar>
                          }
                        }}
                      />
                    </Spin>
                  </div>
                </div>
                <div className="ai-chat-input-wrap">
                  <Sender
                    className="ai-chat-sender"
                    value={content}
                    loading={sending}
                    disabled={sending}
                    placeholder="给智能体发消息"
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    onChange={setContent}
                    onSubmit={sendMessage}
                    onCancel={() => {
                      abortRef.current?.abort();
                      finishSending();
                    }}
                  />
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </PageContainer>
  );
}
