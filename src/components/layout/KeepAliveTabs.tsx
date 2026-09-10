import { useLocation } from '@umijs/max';
import { Activity } from 'react';
// 与 @umijs/max 同一 react-router 实例 umi 构建时已做全局别名
import { UNSAFE_LocationContext } from 'react-router-dom';
import DynamicPage from '@/pages/dynamicPage';
import HomePage from '@/pages/index';
import ProfilePage from '@/pages/system/user/profile';
import { keepAliveCache, useTagsViewStore, type CachedPageEntry } from '@/stores/tagsViewStore';

interface KeepAliveTabsProps {
  /** 刷新计数器 变化时重挂载当前激活的标签页 */
  refreshKey: number;
}

function currentFullPath(pathname: string, search: string) {
  return `${pathname}${search || ''}`;
}

/** 除动态路由外的两个静态布局路由 */
function renderStaticPage(pathname: string) {
  if (pathname === '/index' || pathname === '/') return <HomePage />;
  if (pathname === '/user/profile') return <ProfilePage />;
  return undefined;
}

/**
 * 基于 React 19 <Activity> 的标签页缓存(对标 Vue 版 keep-alive + cachedViews)
 * - 每个打开过的标签页对应一个 Activity 缓存实例 隐藏而非卸载 保留页面状态
 * - 关闭标签后不再渲染对应实例(等价于从 include 中剔除) 登出时 resetTags 清空缓存
 * - 通过 UNSAFE_LocationContext 冻结每个缓存页的路由上下文
 *   隐藏页不会被当前路由变化触发重渲染或重新请求
 */
export default function KeepAliveTabs({ refreshKey }: KeepAliveTabsProps) {
  const location = useLocation();
  const tags = useTagsViewStore(state => state.tags);

  const activeKey = currentFullPath(location.pathname, location.search);

  // refreshKey 变化说明用户点击了刷新 递增当前页版本号触发 Activity 重挂载
  keepAliveCache.noteRefresh(activeKey, refreshKey);

  // 登记当前路由快照(新标签首次打开)
  keepAliveCache.register(activeKey, {
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
    state: location.state,
    key: location.key
  });

  // 渲染集合 = 当前路由 + 已打开标签中登记过的页面(标签由 TagsView 在导航后登记 首帧需兜底渲染当前路由)
  const tagKeys = new Set(tags.map(tag => tag.key));
  tagKeys.add(activeKey);
  const entries: Array<[string, CachedPageEntry]> = [];
  for (const key of tagKeys) {
    const entry = keepAliveCache.get(key);
    if (entry) {
      entries.push([key, entry]);
    }
  }

  return (
    <>
      {entries.map(([key, entry]) => (
        <Activity key={`${key}:${entry.version}`} mode={key === activeKey ? 'visible' : 'hidden'}>
          <UNSAFE_LocationContext.Provider value={{ location: entry.location }}>
            {renderStaticPage(entry.location.pathname) ?? <DynamicPage />}
          </UNSAFE_LocationContext.Provider>
        </Activity>
      ))}
    </>
  );
}
