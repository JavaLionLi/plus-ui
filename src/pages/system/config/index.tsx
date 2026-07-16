import { DeleteOutlined, DownloadOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProFormRadio,
  ProFormText,
  ProFormTextArea,
  ProTable,
  type ActionType,
  type ProColumns
} from '@ant-design/pro-components';
import { useBoolean } from 'ahooks';
import { Button, Form, Input, message, Tabs } from 'antd';
import { useRef, useState } from 'react';
import type { ConfigForm, ConfigQuery, ConfigVO } from '@/api/system/config/types';
import {
  addConfig,
  delConfig,
  getConfig,
  listConfig,
  refreshConfigCache,
  updateConfig,
  updateConfigByKey
} from '@/api/system/config';
import RowActions from '@/components/common/RowActions';
import { useDict } from '@/hooks/useDict';
import { useTableExport } from '@/hooks/useTableExport';
import { useTableScroll } from '@/hooks/useTableScroll';
import { useUserStore } from '@/stores/userStore';
import { dictOptions } from '@/utils/dict';
import { confirmTitleSafe } from '@/utils/modal';
import { hasPermi } from '@/utils/permission';
import { toPageQuery, toTableData } from '@/utils/ruoyi';
import './index.less';

const configTypeTabs = [
  { key: '', label: '全部' },
  { key: 'Y', label: '系统内置' },
  { key: 'N', label: '自定义配置' }
];

export default function SystemConfigPage() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { tableScroll } = useTableScroll(900);
  const [form] = Form.useForm<ConfigForm>();
  const userInfo = useUserStore(state => state.userInfo);
  const dicts = useDict('sys_yes_no');
  const [modalOpen, { setTrue: openModal, setFalse: closeModal }] = useBoolean(false);
  const [modalTitle, setModalTitle] = useState('');
  const [activeConfigType, setActiveConfigType] = useState('');
  const { updateExportParams, exportFile } = useTableExport();
  const canAdd = hasPermi(userInfo, ['system:config:add']);
  const canEdit = hasPermi(userInfo, ['system:config:edit']);
  const canRemove = hasPermi(userInfo, ['system:config:remove']);
  const canExport = hasPermi(userInfo, ['system:config:export']);

  const openAdd = () => {
    form.resetFields();
    form.setFieldsValue({ configType: 'Y' });
    setModalTitle('添加参数');
    openModal();
  };

  const openEdit = async (row: ConfigVO) => {
    const res = await getConfig(row.configId);
    form.resetFields();
    form.setFieldsValue(res.data);
    setModalTitle('修改参数');
    openModal();
  };

  const submit = async (values: ConfigForm) => {
    values.configId ? await updateConfig(values) : await addConfig(values);
    message.success('操作成功');
    form.resetFields();
    actionRef.current?.reload();
    return true;
  };

  const remove = async (row: ConfigVO) => {
    await delConfig(row.configId);
    message.success('删除成功');
    actionRef.current?.reload();
  };

  const changeConfigType = (key: string) => {
    setActiveConfigType(key);
    setTimeout(() => actionRef.current?.reloadAndRest?.(), 0);
  };

  const saveInlineValue = async (row: ConfigVO, value: string) => {
    if (value === row.configValue) return;
    if (!(await confirmTitleSafe(`确认要保存对参数"${row.configKey}"的修改吗？`))) return;
    await updateConfigByKey(row.configKey, value);
    message.success('修改成功');
    actionRef.current?.reload();
  };

  const columns: ProColumns<ConfigVO>[] = [
    { title: '参数名称', dataIndex: 'configName', width: 180 },
    { title: '参数键名', dataIndex: 'configKey', width: 200 },
    {
      title: '参数键值',
      dataIndex: 'configValue',
      search: false,
      width: 240,
      render: (_, row) => (
        <Input
          defaultValue={row.configValue}
          placeholder="请输入参数键值"
          onBlur={event => saveInlineValue(row, event.target.value)}
          onPressEnter={event => event.currentTarget.blur()}
        />
      )
    },
    {
      title: '备注',
      dataIndex: 'remark',
      search: false,
      width: 220,
      ellipsis: true,
      renderText: value => value || '-'
    },
    {
      title: '操作',
      valueType: 'option',
      width: 96,
      fixed: 'right',
      render: (_, row) => (
        <RowActions
          actions={[
            canEdit && { key: 'edit', label: '修改', icon: <EditOutlined />, onClick: () => openEdit(row) },
            canRemove && {
              key: 'delete',
              label: '删除',
              icon: <DeleteOutlined />,
              danger: true,
              confirm: `是否确认删除参数编号为"${row.configId}"的数据项？`,
              onClick: () => remove(row)
            }
          ]}
        />
      )
    }
  ];

  return (
    <PageContainer title="参数管理">
      <ProTable<ConfigVO, ConfigQuery>
        actionRef={actionRef}
        rowKey="configId"
        columns={columns}
        scroll={tableScroll}
        search={{ labelWidth: 90 }}
        request={async params => {
          const query = {
            ...toPageQuery(params),
            configType: activeConfigType
          };
          updateExportParams(query);
          const res = await listConfig(query);
          return toTableData(res);
        }}
        toolbar={{ title: '参数列表' }}
        tableRender={(_, dom) => (
          <div className="system-config-page">
            <Tabs
              activeKey={activeConfigType}
              tabPlacement="start"
              className="system-config-page__tabs"
              items={configTypeTabs}
              onChange={changeConfigType}
            />
            <div className="system-config-page__content">{dom}</div>
          </div>
        )}
        toolBarRender={() => [
          canAdd && (
            <Button key="add" type="primary" icon={<PlusOutlined />} onClick={openAdd}>
              新增
            </Button>
          ),
          canExport && (
            <Button
              key="export"
              icon={<DownloadOutlined />}
              onClick={() => exportFile('/system/config/export', () => `config_${Date.now()}.xlsx`)}
            >
              导出
            </Button>
          ),
          canRemove && (
            <Button
              key="refresh"
              danger
              icon={<ReloadOutlined />}
              onClick={async () => {
                await refreshConfigCache();
                message.success('刷新缓存成功');
              }}
            >
              刷新缓存
            </Button>
          )
        ]}
      />
      <ModalForm<ConfigForm>
        title={modalTitle}
        open={modalOpen}
        width={560}
        form={form}
        layout="vertical"
        initialValues={{ configType: 'Y' }}
        modalProps={{ forceRender: true, onCancel: closeModal }}
        onOpenChange={open => !open && closeModal()}
        onFinish={submit}
      >
        <ProFormText name="configId" hidden />
        <ProFormText name="configName" label="参数名称" rules={[{ required: true, message: '参数名称不能为空' }]} />
        <ProFormText name="configKey" label="参数键名" rules={[{ required: true, message: '参数键名不能为空' }]} />
        <ProFormTextArea
          name="configValue"
          label="参数键值"
          fieldProps={{ rows: 3 }}
          rules={[{ required: true, message: '参数键值不能为空' }]}
        />
        <ProFormRadio.Group name="configType" label="系统内置" options={dictOptions(dicts.sys_yes_no)} />
        <ProFormTextArea name="remark" label="备注" fieldProps={{ rows: 3 }} />
      </ModalForm>
    </PageContainer>
  );
}
