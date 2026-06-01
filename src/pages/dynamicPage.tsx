import { PageContainer, ProCard } from '@ant-design/pro-components';
import { useLocation } from '@umijs/max';
import { useMemo } from 'react';
import AiChatPage from '@/pages/ai/chat';
import DemoDemoPage from '@/pages/demo/demo';
import DemoTreePage from '@/pages/demo/tree';
import MonitorAdminPage from '@/pages/monitor/admin';
import MonitorCachePage from '@/pages/monitor/cache';
import MonitorIframePage from '@/pages/monitor/iframePage';
import MonitorLoginInfoPage from '@/pages/monitor/logininfo';
import MonitorOnlinePage from '@/pages/monitor/online';
import MonitorOperlogPage from '@/pages/monitor/operlog';
import MonitorSnailJobPage from '@/pages/monitor/snailjob';
import SystemClientPage from '@/pages/system/client';
import SystemConfigPage from '@/pages/system/config';
import SystemDeptPage from '@/pages/system/dept';
import SystemDictPage from '@/pages/system/dict';
import SystemMenuPage from '@/pages/system/menu';
import SystemNoticePage from '@/pages/system/notice';
import SystemOssPage from '@/pages/system/oss';
import SystemOssConfigPage from '@/pages/system/oss/config';
import SystemPostPage from '@/pages/system/post';
import SystemRolePage from '@/pages/system/role';
import RoleAuthUserPage from '@/pages/system/role/authUser';
import SystemUserPage from '@/pages/system/user';
import UserAuthRolePage from '@/pages/system/user/authRole';
import ToolGenPage from '@/pages/tool/gen';
import ToolGenEditPage from '@/pages/tool/gen/edit';
import WorkflowCategoryPage from '@/pages/workflow/category';
import WorkflowLeavePage from '@/pages/workflow/leave';
import WorkflowLeaveEditPage from '@/pages/workflow/leave/leaveEdit';
import WorkflowProcessDefinitionPage from '@/pages/workflow/processDefinition';
import WorkflowProcessDefinitionDesignPage from '@/pages/workflow/processDefinition/design';
import WorkflowProcessInstancePage from '@/pages/workflow/processInstance';
import WorkflowSpelPage from '@/pages/workflow/spel';
import WorkflowAllTaskWaitingPage from '@/pages/workflow/task/allTaskWaiting';
import WorkflowMyDocumentPage from '@/pages/workflow/task/myDocument';
import WorkflowTaskCopyPage from '@/pages/workflow/task/taskCopyList';
import WorkflowTaskFinishPage from '@/pages/workflow/task/taskFinish';
import WorkflowTaskWaitingPage from '@/pages/workflow/task/taskWaiting';
import { usePermissionStore } from '@/stores/permissionStore';
import { flattenBackendRoutes } from '@/utils/menu';

