import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProFormDigit,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTreeSelect,
  ProTable,
  type ActionType,
  type ProColumns
} from '@ant-design/pro-components';
import { useBoolean } from 'ahooks';
import { Button, Form, message, Tag } from 'antd';
import { useMemo, useRef, useState } from 'react';
import type { DeptForm, DeptQuery, DeptVO } from '@/api/system/dept/types';
import type { UserVO } from '@/api/system/user/types';
import { addDept, delDept, getDept, listDept, listDeptExcludeChild, updateDept } from '@/api/system/dept';
import { listUserByDeptId } from '@/api/system/user';
import EllipsisText from '@/components/common/EllipsisText';
import RowActions from '@/components/common/RowActions';
import { useDict } from '@/hooks/useDict';
import { useTreeTableExpand } from '@/hooks/useTreeTableExpand';
import { useTableScroll } from '@/hooks/useTableScroll';
import { useUserStore } from '@/stores/userStore';
import { dictOptions } from '@/utils/dict';
import { hasPermi } from '@/utils/permission';
import { handleTree } from '@/utils/ruoyi';

const defaultDeptForm: DeptForm = {
  orderNum: 0,
  status: '0'
};

interface TreeSelectNode {
  title: string;
  value: string | number;
  children?: TreeSelectNode[];
}


function toTreeSelectData(depts: DeptVO[]): TreeSelectNode[] {
  return depts.map(dept => ({
    title: dept.deptName,
    value: dept.deptId,
    children: dept.children ? toTreeSelectData(dept.children) : undefined
  }));
}

