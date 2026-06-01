import type { DataNode } from 'antd/es/tree';
import { useBoolean } from 'ahooks';
import { Checkbox, message, type FormInstance } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import type { DeptTreeVO } from '@/api/system/dept/types';
import type { MenuTreeOption } from '@/api/system/menu/types';
import type { RoleForm } from '@/api/system/role/types';
import { roleMenuTreeselect } from '@/api/system/menu';
import { deptTreeSelect, getRole, updateRolePermission } from '@/api/system/role';

export const defaultRoleForm: RoleForm = {
  roleSort: 1,
  status: '0',
  menuCheckStrictly: true,
  deptCheckStrictly: true,
  dataScope: '1',
  menuIds: [],
  deptIds: []
};

export const dataScopeOptions = [
  { value: '1', label: '全部数据权限' },
  { value: '2', label: '自定数据权限' },
  { value: '3', label: '本部门数据权限' },
  { value: '4', label: '本部门及以下数据权限' },
  { value: '5', label: '仅本人数据权限' },
  { value: '6', label: '部门及以下或本人数据权限' }
];

interface RoleMenuButtonOption {
  menuId: string | number;
  menuName: string;
  disabled?: boolean;
}

interface RoleMenuPermissionOption extends MenuTreeOption {
  buttonPermissions: RoleMenuButtonOption[];
  disabled?: boolean;
  children?: RoleMenuPermissionOption[];
}

interface RoleMenuPermissionMeta {
  treeOptions: RoleMenuPermissionOption[];
  buttonIds: Array<string | number>;
  disabledButtonIds: Array<string | number>;
  buttonParentMap: Map<string, string | number>;
  menuAncestorMap: Map<string, Array<string | number>>;
  menuButtonIdsMap: Map<string, Array<string | number>>;
}

interface UseRolePermissionOptions {
  open: boolean;
  roleId?: string | number;
  form: FormInstance<RoleForm>;
  onSuccess: () => void;
}

function toTreeData(nodes: DeptTreeVO[]): DataNode[] {
  return nodes.map(node => ({
    title: node.label,
    key: node.id,
    disabled: node.disabled,
    children: node.children ? toTreeData(node.children) : undefined
  }));
}