const migratedPages: Record<string, React.ComponentType> = {
  'ai/chat/index': AiChatPage,
  'demo/demo/index': DemoDemoPage,
  'demo/tree/index': DemoTreePage,
  'monitor/admin/index': MonitorAdminPage,
  'monitor/cache/index': MonitorCachePage,
  'monitor/logininfo/index': MonitorLoginInfoPage,
  'monitor/online/index': MonitorOnlinePage,
  'monitor/operlog/index': MonitorOperlogPage,
  'monitor/snailjob/index': MonitorSnailJobPage,
  'system/client/index': SystemClientPage,
  'system/config/index': SystemConfigPage,
  'system/dept/index': SystemDeptPage,
  'system/dict/index': SystemDictPage,
  'system/menu/index': SystemMenuPage,
  'system/notice/index': SystemNoticePage,
  'system/oss/config': SystemOssConfigPage,
  'system/ossConfig/index': SystemOssConfigPage,
  'system/oss-config/index': SystemOssConfigPage,
  'system/oss/index': SystemOssPage,
  'system/post/index': SystemPostPage,
  'system/role/authUser': RoleAuthUserPage,
  'system/role/index': SystemRolePage,
  'system/user/authRole': UserAuthRolePage,
  'system/user/index': SystemUserPage,
  'tool/gen/editTable': ToolGenEditPage,
  'tool/gen/index': ToolGenPage,
  'tool/gen/edit': ToolGenEditPage,
  'tool/gen-edit/index': ToolGenEditPage,
  'workflow/category/index': WorkflowCategoryPage,
  'workflow/leave/leaveEdit': WorkflowLeaveEditPage,
  'workflow/leave/index': WorkflowLeavePage,
  'workflow/leaveEdit/index': WorkflowLeaveEditPage,
  'workflow/processDefinition/design': WorkflowProcessDefinitionDesignPage,
  'workflow/processDefinition/index': WorkflowProcessDefinitionPage,
  'workflow/processInstance/index': WorkflowProcessInstancePage,
  'workflow/spel/index': WorkflowSpelPage,
  'workflow/task/allTaskWaiting/index': WorkflowAllTaskWaitingPage,
  'workflow/task/allTaskWaiting': WorkflowAllTaskWaitingPage,
  'workflow/task/myDocument/index': WorkflowMyDocumentPage,
  'workflow/task/myDocument': WorkflowMyDocumentPage,
  'workflow/task/taskCopyList/index': WorkflowTaskCopyPage,
  'workflow/task/taskCopyList': WorkflowTaskCopyPage,
  'workflow/task/taskFinish/index': WorkflowTaskFinishPage,
  'workflow/task/taskFinish': WorkflowTaskFinishPage,
  'workflow/task/taskList/index': WorkflowTaskWaitingPage,
  'workflow/task/taskList': WorkflowTaskWaitingPage,
  'workflow/task/taskWaiting/index': WorkflowTaskWaitingPage,
  'workflow/task/taskWaiting': WorkflowTaskWaitingPage
};

const migratedPathPrefixes: Array<[string, React.ComponentType]> = [
  ['/system/oss-config/index', SystemOssConfigPage],
  ['/system/role-auth/user/', RoleAuthUserPage],
  ['/system/user-auth/role/', UserAuthRolePage],
  ['/tool/gen-edit/index/', ToolGenEditPage],
  ['/workflow/design/index', WorkflowProcessDefinitionDesignPage],
  ['/workflow/leaveEdit/index', WorkflowLeaveEditPage]
];

function normalizeComponentKey(component?: string) {
  return (component || '')
    .replace(/^@\/views\//, '')
    .replace(/^\.?\//, '')
    .replace(/\.vue$/, '')
    .replace(/\/$/, '');
}

export default function DynamicPage() {
  const location = useLocation();
  const backendRoutes = usePermissionStore(state => state.backendRoutes);
  const currentRoute = useMemo(
    () => flattenBackendRoutes(backendRoutes).find(route => route.fullPath === location.pathname),
    [backendRoutes, location.pathname]
  );
  const componentKey = normalizeComponentKey(currentRoute?.component);
  const MigratedPage =
    migratedPages[componentKey] || migratedPathPrefixes.find(([prefix]) => location.pathname.startsWith(prefix))?.[1];
  const iframeLink = currentRoute?.meta?.link;

  if (MigratedPage) {
    return <MigratedPage />;
  }

  if (iframeLink) {
    const search = location.search || '';
    const src = search ? `${iframeLink}${iframeLink.includes('?') ? '&' : '?'}${search.slice(1)}` : iframeLink;
    return <MonitorIframePage title={currentRoute?.meta?.title || currentRoute?.name || '内嵌页面'} src={src} />;
  }

  return (
    <PageContainer title={currentRoute?.meta?.title || '页面迁移中'}>
      <ProCard>
        <h2 className="dynamic-placeholder-title">{currentRoute?.meta?.title || '页面迁移中'}</h2>
        <p>这个路由已经从后端菜单加载，React 页面还未迁移。</p>
        <p className="dynamic-placeholder-path">path: {location.pathname}</p>
        <p className="dynamic-placeholder-path">component: {componentKey || '-'}</p>
      </ProCard>
    </PageContainer>
  );
}
