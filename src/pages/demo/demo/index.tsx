import { DeleteOutlined, DownloadOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProFormDigit,
  ProFormText,
  ProTable,
  type ActionType,
  type ProColumns
} from '@ant-design/pro-components';
import { useBoolean } from 'ahooks';
import { Button, Form, message, Popconfirm } from 'antd';
import { useRef, useState } from 'react';
import type { DemoForm, DemoQuery, DemoVO } from '@/api/demo/demo/types';
import { addDemo, delDemo, getDemo, listDemo, updateDemo } from '@/api/demo/demo';
import RowActions from '@/components/common/RowActions';
import { useTableExport } from '@/hooks/useTableExport';
import { useTableSelection } from '@/hooks/useTableSelection';
import { useTableScroll } from '@/hooks/useTableScroll';
import { useUserStore } from '@/stores/userStore';
import { hasPermi } from '@/utils/permission';
import { toPageQuery, toTableData } from '@/utils/ruoyi';

const defaultDemoForm: DemoForm = {};

export default function DemoDemoPage() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { tableScroll } = useTableScroll(760);
  const [form] = Form.useForm<DemoForm>();
  const userInfo = useUserStore(state => state.userInfo);
  const { ids, selectedOne, handleSelectionChange, clearSelection } = useTableSelection<DemoVO>(row => row.id);
  const [modalOpen, { setTrue: openModal, setFalse: closeModal }] = useBoolean(false);
  const [modalTitle, setModalTitle] = useState('');
  const { updateExportParams, exportFile } = useTableExport();

  const canAdd = hasPermi(userInfo, ['demo:demo:add']);
  const canEdit = hasPermi(userInfo, ['demo:demo:edit']);
  const canRemove = hasPermi(userInfo, ['demo:demo:remove']);
  const canExport = hasPermi(userInfo, ['demo:demo:export']);
  const openAdd = () => {
    form.resetFields();
    form.setFieldsValue(defaultDemoForm);
    setModalTitle('添加测试单');
    openModal();
  };

  const openEdit = async (row?: DemoVO) => {
    const target = row || selectedOne;
    if (!target?.id) return;
    const res = await getDemo(target.id);
    form.resetFields();
    form.setFieldsValue(res.data);
    setModalTitle('修改测试单');
    openModal();
  };

  const submitForm = async (values: DemoForm) => {
    values.id ? await updateDemo(values) : await addDemo(values);
    message.success('操作成功');
    form.resetFields();
    actionRef.current?.reload();
    return true;
  };

  const remove = async (row?: DemoVO) => {
    await delDemo(row?.id || ids);
    message.success('删除成功');
    clearSelection();
    actionRef.current?.reloadAndRest?.();
  };

  const columns: ProColumns<DemoVO>[] = [
    { title: '主键', dataIndex: 'id', search: false, width: 100 },
    { title: '部门id', dataIndex: 'deptId', search: false },
    { title: '用户id', dataIndex: 'userId', search: false },
    { title: '排序号', dataIndex: 'orderNum', search: false, width: 100 },
    { title: 'key键', dataIndex: 'testKey' },
    { title: '值', dataIndex: 'value' },
    {
      title: '操作',
      valueType: 'option',
      width: 92,
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
              confirm: `是否确认删除测试单编号为"${row.id}"的数据项？`,
              onClick: () => remove(row)
            }
          ]}
        />
      )
    }
  ];

  return (
    <PageContainer title="测试单">
      <ProTable<DemoVO, DemoQuery>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        scroll={tableScroll}
        search={{ labelWidth: 90 }}
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
        rowSelection={{ selectedRowKeys: ids, onChange: handleSelectionChange }}
        request={async params => {
          const query = toPageQuery(params);
          updateExportParams(query);
          const res = await listDemo(query);
          return toTableData(res);
        }}
        toolbar={{ title: '测试单列表' }}
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
            <Popconfirm key="delete" title={`是否确认删除测试单编号为"${ids}"的数据项？`} onConfirm={() => remove()}>
              <Button danger disabled={!ids.length} icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          ),
          canExport && (
            <Button
              key="export"
              icon={<DownloadOutlined />}
              onClick={() => exportFile('/demo/demo/export', () => `demo_${Date.now()}.xlsx`)}
            >
              导出
            </Button>
          )
        ]}
      />

      <ModalForm<DemoForm>
        title={modalTitle}
        open={modalOpen}
        width={520}
        form={form}
        layout="vertical"
        initialValues={defaultDemoForm}
        modalProps={{ destroyOnHidden: true, onCancel: closeModal }}
        onOpenChange={open => !open && closeModal()}
        onFinish={submitForm}
      >
        <ProFormText name="id" hidden />
        <ProFormText name="deptId" label="部门id" rules={[{ required: true, message: '部门id不能为空' }]} />
        <ProFormText name="userId" label="用户id" rules={[{ required: true, message: '用户id不能为空' }]} />
        <ProFormDigit name="orderNum" label="排序号" min={0} rules={[{ required: true, message: '排序号不能为空' }]} />
        <ProFormText name="testKey" label="key键" rules={[{ required: true, message: 'key键不能为空' }]} />
        <ProFormText name="value" label="值" rules={[{ required: true, message: '值不能为空' }]} />
      </ModalForm>
    </PageContainer>
  );
}
