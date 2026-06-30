import { DeleteOutlined, EditOutlined, PlusOutlined, SortAscendingOutlined } from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProFormDigit,
  ProFormText,
  ProFormTreeSelect,
  ProTable,
  type ActionType,
  type ProColumns
} from '@ant-design/pro-components';
import { useBoolean } from 'ahooks';
import { Button, Form, message } from 'antd';
import { useMemo, useRef, useState } from 'react';
import type { CategoryForm, CategoryQuery, CategoryVO } from '@/api/workflow/category/types';
import { addCategory, delCategory, getCategory, listCategory, updateCategory } from '@/api/workflow/category';
import RowActions from '@/components/common/RowActions';
import { useTreeTableExpand } from '@/hooks/useTreeTableExpand';
import { useTableScroll } from '@/hooks/useTableScroll';
import { useUserStore } from '@/stores/userStore';
import { hasPermi } from '@/utils/permission';
import { handleTree } from '@/utils/ruoyi';

const defaultCategoryForm: CategoryForm = { orderNum: 0 };

interface CategorySelectNode {
  title: string;
  value: string | number;
  children?: CategorySelectNode[];
}

function toTreeSelectData(nodes: CategoryVO[]): CategorySelectNode[] {
  return nodes.map(node => ({
    title: node.categoryName,
    value: node.categoryId,
    children: node.children ? toTreeSelectData(node.children) : undefined
  }));
}

export default function WorkflowCategoryPage() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { tableScroll } = useTableScroll(900);
  const [form] = Form.useForm<CategoryForm>();
  const userInfo = useUserStore(state => state.userInfo);
  const [categoryOptions, setCategoryOptions] = useState<CategoryVO[]>([]);
  const [tableRows, setTableRows] = useState<CategoryVO[]>([]);
  const { expandAll, expandedRowKeys, onExpandedRowsChange, syncExpandedRows, toggleExpandAll } =
    useTreeTableExpand<CategoryVO>(row => row.categoryId);
  const [modalOpen, { setTrue: openModal, setFalse: closeModal }] = useBoolean(false);
  const [modalTitle, setModalTitle] = useState('');

  const canAdd = hasPermi(userInfo, ['workflow:category:add']);
  const canEdit = hasPermi(userInfo, ['workflow:category:edit']);
  const canRemove = hasPermi(userInfo, ['workflow:category:remove']);
  const treeSelectData = useMemo(() => toTreeSelectData(categoryOptions), [categoryOptions]);

  const loadCategoryOptions = async () => {
    const res = await listCategory();
    setCategoryOptions(handleTree<CategoryVO>(res.data || [], 'categoryId', 'parentId'));
  };

  const openAdd = async (row?: CategoryVO) => {
    await loadCategoryOptions();
    form.resetFields();
    form.setFieldsValue({ ...defaultCategoryForm, parentId: row?.categoryId });
    setModalTitle('添加流程分类');
    openModal();
  };

  const openEdit = async (row: CategoryVO) => {
    await loadCategoryOptions();
    const res = await getCategory(row.categoryId);
    form.resetFields();
    form.setFieldsValue(res.data);
    setModalTitle('修改流程分类');
    openModal();
  };

  const submitForm = async (values: CategoryForm) => {
    values.categoryId ? await updateCategory(values) : await addCategory(values);
    message.success('操作成功');
    form.resetFields();
    actionRef.current?.reload();
    return true;
  };

  const remove = async (row: CategoryVO) => {
    await delCategory(row.categoryId);
    message.success('删除成功');
    actionRef.current?.reload();
  };

  const columns: ProColumns<CategoryVO>[] = [
    { title: '分类名称', dataIndex: 'categoryName', width: 260 },
    { title: '显示顺序', dataIndex: 'orderNum', search: false, width: 120 },
    { title: '创建时间', dataIndex: 'createTime', valueType: 'dateTime', search: false, width: 170 },
    {
      title: '操作',
      valueType: 'option',
      width: 130,
      fixed: 'right',
      render: (_, row) => (
        <RowActions
          actions={[
            canEdit && { key: 'edit', label: '修改', icon: <EditOutlined />, onClick: () => openEdit(row) },
            canAdd && { key: 'add', label: '新增', icon: <PlusOutlined />, onClick: () => openAdd(row) },
            canRemove && {
              key: 'delete',
              label: '删除',
              icon: <DeleteOutlined />,
              danger: true,
              confirm: `是否确认删除"${row.categoryName}"的分类？`,
              onClick: () => remove(row)
            }
          ]}
        />
      )
    }
  ];

  return (
    <PageContainer title="流程分类">
      <ProTable<CategoryVO, CategoryQuery>
        actionRef={actionRef}
        rowKey="categoryId"
        columns={columns}
        scroll={tableScroll}
        pagination={false}
        search={{ labelWidth: 90 }}
        expandable={{
          expandedRowKeys,
          onExpandedRowsChange
        }}
        request={async params => {
          const res = await listCategory({ categoryName: params.categoryName });
          const rows = handleTree<CategoryVO>(res.data || [], 'categoryId', 'parentId');
          setTableRows(rows);
          syncExpandedRows(rows, expandAll);
          return { data: rows, total: rows.length, success: true };
        }}
        toolbar={{ title: '流程分类列表' }}
        toolBarRender={() => [
          canAdd && (
            <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => openAdd()}>
              新增
            </Button>
          ),
          <Button
            key="expand"
            icon={<SortAscendingOutlined />}
            onClick={() => toggleExpandAll(tableRows)}
          >
            展开/折叠
          </Button>
        ]}
      />

      <ModalForm<CategoryForm>
        title={modalTitle}
        open={modalOpen}
        width={520}
        form={form}
        layout="vertical"
        initialValues={defaultCategoryForm}
        modalProps={{ destroyOnHidden: true, onCancel: closeModal }}
        onOpenChange={open => !open && closeModal()}
        onFinish={submitForm}
      >
        <ProFormText name="categoryId" hidden />
        <ProFormTreeSelect
          name="parentId"
          label="上级分类"
          rules={[{ required: true, message: '请选择上级分类' }]}
          fieldProps={{
            allowClear: true,
            treeDefaultExpandAll: true,
            treeData: treeSelectData,
            placeholder: '请选择上级分类'
          }}
        />
        <div className="form-grid">
          <ProFormText name="categoryName" label="分类名称" rules={[{ required: true, message: '请输入分类名称' }]} />
          <ProFormDigit name="orderNum" label="排序" min={0} />
        </div>
      </ModalForm>
    </PageContainer>
  );
}