export default function SystemDeptPage() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { tableScroll } = useTableScroll(850);
  const [form] = Form.useForm<DeptForm>();
  const userInfo = useUserStore(state => state.userInfo);
  const dicts = useDict('sys_normal_disable');
  const [modalOpen, { setTrue: openModal, setFalse: closeModal }] = useBoolean(false);
  const [modalTitle, setModalTitle] = useState('');
  const [deptOptions, setDeptOptions] = useState<DeptVO[]>([]);
  const [deptUserList, setDeptUserList] = useState<UserVO[]>([]);
  const [lastDeptList, setLastDeptList] = useState<DeptVO[]>([]);
  const { expandedRowKeys, onExpandedRowsChange, syncExpandedRows, toggleExpandAll } = useTreeTableExpand<DeptVO>(
    dept => dept.deptId,
    { initialExpandAll: true }
  );

  const canAdd = hasPermi(userInfo, ['system:dept:add']);
  const canEdit = hasPermi(userInfo, ['system:dept:edit']);
  const canRemove = hasPermi(userInfo, ['system:dept:remove']);
  const parentId = Form.useWatch('parentId', form);
  const deptTreeSelectData = useMemo(() => toTreeSelectData(deptOptions), [deptOptions]);

  const loadDeptOptions = async (excludeDeptId?: string | number) => {
    const res = excludeDeptId ? await listDeptExcludeChild(excludeDeptId) : await listDept();
    const tree = handleTree<DeptVO>(res.data || [], 'deptId');
    setDeptOptions(tree);
    return tree;
  };

  const openAdd = async (row?: DeptVO) => {
    form.resetFields();
    await loadDeptOptions();
    form.setFieldsValue({
      ...defaultDeptForm,
      parentId: row?.deptId
    });
    setDeptUserList([]);
    setModalTitle('添加部门');
    openModal();
  };

  const openEdit = async (row: DeptVO) => {
    form.resetFields();
    const [detail, optionTree] = await Promise.all([getDept(row.deptId), loadDeptOptions(row.deptId)]);
    const users = await listUserByDeptId(row.deptId).catch(() => ({ data: [] as UserVO[] }));
    setDeptUserList(users.data || []);
    const detailData = detail.data;
    if (!optionTree.length && detailData.parentId !== undefined && detailData.parentId !== null) {
      setDeptOptions([
        {
          ...detailData,
          deptId: detailData.parentId,
          deptName: detailData.parentName || String(detailData.parentId),
          children: []
        }
      ]);
    }
    form.setFieldsValue(detail.data);
    setModalTitle('修改部门');
    openModal();
  };

  const submitForm = async (values: DeptForm) => {
    if (values.deptId) {
      await updateDept(values);
    } else {
      await addDept(values);
    }
    message.success('操作成功');
    actionRef.current?.reload();
    return true;
  };

  const handleDelete = async (row: DeptVO) => {
    await delDept(row.deptId);
    message.success('删除成功');
    actionRef.current?.reload();
  };

  const columns: ProColumns<DeptVO>[] = [
    {
      title: '部门名称',
      dataIndex: 'deptName',
      width: 190,
      render: (_, row) => <EllipsisText value={row.deptName} maxWidth={170} />
    },
    {
      title: '类别编码',
      dataIndex: 'deptCategory',
      width: 130,
      render: (_, row) => <EllipsisText value={row.deptCategory} maxWidth={110} />
    },
    {
      title: '排序',
      dataIndex: 'orderNum',
      search: false,
      width: 100
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      width: 100,
      fieldProps: {
        options: dictOptions(dicts.sys_normal_disable)
      },
      render: (_, row) => <Tag color={row.status === '0' ? 'green' : 'red'}>{row.status === '0' ? '正常' : '停用'}</Tag>
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
      search: false,
      width: 170
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
            canAdd && { key: 'add', label: '新增', icon: <PlusOutlined />, onClick: () => openAdd(row) },
            canRemove && {
              key: 'delete',
              label: '删除',
              icon: <DeleteOutlined />,
              danger: true,
              confirm: `是否确认删除名称为"${row.deptName}"的数据项？`,
              onClick: () => handleDelete(row)
            }
          ]}
        />
      )
    }
  ];

  return (
    <PageContainer title="部门管理">
      <ProTable<DeptVO, DeptQuery>
        actionRef={actionRef}
        rowKey="deptId"
        columns={columns}
        scroll={tableScroll}
        search={{ labelWidth: 90 }}
        pagination={false}
        expandable={{
          expandedRowKeys,
          onExpandedRowsChange
        }}
        request={async params => {
          const res = await listDept(params);
          const data = handleTree<DeptVO>(res.data || [], 'deptId');
          setLastDeptList(data);
          syncExpandedRows(data);
          return { data, success: true };
        }}
        toolbar={{ title: '部门列表' }}
        toolBarRender={() => [
          canAdd && (
            <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => openAdd()}>
              新增
            </Button>
          ),
          <Button
            key="expand"
            onClick={() => toggleExpandAll(lastDeptList)}
          >
            展开/折叠
          </Button>
        ]}
      />

      <ModalForm<DeptForm>
        title={modalTitle}
        open={modalOpen}
        width={680}
        form={form}
        layout="vertical"
        initialValues={defaultDeptForm}
        modalProps={{ destroyOnHidden: true, onCancel: closeModal }}
        onOpenChange={open => !open && closeModal()}
        onFinish={submitForm}
      >
        <ProFormText name="deptId" hidden />
        <ProFormTreeSelect
          name="parentId"
          label="上级部门"
          rules={[{ required: true, message: '上级部门不能为空' }]}
          fieldProps={{
            allowClear: true,
            treeDefaultExpandAll: true,
            placeholder: '选择上级部门',
            treeData: deptTreeSelectData,
            disabled: parentId === 0
          }}
        />
        <div className="form-grid">
          <ProFormText
            name="deptName"
            label="部门名称"
            placeholder="请输入部门名称"
            rules={[{ required: true, message: '部门名称不能为空' }]}
          />
          <ProFormText name="deptCategory" label="类别编码" placeholder="请输入类别编码" />
          <ProFormDigit
            name="orderNum"
            label="显示排序"
            min={0}
            rules={[{ required: true, message: '显示排序不能为空' }]}
          />
          <ProFormSelect
            name="leader"
            label="负责人"
            allowClear
            placeholder="请选择负责人"
            options={deptUserList.map(item => ({ label: item.userName, value: item.userId }))}
          />
          <ProFormText
            name="phone"
            label="联系电话"
            fieldProps={{ maxLength: 11 }}
            placeholder="请输入联系电话"
            rules={[{ pattern: /^1[3456789][0-9]\d{8}$/, message: '请输入正确的手机号码' }]}
          />
          <ProFormText
            name="email"
            label="邮箱"
            fieldProps={{ maxLength: 50 }}
            placeholder="请输入邮箱"
            rules={[{ type: 'email', message: '请输入正确的邮箱地址' }]}
          />
          <ProFormRadio.Group name="status" label="部门状态" options={dictOptions(dicts.sys_normal_disable)} />
        </div>
      </ModalForm>
    </PageContainer>
  );
}
