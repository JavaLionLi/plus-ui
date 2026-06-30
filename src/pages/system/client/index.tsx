import { DeleteOutlined, DownloadOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProFormDigit,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
  type ActionType,
  type ProColumns
} from '@ant-design/pro-components';
import { useBoolean } from 'ahooks';
import { Button, Form, message, Popconfirm, Space, Switch } from 'antd';
import { useMemo, useRef, useState } from 'react';
import type { ClientForm, ClientQuery, ClientVO } from '@/api/system/client/types';
import { addClient, changeStatus, delClient, getClient, listClient, updateClient } from '@/api/system/client';
import DictTag from '@/components/common/DictTag';
import EllipsisText from '@/components/common/EllipsisText';
import RowActions from '@/components/common/RowActions';
import { useDict } from '@/hooks/useDict';
import { useTableExport } from '@/hooks/useTableExport';
import { useTableSelection } from '@/hooks/useTableSelection';
import { useTableScroll } from '@/hooks/useTableScroll';
import { useUserStore } from '@/stores/userStore';
import { dictOptions } from '@/utils/dict';
import { confirmAction } from '@/utils/modal';
import { hasPermi } from '@/utils/permission';
import { toPageQuery, toTableData } from '@/utils/ruoyi';

const defaultClientForm: ClientForm = { status: '0' };


function getRuleList(ruleList?: string[], ruleValue?: string) {
  if (Array.isArray(ruleList) && ruleList.length) return ruleList;
  if (!ruleValue) return [];
  return ruleValue
    .split(/[\n,;]+/)
    .map(item => item.trim())
    .filter(Boolean);
}