export function useRolePermission({ open, roleId, form, onSuccess }: UseRolePermissionOptions) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('menu');
  const [menuTree, setMenuTree] = useState<MenuTreeOption[]>([]);
  const [deptTree, setDeptTree] = useState<DeptTreeVO[]>([]);
  const [menuCheckedKeys, setMenuCheckedKeys] = useState<Array<string | number>>([]);
  const [buttonCheckedKeys, setButtonCheckedKeys] = useState<Array<string | number>>([]);
  const [deptCheckedKeys, setDeptCheckedKeys] = useState<Array<string | number>>([]);
  const [menuExpandAll, { set: setMenuExpandAll }] = useBoolean(false);
  const [deptExpandAll, { set: setDeptExpandAll }] = useBoolean(true);
  const [menuConnect, setMenuConnect] = useState(true);
  const [deptConnect, setDeptConnect] = useState(true);

  const menuPermissionMeta = useMemo(() => buildMenuPermissionMeta(menuTree), [menuTree]);
  const deptTreeData = useMemo(() => toTreeData(deptTree), [deptTree]);
  const menuAllKeys = useMemo(() => collectMenuNodeIds(menuPermissionMeta.treeOptions), [menuPermissionMeta]);
  const buttonAllKeys = useMemo(
    () => menuPermissionMeta.buttonIds.filter(key => !hasId(menuPermissionMeta.disabledButtonIds, key)),
    [menuPermissionMeta]
  );
  const deptAllKeys = useMemo(() => flattenTreeKeys(deptTreeData), [deptTreeData]);

  const handleButtonPermissionChange = (buttonId: string | number, checked: boolean) => {
    if (checked) {
      setButtonCheckedKeys(keys => normalizeIds([...keys, buttonId]));
      if (menuConnect) {
        setMenuCheckedKeys(keys => normalizeIds([...keys, ...getMenuIdsForButton(buttonId, menuPermissionMeta)]));
      }
      return;
    }
    setButtonCheckedKeys(keys => keys.filter(key => String(key) !== String(buttonId)));
  };

  const menuTreeData = toMenuTreeData(menuPermissionMeta.treeOptions, buttonCheckedKeys, handleButtonPermissionChange);
  const menuAllChecked =
    menuAllKeys.length > 0 &&
    menuAllKeys.every(key => hasId(menuCheckedKeys, key)) &&
    buttonAllKeys.every(key => hasId(buttonCheckedKeys, key));
  const deptAllChecked = deptAllKeys.length > 0 && deptAllKeys.every(key => deptCheckedKeys.includes(key));

  useEffect(() => {
    if (!open || !roleId) return;

    const loadPermission = async () => {
      setLoading(true);
      setActiveTab('menu');
      try {
        const [roleRes, menuRes, deptRes] = await Promise.all([
          getRole(roleId),
          roleMenuTreeselect(roleId),
          deptTreeSelect(roleId)
        ]);
        form.setFieldsValue({
          ...defaultRoleForm,
          ...roleRes.data
        });
        setMenuConnect(roleRes.data.menuCheckStrictly ?? true);
        setDeptConnect(roleRes.data.deptCheckStrictly ?? true);
        const nextMenuTree = menuRes.data.menus || [];
        const nextMenuMeta = buildMenuPermissionMeta(nextMenuTree);
        const checkedKeys = menuRes.data.checkedKeys || [];
        setMenuTree(nextMenuTree);
        setDeptTree(deptRes.data.depts || []);
        setMenuCheckedKeys(checkedKeys.filter(key => !hasId(nextMenuMeta.buttonIds, key)));
        setButtonCheckedKeys(checkedKeys.filter(key => hasId(nextMenuMeta.buttonIds, key)));
        setDeptCheckedKeys(deptRes.data.checkedKeys || []);
      } finally {
        setLoading(false);
      }
    };

    loadPermission();
  }, [form, open, roleId]);

  const resetPermission = () => {
    form.resetFields();
    setMenuTree([]);
    setDeptTree([]);
    setMenuCheckedKeys([]);
    setButtonCheckedKeys([]);
    setDeptCheckedKeys([]);
  };

  const submitPermission = async () => {
    const fields = await form.validateFields();
    const values = { ...form.getFieldsValue(true), ...fields };
    const nextMenuIds = normalizeIds([
      ...getTreeCheckedKeysWithAncestors(menuCheckedKeys, menuTreeData, values.menuCheckStrictly !== false),
      ...buttonCheckedKeys
    ]);
    const nextDeptIds = getTreeCheckedKeysWithAncestors(
      deptCheckedKeys,
      deptTreeData,
      values.deptCheckStrictly !== false
    );
    setLoading(true);
    try {
      await updateRolePermission({
        ...values,
        menuIds: nextMenuIds,
        deptIds: values.dataScope === '2' ? nextDeptIds : []
      });
      message.success('修改成功');
      onSuccess();
      return true;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    activeTab,
    setActiveTab,
    menuTreeData,
    deptTreeData,
    menuCheckedKeys,
    deptCheckedKeys,
    menuExpandAll,
    setMenuExpandAll,
    deptExpandAll,
    setDeptExpandAll,
    menuConnect,
    deptConnect,
    menuAllChecked,
    deptAllChecked,
    resetPermission,
    submitPermission,
    checkAllMenus: (checked: boolean) => {
      setMenuCheckedKeys(checked ? menuAllKeys : []);
      setButtonCheckedKeys(checked ? buttonAllKeys : []);
    },
    checkAllDepts: (checked: boolean) => setDeptCheckedKeys(checked ? deptAllKeys : []),
    toggleMenuConnect: (checked: boolean) => {
      setMenuConnect(checked);
      form.setFieldValue('menuCheckStrictly', checked);
    },
    toggleDeptConnect: (checked: boolean) => {
      setDeptConnect(checked);
      form.setFieldValue('deptCheckStrictly', checked);
    },
    handleMenuCheck: (
      keys: React.Key[] | { checked: React.Key[]; halfChecked: React.Key[] },
      nodeKey: React.Key,
      checked: boolean
    ) => {
      setMenuCheckedKeys(normalizeCheckedKeys(keys));
      const relatedButtonIds = menuPermissionMeta.menuButtonIdsMap.get(String(nodeKey)) || [];
      if (checked) {
        setButtonCheckedKeys(currentKeys =>
          normalizeIds([
            ...currentKeys,
            ...relatedButtonIds.filter(key => !hasId(menuPermissionMeta.disabledButtonIds, key))
          ])
        );
      } else {
        setButtonCheckedKeys(currentKeys => currentKeys.filter(key => !hasId(relatedButtonIds, key)));
      }
    },
    handleDeptCheck: (keys: React.Key[] | { checked: React.Key[]; halfChecked: React.Key[] }) =>
      setDeptCheckedKeys(normalizeCheckedKeys(keys))
  };
}

