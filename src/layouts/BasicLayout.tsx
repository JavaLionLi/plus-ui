import type { CSSProperties, ReactNode } from 'react';
import { LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { ProLayout } from '@ant-design/pro-components';
import { history, Outlet, useLocation } from '@umijs/max';
import { Button, ConfigProvider, Dropdown, message, Spin, Tooltip, theme as antdTheme, type MenuProps } from 'antd';
import enUS from 'antd/locale/en_US';
import zhCN from 'antd/locale/zh_CN';
import 'dayjs/locale/zh-cn';
import dayjs from 'dayjs';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { RuntimeMenuItem } from '@/api/types';
import { logout } from '@/api/login';
import { isHandledRequestError } from '@/api/request';
import defaultAvatar from '@/assets/images/profile.jpg';
import appLogo from '@/assets/logo/logo.png';
import ExternalLinkButton from '@/components/layout/ExternalLinkButton';
import LayoutSettings from '@/components/layout/LayoutSettings';
import LocaleSelect from '@/components/layout/LocaleSelect';
import MenuSearch from '@/components/layout/MenuSearch';
import MessageBox from '@/components/layout/MessageBox';
import Screenfull from '@/components/layout/Screenfull';
import SizeSelect from '@/components/layout/SizeSelect';
import TagsView from '@/components/layout/TagsView';
import { useAppStore } from '@/stores/appStore';
import { usePermissionStore } from '@/stores/permissionStore';
import { useTagsViewStore } from '@/stores/tagsViewStore';
import { useUserStore } from '@/stores/userStore';
import { getToken, removeToken } from '@/utils/auth';
import { appEnv } from '@/utils/env';
import { appendRouteQuery, flattenBackendRoutes, routeIcon } from '@/utils/menu';
import { closePush, initMessageBox, initPush } from '@/utils/push';
import { isHttp } from '@/utils/ruoyi';

function resolveMenuPath(item: RuntimeMenuItem) {
  if (!item.path) return '';
  return appendRouteQuery(item.path, item.backendRoute?.query);
}

function menuNode(item: RuntimeMenuItem) {
  return (
    <span className="layout-menu-node">
      {item.icon && <span className="layout-menu-node-icon">{item.icon}</span>}
      <span className="layout-menu-node-title">{item.name}</span>
    </span>
  );
}

export default function BasicLayout() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const pushStartedRef = useRef(false);
  const userInfo = useUserStore(state => state.userInfo);
  const clearUserInfo = useUserStore(state => state.clearUserInfo);
  const backendRoutes = usePermissionStore(state => state.backendRoutes);
  const menuData = usePermissionStore(state => state.menuData);
  const reloadMenus = usePermissionStore(state => state.reloadMenus);
  const clearMenus = usePermissionStore(state => state.clearMenus);
  const resetTags = useTagsViewStore(state => state.resetTags);
  const settingsOpen = useAppStore(state => state.settingsOpen);
  const setSettingsOpen = useAppStore(state => state.setSettingsOpen);
  const layoutSettings = useAppStore(state => state.layoutSettings);
  const setLayoutSettings = useAppStore(state => state.setLayoutSettings);
  const appLocale = useAppStore(state => state.appLocale);
  const setAppLocale = useAppStore(state => state.setAppLocale);
  const componentSize = useAppStore(state => state.componentSize);
  const setComponentSize = useAppStore(state => state.setComponentSize);

  useEffect(() => {
    if (!getToken()) {
      closePush();
      pushStartedRef.current = false;
      history.replace(`/login?redirect=${encodeURIComponent(`${location.pathname}${location.search}`)}`);
      return;
    }
    reloadMenus()
      .then(async () => {
        if (!pushStartedRef.current) {
          await initMessageBox();
          initPush();
          pushStartedRef.current = true;
        }
      })
      .catch(error => {
        if (!isHandledRequestError(error)) {
          message.error(error.message || '加载用户信息失败');
        }
        closePush();
        pushStartedRef.current = false;
        removeToken();
        clearUserInfo();
        clearMenus();
        resetTags();
        history.replace('/login');
      })
      .finally(() => setLoading(false));
  }, [clearMenus, clearUserInfo, location.pathname, location.search, reloadMenus, resetTags]);

  useEffect(() => () => closePush(), []);

  const appTitle = appEnv.title;
  const brandTitle = appEnv.logoTitle;
  const effectiveNavDark = layoutSettings.darkMode || layoutSettings.sideTheme === 'realDark';
  const appColors = useMemo(
    () =>
      layoutSettings.darkMode
        ? {
            bg: '#0f172a',
            surface: '#111827',
            surfaceMuted: '#1f2937',
            elevated: '#1f2937',
            border: '#334155',
            text: '#e5e7eb',
            textSecondary: '#94a3b8',
            primarySoft: 'rgba(64, 158, 255, 0.18)',
            link: '#409eff',
            linkStrong: '#69b1ff',
            linkSoft: 'rgba(64, 158, 255, 0.18)',
            linkBorder: 'rgba(64, 158, 255, 0.42)',
            textMuted: '#94a3b8',
            textDisabled: '#64748b',
            danger: '#ff7875',
            borderStrong: '#475569',
            borderSubtle: '#334155'
          }
        : {
            bg: '#f5f7fb',
            surface: '#fff',
            surfaceMuted: '#f8fafc',
            elevated: '#fff',
            border: '#edf0f5',
            text: '#172033',
            textSecondary: '#5d6b82',
            primarySoft: '#eaf3ff',
            link: '#1677ff',
            linkStrong: '#0958d9',
            linkSoft: '#e6f4ff',
            linkBorder: '#91caff',
            textMuted: '#8c8c8c',
            textDisabled: '#bfbfbf',
            danger: '#ff4d4f',
            borderStrong: '#d9d9d9',
            borderSubtle: '#e5e7eb'
          },
    [layoutSettings.darkMode]
  );
  const navColors = useMemo(() => {
    if (effectiveNavDark) {
      return {
        bg: '#111827',
        border: 'rgba(255, 255, 255, 0.08)',
        text: 'rgba(255, 255, 255, 0.72)',
        title: 'rgba(255, 255, 255, 0.92)',
        activeText: '#fff',
        actionHoverBg: 'rgba(255, 255, 255, 0.1)',
        menuHoverBg: 'rgba(255, 255, 255, 0.08)',
        menuSelectedBg: layoutSettings.theme,
        badgeShadow: '#111827'
      };
    }

    return {
      bg: '#fff',
      border: '#edf0f5',
      text: '#5d6b82',
      title: '#172033',
      activeText: layoutSettings.theme,
      actionHoverBg: 'rgba(23, 32, 51, 0.04)',
      menuHoverBg: 'rgba(23, 32, 51, 0.04)',
      menuSelectedBg: '#eaf3ff',
      badgeShadow: '#fff'
    };
  }, [layoutSettings.theme, effectiveNavDark]);
  const proLayoutKey = [
    layoutSettings.navType,
    layoutSettings.sideTheme,
    layoutSettings.darkMode ? 'dark' : 'light',
    layoutSettings.fixedHeader ? 'fixed' : 'static',
    layoutSettings.sidebarLogo ? 'logo' : 'no-logo'
  ].join(':');
  const proLayoutClassName =
    [
      layoutSettings.fixedHeader ? undefined : 'layout-header-static-react',
      effectiveNavDark ? 'layout-nav-dark-react' : 'layout-nav-light-react',
      layoutSettings.fullHeightTable ? 'layout-full-height-table-react' : undefined
    ]
      .filter(Boolean)
      .join(' ') || undefined;
  const proLayoutStyle = {
    '--layout-primary-react': layoutSettings.theme,
    '--layout-nav-bg-react': navColors.bg,
    '--layout-nav-border-react': navColors.border,
    '--layout-nav-text-react': navColors.text,
    '--layout-nav-title-react': navColors.title,
    '--layout-nav-active-text-react': navColors.activeText,
    '--layout-nav-action-hover-bg-react': navColors.actionHoverBg,
    '--layout-nav-menu-hover-bg-react': navColors.menuHoverBg,
    '--layout-nav-menu-selected-bg-react': navColors.menuSelectedBg,
    '--layout-nav-badge-shadow-react': navColors.badgeShadow,
    '--layout-collapsed-button-bg-react': effectiveNavDark ? navColors.bg : appColors.surface,
    '--layout-collapsed-button-hover-bg-react': effectiveNavDark ? '#1f2937' : navColors.actionHoverBg,
    backgroundColor: appColors.bg
  } as CSSProperties;
  const proLayoutContentStyle = {
    backgroundColor: appColors.bg,
    transition: 'background-color 0.2s ease'
  } as CSSProperties;
  const proLayoutToken = useMemo(() => {
    const pageContainerToken = {
      bgLayout: appColors.bg,
      pageContainer: {
        colorBgPageContainer: appColors.bg,
        colorBgPageContainerFixed: appColors.surface
      }
    };

    if (!effectiveNavDark) {
      return {
        ...pageContainerToken,
        header: {
          colorBgHeader: navColors.bg,
          colorBgScrollHeader: navColors.bg,
          colorHeaderTitle: navColors.title,
          colorTextMenu: navColors.text,
          colorTextMenuSecondary: '#697386',
          colorTextMenuSelected: navColors.title,
          colorTextMenuActive: navColors.title,
          colorBgMenuItemHover: navColors.menuHoverBg,
          colorBgMenuItemSelected: 'transparent',
          colorTextRightActionsItem: navColors.text,
          colorBgRightActionsItemHover: navColors.actionHoverBg
        },
        sider: {
          colorBgCollapsedButton: appColors.surface,
          colorTextCollapsedButton: navColors.text,
          colorTextCollapsedButtonHover: navColors.title,
          colorMenuBackground: navColors.bg,
          colorMenuItemDivider: navColors.border,
          colorBgMenuItemHover: navColors.menuHoverBg,
          colorBgMenuItemSelected: navColors.menuSelectedBg,
          colorTextMenuItemHover: navColors.title,
          colorTextMenuSelected: layoutSettings.theme,
          colorTextMenuActive: navColors.title,
          colorTextMenu: navColors.text,
          colorTextMenuSecondary: '#697386',
          colorTextMenuTitle: navColors.title,
          colorTextSubMenuSelected: layoutSettings.theme
        }
      };
    }

    return {
      ...pageContainerToken,
      header: {
        colorBgHeader: navColors.bg,
        colorBgScrollHeader: navColors.bg,
        colorHeaderTitle: navColors.title,
        colorTextMenu: navColors.text,
        colorTextMenuSecondary: 'rgba(255, 255, 255, 0.48)',
        colorTextMenuSelected: navColors.activeText,
        colorTextMenuActive: navColors.activeText,
        colorBgMenuItemHover: navColors.menuHoverBg,
        colorBgMenuItemSelected: 'rgba(255, 255, 255, 0.12)',
        colorTextRightActionsItem: navColors.text,
        colorBgRightActionsItemHover: navColors.actionHoverBg
      },
      sider: {
        colorBgCollapsedButton: appColors.surface,
        colorTextCollapsedButton: navColors.text,
        colorTextCollapsedButtonHover: navColors.activeText,
        colorMenuBackground: navColors.bg,
        colorMenuItemDivider: navColors.border,
        colorBgMenuItemHover: navColors.menuHoverBg,
        colorBgMenuItemSelected: navColors.menuSelectedBg,
        colorTextMenuItemHover: navColors.activeText,
        colorTextMenuSelected: navColors.activeText,
        colorTextMenuActive: navColors.activeText,
        colorTextMenu: navColors.text,
        colorTextMenuSecondary: 'rgba(255, 255, 255, 0.48)',
        colorTextMenuTitle: navColors.title,
        colorTextSubMenuSelected: navColors.activeText
      }
    };
  }, [appColors, layoutSettings.theme, navColors, effectiveNavDark]);
  const renderLayoutBrand = (logo: ReactNode, _title: ReactNode, props?: { collapsed?: boolean }) => (
    <span className="layout-brand-link">
      {logo}
      {!props?.collapsed && <span className="layout-brand-title">{brandTitle}</span>}
    </span>
  );
  const menuHeaderRender = !layoutSettings.sidebarLogo || layoutSettings.navType === 'mix' ? false : renderLayoutBrand;
  const headerTitleRender = layoutSettings.sidebarLogo ? renderLayoutBrand : false;
  const currentTitle = useMemo(() => {
    const route = flattenBackendRoutes(backendRoutes).find(item => item.fullPath === location.pathname);
    return route?.meta?.title;
  }, [backendRoutes, location.pathname]);

  useEffect(() => {
    document.title = layoutSettings.dynamicTitle && currentTitle ? `${currentTitle} - ${appTitle}` : appTitle;
  }, [appTitle, currentTitle, layoutSettings.dynamicTitle]);

  useEffect(() => {
    dayjs.locale(appLocale === 'zh_CN' ? 'zh-cn' : 'en');
  }, [appLocale]);

  useLayoutEffect(() => {
    document.documentElement.style.setProperty('--layout-primary-react', layoutSettings.theme);
    document.documentElement.style.setProperty('--layout-radius-react', `${layoutSettings.radiusBase}px`);
    document.documentElement.style.setProperty('--layout-nav-bg-react', navColors.bg);
    document.documentElement.style.setProperty('--layout-nav-border-react', navColors.border);
    document.documentElement.style.setProperty('--layout-nav-text-react', navColors.text);
    document.documentElement.style.setProperty('--layout-nav-title-react', navColors.title);
    document.documentElement.style.setProperty('--layout-nav-active-text-react', navColors.activeText);
    document.documentElement.style.setProperty('--layout-nav-action-hover-bg-react', navColors.actionHoverBg);
    document.documentElement.style.setProperty('--layout-nav-menu-hover-bg-react', navColors.menuHoverBg);
    document.documentElement.style.setProperty('--layout-nav-menu-selected-bg-react', navColors.menuSelectedBg);
    document.documentElement.style.setProperty('--layout-nav-badge-shadow-react', navColors.badgeShadow);
    document.documentElement.style.setProperty('--app-bg-react', appColors.bg);
    document.documentElement.style.setProperty('--app-surface-react', appColors.surface);
    document.documentElement.style.setProperty('--app-surface-muted-react', appColors.surfaceMuted);
    document.documentElement.style.setProperty('--app-border-react', appColors.border);
    document.documentElement.style.setProperty('--app-text-react', appColors.text);
    document.documentElement.style.setProperty('--app-text-secondary-react', appColors.textSecondary);
    document.documentElement.style.setProperty('--app-primary-soft-react', appColors.primarySoft);
    document.documentElement.style.setProperty('--app-link-react', appColors.link);
    document.documentElement.style.setProperty('--app-link-strong-react', appColors.linkStrong);
    document.documentElement.style.setProperty('--app-link-soft-react', appColors.linkSoft);
    document.documentElement.style.setProperty('--app-link-border-react', appColors.linkBorder);
    document.documentElement.style.setProperty('--app-text-muted-react', appColors.textMuted);
    document.documentElement.style.setProperty('--app-text-disabled-react', appColors.textDisabled);
    document.documentElement.style.setProperty('--app-danger-react', appColors.danger);
    document.documentElement.style.setProperty('--app-border-strong-react', appColors.borderStrong);
    document.documentElement.style.setProperty('--app-border-subtle-react', appColors.borderSubtle);
    document.body.style.backgroundColor = appColors.bg;
  }, [appColors, layoutSettings.radiusBase, layoutSettings.theme, navColors]);

  useLayoutEffect(() => {
    document.body.classList.remove(
      'layout-nav-dark-react',
      'layout-nav-light-react',
      'layout-dark-mode-react',
      'layout-light-mode-react'
    );
    document.body.classList.add(effectiveNavDark ? 'layout-nav-dark-react' : 'layout-nav-light-react');
    document.body.classList.add(layoutSettings.darkMode ? 'layout-dark-mode-react' : 'layout-light-mode-react');
    document.documentElement.classList.toggle('dark', layoutSettings.darkMode);
    document.documentElement.dataset.theme = layoutSettings.darkMode ? 'dark' : 'light';
    return () => {
      document.body.classList.remove(
        'layout-nav-dark-react',
        'layout-nav-light-react',
        'layout-dark-mode-react',
        'layout-light-mode-react'
      );
      document.documentElement.classList.remove('dark');
      delete document.documentElement.dataset.theme;
    };
  }, [layoutSettings.darkMode, effectiveNavDark]);

  const userMenu: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => history.push('/user/profile')
    },
    {
      key: 'setting',
      icon: <SettingOutlined />,
      label: '布局设置',
      onClick: () => setSettingsOpen(true)
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: async () => {
        try {
          await logout();
        } finally {
          closePush();
          pushStartedRef.current = false;
          removeToken();
          clearUserInfo();
          clearMenus();
          resetTags();
          history.replace('/login');
        }
      }
    }
  ];

  if (loading) {
    return (
      <div style={{ display: 'grid', minHeight: '100vh', placeItems: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <ConfigProvider
      key={layoutSettings.darkMode ? 'app-dark' : 'app-light'}
      componentSize={componentSize}
      locale={appLocale === 'zh_CN' ? zhCN : enUS}
      theme={{
        algorithm: layoutSettings.darkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: layoutSettings.theme,
          borderRadius: layoutSettings.radiusBase,
          colorBgLayout: appColors.bg,
          colorBgContainer: appColors.surface,
          colorBgElevated: appColors.elevated
        }
      }}
    >
      <ProLayout
        key={proLayoutKey}
        className={proLayoutClassName}
        style={proLayoutStyle}
        title={layoutSettings.sidebarLogo ? brandTitle : false}
        logo={layoutSettings.sidebarLogo ? <img className="layout-logo-mark" src={appLogo} alt="logo" /> : false}
        colorPrimary={layoutSettings.theme}
        token={proLayoutToken}
        layout={layoutSettings.navType}
        contentStyle={proLayoutContentStyle}
        navTheme="light"
        theme={effectiveNavDark ? 'dark' : 'light'}
        menuProps={{ theme: effectiveNavDark ? 'dark' : 'light' }}
        fixedHeader={layoutSettings.fixedHeader}
        menuHeaderRender={menuHeaderRender}
        headerTitleRender={headerTitleRender}
        location={{ pathname: location.pathname }}
        route={{ path: '/', routes: [{ path: '/index', name: '首页', icon: routeIcon('dashboard') }, ...menuData] }}
        menuItemRender={(item, _dom) => (
          <button
            type="button"
            className="layout-menu-link"
            onClick={() => {
              const targetPath = resolveMenuPath(item as RuntimeMenuItem);
              if (!targetPath) return;
              if (isHttp(targetPath)) {
                window.open(targetPath, '_blank', 'noopener,noreferrer');
                return;
              }
              history.push(targetPath);
            }}
          >
            {menuNode(item as RuntimeMenuItem)}
          </button>
        )}
        subMenuItemRender={(item, _dom) => menuNode(item as RuntimeMenuItem)}
        avatarProps={{
          src: userInfo?.user.avatarUrl || defaultAvatar,
          title: userInfo?.user.nickName || userInfo?.user.userName,
          render: (_, dom) => (
            <Dropdown menu={{ items: userMenu }} placement="bottomRight" trigger={['click']}>
              {dom}
            </Dropdown>
          )
        }}
        actionsRender={() => [
          <MenuSearch key="search" />,
          <MessageBox key="message" userId={userInfo?.user.userId} />,
          <ExternalLinkButton key="git" type="git" />,
          <ExternalLinkButton key="doc" type="doc" />,
          <Screenfull key="screenfull" />,
          <LocaleSelect key="locale" value={appLocale} onChange={setAppLocale} />,
          <SizeSelect key="size" value={componentSize} onChange={setComponentSize} />,
          <Tooltip key="setting" title="布局设置">
            <Button
              type="text"
              className="layout-action-button"
              icon={<SettingOutlined />}
              aria-label="布局设置"
              onClick={() => setSettingsOpen(true)}
            />
          </Tooltip>
        ]}
      >
        {layoutSettings.tagsView && (
          <TagsView
            persist={layoutSettings.tagsViewPersist}
            showIcon={layoutSettings.tagsIcon}
            onRefresh={() => setRefreshKey(value => value + 1)}
          />
        )}
        <Outlet key={`${location.pathname}${location.search}:${refreshKey}`} />
      </ProLayout>
      <LayoutSettings
        open={settingsOpen}
        value={layoutSettings}
        onChange={setLayoutSettings}
        onOpenChange={setSettingsOpen}
      />
    </ConfigProvider>
  );
}