export default function SystemClientPage() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { tableScroll } = useTableScroll(1580);
  const [form] = Form.useForm<ClientForm>();
  const userInfo = useUserStore(state => state.userInfo);
  const dicts = useDict('sys_normal_disable', 'sys_grant_type', 'sys_device_type');
  const { ids, selectedOne, handleSelectionChange, clearSelection } = useTableSelection<ClientVO>(row => row.id);
  const [modalOpen, { setTrue: openModal, setFalse: closeModal }] = useBoolean(false);
  const [modalTitle, setModalTitle] = useState('');
  const { updateExportParams, exportFile } = useTableExport();

  const canAdd = hasPermi(userInfo, ['system:client:add']);
  const canEdit = hasPermi(userInfo, ['system:client:edit']);
  const canRemove = hasPermi(userInfo, ['system:client:remove']);
  const canExport = hasPermi(userInfo, ['system:client:export']);
  const statusOptions = useMemo(() => dictOptions(dicts.sys_normal_disable), [dicts.sys_normal_disable]);
  const grantTypeOptions = useMemo(() => dictOptions(dicts.sys_grant_type), [dicts.sys_grant_type]);
  const deviceTypeOptions = useMemo(() => dictOptions(dicts.sys_device_type), [dicts.sys_device_type]);
  const editingClient = !!Form.useWatch('id', form);

  const openAdd = () => {
    form.resetFields();
    form.setFieldsValue(defaultClientForm);
    setModalTitle('添加客户端管理');
    openModal();
  };

  const openEdit = async (row?: ClientVO) => {
    const target = row || selectedOne;
    if (!target?.id) return;
    const res = await getClient(target.id);
    form.resetFields();
    form.setFieldsValue(res.data);
    setModalTitle('修改客户端管理');
    openModal();
  };

  const submitForm = async (values: ClientForm) => {
    values.id ? await updateClient(values) : await addClient(values);
    message.success('操作成功');
    form.resetFields();
    actionRef.current?.reload();
    return true;
  };

  const remove = async (row?: ClientVO) => {
    await delClient(row?.id || ids);
    message.success('删除成功');
    clearSelection();
    actionRef.current?.reloadAndRest?.();
  };

  const toggleStatus = async (row: ClientVO, checked: boolean) => {
    const nextStatus = checked ? '0' : '1';
    const text = nextStatus === '0' ? '启用' : '停用';
    try {
      await confirmAction(`确认要"${text}"吗?`);
      await changeStatus(row.clientId, nextStatus);
      message.success(`${text}成功`);
      actionRef.current?.reload();
    } catch {
      actionRef.current?.reload();
    }
  };

  const columns: ProColumns<ClientVO>[] = [
    {
      title: '客户端id',
      dataIndex: 'clientId',
      search: false,
      width: 180,
      render: (_, row) => <EllipsisText value={row.clientId} maxWidth={160} />
    },
    {
      title: '客户端key',
      dataIndex: 'clientKey',
      width: 170,
      render: (_, row) => <EllipsisText value={row.clientKey} maxWidth={150} />
    },
    {
      title: '客户端秘钥',
      dataIndex: 'clientSecret',
      width: 180,
      render: (_, row) => <EllipsisText value={row.clientSecret} maxWidth={160} />
    },
    {
      title: '授权类型',
      dataIndex: 'grantType',
      search: false,
      width: 150,
      render: (_, row) => (
        <Space size={4} wrap>
          <DictTag options={dicts.sys_grant_type} value={row.grantTypeList} />
        </Space>
      )
    },
    {
      title: '设备类型',
      dataIndex: 'deviceType',
      valueType: 'select',
      width: 120,
      fieldProps: { options: deviceTypeOptions },
      render: (_, row) => <DictTag options={dicts.sys_device_type} value={row.deviceType} />
    },
    {
      title: '白名单路径',
      dataIndex: 'accessPath',
      search: false,
      width: 190,
      render: (_, row) => {
        const rules = getRuleList(row.accessPathList, row.accessPath);
        return rules.length ? <EllipsisText value={rules.join(', ')} maxWidth={170} /> : '全部路径';
      }
    },
    {
      title: '白名单IP',
      dataIndex: 'ipWhitelist',
      search: false,
      width: 190,
      render: (_, row) => {
        const rules = getRuleList(row.ipWhitelistList, row.ipWhitelist);
        return rules.length ? <EllipsisText value={rules.join(', ')} maxWidth={170} /> : '全部IP';
      }
    },
    { title: 'Token活跃超时', dataIndex: 'activeTimeout', search: false, width: 150 },
    { title: 'Token固定超时', dataIndex: 'timeout', search: false, width: 150 },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      fieldProps: { options: statusOptions },
      width: 90,
      render: (_, row) => (
        <Switch
          checked={row.status === '0'}
          checkedChildren="正常"
          unCheckedChildren="停用"
          onChange={checked => toggleStatus(row, checked)}
        />
      )
    },
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
              confirm: `是否确认删除客户端管理编号为"${row.id}"的数据项？`,
              onClick: () => remove(row)
            }
          ]}
        />
      )
    }
  ];

  return (
    <PageContainer title="客户端管理">
      <ProTable<ClientVO, ClientQuery>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={{ labelWidth: 95 }}
        scroll={tableScroll}
        rowSelection={{ selectedRowKeys: ids, onChange: handleSelectionChange }}
        request={async params => {
          const query = toPageQuery(params);
          updateExportParams(query);
          const res = await listClient(query);
          return toTableData(res);
        }}
        toolbar={{ title: '客户端列表' }}
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
            <Popconfirm
              key="delete"
              title={`是否确认删除客户端管理编号为"${ids}"的数据项？`}
              onConfirm={() => remove()}
            >
              <Button danger disabled={!ids.length} icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          ),
          canExport && (
            <Button
              key="export"
              icon={<DownloadOutlined />}
              onClick={() => exportFile('/system/client/export', () => `client_${Date.now()}.xlsx`)}
            >
              导出
            </Button>
          )
        ]}
      />

      <ModalForm<ClientForm>
        title={modalTitle}
        open={modalOpen}
        width={760}
        form={form}
        layout="vertical"
        initialValues={defaultClientForm}
        modalProps={{ destroyOnHidden: true, onCancel: closeModal }}
        onOpenChange={open => !open && closeModal()}
        onFinish={submitForm}
      >
        <ProFormText name="id" hidden />
        <ProFormText name="clientId" hidden />
        <ProFormText
          name="clientKey"
          label="客户端key"
          rules={[{ required: true, message: '客户端key不能为空' }]}
          fieldProps={{ disabled: editingClient }}
        />
        <ProFormText
          name="clientSecret"
          label="客户端秘钥"
          rules={[{ required: true, message: '客户端秘钥不能为空' }]}
          fieldProps={{ disabled: editingClient }}
        />
        <ProFormSelect
          name="grantTypeList"
          label="授权类型"
          rules={[{ required: true, message: '授权类型不能为空' }]}
          mode="multiple"
          options={grantTypeOptions}
        />
        <ProFormSelect
          name="deviceType"
          label="设备类型"
          rules={[{ required: true, message: '设备类型不能为空' }]}
          options={deviceTypeOptions}
        />
        <ProFormTextArea
          name="accessPath"
          label="允许访问路径"
          fieldProps={{ rows: 4, placeholder: '多个路径可按换行、逗号或分号分隔；为空表示允许访问所有接口路径' }}
        />
        <ProFormTextArea
          name="ipWhitelist"
          label="IP白名单"
          fieldProps={{ rows: 4, placeholder: '支持精确IP、通配符和CIDR；为空表示允许所有IP' }}
        />
        <div className="form-grid">
          <ProFormDigit name="activeTimeout" label="Token活跃超时时间" min={0} />
          <ProFormDigit name="timeout" label="Token固定超时时间" min={0} />
        </div>
        <ProFormRadio.Group name="status" label="状态" options={statusOptions} />
      </ModalForm>
    </PageContainer>
  );
}
