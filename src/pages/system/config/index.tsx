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
import { Button, Form, message, Popconfirm } from 'antd';
import { useRef, useState } from 'react';
import type { ConfigForm, ConfigQuery, ConfigVO } from '@/api/system/config/types';
import { addConfig, delConfig, getConfig, listConfig, refreshConfigCache, updateConfig } from '@/api/system/config';
import DictTag from '@/components/common/DictTag';
import EllipsisText from '@/components/common/EllipsisText';
import RowActions from '@/components/common/RowActions';
import { useDateRangeQuery } from '@/hooks/useDateRangeQuery';
import { useDict } from '@/hooks/useDict';
import { useTableExport } from '@/hooks/useTableExport';
import { useTableSelection } from '@/hooks/useTableSelection';
import { useUserStore } from '@/stores/userStore';
import { dictOptions } from '@/utils/dict';
import { hasPermi } from '@/utils/permission';
import { toPageQuery, toTableData } from '@/utils/ruoyi';


export default function SystemConfigPage() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const [form] = Form.useForm<ConfigForm>();
  const userInfo = useUserStore(state => state.userInfo);
  const dicts = useDict('sys_yes_no');
  const { ids, selectedOne, handleSelectionChange, clearSelection } = useTableSelection<ConfigVO>(row => row.configId);
  const [modalOpen, { setTrue: openModal, setFalse: closeModal }] = useBoolean(false);
  const [modalTitle, setModalTitle] = useState('');
  const { updateExportParams, exportFile } = useTableExport();
  const { applyDateRange: applyCreateTimeDateRange } = useDateRangeQuery();
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
  const openEdit = async (row?: ConfigVO) => {
    const target = row || selectedOne;
    if (!target) return;
    const res = await getConfig(target.configId);
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
  const remove = async (row?: ConfigVO) => {
    await delConfig(row?.configId || ids);
    message.success('删除成功');
    clearSelection();
    actionRef.current?.reloadAndRest?.();
  };

  const columns: ProColumns<ConfigVO>[] = [
    { title: '参数名称', dataIndex: 'configName', width: 160 },
    { title: '参数键名', dataIndex: 'configKey', width: 180 },
    {
      title: '参数键值',
      dataIndex: 'configValue',
      search: false,
      width: 220,
      render: (_, row) => <EllipsisText value={row.configValue} maxWidth={200} />
    },
    {
      title: '系统内置',
      dataIndex: 'configType',
      valueType: 'select',
      width: 120,
      fieldProps: { options: dictOptions(dicts.sys_yes_no) },
      render: (_, row) => <DictTag options={dicts.sys_yes_no} value={row.configType} />
    },
    {
      title: '备注',
      dataIndex: 'remark',
      search: false,
      width: 180,
      render: (_, row) => <EllipsisText value={row.remark} maxWidth={160} />
    },
    { title: '创建时间', dataIndex: 'createTimeRange', valueType: 'dateTimeRange', hideInTable: true },
    { title: '创建时间', dataIndex: 'createTime', valueType: 'dateTime', search: false, width: 170 },
    {
      title: '操作',
      valueType: 'option',
      width: 120,
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
      <ProTable<ConfigVO, ConfigQuery & { createTimeRange?: [string, string] }>
        actionRef={actionRef}
        rowKey="configId"
        columns={columns}
        scroll={{ x: 1180 }}
        search={{ labelWidth: 90 }}
        rowSelection={{ selectedRowKeys: ids, onChange: handleSelectionChange }}
        request={async params => {
          const { createTimeRange, ...tableParams } = params;
          const query = applyCreateTimeDateRange(toPageQuery(tableParams), createTimeRange);
          updateExportParams(query);
          const res = await listConfig(query);
          return toTableData(res);
        }}
        toolbar={{ title: '参数列表' }}
        toolBarRender={() => [
          canAdd && (
            <Button key="add" type="primary" icon={<PlusOutlined />} onClick={openAdd}>
              新增
            </Button>
          ),
          canEdit && (
            <Button key="edit" disabled={!selectedOne} icon={<EditOutlined />} onClick={() => openEdit()}>
              修改
            </Button>
          ),
          canRemove && (
            <Popconfirm key="delete" title={`是否确认删除参数编号为"${ids}"的数据项？`} onConfirm={() => remove()}>
              <Button danger disabled={!ids.length} icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
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
        modalProps={{ destroyOnHidden: true, onCancel: closeModal }}
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
