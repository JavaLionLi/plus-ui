import { PageContainer, ProCard } from '@ant-design/pro-components';

interface MonitorIframePageProps {
  title: string;
  src?: string;
}

export default function MonitorIframePage({ title, src }: MonitorIframePageProps) {
  return (
    <PageContainer title={title}>
      <ProCard>
        <div className="monitor-iframe-wrap">
          {src ? (
            <iframe className="monitor-iframe" title={title} src={src} />
          ) : (
            <div className="monitor-iframe-empty">未配置访问地址</div>
          )}
        </div>
      </ProCard>
    </PageContainer>
  );
}
