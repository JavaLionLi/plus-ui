import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
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
import { Button, Form, message, Popconfirm, Switch, Tag } from 'antd';
import { useMemo, useRef, useState } from 'react';
import type { OssConfigForm, OssConfigQuery, OssConfigVO } from '@/api/system/ossConfig/types';
import {
  addOssConfig,
  changeOssConfigStatus,
  delOssConfig,
  getOssConfig,
  listOssConfig,
  updateOssConfig
} from '@/api/system/ossConfig';
import EllipsisText from '@/components/common/EllipsisText';
import RowActions from '@/components/common/RowActions';
import { useDict } from '@/hooks/useDict';
import { useTableSelection } from '@/hooks/useTableSelection';
import { useTableScroll } from '@/hooks/useTableScroll';
import { useUserStore } from '@/stores/userStore';
import { dictOptions } from '@/utils/dict';
import { confirmAction } from '@/utils/modal';
import { hasPermi } from '@/utils/permission';
import { toPageQuery, toTableData } from '@/utils/ruoyi';

const defaultOssConfigForm: OssConfigForm = {
  isHttps: 'N',
  accessPolicy: '1',
  status: 'N'
};

function accessPolicyTag(value?: string) {
  if (value === '0') return <Tag color="orange">private</Tag>;
  if (value === '1') return <Tag color="green">public</Tag>;
  if (value === '2') return <Tag>custom</Tag>;
  return value || '-';
}

