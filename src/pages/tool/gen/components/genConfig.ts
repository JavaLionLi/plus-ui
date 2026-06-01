import type { DbColumnVO } from '@/api/tool/gen/types';

export const javaTypeOptions = ['Long', 'String', 'Integer', 'Double', 'BigDecimal', 'LocalDateTime', 'Boolean'].map(
  item => ({ label: item, value: item })
);

export const queryTypeOptions = [
  { label: '=', value: 'EQ' },
  { label: '!=', value: 'NE' },
  { label: '>', value: 'GT' },
  { label: '>=', value: 'GE' },
  { label: '<', value: 'LT' },
  { label: '<=', value: 'LE' },
  { label: 'LIKE', value: 'LIKE' },
  { label: 'BETWEEN', value: 'BETWEEN' }
];

export const htmlTypeOptions = [
  { label: '文本框', value: 'input' },
  { label: '数字输入', value: 'inputNumber' },
  { label: '文本域', value: 'textarea' },
  { label: '下拉框', value: 'select' },
  { label: '单选框', value: 'radio' },
  { label: '复选框', value: 'checkbox' },
  { label: '开关', value: 'switch' },
  { label: '日期控件', value: 'datetime' },
  { label: '图片上传', value: 'imageUpload' },
  { label: '文件上传', value: 'fileUpload' },
  { label: '富文本控件', value: 'editor' }
];

export const dictHtmlTypes = ['select', 'radio', 'checkbox', 'switch'];
export const sortableJavaTypes = ['Integer', 'Long', 'Double', 'BigDecimal', 'LocalDateTime'];

export function normalizeStringArray(value?: string | string[]) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return String(value).split(',').filter(Boolean);
}

export function normalizeGenColumn(column: DbColumnVO) {
  if (!dictHtmlTypes.includes(column.htmlType || '')) {
    return { ...column, dictType: '' };
  }
  return column;
}
