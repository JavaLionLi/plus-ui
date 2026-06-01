import { getToken } from '@/utils/auth';
import { appEnv } from '@/utils/env';

interface FlowChartProps {
  instanceId?: string | number;
}

function buildFlowChartUrl(instanceId?: string | number) {
  if (!instanceId) return '';
  const params = new URLSearchParams({
    id: String(instanceId),
    type: 'FlowChart',
    t: String(Date.now()),
    Authorization: `Bearer ${getToken() || ''}`,
    clientid: appEnv.clientId
  });
  return `${appEnv.baseApi}/warm-flow-ui/index.html?${params.toString()}`;
}

export default function FlowChart({ instanceId }: FlowChartProps) {
  const url = buildFlowChartUrl(instanceId);

  if (!url) {
    return <div className="monitor-iframe-empty">暂无流程图</div>;
  }

  return <iframe title="流程图" src={url} className="workflow-record-iframe" />;
}