export default function SystemOssConfigPage() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { tableScroll } = useTableScroll(1460);
  const [form] = Form.useForm<OssConfigForm>();
  const userInfo = useUserStore(state => state.userInfo);
  const dicts = useDict('sys_yes_no');
  const { ids, selectedOne, handleSelectionChange, clearSelection } = useTableSelection<OssConfigVO>(
    row => row.ossConfigId
  );
  const [modalOpen, { setTrue: openModal, setFalse: closeModal }] = useBoolean(false);
  const [modalTitle, setModalTitle] = useState('');

  const canAdd = hasPermi(userInfo, ['system:ossConfig:add']);
  const canEdit = hasPermi(userInfo, ['system:ossConfig:edit']);
  const canRemove = hasPermi(userInfo, ['system:ossConfig:remove']);
  const yesNoOptions = useMemo(() => dictOptions(dicts.sys_yes_no), [dicts.sys_yes_no]);
  const isHttps = Form.useWatch('isHttps', form);
  const protocol = isHttps === 'Y' ? 'https://' : 'http://';

  const openAdd = () => {
    form.resetFields();
    form.setFieldsValue(defaultOssConfigForm);
    setModalTitle('添加对象存储配置');
    openModal();
  };

  const openEdit = async (row?: OssConfigVO) => {
    const target = row || selectedOne;
    if (!target?.ossConfigId) return;
    const res = await getOssConfig(target.ossConfigId);
    form.resetFields();
    form.setFieldsValue(res.data);
    setModalTitle('修改对象存储配置');
    openModal();
  };

  const submitForm = async (values: OssConfigForm) => {
    values.ossConfigId ? await updateOssConfig(values) : await addOssConfig(values);
    message.success('操作成功');
    form.resetFields();
    actionRef.current?.reload();
    return true;
  };

  const remove = async (row?: OssConfigVO) => {
    await delOssConfig(row?.ossConfigId || ids);
    message.success('删除成功');
    clearSelection();
    actionRef.current?.reloadAndRest?.();
  };

  const toggleStatus = async (row: OssConfigVO, checked: boolean) => {
    const nextStatus = checked ? 'Y' : 'N';
    const text = checked ? '启用' : '停用';
    try {
      await confirmAction(`确认要"${text}""${row.configKey}"配置吗?`);
      await changeOssConfigStatus(row.ossConfigId, nextStatus, row.configKey);
      message.success(`${text}成功`);
      actionRef.current?.reload();
    } catch {
      actionRef.current?.reload();
    }
  };

  const columns: ProColumns<OssConfigVO>[] = [
    { title: '配置key', dataIndex: 'configKey', width: 160 },
    {
      title: '访问站点',
      dataIndex: 'endpoint',
      search: false,
      width: 220,
      render: (_, row) => <EllipsisText value={row.endpoint} maxWidth={200} />
    },
    {
      title: '自定义域名',
      dataIndex: 'domainUrl',
      search: false,
      width: 220,
      render: (_, row) => <EllipsisText value={row.domainUrl} maxWidth={200} />
    },
    { title: '桶名称', dataIndex: 'bucketName', width: 150 },
    { title: '前缀', dataIndex: 'prefix', search: false, width: 120 },
    { title: '域', dataIndex: 'region', search: false, width: 120 },
    {
      title: '桶权限类型',
      dataIndex: 'accessPolicy',
      search: false,
      width: 130,
      render: (_, row) => accessPolicyTag(row.accessPolicy)
    },
    {
      title: '是否默认',
      dataIndex: 'status',
      valueType: 'select',
      width: 120,
      fieldProps: { options: yesNoOptions },
      render: (_, row) => (
        <Switch
          checked={row.status === 'Y'}
          checkedChildren="是"
          unCheckedChildren="否"
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
              confirm: `是否确认删除OSS配置编号为"${row.ossConfigId}"的数据项？`,
              onClick: () => remove(row)
            }
          ]}
        />
      )
    }
  ];

  return (
    <PageContainer title="OSS 配置">
      <ProTable<OssConfigVO, OssConfigQuery>
        actionRef={actionRef}
        rowKey="ossConfigId"
        columns={columns}
        scroll={tableScroll}
        search={{ labelWidth: 90 }}
        rowSelection={{ selectedRowKeys: ids, onChange: handleSelectionChange }}
        request={async params => {
          const res = await listOssConfig(toPageQuery(params));
          return toTableData(res);
        }}
        toolbar={{ title: 'OSS 配置列表' }}
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
            <Popconfirm key="delete" title={`是否确认删除OSS配置编号为"${ids}"的数据项？`} onConfirm={() => remove()}>
              <Button danger disabled={!ids.length} icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )
        ]}
      />

      <ModalForm<OssConfigForm>
        title={modalTitle}
        open={modalOpen}
        width={800}
        form={form}
        layout="vertical"
        initialValues={defaultOssConfigForm}
        modalProps={{ destroyOnHidden: true, onCancel: closeModal }}
        onOpenChange={open => !open && closeModal()}
        onFinish={submitForm}
      >
        <ProFormText name="ossConfigId" hidden />
        <ProFormText name="configKey" label="配置key" rules={[{ required: true, message: 'configKey不能为空' }]} />
        <ProFormText
          name="endpoint"
          label="访问站点"
          rules={[{ required: true, message: 'endpoint不能为空' }]}
          fieldProps={{ addonBefore: protocol }}
        />
        <ProFormText name="domainUrl" label="自定义域名" fieldProps={{ addonBefore: protocol }} />
        <ProFormText
          name="accessKey"
          label="accessKey"
          rules={[
            { required: true, message: 'accessKey不能为空' },
            { min: 2, max: 200, message: 'accessKey长度必须介于 2 和 200 之间' }
          ]}
        />
        <ProFormText.Password
          name="secretKey"
          label="secretKey"
          rules={[
            { required: true, message: 'secretKey不能为空' },
            { min: 2, max: 100, message: 'secretKey长度必须介于 2 和 100 之间' }
          ]}
        />
        <ProFormText
          name="bucketName"
          label="桶名称"
          rules={[
            { required: true, message: 'bucketName不能为空' },
            { min: 2, max: 100, message: 'bucketName长度必须介于 2 和 100 之间' }
          ]}
        />
        <ProFormText name="prefix" label="前缀" />
        <ProFormRadio.Group name="isHttps" label="是否HTTPS" options={yesNoOptions} />
        <ProFormRadio.Group
          name="accessPolicy"
          label="桶权限类型"
          rules={[{ required: true, message: 'accessPolicy不能为空' }]}
          options={[
            { label: 'private', value: '0' },
            { label: 'public', value: '1' },
            { label: 'custom', value: '2' }
          ]}
        />
        <ProFormText name="region" label="域" />
        <ProFormTextArea name="remark" label="备注" fieldProps={{ rows: 3 }} />
      </ModalForm>
    </PageContainer>
  );
}