function isMenuTypeButton(menu: MenuTreeOption) {
  return menu.menuType === 'F';
}

function isMenuDisabled(menu: MenuTreeOption, ancestorDisabled = false) {
  return ancestorDisabled || menu.disabled === true || menu.status === '1';
}

function buildMenuPermissionOptions(
  nodes: MenuTreeOption[],
  disabledButtonIds: Array<string | number>,
  buttonParentMap: Map<string, string | number>,
  ancestorDisabled = false
): RoleMenuPermissionOption[] {
  return nodes.reduce<RoleMenuPermissionOption[]>((options, node) => {
    if (isMenuTypeButton(node)) return options;

    const nodeDisabled = isMenuDisabled(node, ancestorDisabled);
    const childNodes = node.children || [];
    const buttonPermissions = childNodes.filter(isMenuTypeButton).map(button => {
      const buttonDisabled = isMenuDisabled(button, nodeDisabled);
      buttonParentMap.set(String(button.id), node.id);
      if (buttonDisabled) {
        disabledButtonIds.push(button.id);
      }
      return {
        menuId: button.id,
        menuName: button.label,
        disabled: buttonDisabled
      };
    });

    options.push({
      ...node,
      disabled: nodeDisabled,
      buttonPermissions,
      children: buildMenuPermissionOptions(childNodes, disabledButtonIds, buttonParentMap, nodeDisabled)
    });
    return options;
  }, []);
}

function buildMenuPermissionMeta(menuTree: MenuTreeOption[]): RoleMenuPermissionMeta {
  const disabledButtonIds: Array<string | number> = [];
  const buttonParentMap = new Map<string, string | number>();
  const treeOptions = buildMenuPermissionOptions(menuTree, disabledButtonIds, buttonParentMap);
  const buttonIds: Array<string | number> = [];
  const menuAncestorMap = new Map<string, Array<string | number>>();
  const menuButtonIdsMap = new Map<string, Array<string | number>>();

  const collect = (nodes: RoleMenuPermissionOption[], ancestors: Array<string | number> = []) => {
    return nodes.reduce<Array<string | number>>((subtreeButtonIds, node) => {
      menuAncestorMap.set(String(node.id), ancestors);
      const ownButtonIds = node.buttonPermissions.map(button => button.menuId);
      const childButtonIds = node.children?.length ? collect(node.children, [...ancestors, node.id]) : [];
      const currentButtonIds = [...ownButtonIds, ...childButtonIds];
      buttonIds.push(...ownButtonIds);
      menuButtonIdsMap.set(String(node.id), currentButtonIds);
      subtreeButtonIds.push(...currentButtonIds);
      return subtreeButtonIds;
    }, []);
  };

  collect(treeOptions);

  return {
    treeOptions,
    buttonIds,
    disabledButtonIds,
    buttonParentMap,
    menuAncestorMap,
    menuButtonIdsMap
  };
}

