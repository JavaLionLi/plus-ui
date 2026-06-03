
import type { DictData } from '@/api/system/dict/data/types';

export function dictOptions(dicts?: Pick<DictData, 'dictLabel' | 'dictValue'>[]) {
  return (dicts || []).map(item => ({
    label: item.dictLabel,
    value: item.dictValue
  }));
}
