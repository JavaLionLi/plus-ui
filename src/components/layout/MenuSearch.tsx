import { EnterOutlined, SearchOutlined } from '@ant-design/icons';
import { history } from '@umijs/max';
import { useBoolean } from 'ahooks';
import { Button, Empty, Input, List, Modal, Tooltip } from 'antd';
import { useMemo, useState } from 'react';
import { usePermissionStore } from '@/stores/permissionStore';
import { appendRouteQuery, flattenBackendRoutes, routeIcon } from '@/utils/menu';
import { isHttp } from '@/utils/ruoyi';

interface SearchItem {
  title: string;
  path: string;
  icon?: React.ReactNode;
}

export default function MenuSearch() {
  const backendRoutes = usePermissionStore(state => state.backendRoutes);
  const [open, { setTrue: openModal, setFalse: closeModal }] = useBoolean(false);
  const [keyword, setKeyword] = useState('');

  const searchItems = useMemo<SearchItem[]>(() => {
    const routes = flattenBackendRoutes(backendRoutes);
    return routes
      .filter(route => !route.hidden && route.meta?.title && !route.children?.length)
      .map(route => ({
        title: route.meta?.title || route.name || route.path,
        path: appendRouteQuery(route.fullPath, route.query),
        icon: routeIcon(route.meta?.icon)
      }));
  }, [backendRoutes]);

  const results = useMemo(() => {
    const value = keyword.trim().toLowerCase();
    if (!value) return searchItems.slice(0, 12);
    return searchItems.filter(item => `${item.title} ${item.path}`.toLowerCase().includes(value)).slice(0, 20);
  }, [keyword, searchItems]);

  const goTo = (item: SearchItem) => {
    closeModal();
    setKeyword('');
    if (isHttp(item.path)) {
      window.open(item.path, '_blank', 'noopener,noreferrer');
      return;
    }
    history.push(item.path);
  };

  return (
    <>
      <Tooltip title="搜索菜单">
        <Button
          type="text"
          className="layout-action-button"
          icon={<SearchOutlined />}
          aria-label="搜索菜单"
          onClick={openModal}
        />
      </Tooltip>
      <Modal
        title="搜索菜单"
        open={open}
        footer={null}
        width={560}
        onCancel={closeModal}
        destroyOnHidden
        afterOpenChange={visible => {
          if (!visible) setKeyword('');
        }}
      >
        <Input
          autoFocus
          allowClear
          prefix={<SearchOutlined />}
          value={keyword}
          onChange={event => setKeyword(event.target.value)}
          placeholder="输入菜单名称或路径"
        />
        <List<SearchItem>
          className="menu-search-list-react"
          dataSource={results}
          locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="未找到菜单" /> }}
          renderItem={item => (
            <List.Item className="menu-search-item-react" onClick={() => goTo(item)}>
              <div className="menu-search-item-icon">{item.icon}</div>
              <div className="menu-search-item-main">
                <div className="menu-search-item-title">{item.title}</div>
                <div className="menu-search-item-path">{item.path}</div>
              </div>
              <EnterOutlined className="menu-search-item-enter" />
            </List.Item>
          )}
        />
      </Modal>
    </>
  );
}
