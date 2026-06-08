import {
  CloseCircleOutlined,
  CloseOutlined,
  CompressOutlined,
  DownOutlined,
  ExpandOutlined,
  LeftOutlined,
  ReloadOutlined,
  RightOutlined
} from '@ant-design/icons';
import { history, useLocation } from '@umijs/max';
import { Button, Dropdown, type MenuProps } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePermissionStore } from '@/stores/permissionStore';
import { homeTag, type TagViewItem, useTagsViewStore } from '@/stores/tagsViewStore';
import { flattenBackendRoutes, routeIcon } from '@/utils/menu';

interface RouteMetaLite {
  title?: string;
  icon?: string | null;
  affix?: boolean;
}

interface TagsViewProps {
  onRefresh: () => void;
  persist?: boolean;
  showIcon?: boolean;
}

const knownRouteTitles: Array<[RegExp, string, string?]> = [
  [/^\/user\/profile$/, '个人中心', 'user'],
  [/^\/system\/oss-config\/index$/, 'OSS配置', 'oss'],
  [/^\/system\/role-auth\/user\//, '分配用户', 'usergroup'],
  [/^\/system\/user-auth\/role\//, '分配角色', 'user-switch'],
  [/^\/tool\/gen-edit\/index\//, '修改生成配置', 'edit'],
  [/^\/workflow\/design\/index$/, '流程设计', 'process'],
  [/^\/workflow\/leaveEdit\/index$/, '请假申请', 'form'],
  [/^\/workflow\/task\/taskWaiting$/, '待办任务', 'waiting'],
  [/^\/workflow\/task\/taskFinish$/, '已办任务', 'finish'],
  [/^\/workflow\/task\/taskCopyList$/, '抄送任务', 'copy'],
  [/^\/workflow\/task\/allTaskWaiting$/, '全部任务', 'approval'],
  [/^\/workflow\/task\/myDocument$/, '我的单据', 'fileDone']
];

function activeFullPath(pathname: string, search: string) {
  return `${pathname}${search || ''}`;
}

function tagKeyFromFullPath(fullPath: string) {
  return fullPath === '/' ? homeTag.fullPath : fullPath;
}

function getTitleFromSearch(search: string) {
  const title = new URLSearchParams(search).get('title');
  return title || undefined;
}

function getRouteMeta(pathname: string, routeMap: Map<string, RouteMetaLite>, search: string): RouteMetaLite {
  const queryTitle = getTitleFromSearch(search);
  const matched = routeMap.get(pathname);
  if (matched) {
    return { ...matched, title: queryTitle || matched.title };
  }
  const known = knownRouteTitles.find(([pattern]) => pattern.test(pathname));
  if (known) {
    return { title: queryTitle || known[1], icon: known[2] };
  }
  if (pathname === '/') return { title: '首页', icon: 'dashboard', affix: true };
  return { title: queryTitle || pathname };
}

export default function TagsView({ onRefresh, persist = true, showIcon = true }: TagsViewProps) {
  const location = useLocation();
  const backendRoutes = usePermissionStore(state => state.backendRoutes);
  const tags = useTagsViewStore(state => state.tags);
  const initTags = useTagsViewStore(state => state.initTags);
  const setStoreTags = useTagsViewStore(state => state.setTags);
  const updateStoreTags = useTagsViewStore(state => state.updateTags);
  const clearPersistedTags = useTagsViewStore(state => state.clearPersistedTags);
  const fullscreen = useTagsViewStore(state => state.fullscreen);
  const setFullscreen = useTagsViewStore(state => state.setFullscreen);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ open: boolean; x: number; y: number; tag?: TagViewItem }>({
    open: false,
    x: 0,
    y: 0
  });

  const currentFullPath = activeFullPath(location.pathname, location.search);
  const currentTagKey = tagKeyFromFullPath(currentFullPath);
  const currentPath = location.pathname === '/' ? '/index' : location.pathname;

  const routeMap = useMemo(() => {
    const map = new Map<string, RouteMetaLite>();
    map.set('/index', { title: '首页', icon: 'dashboard', affix: true });
    for (const route of flattenBackendRoutes(backendRoutes)) {
      map.set(route.fullPath, {
        title: route.meta?.title,
        icon: route.meta?.icon,
        affix: (route.meta as RouteMetaLite | undefined)?.affix
      });
    }
    return map;
  }, [backendRoutes]);

  const activeTag =
    tags.find(item => item.key === currentTagKey) || tags.find(item => item.path === currentPath) || homeTag;

  useEffect(() => {
    initTags(persist);
  }, [initTags, persist]);

  const updateArrowState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  const moveToCurrentTag = useCallback(() => {
    const wrapper = scrollRef.current;
    const current = wrapper?.querySelector<HTMLElement>(`[data-tag-key="${CSS.escape(currentTagKey)}"]`);
    if (!wrapper || !current) {
      updateArrowState();
      return;
    }
    const wrapperLeft = wrapper.scrollLeft;
    const wrapperRight = wrapperLeft + wrapper.clientWidth;
    const tagLeft = current.offsetLeft;
    const tagRight = tagLeft + current.offsetWidth;
    if (tagLeft < wrapperLeft) {
      wrapper.scrollTo({ left: Math.max(tagLeft - 12, 0), behavior: 'smooth' });
    } else if (tagRight > wrapperRight) {
      wrapper.scrollTo({ left: tagRight - wrapper.clientWidth + 12, behavior: 'smooth' });
    }
    setTimeout(updateArrowState, 240);
  }, [currentTagKey, updateArrowState]);

  useEffect(() => {
    if (location.pathname === '/login') return;
    updateStoreTags(current => {
      const meta = getRouteMeta(currentPath, routeMap, location.search);
      const fullPath = tagKeyFromFullPath(currentFullPath);
      const nextTag: TagViewItem = {
        key: fullPath,
        path: currentPath,
        fullPath,
        title: meta.title || currentPath,
        icon: meta.icon,
        affix: currentPath === homeTag.path || !!meta.affix
      };
      const index = current.findIndex(item => item.key === nextTag.key);
      const next =
        index >= 0
          ? current.map((item, itemIndex) =>
              itemIndex === index ? { ...item, ...nextTag, affix: item.affix || nextTag.affix } : item
            )
          : [...current, nextTag];
      return next;
    }, persist);
  }, [currentFullPath, currentPath, location.pathname, location.search, persist, routeMap, updateStoreTags]);

  useEffect(() => {
    if (!persist) {
      clearPersistedTags();
    }
  }, [clearPersistedTags, persist]);

  useEffect(() => {
    if (tags.some(item => item.key === currentTagKey)) {
      moveToCurrentTag();
    }
  }, [currentTagKey, moveToCurrentTag, tags]);

  useEffect(() => {
    const closeMenu = () => setContextMenu(menu => ({ ...menu, open: false }));
    const handleResize = () => updateArrowState();
    document.body.addEventListener('click', closeMenu);
    window.addEventListener('resize', handleResize);
    return () => {
      document.body.removeEventListener('click', closeMenu);
      window.removeEventListener('resize', handleResize);
    };
  }, [updateArrowState]);

  useEffect(() => {
    document.body.classList.toggle('tags-fullscreen-mode-react', fullscreen);
    return () => document.body.classList.remove('tags-fullscreen-mode-react');
  }, [fullscreen]);

  const applyTags = (next: TagViewItem[], fallbackPath?: string) => {
    const normalized = next.some(item => item.key === homeTag.key) ? next : [homeTag, ...next];
    setStoreTags(normalized, persist);
    if (!normalized.some(item => item.key === currentTagKey)) {
      const target =
        normalized.find(item => item.key === fallbackPath || item.path === fallbackPath) ||
        normalized.at(-1) ||
        homeTag;
      const targetPath = target.fullPath || target.path;
      if (targetPath !== currentFullPath) {
        history.push(targetPath);
      }
    }
  };

  const closeTag = (target: TagViewItem) => {
    if (target.affix) return;
    const targetIndex = tags.findIndex(item => item.key === target.key);
    const fallback = tags[targetIndex + 1]?.key || tags[targetIndex - 1]?.key || homeTag.key;
    applyTags(
      tags.filter(item => item.key !== target.key),
      fallback
    );
  };

  const refreshTag = (target?: TagViewItem) => {
    if (!target) return;
    if (target.key !== currentTagKey) {
      history.push(target.fullPath || target.path);
      setTimeout(onRefresh, 0);
      return;
    }
    onRefresh();
  };

  const closeOthers = (target: TagViewItem) => {
    applyTags(
      tags.filter(item => item.affix || item.key === target.key),
      target.key
    );
  };

  const closeLeft = (target: TagViewItem) => {
    const index = tags.findIndex(item => item.key === target.key);
    applyTags(
      tags.filter((item, itemIndex) => item.affix || itemIndex >= index),
      target.key
    );
  };

  const closeRight = (target: TagViewItem) => {
    const index = tags.findIndex(item => item.key === target.key);
    applyTags(
      tags.filter((item, itemIndex) => item.affix || itemIndex <= index),
      target.key
    );
  };

  const closeAll = () => {
    applyTags(
      tags.filter(item => item.affix),
      homeTag.path
    );
  };

  const scrollTo = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const target = direction === 'left' ? 0 : el.scrollWidth - el.clientWidth;
    el.scrollTo({ left: target, behavior: 'smooth' });
    setTimeout(updateArrowState, 240);
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    event.preventDefault();
    el.scrollLeft += event.deltaY || event.deltaX;
    updateArrowState();
  };

  const buildMenuItems = (target: TagViewItem): MenuProps['items'] => {
    const index = tags.findIndex(item => item.key === target.key);
    return [
      { key: 'refresh', icon: <ReloadOutlined />, label: '刷新页面' },
      { key: 'close', icon: <CloseOutlined />, label: '关闭当前', disabled: !!target.affix },
      { key: 'closeOthers', icon: <CloseCircleOutlined />, label: '关闭其他' },
      { key: 'closeLeft', icon: <LeftOutlined />, label: '关闭左侧', disabled: index <= 1 },
      {
        key: 'closeRight',
        icon: <RightOutlined />,
        label: '关闭右侧',
        disabled: index < 0 || index >= tags.length - 1
      },
      { key: 'closeAll', icon: <CloseCircleOutlined />, label: '全部关闭' },
      { type: 'divider' },
      {
        key: 'fullscreen',
        icon: fullscreen ? <CompressOutlined /> : <ExpandOutlined />,
        label: fullscreen ? '退出全屏' : '全屏显示'
      }
    ];
  };

  const executeMenuCommand = (target: TagViewItem, key: React.Key) => {
    setContextMenu(menu => ({ ...menu, open: false }));
    if (key === 'refresh') refreshTag(target);
    if (key === 'close') closeTag(target);
    if (key === 'closeOthers') closeOthers(target);
    if (key === 'closeLeft') closeLeft(target);
    if (key === 'closeRight') closeRight(target);
    if (key === 'closeAll') closeAll();
    if (key === 'fullscreen') setFullscreen(value => !value);
  };

  const handleMenuClick =
    (target: TagViewItem): MenuProps['onClick'] =>
    ({ key }) => {
      executeMenuCommand(target, key);
    };

  const openContextMenu = (tag: TagViewItem, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({ open: true, x: event.clientX, y: event.clientY, tag });
  };

  const navigateToTag = (tag: TagViewItem) => {
    if (tag.key === currentTagKey) return;
    history.push(tag.fullPath || tag.path);
  };

  return (
    <div className="tags-view-react">
      {canScrollLeft && (
        <Button className="tags-nav-btn-react" size="small" icon={<LeftOutlined />} onClick={() => scrollTo('left')} />
      )}
      <div ref={scrollRef} className="tags-scroll-react" onScroll={updateArrowState} onWheel={handleWheel}>
        {tags.map(tag => {
          const active = tag.key === currentTagKey;
          return (
            <button
              type="button"
              key={tag.key}
              data-tag-key={tag.key}
              className={`tags-item-react ${active ? 'active' : ''} ${showIcon && tag.icon ? 'has-icon' : ''}`}
              onClick={() => navigateToTag(tag)}
              onAuxClick={event => {
                if (event.button === 1) closeTag(tag);
              }}
              onContextMenu={event => openContextMenu(tag, event)}
            >
              {showIcon && tag.icon && <span className="tags-item-icon-react">{routeIcon(tag.icon)}</span>}
              <span className="tags-item-title-react">{tag.title}</span>
              {!tag.affix && (
                <CloseOutlined
                  className="tags-item-close-react"
                  onClick={event => {
                    event.stopPropagation();
                    closeTag(tag);
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
      {canScrollRight && (
        <Button
          className="tags-nav-btn-react"
          size="small"
          icon={<RightOutlined />}
          onClick={() => scrollTo('right')}
        />
      )}
      <Dropdown
        menu={{ items: buildMenuItems(activeTag), onClick: handleMenuClick(activeTag) }}
        placement="bottomRight"
        trigger={['click']}
      >
        <Button className="tags-action-btn-react" size="small" icon={<DownOutlined />} />
      </Dropdown>
      <Button
        className="tags-refresh-btn-react"
        size="small"
        icon={<ReloadOutlined />}
        onClick={() => refreshTag(activeTag)}
      >
        刷新
      </Button>
      {contextMenu.open && contextMenu.tag && (
        <div className="tags-context-menu-react" style={{ left: contextMenu.x, top: contextMenu.y }}>
          {(buildMenuItems(contextMenu.tag) || []).map(item => {
            if (!item || item.type === 'divider')
              return <div key="divider" className="tags-context-menu-divider-react" />;
            const menuItem = item as {
              key: string;
              icon?: React.ReactNode;
              label?: React.ReactNode;
              disabled?: boolean;
            };
            return (
              <button
                key={menuItem.key}
                type="button"
                disabled={menuItem.disabled}
                className="tags-context-menu-item-react"
                onClick={() => {
                  if (contextMenu.tag) {
                    executeMenuCommand(contextMenu.tag, menuItem.key);
                  }
                }}
              >
                {menuItem.icon}
                <span>{menuItem.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
