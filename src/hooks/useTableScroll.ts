import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppStore } from '@/stores/appStore';

type TableScrollX = number | string | true;

interface TableScrollOptions {
  x: TableScrollX;
  bottomOffset?: number;
  fallbackY?: number;
  disabled?: boolean;
}

function getViewportHeight() {
  if (typeof window === 'undefined') return 0;

  return window.visualViewport?.height || window.innerHeight || document.documentElement.clientHeight;
}

export function useTableScroll(options: TableScrollX | TableScrollOptions) {
  const fullHeightTable = useAppStore(state => state.layoutSettings.fullHeightTable);
  const normalized = typeof options === 'object' ? options : { x: options };
  const { x, bottomOffset = 40, fallbackY = 300, disabled = false } = normalized;
  const tableWrapperRef = useRef<HTMLElement>(null);
  const frameRef = useRef<number | undefined>(undefined);
  const tableBodyRef = useRef<HTMLElement | undefined>(undefined);
  const [tableY, setTableY] = useState<number>();

  const clearTableBodyHeight = useCallback(() => {
    if (!tableBodyRef.current) return;

    tableBodyRef.current.style.removeProperty('height');
    tableBodyRef.current = undefined;
  }, []);

  const refreshTableScroll = useCallback(() => {
    if (!fullHeightTable || disabled || typeof window === 'undefined') {
      clearTableBodyHeight();
      setTableY(undefined);
      return;
    }

    if (frameRef.current) {
      window.cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = window.requestAnimationFrame(() => {
      const wrapper =
        tableWrapperRef.current ||
        document.querySelector<HTMLElement>('.ant-pro-page-container') ||
        document.body;

      const tableBody =
        wrapper.querySelector<HTMLElement>('.ant-table-body') ||
        wrapper.querySelector<HTMLElement>('.ant-table-content') ||
        wrapper;
      const pagination = wrapper.querySelector<HTMLElement>('.ant-pagination');
      const paginationHeight = pagination ? Math.ceil(pagination.getBoundingClientRect().height) + 16 : 0;
      const availableY = Math.floor(
        getViewportHeight() - tableBody.getBoundingClientRect().top - paginationHeight - bottomOffset
      );
      const nextY = availableY > 0 ? availableY : fallbackY;

      if (tableBodyRef.current && tableBodyRef.current !== tableBody) {
        tableBodyRef.current.style.removeProperty('height');
      }
      const nextHeight = `${nextY}px`;
      if (tableBody.style.height !== nextHeight) {
        tableBody.style.height = nextHeight;
      }
      tableBodyRef.current = tableBody;
      setTableY(current => (current === nextY ? current : nextY));
    });
  }, [bottomOffset, clearTableBodyHeight, disabled, fallbackY, fullHeightTable]);

  useEffect(() => {
    refreshTableScroll();

    if (!fullHeightTable || disabled || typeof window === 'undefined') return undefined;

    const wrapper =
      tableWrapperRef.current || document.querySelector<HTMLElement>('.ant-pro-page-container') || document.body;
    const resizeObserver = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(refreshTableScroll);
    const mutationObserver =
      typeof MutationObserver === 'undefined'
        ? undefined
        : new MutationObserver(() => {
            refreshTableScroll();
          });

    resizeObserver?.observe(wrapper);
    mutationObserver?.observe(wrapper, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['class', 'style']
    });
    window.addEventListener('resize', refreshTableScroll);
    window.visualViewport?.addEventListener('resize', refreshTableScroll);

    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
      clearTableBodyHeight();
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      window.removeEventListener('resize', refreshTableScroll);
      window.visualViewport?.removeEventListener('resize', refreshTableScroll);
    };
  }, [clearTableBodyHeight, disabled, fullHeightTable, refreshTableScroll]);

  const tableScroll = useMemo(() => {
    if (!fullHeightTable || disabled || !tableY) return { x };

    return {
      x,
      y: tableY
    };
  }, [disabled, fullHeightTable, tableY, x]);

  return {
    tableScroll,
    tableWrapperRef,
    refreshTableScroll
  };
}
