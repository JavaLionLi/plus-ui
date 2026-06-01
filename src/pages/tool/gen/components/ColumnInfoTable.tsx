import { ProTable, type ProColumns } from '@ant-design/pro-components';
import { Checkbox, Input, Select } from 'antd';
import type { DictTypeVO } from '@/api/system/dict/type/types';
import type { DbColumnVO } from '@/api/tool/gen/types';
import { dictHtmlTypes, htmlTypeOptions, javaTypeOptions, normalizeGenColumn, queryTypeOptions } from './genConfig';

interface ColumnInfoTableProps {
  columns: DbColumnVO[];
  dictOptions: DictTypeVO[];
  onChange: (columns: DbColumnVO[]) => void;
}

function updateColumn(columns: DbColumnVO[], row: DbColumnVO, patch: Partial<DbColumnVO>) {
  return columns.map(item => {
    const same = item.columnId ? item.columnId === row.columnId : item.columnName === row.columnName;
    if (!same) return item;
    return normalizeGenColumn({ ...item, ...patch });
  });
}

export default function ColumnInfoTable({ columns, dictOptions, onChange }: ColumnInfoTableProps) {
  const patchColumn = (row: DbColumnVO, patch: Partial<DbColumnVO>) => {
    onChange(updateColumn(columns, row, patch));
  };

  const fieldColumns: ProColumns<DbColumnVO>[] = [
    { title: '字段列名', dataIndex: 'columnName', search: false, ellipsis: true, width: 150 },
    {
      title: '字段描述',
      dataIndex: 'columnComment',
      search: false,
      width: 180,
      render: (_, row) => (
        <Input value={row.columnComment} onChange={event => patchColumn(row, { columnComment: event.target.value })} />
      )
    },
    { title: '物理类型', dataIndex: 'columnType', search: false, ellipsis: true, width: 130 },
    {
      title: 'Java类型',
      dataIndex: 'javaType',
      search: false,
      width: 150,
      render: (_, row) => (
        <Select
          value={row.javaType}
          options={javaTypeOptions}
          onChange={value => patchColumn(row, { javaType: value })}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'java属性',
      dataIndex: 'javaField',
      search: false,
      width: 150,
      render: (_, row) => (
        <Input value={row.javaField} onChange={event => patchColumn(row, { javaField: event.target.value })} />
      )
    },
    ...(['isInsert', 'isEdit', 'isList', 'isQuery', 'isRequired'] as const).map(field => ({
      title: { isInsert: '插入', isEdit: '编辑', isList: '列表', isQuery: '查询', isRequired: '必填' }[field],
      dataIndex: field,
      search: false,
      width: 80,
      render: (_: unknown, row: DbColumnVO) => (
        <Checkbox
          checked={row[field] === '1'}
          onChange={event => patchColumn(row, { [field]: event.target.checked ? '1' : '0' })}
        />
      )
    })),
    {
      title: '查询方式',
      dataIndex: 'queryType',
      search: false,
      width: 120,
      render: (_, row) => (
        <Select
          value={row.queryType}
          options={queryTypeOptions}
          onChange={value => patchColumn(row, { queryType: value })}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: '显示类型',
      dataIndex: 'htmlType',
      search: false,
      width: 150,
      render: (_, row) => (
        <Select
          value={row.htmlType}
          options={htmlTypeOptions}
          onChange={value => patchColumn(row, { htmlType: value })}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: '字典类型',
      dataIndex: 'dictType',
      search: false,
      width: 190,
      render: (_, row) => (
        <Select
          allowClear
          showSearch
          disabled={!dictHtmlTypes.includes(row.htmlType || '')}
          value={row.dictType || undefined}
          options={dictOptions.map(item => ({ label: `${item.dictName} (${item.dictType})`, value: item.dictType }))}
          onChange={value => patchColumn(row, { dictType: value || '' })}
          style={{ width: '100%' }}
        />
      )
    }
  ];

  return (
    <ProTable<DbColumnVO>
      rowKey={row => String(row.columnId || row.columnName)}
      columns={fieldColumns}
      options={false}
      dataSource={columns}
      search={false}
      pagination={false}
      scroll={{ x: 1550, y: 520 }}
    />
  );
}
