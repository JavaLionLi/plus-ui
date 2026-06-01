import { create } from 'zustand';
import type { DictData } from '@/api/system/dict/data/types';
import { getDicts } from '@/api/system/dict/data';

interface DictState {
  dicts: Record<string, DictData[]>;
  loadDicts: (types: string[]) => Promise<Record<string, DictData[]>>;
  clearDicts: () => void;
}

export const useDictStore = create<DictState>((set, get) => ({
  dicts: {},
  loadDicts: async types => {
    const uniqueTypes = [...new Set(types.filter(Boolean))];
    const current = get().dicts;
    const missingTypes = uniqueTypes.filter(type => !current[type]);
    if (missingTypes.length) {
      const entries = await Promise.all(
        missingTypes.map(async type => {
          const res = await getDicts(type);
          return [type, res.data || []] as const;
        })
      );
      set(state => ({ dicts: { ...state.dicts, ...Object.fromEntries(entries) } }));
    }
    const next = get().dicts;
    return Object.fromEntries(uniqueTypes.map(type => [type, next[type] || []]));
  },
  clearDicts: () => set({ dicts: {} })
}));
