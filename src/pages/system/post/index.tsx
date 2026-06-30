import { DeleteOutlined, DownloadOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProFormDigit,
  ProFormRadio,
  ProFormText,
  ProFormTextArea,
  ProFormTreeSelect,
  ProTable,
  type ActionType,
  type ProColumns
} from '@ant-design/pro-components';
import { useBoolean } from 'ahooks';
import { Button, Form, message, Popconfirm, Tag } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { DeptTreeVO } from '@/api/system/dept/types';
import type { PostForm, PostQuery, PostVO } from '@/api/system/post/types';
import { addPost, delPost, getPost, listPost, postDeptTreeSelect, updatePost } from '@/api/system/post';
import EllipsisText from '@/components/common/EllipsisText';
import RowActions from '@/components/common/RowActions';
import TreePanel from '@/components/common/TreePanel';
import { useDict } from '@/hooks/useDict';
import { useTableExport } from '@/hooks/useTableExport';
import { useTableSelection } from '@/hooks/useTableSelection';
import { useTableScroll } from '@/hooks/useTableScroll';
import { useUserStore } from '@/stores/userStore';
import { dictOptions } from '@/utils/dict';
import { hasPermi } from '@/utils/permission';
import { toPageQuery, toTableData } from '@/utils/ruoyi';

const defaultPostForm: PostForm = { postSort: 0, status: '0' };


interface TreeSelectNode {
  title: string;
  value: string | number;
  children?: TreeSelectNode[];
}

function toTreeSelectData(nodes: DeptTreeVO[]): TreeSelectNode[] {
  return nodes.map(node => ({
    title: node.label,
    value: node.id,
    children: node.children ? toTreeSelectData(node.children) : undefined
  }));
}

