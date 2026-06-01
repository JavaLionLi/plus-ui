import { useQuery } from '@tanstack/react-query';
import type { DictData } from '@/api/system/dict/data/types';
import { useDictStore } from '@/stores/dictStore';

export function useDict(...types: string[]) {
  const loadDicts = useDictStore(state => state.loadDicts);
  const dictTypes = [...new Set(types.filter(Boolean))];
  const dictTypeKey = dictTypes.join('|');

  const { data } = useQuery<Record<string, DictData[]>>({
    queryKey: ['dict', dictTypeKey],
    queryFn: () => loadDicts(dictTypes),
    enabled: dictTypes.length > 0,
    placeholderData: {},
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000
  });

  return data || {};
}
