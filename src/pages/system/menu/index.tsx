import type { DataNode } from 'antd/es/tree';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProFormDigit,
  ProFormRadio,
  ProFormText,
  ProFormTreeSelect,
  ProTable,
  type ActionType,
  type ProColumns
} from '@ant-design/pro-components';
import { useBoolean } from 'ahooks';
import { Button, Form, message, Modal, Space, Tag, Tree } from 'antd';
import { useMemo, useRef, useState } from 'react';
import type { MenuForm, MenuQuery, MenuTreeOption, MenuVO } from '@/api/system/menu/types';
import { addMenu, cascadeDelMenu, delMenu, getMenu, listMenu, treeselect, updateMenu } from '@/api/system/menu';
import DictTag from '@/components/common/DictTag';
import EllipsisText from '@/components/common/EllipsisText';
import IconSelect from '@/components/common/IconSelect';
import RowActions from '@/components/common/RowActions';
import { useDict } from '@/hooks/useDict';
import { useLoading } from '@/hooks/useLoading';
import { useTableScroll } from '@/hooks/useTableScroll';
import { useUserStore } from '@/stores/userStore';
import { routeIcon } from '@/utils/menu';
import { dictOptions } from '@/utils/dict';
import { hasPermi } from '@/utils/permission';
import { handleTree } from '@/utils/ruoyi';

const defaultMenuForm: MenuForm = {
  parentId: 0,
  menuType: 'M',
  orderNum: 1,
  isFrame: 'N',
  isCache: 'Y',
  visible: '0',
  status: '0'
};


function menuTypeMeta(row: MenuVO) {
  if (row.menuType === 'F') return { label: '按钮', color: 'orange' };
  if (row.isFrame === 'Y') return { label: '外链', color: 'red' };
  if (row.menuType === 'M') return { label: '目录', color: 'blue' };
  return { label: '菜单', color: 'green' };
}

function toTreeNodes(nodes: MenuTreeOption[]): DataNode[] {
  return nodes.map(node => ({
    title: node.label,
    key: node.id,
    children: node.children ? toTreeNodes(node.children) : undefined
  }));
}

