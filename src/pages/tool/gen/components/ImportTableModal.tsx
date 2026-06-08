import { ProTable, type ActionType, type ProColumns } from '@ant-design/pro-components';
import { message, Modal, Select, Space } from 'antd';
import { useRef, useState } from 'react';
import type { DbTableQuery, DbTableVO } from '@/api/tool/gen/types';
import { importTable, listDbTable } from '@/api/tool/gen';
import EllipsisText from '@/components/common/EllipsisText';
import { toPageQuery, toTableData } from '@/utils/ruoyi';

interface ImportTableModalProps {
  open: boolean;
  dataNames: string[];
  initialDataName?: string;
  onCancel: () => void;
  onSuccess: () => void;
}

const columns: ProColumns<DbTableVO>[] = [
  {
    title: '表名称',
    dataIndex: 'tableName',
    width: 180,
    render: (_, row) => <EllipsisText value={row.tableName} maxWidth={160} />
  },
  {
    title: '表描述',
    dataIndex: 'tableComment',
    width: 180,
    render: (_, row) => <EllipsisText value={row.tableComment} maxWidth={160} />
  },
  { title: '创建时间', dataIndex: 'createTime', valueType: 'dateTime', search: false, width: 170 },
  { title: '更新时间', dataIndex: 'updateTime', valueType: 'dateTime', search: false, width: 170 }
];

export default function ImportTableModal({
  open,
  dataNames,
  initialDataName,
  onCancel,
  onSuccess
}: ImportTableModalProps) {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const [selectedRows, setSelectedRows] = useState<DbTableVO[]>([]);
  const [dataName, setDataName] = useState<string>();
  const currentDataName = dataName || initialDataName || dataNames[0];

  const closeModal = () => {
    setSelectedRows([]);
    setDataName(undefined);
    onCancel();
  };

  const submit = async () => {
    const tableNames = selectedRows.map(item => item.tableName).filter(Boolean);
    if (!currentDataName) {
      message.warning('请选择数据源');
      return;
    }
    if (!tableNames.length) {
      message.warning('请选择要导入的表');
      return;
    }
    const res = await importTable({ tables: tableNames.join(','), dataName: currentDataName });
    message.success(res.msg || '导入成功');
    setSelectedRows([]);
    setDataName(undefined);
    onSuccess();
  };

  return (
    <Modal title="导入表" open={open} width={900} onOk={submit} onCancel={closeModal} destroyOnHidden>
      <Space orientation="vertical" size={12} style={{ width: '100%' }}>
        <Select
          showSearch
          value={currentDataName}
          onChange={value => {
            setDataName(value);
            setSelectedRows([]);
            setTimeout(() => actionRef.current?.reloadAndRest?.(), 0);
          }}
          placeholder="请选择/输入数据源名称"
          options={dataNames.map(item => ({ label: item, value: item }))}
          style={{ width: 260 }}
        />
        <ProTable<DbTableVO, DbTableQuery>
          actionRef={actionRef}
          rowKey="tableName"
          columns={columns}
          scroll={{ x: 900 }}
          search={{ labelWidth: 80 }}
          pagination={{ defaultPageSize: 10, showSizeChanger: true }}
          rowSelection={{
            selectedRowKeys: selectedRows.map(item => item.tableName),
            onChange: (_, rows) => setSelectedRows(rows)
          }}
          request={async params => {
            if (!currentDataName) {
              return { data: [], total: 0, success: true };
            }
            const res = await listDbTable({ ...toPageQuery(params), dataName: currentDataName });
            return toTableData(res);
          }}
          toolBarRender={false}
          options={false}
        />
      </Space>
    </Modal>
  );
}
