import { create } from 'zustand';
import { tagsStorageKey } from './appStore';

export interface TagViewItem {
  key: string;
  path: string;
  fullPath: string;
  title: string;
  icon?: string | null;
  affix?: boolean;
}

export const homeTag: TagViewItem = {
  key: '/index',
  path: '/index',
  fullPath: '/index',
  title: '首页',
  icon: 'dashboard',
  affix: true
};

function readPersistedTags() {
  try {
    const data = JSON.parse(localStorage.getItem(tagsStorageKey) || '[]') as TagViewItem[];
    return data
      .map(item => ({
        ...item,
        fullPath: item.fullPath || item.key || item.path,
        key: item.key || item.fullPath || item.path
      }))
      .filter(item => item.key && item.path && item.fullPath && item.title);
  } catch {
    localStorage.removeItem(tagsStorageKey);
    return [];
  }
}

function persistTags(tags: TagViewItem[], persist = true) {
  if (!persist) {
    localStorage.removeItem(tagsStorageKey);
    return;
  }
  const payload = tags.filter(item => !item.affix);
  localStorage.setItem(tagsStorageKey, JSON.stringify(payload));
}

interface TagsViewState {
  tags: TagViewItem[];
  fullscreen: boolean;
  initTags: (persist?: boolean) => void;
  setTags: (tags: TagViewItem[], persist?: boolean) => void;
  updateTags: (updater: (tags: TagViewItem[]) => TagViewItem[], persist?: boolean) => TagViewItem[];
  clearPersistedTags: () => void;
  resetTags: () => void;
  setFullscreen: (fullscreen: boolean | ((fullscreen: boolean) => boolean)) => void;
}

function normalizeTags(tags: TagViewItem[]) {
  return tags.some(item => item.key === homeTag.key) ? tags : [homeTag, ...tags];
}

export const useTagsViewStore = create<TagsViewState>((set, get) => ({
  tags: [homeTag, ...readPersistedTags().filter(item => item.key !== homeTag.key)],
  fullscreen: false,
  initTags: (persist = true) => {
    const tags = persist ? [homeTag, ...readPersistedTags().filter(item => item.key !== homeTag.key)] : [homeTag];
    set({ tags });
  },
  setTags: (tags, persist = true) => {
    const normalized = normalizeTags(tags);
    persistTags(normalized, persist);
    set({ tags: normalized });
  },
  updateTags: (updater, persist = true) => {
    const normalized = normalizeTags(updater(get().tags));
    persistTags(normalized, persist);
    set({ tags: normalized });
    return normalized;
  },
  clearPersistedTags: () => {
    localStorage.removeItem(tagsStorageKey);
  },
  resetTags: () => {
    localStorage.removeItem(tagsStorageKey);
    set({ tags: [homeTag], fullscreen: false });
  },
  setFullscreen: fullscreen =>
    set(state => ({
      fullscreen: typeof fullscreen === 'function' ? fullscreen(state.fullscreen) : fullscreen
    }))
}));