export default function SystemMenuPage() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { tableScroll } = useTableScroll(1120);
  const [form] = Form.useForm<MenuForm>();
  const userInfo = useUserStore(state => state.userInfo);
  const dicts = useDict('sys_show_hide', 'sys_normal_disable', 'sys_yes_no');
  const [menuOptions, setMenuOptions] = useState<MenuTreeOption[]>([]);
  const [modalOpen, { setTrue: openModal, setFalse: closeModal }] = useBoolean(false);
  const [modalTitle, setModalTitle] = useState('');
  const [cascadeOpen, { setTrue: openCascadeModal, setFalse: closeCascadeModal }] = useBoolean(false);
  const [cascadeKeys, setCascadeKeys] = useState<Array<string | number>>([]);
  const { loading: cascadeLoading, withLoading: withCascadeLoading } = useLoading();

  const canAdd = hasPermi(userInfo, ['system:menu:add']);
  const canEdit = hasPermi(userInfo, ['system:menu:edit']);
  const canRemove = hasPermi(userInfo, ['system:menu:remove']);
  const menuType = Form.useWatch('menuType', form) || defaultMenuForm.menuType;
  const visible = Form.useWatch('visible', form) || defaultMenuForm.visible;
  const treeNodes = useMemo(() => toTreeNodes(menuOptions), [menuOptions]);

  const loadMenuTree = async () => {
    const res = await treeselect();
    setMenuOptions([{ id: 0, label: '主类目', parentId: 0, weight: 0, children: res.data || [] }]);
  };

  const openAdd = async (row?: MenuVO) => {
    await loadMenuTree();
    form.resetFields();
    form.setFieldsValue({ ...defaultMenuForm, parentId: row?.menuId || 0 });
    setModalTitle('添加菜单');
    openModal();
  };

  const openEdit = async (row: MenuVO) => {
    await loadMenuTree();
    const res = await getMenu(row.menuId);
    form.resetFields();
    form.setFieldsValue(res.data);
    setModalTitle('修改菜单');
    openModal();
  };

  const submitForm = async (values: MenuForm) => {
    values.menuId ? await updateMenu(values) : await addMenu(values);
    message.success('操作成功');
    form.resetFields();
    actionRef.current?.reload();
    return true;
  };

  const remove = async (row: MenuVO) => {
    await delMenu(row.menuId);
    message.success('删除成功');
    actionRef.current?.reload();
  };

  const openCascadeDelete = async () => {
    await loadMenuTree();
    setCascadeKeys([]);
    openCascadeModal();
  };

  const submitCascadeDelete = async () => {
    if (!cascadeKeys.length) {
      message.warning('请选择要删除的菜单');
      return;
    }
    await withCascadeLoading(async () => {
      await cascadeDelMenu(cascadeKeys);
      message.success('删除成功');
      closeCascadeModal();
      actionRef.current?.reload();
    });
  };

  const columns: ProColumns<MenuVO>[] = [
    {
      title: '菜单名称',
      dataIndex: 'menuName',
      width: 220,
      render: (_, row) => (
        <Space size={8}>
          {row.icon && <span className="menu-name-icon-react">{routeIcon(row.icon)}</span>}
          <span>{row.menuName}</span>
        </Space>
      )
    },
    {
      title: '类型',
      dataIndex: 'menuType',
      search: false,
      width: 90,
      render: (_, row) => <Tag color={menuTypeMeta(row).color}>{menuTypeMeta(row).label}</Tag>
    },
    { title: '排序', dataIndex: 'orderNum', search: false, width: 90 },
    {
      title: '权限标识',
      dataIndex: 'perms',
      search: false,
      width: 200,
      render: (_, row) => <EllipsisText value={row.perms} maxWidth={180} />
    },
    {
      title: '组件路径',
      dataIndex: 'component',
      search: false,
      width: 220,
      render: (_, row) => <EllipsisText value={row.component} maxWidth={200} />
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      fieldProps: { options: dictOptions(dicts.sys_normal_disable) },
      width: 90,
      render: (_, row) => <DictTag options={dicts.sys_normal_disable} value={row.status} />
    },
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
              confirm: `是否确认删除名称为"${row.menuName}"的数据项？`,
              onClick: () => remove(row)
            }
          ]}
        />
      )
    }
  ];

  return (
    <PageContainer title="菜单管理">
      <ProTable<MenuVO, MenuQuery>
        actionRef={actionRef}
        rowKey="menuId"
        columns={columns}
        scroll={tableScroll}
        pagination={false}
        search={{ labelWidth: 90 }}
        expandable={{ defaultExpandAllRows: false }}
        request={async params => {
          const res = await listMenu({ menuName: params.menuName, status: params.status });
          const rows = handleTree<MenuVO>(res.data || [], 'menuId');
          return { data: rows, total: rows.length, success: true };
        }}
        toolbar={{ title: '菜单列表' }}
        toolBarRender={() => [
          canAdd && (
            <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => openAdd()}>
              新增
            </Button>
          ),
          canRemove && (
            <Button key="cascade" danger icon={<DeleteOutlined />} onClick={openCascadeDelete}>
              级联删除
            </Button>
          )
        ]}
      />

      <ModalForm<MenuForm>
        title={modalTitle}
        open={modalOpen}
        width={760}
        form={form}
        layout="vertical"
        initialValues={defaultMenuForm}
        modalProps={{ destroyOnHidden: true, onCancel: closeModal }}
        onOpenChange={open => !open && closeModal()}
        onFinish={submitForm}
      >
        <ProFormText name="menuId" hidden />
        <ProFormTreeSelect
          name="parentId"
          label="上级菜单"
          fieldProps={{
            treeDefaultExpandAll: true,
            treeData: menuOptions,
            fieldNames: { label: 'label', value: 'id', children: 'children' }
          }}
        />
        <ProFormRadio.Group
          name="menuType"
          label="菜单类型"
          rules={[{ required: true, message: '菜单类型不能为空' }]}
          options={[
            { label: '目录', value: 'M' },
            { label: '菜单', value: 'C' },
            { label: '按钮', value: 'F' }
          ]}
        />
        {menuType !== 'F' && (
          <Form.Item name="icon" label="菜单图标">
            <IconSelect />
          </Form.Item>
        )}
        <div className="form-grid">
          <ProFormText name="menuName" label="菜单名称" rules={[{ required: true, message: '菜单名称不能为空' }]} />
          <ProFormDigit
            name="orderNum"
            label="显示排序"
            min={0}
            rules={[{ required: true, message: '显示排序不能为空' }]}
          />
        </div>
        <div className="form-grid">
          {menuType !== 'F' && (
            <ProFormRadio.Group name="isFrame" label="是否外链" options={dictOptions(dicts.sys_yes_no)} />
          )}
          {menuType !== 'F' && (
            <ProFormText name="path" label="路由地址" rules={[{ required: true, message: '路由地址不能为空' }]} />
          )}
          {menuType === 'C' && <ProFormText name="component" label="组件路径" />}
          {menuType !== 'M' && <ProFormText name="perms" label="权限字符" fieldProps={{ maxLength: 100 }} />}
          {menuType === 'C' && <ProFormText name="queryParam" label="路由参数" fieldProps={{ maxLength: 255 }} />}
          {menuType === 'C' && (
            <ProFormRadio.Group
              name="isCache"
              label="是否缓存"
              options={[
                { label: '缓存', value: 'Y' },
                { label: '不缓存', value: 'N' }
              ]}
            />
          )}
          {menuType !== 'F' && (
            <ProFormRadio.Group name="visible" label="显示状态" options={dictOptions(dicts.sys_show_hide)} />
          )}
          <ProFormRadio.Group name="status" label="菜单状态" options={dictOptions(dicts.sys_normal_disable)} />
          {visible !== '0' && <ProFormText name="activeMenu" label="激活路由" />}
          <ProFormText name="remark" label="备注" />
        </div>
      </ModalForm>

      <Modal
        title="级联删除菜单"
        open={cascadeOpen}
        width={760}
        confirmLoading={cascadeLoading}
        onOk={submitCascadeDelete}
        onCancel={closeCascadeModal}
        destroyOnHidden
      >
        <Tree
          checkable
          defaultExpandAll
          treeData={treeNodes}
          checkedKeys={cascadeKeys}
          onCheck={keys => setCascadeKeys(keys as Array<string | number>)}
        />
      </Modal>
    </PageContainer>
  );
}
