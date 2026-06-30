import {
  CheckCircleOutlined,
  CopyOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { PageContainer, ProTable, type ActionType, type ProColumns } from '@ant-design/pro-components';
import { history, useLocation } from '@umijs/max';
import { useBoolean } from 'ahooks';
import { Button, Form, message, Popconfirm, Space, Switch, Tabs, Tag } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { PageResult, R } from '@/api/types';
import type { CategoryTreeVO } from '@/api/workflow/category/types';
import type { FlowDefinitionForm, FlowDefinitionQuery, FlowDefinitionVO } from '@/api/workflow/definition/types';
import { categoryTree } from '@/api/workflow/category';
import {
  activeDefinition,
  addDefinition,
  copyDefinition,
  deleteDefinition,
  editDefinition,
  exportDefinition,
  getDefinition,
  listDefinition,
  publishDefinition,
  unPublishList
} from '@/api/workflow/definition';
import EllipsisText from '@/components/common/EllipsisText';
import TreePanel from '@/components/common/TreePanel';
import { useSearchReset } from '@/hooks/useSearchReset';
import { useTableScroll } from '@/hooks/useTableScroll';
import { useUserStore } from '@/stores/userStore';
import { saveValidatedBlob } from '@/utils/download';
import { confirmAction } from '@/utils/modal';
import { hasPermi } from '@/utils/permission';
import { toPageQuery, toTableData } from '@/utils/ruoyi';
import DefinitionFormModal from './components/DefinitionFormModal';
import DefinitionImportModal from './components/DefinitionImportModal';

type DefinitionTab = '0' | '1';

function getActiveTabFromSearch(search: string): DefinitionTab {
  return new URLSearchParams(search).get('activeName') === '1' ? '1' : '0';
}

function getExplicitActiveTabFromSearch(search: string): DefinitionTab | undefined {
  const activeName = new URLSearchParams(search).get('activeName');
  return activeName === '0' || activeName === '1' ? activeName : undefined;
}

const defaultForm: FlowDefinitionForm = {
  flowName: '',
  flowCode: '',
  category: '',
  ext: '',
  formPath: '',
  formCustom: 'N',
  modelValue: 'CLASSICS'
};

function requestDefinitionList(
  tab: DefinitionTab,
  query: FlowDefinitionQuery
): Promise<R<PageResult<FlowDefinitionVO>>> {
  if (tab === '0') return listDefinition(query);
  return unPublishList(query);
}

export default function WorkflowProcessDefinitionPage() {
  const location = useLocation();
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { tableScroll } = useTableScroll(1240);
  const [form] = Form.useForm<FlowDefinitionForm>();
  const userInfo = useUserStore(state => state.userInfo);
  const [categoryOptions, setCategoryOptions] = useState<CategoryTreeVO[]>([]);
  const [category, setCategory] = useState<string | number>();
  const [activeTab, setActiveTab] = useState<DefinitionTab>(() => getActiveTabFromSearch(location.search));
  const [selectedRows, setSelectedRows] = useState<FlowDefinitionVO[]>([]);
  const [modalOpen, { setTrue: openModal, setFalse: closeModal }] = useBoolean(false);
  const [modalTitle, setModalTitle] = useState('新增流程');
  const [autoPass, setAutoPass] = useState(false);
  const [uploadOpen, { setTrue: openUploadModal, setFalse: closeUploadModal }] = useBoolean(false);

  const canAdd = hasPermi(userInfo, ['workflow:definition:add']);
  const canEdit = hasPermi(userInfo, ['workflow:definition:edit']);
  const canRemove = hasPermi(userInfo, ['workflow:definition:remove']);
  const canImport = hasPermi(userInfo, ['workflow:definition:import']);
  const canExport = hasPermi(userInfo, ['workflow:definition:export']);
  const canActive = hasPermi(userInfo, ['workflow:definition:active']);
  const canCopy = hasPermi(userInfo, ['workflow:definition:copy']);
  const canQuery = hasPermi(userInfo, ['workflow:definition:query']);
  const canPublish = hasPermi(userInfo, ['workflow:definition:publish']);

  const selectedIds = selectedRows.map(item => item.id).filter(Boolean);
  const selectedOne = selectedRows.length === 1 ? selectedRows[0] : undefined;
  const resetSearch = useSearchReset(
    actionRef,
    useCallback(() => setCategory(undefined), [])
  );

  const switchTab = useCallback((nextTab: DefinitionTab) => {
    setSelectedRows([]);
    setActiveTab(currentTab => {
      if (nextTab === currentTab) {
        setTimeout(() => actionRef.current?.reloadAndRest?.(), 0);
        return currentTab;
      }
      return nextTab;
    });
  }, []);

  useEffect(() => {
    categoryTree().then(res => setCategoryOptions(res.data || []));
  }, []);

  useEffect(() => {
    const nextTab = getExplicitActiveTabFromSearch(location.search);
    if (!nextTab) return;
    switchTab(nextTab);
  }, [location.search, switchTab]);

  const changeTab = (key: string) => {
    switchTab(key as DefinitionTab);
  };

  const openAdd = () => {
    form.resetFields();
    form.setFieldsValue({
      ...defaultForm,
      category: category || ''
    });
    setAutoPass(false);
    setModalTitle('新增流程');
    openModal();
  };

  const openEdit = async (row?: FlowDefinitionVO) => {
    const target = row || selectedOne;
    if (!target?.id) return;
    const res = await getDefinition(target.id);
    const data = res.data || {};
    form.resetFields();
    form.setFieldsValue(data);
    setAutoPass(false);
    if (data.ext) {
      try {
        setAutoPass(!!JSON.parse(data.ext).autoPass);
      } catch {
        setAutoPass(false);
      }
    }
    setModalTitle('修改流程');
    openModal();
  };

  const submitForm = async (fields: FlowDefinitionForm) => {
    const values = { ...form.getFieldsValue(true), ...fields };
    const data = { ...values, ext: JSON.stringify({ autoPass }) };
    if (data.id) {
      await editDefinition(data);
    } else {
      await addDefinition(data);
      switchTab('1');
    }
    message.success('操作成功');
    form.resetFields();
    if (data.id) {
      actionRef.current?.reload();
    }
    return true;
  };

  const handleDelete = async (row?: FlowDefinitionVO) => {
    const ids = row?.id ? [row.id] : selectedIds;
    if (!ids.length) return;
    await deleteDefinition(ids);
    message.success('删除成功');
    setSelectedRows([]);
    actionRef.current?.reloadAndRest?.();
  };

  const handlePublish = async (row: FlowDefinitionVO) => {
    await confirmAction(
      `是否确认发布流程定义编码为【${row.flowCode}】版本为【${row.version}】的数据项？发布后会将已发布流程定义改为失效！`
    );
    await publishDefinition(row.id);
    message.success('发布成功');
    switchTab('0');
  };

  const handleCopy = async (row: FlowDefinitionVO) => {
    await confirmAction(`是否确认复制【${row.flowCode}】版本为【${row.version}】的流程定义！`);
    await copyDefinition(row.id);
    message.success('操作成功');
    switchTab('1');
  };

  const handleActiveChange = async (row: FlowDefinitionVO, checked: boolean) => {
    const previous = row.activityStatus;
    const messageText = checked
      ? `启动后，此流程下的所有任务都允许往后流转，您确定激活【${row.flowName || row.flowCode}】吗？`
      : `暂停后，此流程下的所有任务都不允许往后流转，您确定挂起【${row.flowName || row.flowCode}】吗？`;
    try {
      await confirmAction(messageText);
      await activeDefinition(row.id, checked);
      message.success('操作成功');
      actionRef.current?.reload();
    } catch {
      row.activityStatus = previous;
      actionRef.current?.reload();
    }
  };

  const handleExport = async () => {
    if (!selectedOne?.id) return;
    const blob = await exportDefinition(selectedOne.id);
    await saveValidatedBlob(blob, `${selectedOne.flowCode}.json`);
  };

  const columns: ProColumns<FlowDefinitionVO>[] = [
    {
      title: '流程定义名称',
      dataIndex: 'flowName',
      width: 180,
      render: (_, row) => <EllipsisText value={row.flowName} maxWidth={160} />
    },
    {
      title: '标识KEY',
      dataIndex: 'flowCode',
      width: 170,
      render: (_, row) => <EllipsisText value={row.flowCode} maxWidth={150} />
    },
    {
      title: '流程分类',
      dataIndex: 'categoryName',
      search: false,
      width: 150,
      render: (_, row) => <EllipsisText value={row.categoryName} maxWidth={130} />
    },
    {
      title: '版本号',
      dataIndex: 'version',
      search: false,
      width: 100,
      render: (_, row) => (row.version ? `v${row.version}.0` : '-')
    },
    {
      title: '激活状态',
      dataIndex: 'activityStatus',
      search: false,
      width: 120,
      render: (_, row) => (
        <Switch
          disabled={!canActive}
          checked={row.activityStatus === 1}
          onChange={checked => handleActiveChange(row, checked)}
        />
      )
    },
    {
      title: '发布状态',
      dataIndex: 'isPublish',
      search: false,
      width: 120,
      render: (_, row) => {
        if (row.isPublish === 1) return <Tag color="green">已发布</Tag>;
        if (row.isPublish === 0) return <Tag color="red">未发布</Tag>;
        return <Tag color="red">失效</Tag>;
      }
    },
    {
      title: '操作',
      valueType: 'option',
      width: 250,
      fixed: 'right',
      render: (_, row) => (
        <Space size={4} wrap>
          {canRemove && (
            <Popconfirm
              title={`是否确认删除流程定义编码为"${row.flowCode}"的数据项？`}
              onConfirm={() => handleDelete(row)}
            >
              <Button type="link" danger size="small" icon={<DeleteOutlined />}>
                删除流程
              </Button>
            </Popconfirm>
          )}
          {canCopy && (
            <Button type="link" size="small" icon={<CopyOutlined />} onClick={() => handleCopy(row)}>
              复制流程
            </Button>
          )}
          {canQuery && row.isPublish === 0 && (
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() =>
                history.push(`/workflow/design/index?definitionId=${row.id}&disabled=false&activeName=${activeTab}`)
              }
            >
              流程设计
            </Button>
          )}
          {canQuery && row.isPublish !== 0 && (
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() =>
                history.push(`/workflow/design/index?definitionId=${row.id}&disabled=true&activeName=${activeTab}`)
              }
            >
              查看流程
            </Button>
          )}
          {canPublish && row.isPublish !== 1 && (
            <Button type="link" size="small" icon={<CheckCircleOutlined />} onClick={() => handlePublish(row)}>
              发布流程
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <PageContainer title="流程定义">
      <div className="tree-table-page">
        <TreePanel<CategoryTreeVO>
          title="流程分类"
          placeholder="请输入流程分类名"
          data={categoryOptions}
          fieldNames={{ title: 'label', key: 'id', children: 'children' }}
          filterField="label"
          onNodeClick={node => {
            setCategory(node.id === '0' ? undefined : node.id);
            setTimeout(() => actionRef.current?.reloadAndRest?.(), 0);
          }}
        />
        <main className="table-panel">
          <Tabs
            activeKey={activeTab}
            onChange={changeTab}
            items={[
              { key: '0', label: '已发布' },
              { key: '1', label: '未发布' }
            ]}
          />
          <ProTable<FlowDefinitionVO, FlowDefinitionQuery>
            key={activeTab}
            actionRef={actionRef}
            rowKey="id"
            columns={columns}
            scroll={tableScroll}
            search={{ labelWidth: 120 }}
            form={{ onReset: resetSearch }}
            pagination={{ defaultPageSize: 10, showSizeChanger: true }}
            rowSelection={{
              selectedRowKeys: selectedIds,
              onChange: (_, rows) => setSelectedRows(rows)
            }}
            request={async params => {
              const res = await requestDefinitionList(activeTab, { ...toPageQuery(params), category });
              return toTableData(res);
            }}
            toolbar={{ title: '流程定义' }}
            toolBarRender={() => [
              canAdd && (
                <Button key="add" type="primary" icon={<PlusOutlined />} onClick={openAdd}>
                  添加
                </Button>
              ),
              canEdit && (
                <Button key="edit" icon={<EditOutlined />} disabled={!selectedOne} onClick={() => openEdit()}>
                  修改
                </Button>
              ),
              canRemove && (
                <Popconfirm key="delete" title="是否确认删除选中的流程定义？" onConfirm={() => handleDelete()}>
                  <Button danger icon={<DeleteOutlined />} disabled={!selectedIds.length}>
                    删除
                  </Button>
                </Popconfirm>
              ),
              canImport && (
                <Button key="import" icon={<UploadOutlined />} onClick={openUploadModal}>
                  部署流程文件
                </Button>
              ),
              canExport && (
                <Button key="export" icon={<DownloadOutlined />} disabled={!selectedOne} onClick={handleExport}>
                  导出
                </Button>
              )
            ]}
          />
        </main>
      </div>

      <DefinitionFormModal
        title={modalTitle}
        open={modalOpen}
        form={form}
        categoryOptions={categoryOptions}
        autoPass={autoPass}
        onAutoPassChange={setAutoPass}
        onCancel={closeModal}
        onFinish={submitForm}
      />

      <DefinitionImportModal
        open={uploadOpen}
        categoryOptions={categoryOptions}
        initialCategory={category}
        onCancel={closeUploadModal}
        onSuccess={() => switchTab('1')}
      />
    </PageContainer>
  );
}
