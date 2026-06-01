import { PageContainer } from '@ant-design/pro-components';
import { history, useLocation } from '@umijs/max';
import { useEffect, useMemo } from 'react';
import { getToken } from '@/utils/auth';
import { appEnv } from '@/utils/env';

export default function WorkflowProcessDefinitionDesignPage() {
  const location = useLocation();
  const iframeUrl = useMemo(() => {
    const search = new URLSearchParams(location.search);
    const definitionId = search.get('definitionId') || '';
    const params = new URLSearchParams({
      id: definitionId,
      onlyDesignShow: 'true',
      Authorization: `Bearer ${getToken() || ''}`,
      clientid: appEnv.clientId
    });
    return `${appEnv.baseApi}/warm-flow-ui/index.html?${params.toString()}`;
  }, [location.search]);

  useEffect(() => {
    const onDesignerMessage = (event: MessageEvent) => {
      if (event.data?.method === 'close') {
        const search = new URLSearchParams(location.search);
        const activeName = search.get('activeName') || '0';
        history.push(`/workflow/processDefinition?activeName=${activeName}`);
      }
    };
    window.addEventListener('message', onDesignerMessage);
    return () => window.removeEventListener('message', onDesignerMessage);
  }, [location.search]);

  return (
    <PageContainer title={false}>
      <iframe title="Warm Flow Designer" src={iframeUrl} className="warm-flow-designer-iframe" />
    </PageContainer>
  );
}
