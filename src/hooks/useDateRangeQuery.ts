import { useCallback, useState } from 'react';
import type { ConfigType } from 'dayjs';
import { addDateRange, formatDateTimeRange } from '@/utils/ruoyi';

export type DateRangeValue = [ConfigType, ConfigType] | null | undefined;

export function useDateRangeQuery(propName?: string) {
  const [dateRange, setDateRange] = useState<DateRangeValue>();

  const applyDateRange = useCallback(
    <T extends Record<string, unknown>>(queryParams: T, range: DateRangeValue = dateRange) => {
      return addDateRange(queryParams, formatDateTimeRange(range), propName);
    },
    [dateRange, propName]
  );

  const resetDateRange = useCallback(() => setDateRange(undefined), []);

  return {
    dateRange,
    setDateRange,
    applyDateRange,
    resetDateRange
  };
}
