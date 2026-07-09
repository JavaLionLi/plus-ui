import { ReloadOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Empty, Spin } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { registerCurrentSnailUser } from '@/api/ai/agent';
import { getToken } from '@/utils/auth';
import { appEnv } from '@/utils/env';

function buildChatUrl(openId: string, trustedCredential: string) {
  const params = new URLSearchParams({ openId, trustedCredential });
  return `${appEnv.baseApi}/snail-chat/?${params.toString()}`;
}

export default function AiChatPage() {
  const [chatUrl, setChatUrl] = useState('');
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadChat = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const token = getToken();
      if (!token) {
        setChatUrl('');
        setLoadError('登录凭证不存在，请重新登录后再试');
        return;
      }

      const res = await registerCurrentSnailUser();
      if (!res.data?.openId) {
        setChatUrl('');
        setLoadError('获取 AI 用户身份失败');
        return;
      }

      setChatUrl(buildChatUrl(res.data.openId, token));
    } catch {
      setChatUrl('');
      setLoadError('加载 AI 聊天失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChat();
  }, [loadChat]);

  return (
    <PageContainer className="ai-chat-container" title={false}>
      <div className="ai-chat-page">
        {loading ? (
          <div className="ai-chat-loading">
            <Spin />
          </div>
        ) : null}
        {chatUrl ? (
          <iframe className="ai-chat-frame" src={chatUrl} title="Snail AI" allow="clipboard-read; clipboard-write" />
        ) : (
          <Empty className="ai-chat-empty" description={loadError || '正在加载 Snail AI'}>
            {loadError ? (
              <Button type="primary" icon={<ReloadOutlined />} onClick={loadChat}>
                重新加载
              </Button>
            ) : null}
          </Empty>
        )}
      </div>
    </PageContainer>
  );
}
