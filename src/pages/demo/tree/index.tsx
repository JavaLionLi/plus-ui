import { DeleteOutlined, EditOutlined, PlusOutlined, SortAscendingOutlined } from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProFormText,
  ProFormTreeSelect,
  ProTable,
  type ActionType,
  type ProColumns
} from '@ant-design/pro-components';
import { useBoolean } from 'ahooks';
import { Button, Form, message } from 'antd';
import { useMemo, useRef, useState } from 'react';
import type { TreeForm, TreeQuery, TreeVO } from '@/api/demo/tree/types';
import { addTree, delTree, getTree, listTree, updateTree } from '@/api/demo/tree';
import RowActions from '@/components/common/RowActions';
import { useTreeTableExpand } from '@/hooks/useTreeTableExpand';
import { useTableScroll } from '@/hooks/useTableScroll';
import { useUserStore } from '@/stores/userStore';
import { hasPermi } from '@/utils/permission';
import { handleTree } from '@/utils/ruoyi';

const defaultTreeForm: TreeForm = { parentId: 0 };

interface TreeSelectNode {
  title: string;
  value: string | number;
  children?: TreeSelectNode[];
}

function toTreeSelectData(nodes: TreeVO[]): TreeSelectNode[] {
  return nodes.map(node => ({
    title: node.treeName,
    value: node.id,
    children: node.children ? toTreeSelectData(node.children) : undefined
  }));
}

export default function DemoTreePage() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { tableScroll } = useTableScroll(760);
  const [form] = Form.useForm<TreeForm>();
  const userInfo = useUserStore(state => state.userInfo);
  const [treeOptions, setTreeOptions] = useState<TreeVO[]>([]);
  const [tableRows, setTableRows] = useState<TreeVO[]>([]);
  const { expandAll, expandedRowKeys, onExpandedRowsChange, syncExpandedRows, toggleExpandAll } =
    useTreeTableExpand<TreeVO>(row => row.id);
  const [modalOpen, { setTrue: openModal, setFalse: closeModal }] = useBoolean(false);
  const [modalTitle, setModalTitle] = useState('');

  const canAdd = hasPermi(userInfo, ['demo:tree:add']);
  const canEdit = hasPermi(userInfo, ['demo:tree:edit']);
  const canRemove = hasPermi(userInfo, ['demo:tree:remove']);
  const treeSelectData = useMemo(
    () => [{ title: '顶级节点', value: 0, children: toTreeSelectData(treeOptions) }],
    [treeOptions]
  );

  const loadTreeOptions = async () => {
    const res = await listTree();
    setTreeOptions(handleTree<TreeVO>(res.data || [], 'id', 'parentId'));
  };

  const openAdd = async (row?: TreeVO) => {
    await loadTreeOptions();
    form.resetFields();
    form.setFieldsValue({ ...defaultTreeForm, parentId: row?.id || 0 });
    setModalTitle('添加测试树');
    openModal();
  };

  const openEdit = async (row: TreeVO) => {
    await loadTreeOptions();
    const res = await getTree(row.id);
    form.resetFields();
    form.setFieldsValue(res.data);
    setModalTitle('修改测试树');
    openModal();
  };

  const submitForm = async (values: TreeForm) => {
    values.id ? await updateTree(values) : await addTree(values);
    message.success('操作成功');
    form.resetFields();
    actionRef.current?.reload();
    return true;
  };

  const remove = async (row: TreeVO) => {
    await delTree(row.id);
    message.success('删除成功');
    actionRef.current?.reload();
  };

  const columns: ProColumns<TreeVO>[] = [
    { title: '父id', dataIndex: 'parentId', search: false },
    { title: '部门id', dataIndex: 'deptId', search: false },
    { title: '用户id', dataIndex: 'userId', search: false },
    { title: '树节点名', dataIndex: 'treeName' },
    {
      title: '操作',
      valueType: 'option',
      width: 120,
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
              confirm: `是否确认删除测试树编号为"${row.id}"的数据项？`,
              onClick: () => remove(row)
            }
          ]}
        />
      )
    }
  ];

  return (
    <PageContainer title="测试树">
      <ProTable<TreeVO, TreeQuery>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        scroll={tableScroll}
        pagination={false}
        search={{ labelWidth: 90 }}
        expandable={{
          expandedRowKeys,
          onExpandedRowsChange
        }}
        request={async params => {
          const res = await listTree({ treeName: params.treeName });
          const rows = handleTree<TreeVO>(res.data || [], 'id', 'parentId');
          setTableRows(rows);
          syncExpandedRows(rows, expandAll);
          return { data: rows, total: rows.length, success: true };
        }}
        toolbar={{ title: '测试树列表' }}
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

      <ModalForm<TreeForm>
        title={modalTitle}
        open={modalOpen}
        width={520}
        form={form}
        layout="vertical"
        initialValues={defaultTreeForm}
        modalProps={{ destroyOnHidden: true, onCancel: closeModal }}
        onOpenChange={open => !open && closeModal()}
        onFinish={submitForm}
      >
        <ProFormText name="id" hidden />
        <ProFormTreeSelect
          name="parentId"
          label="父id"
          rules={[{ required: true, message: '父id不能为空' }]}
          fieldProps={{ treeDefaultExpandAll: true, treeData: treeSelectData }}
        />
        <ProFormText name="deptId" label="部门id" rules={[{ required: true, message: '部门id不能为空' }]} />
        <ProFormText name="userId" label="用户id" rules={[{ required: true, message: '用户id不能为空' }]} />
        <ProFormText name="treeName" label="值" rules={[{ required: true, message: '值不能为空' }]} />
      </ModalForm>
    </PageContainer>
  );
}
