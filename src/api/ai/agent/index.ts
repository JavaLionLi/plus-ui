import type { PageResult, R } from '@/api/types';
import request, { globalHeaders } from '@/api/request';
import { useAppStore } from '@/stores/appStore';
import { appEnv } from '@/utils/env';
import type {
  AgentChatRequest,
  AgentChatSyncResponse,
  AgentItem,
  ConversationMessage,
  ConversationSummaryItem,
  SnailOpenApiUser
} from './types';

export function fetchMyAgents() {
  return request<R<AgentItem[] | PageResult<AgentItem>>>({
    url: '/snail-ai/agents',
    method: 'get'
  });
}

export function fetchAgentDetail(id: number) {
  return request<R<AgentItem>>({
    url: `/snail-ai/agent/${id}`,
    method: 'get'
  });
}

export function fetchAgentConversations(
  id: number,
  params: { page?: number; size?: number; start?: string; end?: string }
) {
  return request<R<PageResult<ConversationSummaryItem> | ConversationSummaryItem[]>>({
    url: `/snail-ai/agent/${id}/conversations`,
    method: 'get',
    params
  });
}

export function fetchConversationMessages(agentId: number, conversationId: string) {
  return request<R<ConversationMessage[] | PageResult<ConversationMessage>>>({
    url: `/snail-ai/agent/${agentId}/conversation/${conversationId}/messages`,
    method: 'get'
  });
}

export function createConversation(agentId: number, data: { title?: string }) {
  return request<R<ConversationSummaryItem>>({
    url: `/snail-ai/agent/${agentId}/conversation`,
    method: 'post',
    data
  });
}

export function deleteConversation(agentId: number, conversationId: string) {
  return request<R>({
    url: `/snail-ai/agent/${agentId}/conversation/${conversationId}`,
    method: 'delete'
  });
}

export function registerCurrentSnailUser() {
  return request<R<SnailOpenApiUser>>({
    url: '/snail-ai/user/register',
    method: 'post'
  });
}

export function fetchChatMode() {
  return request<R<{ mode?: 'stream' | 'sync' }>>({
    url: '/snail-ai/chat/mode',
    method: 'get'
  });
}

export async function fetchAgentChat(
  agentId: number,
  data: AgentChatRequest,
  options: {
    onMessage: (chunk: string) => void;
    onThinking?: (chunk: string) => void;
    onDone: () => void;
    onError: (error: Error) => void;
    signal?: AbortSignal;
  }
) {
  const baseURL = appEnv.baseApi;
  const language = useAppStore.getState().appLocale;
  try {
    const response = await fetch(`${baseURL}/snail-ai/agent/${agentId}/chat/stream`, {
      method: 'POST',
      headers: {
        ...globalHeaders(),
        'Content-Language': language,
        Accept: 'text/event-stream',
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(data),
      signal: options.signal
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `HTTP ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('ReadableStream not supported');

    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const eventBlocks = buffer.split(/\r?\n\r?\n/);
      buffer = eventBlocks.pop() || '';
      for (const block of eventBlocks) {
        if (!block.trim()) continue;
        let eventName = 'message';
        let payload = '';
        for (const line of block.split(/\r?\n/)) {
          if (line.startsWith('event:')) eventName = line.slice(6).trim();
          if (line.startsWith('data:')) payload += line.slice(5).trim();
        }
        if (!payload && eventName !== 'done') continue;
        if (eventName === 'thinking') {
          options.onThinking?.(payload);
        } else if (eventName === 'done') {
          options.onDone();
          return;
        } else if (eventName === 'error') {
          throw new Error(payload || 'SSE stream error');
        } else {
          options.onMessage(payload);
        }
      }
    }
    options.onDone();
  } catch (error) {
    if ((error as Error).name !== 'AbortError') options.onError(error as Error);
  }
}

export function fetchAgentChatSync(agentId: number, data: AgentChatRequest) {
  return request<R<AgentChatSyncResponse>>({
    url: `/snail-ai/agent/${agentId}/chat/sync`,
    method: 'post',
    data
  });
}
