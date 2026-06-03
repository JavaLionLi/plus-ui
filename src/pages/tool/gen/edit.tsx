import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, useLocation } from '@umijs/max';
import { useRequest } from 'ahooks';
import { Button, Card, Form, message, Space, Spin, Tabs } from 'antd';
import { useEffect, useState } from 'react';
import type { DictTypeVO } from '@/api/system/dict/type/types';
import type { MenuVO } from '@/api/system/menu/types';
import type { DbColumnVO, DbTableVO } from '@/api/tool/gen/types';
import { optionselect } from '@/api/system/dict/type';
import { listMenu } from '@/api/system/menu';
import { getGenTable, updateGenTable } from '@/api/tool/gen';
import { handleTree } from '@/utils/ruoyi';
import BasicInfoForm from './components/BasicInfoForm';
import ColumnInfoTable from './components/ColumnInfoTable';
import { normalizeGenColumn, normalizeStringArray } from './components/genConfig';
import GenInfoForm from './components/GenInfoForm';

function getTableId(pathname: string) {
  return pathname.split('/').filter(Boolean).at(-1) || '';
}

function withDefaults(info: DbTableVO): DbTableVO {
  return {
    ...info,
    enableExport: info.enableExport ?? true,
    enableStatus: info.enableStatus ?? false,
    statusField: info.statusField ?? '',
    enableUnique: info.enableUnique ?? false,
    uniqueFields: normalizeStringArray(info.uniqueFields),
    enableSort: info.enableSort ?? false,
    sortField: info.sortField ?? '',
    frontendType: info.frontendType || 'react',
    treeRootValue: info.treeRootValue ?? '0',
    treeAncestorsField: info.treeAncestorsField ?? '',
    treeOrderField: info.treeOrderField ?? ''
  };
}

export default function ToolGenEditPage() {
  const location = useLocation();
  const tableId = getTableId(location.pathname);
  const pageNum = new URLSearchParams(location.search).get('pageNum') || '1';
  const [form] = Form.useForm<DbTableVO>();
  const [tableInfo, setTableInfo] = useState<Partial<DbTableVO>>({});
  const [columns, setColumns] = useState<DbColumnVO[]>([]);
  const [dictOptions, setDictOptions] = useState<DictTypeVO[]>([]);
  const [menuOptions, setMenuOptions] = useState<MenuVO[]>([]);
  const [activeTab, setActiveTab] = useState('columnInfo');

  const backToList = () => history.push(`/tool/gen?pageNum=${pageNum}&t=${Date.now()}`);

  const { loading, runAsync: loadGenConfig } = useRequest(
    async (nextTableId: string) => {
      const [detailRes, dictRes, menuRes] = await Promise.all([getGenTable(nextTableId), optionselect(), listMenu()]);
      return { detail: detailRes.data, dicts: dictRes.data || [], menus: menuRes.data || [] };
    },
    {
      manual: true,
      onSuccess: ({ detail, dicts, menus }) => {
        const info = withDefaults(detail.info || {});
        setTableInfo(info);
        setColumns((detail.rows || []).map(normalizeGenColumn));
        setDictOptions(dicts);
        setMenuOptions(handleTree<MenuVO>(menus, 'menuId'));
        form.setFieldsValue(info);
      }
    }
  );
  const { loading: submitLoading, runAsync: submitGenConfig } = useRequest(updateGenTable, { manual: true });

  useEffect(() => {
    if (!tableId) return;
    loadGenConfig(tableId);
  }, [loadGenConfig, tableId]);

  const submitForm = async () => {
    const values = await form.validateFields();
    const normalizedColumns = columns.map(normalizeGenColumn);
    await submitGenConfig({
      ...tableInfo,
      ...values,
      tableId,
      columns: normalizedColumns,
      params: {
        treeCode: values.treeCode,
        treeName: values.treeName,
        treeParentCode: values.treeParentCode,
        parentMenuId: values.parentMenuId,
        enableExport: values.enableExport,
        enableStatus: values.enableStatus,
        statusField: values.statusField,
        enableUnique: values.enableUnique,
        uniqueFields: values.uniqueFields,
        enableSort: values.enableSort,
        sortField: values.sortField,
        treeRootValue: values.treeRootValue,
        treeAncestors: values.treeAncestorsField,
        treeOrderField: values.treeOrderField
      }
    });
    message.success('操作成功');
    backToList();
  };

  return (
    <PageContainer title="修改生成配置">
      <Spin spinning={loading}>
        <Card>
          <Form form={form} layout="vertical">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: 'basic',
                  label: '基本信息',
                  children: <BasicInfoForm />
                },
                {
                  key: 'columnInfo',
                  label: '字段信息',
                  children: <ColumnInfoTable columns={columns} dictOptions={dictOptions} onChange={setColumns} />
                },
                {
                  key: 'genInfo',
                  label: '生成信息',
                  children: <GenInfoForm form={form} columns={columns} menuOptions={menuOptions} />
                }
              ]}
            />
          </Form>

          <Space style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
            <Button type="primary" icon={<SaveOutlined />} loading={submitLoading} onClick={submitForm}>
              提交
            </Button>
            <Button icon={<ArrowLeftOutlined />} onClick={backToList}>
              返回
            </Button>
          </Space>
        </Card>
      </Spin>
    </PageContainer>
  );
}
