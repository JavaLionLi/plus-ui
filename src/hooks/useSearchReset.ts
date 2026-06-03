import { useCallback, type RefObject } from 'react';
import type { ActionType } from '@ant-design/pro-components';

export function useSearchReset(actionRef: RefObject<ActionType | undefined>, resetExtras?: () => void) {
  return useCallback(() => {
    resetExtras?.();
    setTimeout(() => actionRef.current?.reloadAndRest?.(), 0);
  }, [actionRef, resetExtras]);
}