export default function SystemPostPage() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { tableScroll } = useTableScroll(960);
  const [form] = Form.useForm<PostForm>();
  const userInfo = useUserStore(state => state.userInfo);
  const dicts = useDict('sys_normal_disable');
  const [deptOptions, setDeptOptions] = useState<DeptTreeVO[]>([]);
  const [belongDeptId, setBelongDeptId] = useState<string | number>();
  const {
    ids: selectedIds,
    selectedOne,
    handleSelectionChange,
    clearSelection
  } = useTableSelection<PostVO>(row => row.postId);
  const [modalOpen, { setTrue: openModal, setFalse: closeModal }] = useBoolean(false);
  const [modalTitle, setModalTitle] = useState('');
  const { updateExportParams, exportFile } = useTableExport();

  const canAdd = hasPermi(userInfo, ['system:post:add']);
  const canEdit = hasPermi(userInfo, ['system:post:edit']);
  const canRemove = hasPermi(userInfo, ['system:post:remove']);
  const canExport = hasPermi(userInfo, ['system:post:export']);
  useEffect(() => {
    postDeptTreeSelect().then(res => setDeptOptions(res.data || []));
  }, []);

  const treeSelectData = useMemo(() => toTreeSelectData(deptOptions), [deptOptions]);

  const openAdd = () => {
    form.resetFields();
    form.setFieldsValue(defaultPostForm);
    setModalTitle('添加岗位');
    openModal();
  };

  const openEdit = async (row?: PostVO) => {
    const target = row || selectedOne;
    if (!target?.postId) return;
    const res = await getPost(target.postId);
    form.resetFields();
    form.setFieldsValue(res.data);
    setModalTitle('修改岗位');
    openModal();
  };

  const submitForm = async (values: PostForm) => {
    values.postId ? await updatePost(values) : await addPost(values);
    message.success('操作成功');
    form.resetFields();
    actionRef.current?.reload();
    return true;
  };

  const handleDelete = async (row?: PostVO) => {
    const ids = row?.postId || selectedIds;
    await delPost(ids);
    message.success('删除成功');
    clearSelection();
    actionRef.current?.reloadAndRest?.();
  };

  const columns: ProColumns<PostVO>[] = [
    {
      title: '岗位编码',
      dataIndex: 'postCode',
      width: 140,
      render: (_, row) => <EllipsisText value={row.postCode} maxWidth={120} />
    },
    {
      title: '类别编码',
      dataIndex: 'postCategory',
      width: 130,
      render: (_, row) => <EllipsisText value={row.postCategory} maxWidth={110} />
    },
    {
      title: '岗位名称',
      dataIndex: 'postName',
      width: 140,
      render: (_, row) => <EllipsisText value={row.postName} maxWidth={120} />
    },
    {
      title: '部门',
      dataIndex: 'deptName',
      search: false,
      width: 150,
      render: (_, row) => <EllipsisText value={row.deptName} maxWidth={130} />
    },
    { title: '排序', dataIndex: 'postSort', search: false, width: 90 },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      width: 100,
      fieldProps: { options: dictOptions(dicts.sys_normal_disable) },
      render: (_, row) => <Tag color={row.status === '0' ? 'green' : 'red'}>{row.status === '0' ? '正常' : '停用'}</Tag>
    },
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
              confirm: `是否确认删除岗位编号为"${row.postId}"的数据项？`,
              onClick: () => handleDelete(row)
            }
          ]}
        />
      )
    }
  ];

  return (
    <PageContainer title="岗位管理">
      <div className="tree-table-page">
        <TreePanel
          title="部门结构"
          placeholder="请输入部门名称"
          data={deptOptions}
          fieldNames={{ title: 'label', key: 'id', children: 'children' }}
          onNodeClick={node => {
            setBelongDeptId(node.id as string | number);
            setTimeout(() => actionRef.current?.reload(), 0);
          }}
        />
        <main className="table-panel">
          <ProTable<PostVO, PostQuery>
            actionRef={actionRef}
            rowKey="postId"
            columns={columns}
            scroll={tableScroll}
            search={{ labelWidth: 90 }}
            rowSelection={{ selectedRowKeys: selectedIds, onChange: handleSelectionChange }}
            request={async params => {
              const query = { ...toPageQuery(params), belongDeptId };
              updateExportParams(query);
              const res = await listPost(query);
              return toTableData(res);
            }}
            toolbar={{ title: '岗位列表' }}
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
                  title={`是否确认删除岗位编号为"${selectedIds}"的数据项？`}
                  onConfirm={() => handleDelete()}
                >
                  <Button danger disabled={!selectedIds.length} icon={<DeleteOutlined />}>
                    删除
                  </Button>
                </Popconfirm>
              ),
              canExport && (
                <Button
                  key="export"
                  icon={<DownloadOutlined />}
                  onClick={() => exportFile('/system/post/export', () => `post_${Date.now()}.xlsx`)}
                >
                  导出
                </Button>
              )
            ]}
          />
        </main>
      </div>
      <ModalForm<PostForm>
        title={modalTitle}
        open={modalOpen}
        width={560}
        form={form}
        layout="vertical"
        initialValues={defaultPostForm}
        modalProps={{ destroyOnHidden: true, onCancel: closeModal }}
        onOpenChange={open => !open && closeModal()}
        onFinish={submitForm}
      >
        <ProFormText name="postId" hidden />
        <ProFormText name="postName" label="岗位名称" rules={[{ required: true, message: '岗位名称不能为空' }]} />
        <ProFormTreeSelect
          name="deptId"
          label="部门"
          rules={[{ required: true, message: '部门不能为空' }]}
          fieldProps={{ treeDefaultExpandAll: true, treeData: treeSelectData }}
        />
        <ProFormText name="postCode" label="岗位编码" rules={[{ required: true, message: '岗位编码不能为空' }]} />
        <ProFormText name="postCategory" label="类别编码" />
        <ProFormDigit
          name="postSort"
          label="岗位顺序"
          min={0}
          rules={[{ required: true, message: '岗位顺序不能为空' }]}
        />
        <ProFormRadio.Group name="status" label="岗位状态" options={dictOptions(dicts.sys_normal_disable)} />
        <ProFormTextArea name="remark" label="备注" fieldProps={{ rows: 3 }} />
      </ModalForm>
    </PageContainer>
  );
}
