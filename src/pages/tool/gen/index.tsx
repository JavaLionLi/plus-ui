import {
  CopyOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  SyncOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { PageContainer, ProTable, type ActionType, type ProColumns } from '@ant-design/pro-components';
import { history, useLocation } from '@umijs/max';
import { useBoolean } from 'ahooks';
import { Button, message, Modal, Popconfirm, Space, Tabs, Tooltip } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { TableQuery, TableVO } from '@/api/tool/gen/types';
import { batchGenCode, delTable, getDataNames, listTable, previewTable, synchDb } from '@/api/tool/gen';
import EllipsisText from '@/components/common/EllipsisText';
import { useDateRangeQuery } from '@/hooks/useDateRangeQuery';
import { useTableScroll } from '@/hooks/useTableScroll';
import { useUserStore } from '@/stores/userStore';
import { saveValidatedBlob } from '@/utils/download';
import { hasPermi } from '@/utils/permission';
import { toPageQuery, toTableData } from '@/utils/ruoyi';
import ImportTableModal from './components/ImportTableModal';

function previewName(path: string) {
  const fileName = path.substring(path.lastIndexOf('/') + 1);
  return fileName.includes('.ftl') ? fileName.substring(0, fileName.indexOf('.ftl')) : fileName;
}

function previewLanguage(name: string) {
  const ext = name.toLowerCase().split('.').pop();
  const languageMap: Record<string, string> = {
    java: 'java',
    xml: 'xml',
    ts: 'typescript',
    tsx: 'tsx',
    vue: 'vue',
    sql: 'sql',
    json: 'json',
    yml: 'yaml',
    yaml: 'yaml',
    js: 'javascript',
    jsx: 'jsx',
    html: 'html',
    css: 'css',
    less: 'less'
  };
  return (ext && languageMap[ext]) || 'text';
}

export default function ToolGenPage() {
  const location = useLocation();
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { tableScroll } = useTableScroll(1300);
  const userInfo = useUserStore(state => state.userInfo);
  const [selectedRows, setSelectedRows] = useState<TableVO[]>([]);
  const [dataNames, setDataNames] = useState<string[]>([]);
  const [previewOpen, { setTrue: openPreviewModal, setFalse: closePreviewModal }] = useBoolean(false);
  const [previewData, setPreviewData] = useState<Record<string, string>>({});
  const [previewActive, setPreviewActive] = useState('');
  const [importOpen, { setTrue: openImportModal, setFalse: closeImportModal }] = useBoolean(false);
  const [currentDataName, setCurrentDataName] = useState<string>();
  const [currentPage, setCurrentPage] = useState(
    () => Number(new URLSearchParams(location.search).get('pageNum')) || 1
  );
  const { applyDateRange } = useDateRangeQuery();

  const canCode = hasPermi(userInfo, ['tool:gen:code']);
  const canImport = hasPermi(userInfo, ['tool:gen:import']);
  const canEdit = hasPermi(userInfo, ['tool:gen:edit']);
  const canRemove = hasPermi(userInfo, ['tool:gen:remove']);
  const canPreview = hasPermi(userInfo, ['tool:gen:preview']);
  const selectedIds = selectedRows.map(item => item.tableId).filter(Boolean);
  const selectedOne = selectedRows.length === 1 ? selectedRows[0] : undefined;
  const previewItems = useMemo(() => Object.entries(previewData), [previewData]);

  const loadDataNames = useCallback(async () => {
    const res = await getDataNames();
    const names = res.data || [];
    setDataNames(names);
    return names;
  }, []);

  const openEditTable = (tableId?: string | number) => {
    if (!tableId) return;
    history.push(`/tool/gen-edit/index/${tableId}?pageNum=${currentPage}`);
  };

  useEffect(() => {
    loadDataNames();
  }, [loadDataNames]);

  const handleGenTable = async (row?: TableVO) => {
    const rows = row ? [row] : selectedRows;
    if (!rows.length) {
      message.error('请选择要生成的数据');
      return;
    }
    const tableIdStr = rows.map(item => item.tableId).join(',');
    const blob = await batchGenCode(tableIdStr);
    await saveValidatedBlob(blob, 'ruoyi.zip');
  };

  const handlePreview = async (row: TableVO) => {
    const res = await previewTable(row.tableId);
    const data = res.data || {};
    setPreviewData(data);
    setPreviewActive(Object.keys(data)[0] ? previewName(Object.keys(data)[0]) : '');
    openPreviewModal();
  };

  const copyPreview = async (value: string) => {
    await navigator.clipboard.writeText(value);
    message.success('复制成功');
  };

  const handleSynchDb = async (row: TableVO) => {
    await synchDb(row.tableId);
    message.success('同步成功');
    actionRef.current?.reload();
  };

  const handleDelete = async (row?: TableVO) => {
    const ids = row?.tableId || selectedIds;
    if (!ids || (Array.isArray(ids) && ids.length === 0)) return;
    await delTable(ids);
    message.success('删除成功');
    setSelectedRows([]);
    actionRef.current?.reloadAndRest?.();
  };

  const openImportTable = async () => {
    await loadDataNames();
    openImportModal();
  };

  const columns: ProColumns<TableVO>[] = [
    {
      title: '数据源',
      dataIndex: 'dataName',
      valueType: 'select',
      fieldProps: {
        allowClear: true,
        showSearch: true,
        options: [{ label: '全部', value: '' }, ...dataNames.map(item => ({ label: item, value: item }))]
      },
      width: 150,
      render: (_, row) => <EllipsisText value={row.dataName} maxWidth={130} />
    },
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
    {
      title: '实体',
      dataIndex: 'className',
      search: false,
      width: 180,
      render: (_, row) => <EllipsisText value={row.className} maxWidth={160} />
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
      search: false,
      width: 170
    },
    {
      title: '创建时间',
      dataIndex: 'dateRange',
      valueType: 'dateRange',
      hideInTable: true,
      search: { transform: value => ({ dateRange: value }) }
    },
    { title: '更新时间', dataIndex: 'updateTime', valueType: 'dateTime', search: false, width: 170 },
    {
      title: '操作',
      valueType: 'option',
      width: 230,
      fixed: 'right',
      render: (_, row) => (
        <Space size={4}>
          {canPreview && (
            <Tooltip title="预览">
              <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handlePreview(row)} />
            </Tooltip>
          )}
          {canEdit && (
            <Tooltip title="编辑">
              <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditTable(row.tableId)} />
            </Tooltip>
          )}
          {canRemove && (
            <Popconfirm title={`是否确认删除表编号为"${row.tableId}"的数据项？`} onConfirm={() => handleDelete(row)}>
              <Tooltip title="删除">
                <Button type="link" danger size="small" icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          )}
          {canEdit && (
            <Popconfirm title={`确认要强制同步"${row.tableName}"表结构吗？`} onConfirm={() => handleSynchDb(row)}>
              <Tooltip title="同步">
                <Button type="link" size="small" icon={<SyncOutlined />} />
              </Tooltip>
            </Popconfirm>
          )}
          {canCode && (
            <Tooltip title="生成代码">
              <Button type="link" size="small" icon={<DownloadOutlined />} onClick={() => handleGenTable(row)} />
            </Tooltip>
          )}
        </Space>
      )
    }
  ];

  return (
    <PageContainer title="代码生成">
      <ProTable<TableVO, TableQuery & { dateRange?: [string, string] }>
        actionRef={actionRef}
        rowKey="tableId"
        columns={columns}
        scroll={tableScroll}
        search={{ labelWidth: 90 }}
        pagination={{ defaultCurrent: currentPage, defaultPageSize: 10, showSizeChanger: true }}
        rowSelection={{
          selectedRowKeys: selectedIds,
          onChange: (_, rows) => setSelectedRows(rows)
        }}
        request={async params => {
          const { dateRange, ...tableParams } = params;
          setCurrentPage(tableParams.current || 1);
          setCurrentDataName(tableParams.dataName || undefined);
          const query = applyDateRange(toPageQuery(tableParams), dateRange);
          const res = await listTable(query);
          return toTableData(res);
        }}
        toolbar={{ title: '数据表列表' }}
        toolBarRender={() => [
          canCode && (
            <Button key="gen" type="primary" icon={<DownloadOutlined />} onClick={() => handleGenTable()}>
              生成
            </Button>
          ),
          canImport && (
            <Button key="import" icon={<UploadOutlined />} onClick={openImportTable}>
              导入
            </Button>
          ),
          canEdit && (
            <Button
              key="edit"
              icon={<EditOutlined />}
              disabled={!selectedOne}
              onClick={() => openEditTable(selectedOne?.tableId)}
            >
              修改
            </Button>
          ),
          canRemove && (
            <Popconfirm key="delete" title="是否确认删除选中的代码生成表？" onConfirm={() => handleDelete()}>
              <Button danger icon={<DeleteOutlined />} disabled={!selectedIds.length}>
                删除
              </Button>
            </Popconfirm>
          )
        ]}
      />

      <Modal title="代码预览" open={previewOpen} width="80%" onCancel={closePreviewModal} footer={null} destroyOnHidden>
        <Tabs
          activeKey={previewActive}
          onChange={setPreviewActive}
          items={previewItems.map(([key, value]) => ({
            key: previewName(key),
            label: previewName(key),
            children: (
              <div>
                <Button
                  type="link"
                  icon={<CopyOutlined />}
                  onClick={() => copyPreview(value)}
                  style={{ float: 'right' }}
                >
                  复制
                </Button>
                <SyntaxHighlighter
                  language={previewLanguage(previewName(key))}
                  style={oneDark}
                  showLineNumbers
                  wrapLongLines
                  customStyle={{ maxHeight: '60vh', clear: 'both', margin: 0, borderRadius: 6 }}
                >
                  {value}
                </SyntaxHighlighter>
              </div>
            )
          }))}
        />
      </Modal>

      <ImportTableModal
        open={importOpen}
        dataNames={dataNames}
        initialDataName={currentDataName}
        onCancel={closeImportModal}
        onSuccess={() => {
          closeImportModal();
          actionRef.current?.reloadAndRest?.();
        }}
      />
    </PageContainer>
  );
}