function toMenuTreeData(
  nodes: RoleMenuPermissionOption[],
  buttonCheckedKeys: Array<string | number>,
  onButtonChange: (buttonId: string | number, checked: boolean) => void
): DataNode[] {
  return nodes.map(node => ({
    title: (
      <div className="menu-permission-row">
        <span className={node.visible === '1' ? 'menu-permission-name is-hidden' : 'menu-permission-name'}>
          {node.label}
          {node.visible === '1' && <span className="menu-permission-tag">隐藏</span>}
          {node.disabled && <span className="menu-permission-tag">停用</span>}
        </span>
        {node.buttonPermissions.length > 0 && (
          <span className="menu-permission-buttons">
            {node.buttonPermissions.map(button => (
              <Checkbox
                key={String(button.menuId)}
                checked={hasId(buttonCheckedKeys, button.menuId)}
                disabled={button.disabled}
                onClick={event => event.stopPropagation()}
                onChange={event => onButtonChange(button.menuId, event.target.checked)}
              >
                {button.menuName}
              </Checkbox>
            ))}
          </span>
        )}
      </div>
    ),
    key: node.id,
    disabled: node.disabled,
    children: node.children?.length ? toMenuTreeData(node.children, buttonCheckedKeys, onButtonChange) : undefined
  }));
}

function normalizeCheckedKeys(keys: React.Key[] | { checked: React.Key[]; halfChecked: React.Key[] }) {
  const checked = Array.isArray(keys) ? keys : keys.checked;
  return checked.map(key => key as string | number);
}

function flattenTreeKeys(nodes: DataNode[]): Array<string | number> {
  return nodes.reduce<Array<string | number>>((keys, node) => {
    keys.push(node.key as string | number);
    if (node.children?.length) {
      keys.push(...flattenTreeKeys(node.children));
    }
    return keys;
  }, []);
}

function collectMenuNodeIds(nodes: RoleMenuPermissionOption[]) {
  return nodes.reduce<Array<string | number>>((keys, node) => {
    if (!node.disabled) {
      keys.push(node.id);
    }
    if (node.children?.length) {
      keys.push(...collectMenuNodeIds(node.children));
    }
    return keys;
  }, []);
}

function getMenuIdsForButton(buttonId: string | number, meta: RoleMenuPermissionMeta) {
  const parentMenuId = meta.buttonParentMap.get(String(buttonId));
  if (!parentMenuId) return [];
  return normalizeIds([parentMenuId, ...(meta.menuAncestorMap.get(String(parentMenuId)) || [])]);
}

function hasId(ids: Array<string | number>, id: string | number) {
  return ids.some(item => String(item) === String(id));
}

function getTreeCheckedKeysWithAncestors(checkedKeys: Array<string | number>, nodes: DataNode[], connect: boolean) {
  if (!connect) return checkedKeys;
  return normalizeIds([...checkedKeys, ...collectAncestorKeys(checkedKeys, nodes)]);
}

function collectAncestorKeys(checkedKeys: Array<string | number>, nodes: DataNode[]) {
  const checkedKeySet = new Set(checkedKeys.map(String));
  const ancestors: Array<string | number> = [];

  const visit = (node: DataNode, path: Array<string | number>) => {
    const ownKey = node.key as string | number;
    let subtreeChecked = checkedKeySet.has(String(ownKey));

    node.children?.forEach(child => {
      if (visit(child, [...path, ownKey])) {
        subtreeChecked = true;
      }
    });

    if (subtreeChecked) {
      ancestors.push(...path);
    }
    return subtreeChecked;
  };

  nodes.forEach(node => {
    visit(node, []);
  });
  return normalizeIds(ancestors);
}

function normalizeIds(ids: Array<string | number>) {
  const normalized = new Map<string, string | number>();
  ids.forEach(id => {
    normalized.set(String(id), id);
  });
  return [...normalized.values()];
}
