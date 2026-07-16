import { create } from 'zustand';
import type { MessageVO } from '@/api/system/message/types';

export type NoticeCategory = 'system' | 'notice' | 'workflow';

export type NoticeItem = MessageVO & {
  category: NoticeCategory;
  read: boolean;
  timestamp?: number;
  time?: string;
};

interface NoticeState {
  notices: NoticeItem[];
  setNotices: (notices: NoticeItem[]) => void;
  addNotice: (notice: NoticeItem) => void;
  markRead: (messageId?: string | number) => void;
  markReadBatch: (messageIds: Array<string | number | undefined | null>) => void;
  readAll: () => void;
  clearNotice: () => void;
}

function noticeKey(notice: NoticeItem) {
  if (notice.messageId !== undefined && notice.messageId !== null) {
    return String(notice.messageId);
  }
  return [notice.type, notice.source, notice.timestamp, notice.message].join(':');
}

function sortNotices(notices: NoticeItem[]) {
  return [...notices].sort((a, b) => Number(b.timestamp || 0) - Number(a.timestamp || 0));
}

function dedupeNotices(notices: NoticeItem[]) {
  const messageIds = new Set<string>();
  return notices.filter(notice => {
    const messageId = String(notice.messageId);
    if (messageIds.has(messageId)) return false;
    messageIds.add(messageId);
    return true;
  });
}

export const useNoticeStore = create<NoticeState>(set => ({
  notices: [],
  setNotices: notices => set({ notices: sortNotices(dedupeNotices(notices)) }),
  addNotice: notice =>
    set(state => {
      const key = noticeKey(notice);
      const index = state.notices.findIndex(item => noticeKey(item) === key);
      if (index < 0) {
        return { notices: sortNotices([notice, ...state.notices]) };
      }
      const notices = [...state.notices];
      notices[index] = { ...notices[index], ...notice };
      return { notices: sortNotices(notices) };
    }),
  markRead: messageId => {
    if (messageId === undefined || messageId === null) return;
    set(state => ({
      notices: state.notices.map(item =>
        String(item.messageId) === String(messageId) ? { ...item, read: true } : item
      )
    }));
  },
  markReadBatch: messageIds => {
    const idSet = new Set(
      messageIds.filter((item): item is string | number => item !== undefined && item !== null).map(String)
    );
    set(state => ({
      notices: state.notices.map(item => (idSet.has(String(item.messageId)) ? { ...item, read: true } : item))
    }));
  },
  readAll: () => set(state => ({ notices: state.notices.map(item => ({ ...item, read: true })) })),
  clearNotice: () => set({ notices: [] })
}));
