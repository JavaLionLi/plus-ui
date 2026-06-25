import { notification } from 'antd';
import type { MessageVO } from '@/api/system/message/types';
import { globalHeaders } from '@/api/request';
import { getMessageBox } from '@/api/system/message';
import { useNoticeStore, type NoticeItem } from '@/stores/noticeStore';
import { useUserStore } from '@/stores/userStore';
import { getToken } from '@/utils/auth';
import { appEnv } from '@/utils/env';
import { getReadMessageIds } from '@/utils/messageRead';
import { parsePushMessage, resolveNoticeGroup, resolveNoticeTitle, shouldAppendNotice } from '@/utils/pushMessage';

let eventSource: EventSource | undefined;
let webSocket: WebSocket | undefined;
let reconnectTimer: number | undefined;
let reconnectAttempts = 0;
let pushClosed = true;
const KICKED_MESSAGE = 'kicked';
let pushKicked = false;
let resumePushTimer: number | undefined;

function messageEnabled() {
  return appEnv.messageEnabled;
}

function formatNoticeTime(timestamp?: number | string) {
  const time = timestamp ? new Date(timestamp) : new Date();
  return time.toLocaleString();
}

function currentUserId() {
  return useUserStore.getState().userInfo?.user.userId;
}

function withRead(messageId?: string | number) {
  if (messageId === undefined || messageId === null) return false;
  return getReadMessageIds(currentUserId()).has(String(messageId));
}

function toNoticeItem(item: MessageVO, category: NoticeItem['category']): NoticeItem {
  const timestamp = item.createTime ? new Date(item.createTime).getTime() : Date.now();
  return {
    ...item,
    category,
    read: withRead(item.messageId),
    timestamp,
    time: formatNoticeTime(timestamp)
  };
}

function appendNotice(raw: string) {
  const payload = parsePushMessage(raw);
  if (!shouldAppendNotice(payload)) return;

  const title = resolveNoticeTitle(payload);
  const notice: NoticeItem = {
    messageId: payload.messageId || `${payload.type || 'message'}:${payload.timestamp || Date.now()}`,
    category: resolveNoticeGroup(payload),
    type: payload.type || 'message',
    source: payload.source || 'backend',
    title,
    message: payload.message || '',
    content: typeof payload.data?.noticeContent === 'string' ? payload.data.noticeContent : undefined,
    data: payload.data || null,
    path: payload.path,
    read: withRead(payload.messageId),
    timestamp: payload.timestamp || Date.now(),
    time: formatNoticeTime(payload.timestamp)
  };
  useNoticeStore.getState().addNotice(notice);
  notification.success({ message: title, description: notice.message, duration: 3 });
}

function handlePushMessage(raw: string) {
  if (raw === KICKED_MESSAGE) {
    pushKicked = true;
    closePush();
    return;
  }
  appendNotice(raw);
}

function buildHttpUrl(path: string) {
  const base = appEnv.baseApi;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${base}${normalizedPath}`;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}Authorization=Bearer ${encodeURIComponent(getToken() || '')}&clientid=${encodeURIComponent(appEnv.clientId)}`;
}

function buildWsUrl(path: string) {
  const httpUrl = buildHttpUrl(path);
  if (/^https?:\/\//.test(httpUrl)) {
    return httpUrl.replace(/^http/, 'ws');
  }
  const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
  return `${protocol}${window.location.host}${httpUrl}`;
}

function clearReconnectTimer() {
  if (reconnectTimer) {
    window.clearTimeout(reconnectTimer);
    reconnectTimer = undefined;
  }
}

function scheduleReconnect(connect: () => void, maxRetries: number, delay: number) {
  if (pushClosed) return;
  if (reconnectAttempts >= maxRetries) return;
  reconnectAttempts += 1;
  clearReconnectTimer();
  reconnectTimer = window.setTimeout(connect, delay);
}

function initSsePush(path: string) {
  const connect = () => {
    if (pushClosed) return;
    eventSource?.close();
    eventSource = new EventSource(buildHttpUrl(path));
    eventSource.onopen = () => {
      reconnectAttempts = 0;
    };
    eventSource.onmessage = event => {
      if (event.data) handlePushMessage(event.data);
    };
    eventSource.onerror = () => {
      eventSource?.close();
      scheduleReconnect(connect, 5, 5000);
    };
  };
  connect();
}

function initWsPush(path: string) {
  const connect = () => {
    if (pushClosed) return;
    webSocket?.close();
    webSocket = new WebSocket(buildWsUrl(path));
    webSocket.onopen = () => {
      reconnectAttempts = 0;
    };
    webSocket.onmessage = event => {
      if (String(event.data) === 'pong') return;
      handlePushMessage(String(event.data));
    };
    webSocket.onclose = () => scheduleReconnect(connect, 3, 1000);
  };
  connect();
}

export async function initMessageBox() {
  if (!messageEnabled()) {
    useNoticeStore.getState().clearNotice();
    return;
  }
  const res = await getMessageBox();
  useNoticeStore
    .getState()
    .setNotices([
      ...(res.data?.systemList || []).map(item => toNoticeItem(item, 'system')),
      ...(res.data?.noticeList || []).map(item => toNoticeItem(item, 'notice')),
      ...(res.data?.workflowList || []).map(item => toNoticeItem(item, 'workflow'))
    ]);
}

export function initPush() {
  closePush();
  if (!messageEnabled()) return;
  pushKicked = false;
  pushClosed = false;
  if (appEnv.messageTransport === 'websocket') {
    initWsPush(appEnv.messagePath);
    return;
  }
  initSsePush(appEnv.messagePath);
}

export function closePush() {
  pushClosed = true;
  clearReconnectTimer();
  if (webSocket) {
    webSocket.onopen = null;
    webSocket.onmessage = null;
    webSocket.onclose = null;
    webSocket.onerror = null;
  }
  if (eventSource) {
    eventSource.onopen = null;
    eventSource.onmessage = null;
    eventSource.onerror = null;
  }
  eventSource?.close();
  webSocket?.close();
  eventSource = undefined;
  webSocket = undefined;
  reconnectAttempts = 0;
}

function resumePushIfNeeded() {
  if (!pushKicked || !getToken() || document.visibilityState !== 'visible') {
    return;
  }
  if (resumePushTimer) {
    window.clearTimeout(resumePushTimer);
  }
  resumePushTimer = window.setTimeout(async () => {
    resumePushTimer = undefined;
    if (!pushKicked || !getToken() || document.visibilityState !== 'visible') {
      return;
    }
    try {
      await initMessageBox();
    } finally {
      initPush();
    }
  }, 300);
}

if (typeof window !== 'undefined') {
  window.addEventListener('focus', resumePushIfNeeded);
  document.addEventListener('visibilitychange', resumePushIfNeeded);
  window.addEventListener('online', resumePushIfNeeded);
}

export function pushHeaders() {
  return globalHeaders();
}
