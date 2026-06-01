import { Space, Tag } from 'antd';
import type { DictData } from '@/api/system/dict/data/types';

type DictValue = string | number | boolean;

export interface DictTagProps {
  options?: DictData[];
  value?: DictValue | DictValue[];
  showValue?: boolean;
  separator?: string;
  className?: string;
}

const tagColorMap: Record<string, string> = {
  primary: 'blue',
  success: 'green',
  info: 'default',
  warning: 'orange',
  danger: 'red'
};

function normalizeValues(value: DictTagProps['value'], separator: string) {
  if (value === '' || value === null || typeof value === 'undefined') {
    return [];
  }
  if (Array.isArray(value)) {
    return value.map(item => String(item));
  }
  if (typeof value === 'boolean') {
    return [String(value)];
  }
  return String(value).split(separator).filter(Boolean);
}

export default function DictTag({ options = [], value, showValue = true, separator = ',', className }: DictTagProps) {
  const values = normalizeValues(value, separator);
  const matchedOptions = options.filter(item => values.some(current => current === String(item.dictValue)));
  const unmatchedValues = values.filter(current => !options.some(item => current === String(item.dictValue)));

  if (!values.length) {
    return <span className={className}>-</span>;
  }

  return (
    <Space size={4} wrap className={className}>
      {matchedOptions.map(item => {
        const listClass = item.listClass || 'default';
        if (listClass === 'default' && !item.cssClass) {
          return <span key={item.dictValue}>{item.dictLabel}</span>;
        }
        return (
          <Tag key={item.dictValue} color={tagColorMap[listClass] || 'blue'} className={item.cssClass}>
            {item.dictLabel}
          </Tag>
        );
      })}
      {showValue && unmatchedValues.map(item => <span key={item}>{item}</span>)}
    </Space>
  );
}
