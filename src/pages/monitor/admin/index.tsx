import MonitorIframePage from '@/pages/monitor/iframePage';
import { appEnv } from '@/utils/env';

export default function MonitorAdminPage() {
  return <MonitorIframePage title="服务监控" src={appEnv.monitorAdmin} />;
}
