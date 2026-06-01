export interface AgentItem {
  id: number;
  name: string;
  description?: string;
  avatar?: string;
  greeting?: string;
  status?: number;
  presetQuestions?: string[];
}

export interface ConversationSummaryItem {
  conversationId: string;
  agentId?: number;
  title: string;
  lastMessageDt?: string;
  createDt?: string;
  updateDt?: string;
}

export interface ConversationSummaryList {
  total: number;
  rows: ConversationSummaryItem[];
}

export interface ConversationMessage {
  role?: string;
  content?: string;
  thinking?: string;
  message?: string;
  text?: string;
  messageType?: string;
  senderType?: string;
}

export interface AgentChatRequest {
  conversationId?: string;
  content: string;
  disabledMcpServerIds?: number[];
  disabledSkillIds?: number[];
}

export interface AgentChatSyncResponse {
  conversationId?: string;
  content?: string;
  traceId?: string;
  durationMs?: number;
  text?: string;
  message?: string;
  answer?: string;
  reply?: string;
  outputText?: string;
  result?: string;
  messages?: ConversationMessage[];
}

export interface SnailOpenApiUser {
  openId: string;
  nickname?: string;
  externalId?: string;
  created?: boolean;
}
