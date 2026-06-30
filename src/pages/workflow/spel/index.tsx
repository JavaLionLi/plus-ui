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
import { Button, Form, message, Popconfirm } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { SpelForm, SpelQuery, SpelVO } from '@/api/workflow/spel/types';
import { addSpel, delSpel, getSpel, listSpel, updateSpel } from '@/api/workflow/spel';
import DictTag from '@/components/common/DictTag';
import EllipsisText from '@/components/common/EllipsisText';
import RowActions from '@/components/common/RowActions';
import { useDict } from '@/hooks/useDict';
import { useTableSelection } from '@/hooks/useTableSelection';
import { useTableScroll } from '@/hooks/useTableScroll';
import { useUserStore } from '@/stores/userStore';
import { dictOptions } from '@/utils/dict';
import { hasPermi } from '@/utils/permission';
import { toPageQuery, toTableData } from '@/utils/ruoyi';

const defaultSpelForm: SpelForm = { status: '0' };
const spelPlaceholder = '例如：#{@组件名.方法名(#方法参数)} 或 ${方法参数}';


function buildViewSpel(values: Pick<SpelForm, 'componentName' | 'methodName' | 'methodParams'>) {
  const comp = (values.componentName || '').trim();
  const method = (values.methodName || '').trim();
  const paramStr = (values.methodParams || '').trim();

  if (!comp && !method && !paramStr) return '';
  if (!comp && !method && paramStr) {
    const params = paramStr
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
    if (params.length === 1) return `\${${params[0]}}`;
  }
  if (!comp || !method) return '请填写组件名称和方法名';

  const params = paramStr
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
  const paramPart = params.length ? `(${params.map(item => `#${item}`).join(',')})` : '()';
  return `#{@${comp}.${method}${paramPart}}`;
}

export default function WorkflowSpelPage() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { tableScroll } = useTableScroll(1110);
  const [form] = Form.useForm<SpelForm>();
  const userInfo = useUserStore(state => state.userInfo);
  const dicts = useDict('sys_normal_disable');
  const { ids, selectedOne, handleSelectionChange, clearSelection } = useTableSelection<SpelVO>(row => row.id);
  const [modalOpen, { setTrue: openModal, setFalse: closeModal }] = useBoolean(false);
  const [modalTitle, setModalTitle] = useState('');
  const [preview, setPreview] = useState('');

  const canAdd = hasPermi(userInfo, ['workflow:spel:add']);
  const canEdit = hasPermi(userInfo, ['workflow:spel:edit']);
  const canRemove = hasPermi(userInfo, ['workflow:spel:remove']);
  const statusOptions = useMemo(() => dictOptions(dicts.sys_normal_disable), [dicts.sys_normal_disable]);
  const watchedValues = Form.useWatch([], form);

  useEffect(() => {
    const nextPreview = buildViewSpel(watchedValues || {});
    setPreview(nextPreview);
    form.setFieldValue('viewSpel', nextPreview);
  }, [form, watchedValues]);

  const openAdd = () => {
    form.resetFields();
    form.setFieldsValue(defaultSpelForm);
    setModalTitle('添加流程spel表达式定义');
    setPreview('');
    openModal();
  };

  const openEdit = async (row?: SpelVO) => {
    const target = row || selectedOne;
    if (!target?.id) return;
    const res = await getSpel(target.id);
    form.resetFields();
    form.setFieldsValue(res.data);
    setModalTitle('修改流程spel表达式定义');
    setPreview(res.data.viewSpel || '');
    openModal();
  };

  const submitForm = async (values: SpelForm) => {
    values.id ? await updateSpel(values) : await addSpel(values);
    message.success('操作成功');
    form.resetFields();
    actionRef.current?.reload();
    return true;
  };

  const remove = async (row?: SpelVO) => {
    await delSpel(row?.id || ids);
    message.success('删除成功');
    clearSelection();
    actionRef.current?.reloadAndRest?.();
  };

  const columns: ProColumns<SpelVO>[] = [
    { title: '组件名称', dataIndex: 'componentName', renderText: value => value || '-' },
    { title: '方法名称', dataIndex: 'methodName', renderText: value => value || '-' },
    { title: '参数名称', dataIndex: 'methodParams', search: false, renderText: value => value || '-' },
    {
      title: 'SPEL表达式',
      dataIndex: 'viewSpel',
      search: false,
      width: 260,
      render: (_, row) => <EllipsisText value={row.viewSpel} maxWidth={240} />
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      width: 100,
      fieldProps: { options: statusOptions },
      render: (_, row) => <DictTag options={dicts.sys_normal_disable} value={row.status} />
    },
    {
      title: '备注',
      dataIndex: 'remark',
      search: false,
      width: 180,
      render: (_, row) => <EllipsisText value={row.remark} maxWidth={160} />
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
              confirm: `是否确认删除流程spel表达式定义编号为"${row.id}"的数据项？`,
              onClick: () => remove(row)
            }
          ]}
        />
      )
    }
  ];

  return (
    <PageContainer title="流程表达式">
      <ProTable<SpelVO, SpelQuery>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        scroll={tableScroll}
        search={{ labelWidth: 90 }}
        rowSelection={{ selectedRowKeys: ids, onChange: handleSelectionChange }}
        request={async params => {
          const res = await listSpel(toPageQuery(params));
          return toTableData(res);
        }}
        toolbar={{ title: '流程表达式列表' }}
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
              title={`是否确认删除流程spel表达式定义编号为"${ids}"的数据项？`}
              onConfirm={() => remove()}
            >
              <Button danger disabled={!ids.length} icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )
        ]}
      />

      <ModalForm<SpelForm>
        title={modalTitle}
        open={modalOpen}
        width={560}
        form={form}
        layout="vertical"
        initialValues={defaultSpelForm}
        modalProps={{ destroyOnHidden: true, onCancel: closeModal }}
        onOpenChange={open => !open && closeModal()}
        onFinish={submitForm}
      >
        <ProFormText name="id" hidden />
        <ProFormText name="componentName" label="组件名称" placeholder="如：spelRuleComponent" />
        <ProFormText name="methodName" label="方法名称" placeholder="如：selectDeptLeaderById" />
        <ProFormText name="methodParams" label="方法参数" placeholder="如：deptId，多个使用逗号分隔" />
        <ProFormText name="viewSpel" hidden />
        <Form.Item label="SPEL表达式">
          <div className="preview-box-react">{preview || spelPlaceholder}</div>
        </Form.Item>
        <ProFormRadio.Group
          name="status"
          label="状态"
          rules={[{ required: true, message: '状态不能为空' }]}
          options={statusOptions}
        />
        <ProFormTextArea name="remark" label="备注" fieldProps={{ rows: 3 }} />
      </ModalForm>
    </PageContainer>
  );
}
