import {
  ApartmentOutlined,
  ApiOutlined,
  AppstoreOutlined,
  AuditOutlined,
  BellOutlined,
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloudOutlined,
  ClusterOutlined,
  CodeOutlined,
  CompassOutlined,
  ContainerOutlined,
  CopyOutlined,
  ControlOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  DeploymentUnitOutlined,
  DesktopOutlined,
  FileDoneOutlined,
  FileProtectOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  FolderOutlined,
  FormOutlined,
  HddOutlined,
  HistoryOutlined,
  KeyOutlined,
  LockOutlined,
  MonitorOutlined,
  PartitionOutlined,
  ProfileOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
  ScheduleOutlined,
  SettingOutlined,
  TeamOutlined,
  ToolOutlined,
  UserOutlined,
  UserSwitchOutlined
} from '@ant-design/icons';
import { Icon } from '@iconify/react';
import type { BackendRoute, RuntimeMenuItem } from '@/api/types';
import { isHttp, normalizePath } from '@/utils/ruoyi';

const svgIconModules = import.meta.glob<string>('../assets/icons/svg/*.svg', {
  eager: true,
  as: 'url'
});
const svgIconMap = Object.fromEntries(
  Object.entries(svgIconModules).map(([path, url]) => {
    const fileName = path.substring(path.lastIndexOf('/') + 1, path.lastIndexOf('.svg'));
    return [fileName, url];
  })
) as Record<string, string>;

const iconMap: Record<string, React.ReactNode> = {
  dashboard: <DashboardOutlined />,
  guide: <CompassOutlined />,
  user: <UserOutlined />,
  users: <TeamOutlined />,
  peopels: <TeamOutlined />,
  peoples: <TeamOutlined />,
  system: <SettingOutlined />,
  monitor: <MonitorOutlined />,
  tool: <ToolOutlined />,
  form: <FileTextOutlined />,
  list: <AppstoreOutlined />,
  tree: <PartitionOutlined />,
  'tree-table': <PartitionOutlined />,
  treeTable: <PartitionOutlined />,
  edit: <FormOutlined />,
  post: <ProfileOutlined />,
  dict: <BookOutlined />,
  config: <ControlOutlined />,
  client: <ApiOutlined />,
  international: <ApiOutlined />,
  online: <DesktopOutlined />,
  log: <FileSearchOutlined />,
  logininfo: <FileProtectOutlined />,
  logininfor: <FileProtectOutlined />,
  cache: <DatabaseOutlined />,
  server: <HddOutlined />,
  job: <ScheduleOutlined />,
  swagger: <ApiOutlined />,
  code: <CodeOutlined />,
  build: <ContainerOutlined />,
  redis: <DatabaseOutlined />,
  oss: <CloudOutlined />,
  notice: <BellOutlined />,
  message: <BellOutlined />,
  workflow: <DeploymentUnitOutlined />,
  'my-task': <ScheduleOutlined />,
  myTask: <ScheduleOutlined />,
  component: <ClusterOutlined />,
  process: <DeploymentUnitOutlined />,
  'process-definition': <DeploymentUnitOutlined />,
  processDefinition: <DeploymentUnitOutlined />,
  category: <FolderOutlined />,
  waiting: <ClockCircleOutlined />,
  finish: <CheckCircleOutlined />,
  input: <FormOutlined />,
  upload: <CloudOutlined />,
  checkbox: <CheckCircleOutlined />,
  'my-copy': <CopyOutlined />,
  copy: <CopyOutlined />,
  approval: <AuditOutlined />,
  record: <HistoryOutlined />,
  deploy: <DeploymentUnitOutlined />,
  instance: <ApartmentOutlined />,
  lock: <LockOutlined />,
  key: <KeyOutlined />,
  safety: <SafetyCertificateOutlined />,
  ai: <RobotOutlined />,
  chat: <RobotOutlined />,
  'user-switch': <UserSwitchOutlined />,
  userSwitch: <UserSwitchOutlined />,
  usergroup: <TeamOutlined />,
  'file-done': <FileDoneOutlined />,
  fileDone: <FileDoneOutlined />
};

export function routeIcon(icon?: string | null) {
  const iconValue = typeof icon === 'string' ? icon.trim() : '';
  if (!iconValue) return <AppstoreOutlined />;
  const normalizedIcon = iconValue.replace(/^i-/, '');
  if (normalizedIcon.includes(':')) return <Icon icon={normalizedIcon} />;
  const svgIcon = svgIconMap[normalizedIcon] || svgIconMap[normalizedIcon.toLowerCase()];
  if (svgIcon) {
    return (
      <span
        className="vue-svg-icon-react"
        style={{ '--vue-svg-icon-url': `url("${svgIcon}")` } as React.CSSProperties}
      />
    );
  }
  return iconMap[iconValue] || iconMap[normalizedIcon] || iconMap[normalizedIcon.toLowerCase()] || <AppstoreOutlined />;
}

function joinPath(parentPath: string, childPath: string) {
  if (isHttp(childPath)) return childPath;
  if (childPath.startsWith('/')) return childPath;
  if (!parentPath || parentPath === '/') return normalizePath(childPath);
  return normalizePath(`${parentPath}/${childPath}`);
}

export function backendRoutesToMenu(routes: BackendRoute[] = [], parentPath = ''): RuntimeMenuItem[] {
  return routes
    .filter(route => !route.hidden)
    .map(route => {
      const path = joinPath(parentPath, route.path);
      const visibleChildren = (route.children || []).filter(child => !child.hidden);
      if (visibleChildren.length === 1 && !route.alwaysShow && !visibleChildren[0].children?.length) {
        const child = visibleChildren[0];
        const childPath = joinPath(path, child.path);
        return {
          path: childPath,
          name: child.meta?.title || child.name || child.path,
          icon: routeIcon(child.meta?.icon || route.meta?.icon),
          backendRoute: child
        };
      }

      const children = visibleChildren.length ? backendRoutesToMenu(visibleChildren, path) : undefined;
      return {
        path,
        name: route.meta?.title || route.name || route.path,
        icon: routeIcon(route.meta?.icon),
        backendRoute: route,
        routes: children
      };
    });
}

export function appendRouteQuery(path: string, routeQuery?: string) {
  if (!routeQuery || isHttp(path)) return path;
  try {
    const params = new URLSearchParams(JSON.parse(routeQuery) as Record<string, string>);
    const search = params.toString();
    return search ? `${path}?${search}` : path;
  } catch {
    return path;
  }
}

export function flattenBackendRoutes(
  routes: BackendRoute[],
  parentPath = ''
): Array<BackendRoute & { fullPath: string }> {
  const result: Array<BackendRoute & { fullPath: string }> = [];
  for (const route of routes) {
    const fullPath = joinPath(parentPath, route.path);
    result.push({ ...route, fullPath });
    if (route.children?.length) {
      result.push(...flattenBackendRoutes(route.children, fullPath));
    }
  }
  return result;
}
