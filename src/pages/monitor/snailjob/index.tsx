import MonitorIframePage from '@/pages/monitor/iframePage';
import { appEnv } from '@/utils/env';

export default function MonitorSnailJobPage() {
  return <MonitorIframePage title="任务调度中心" src={appEnv.snailJobAdmin} />;
}
