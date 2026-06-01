import { history, useSearchParams } from '@umijs/max';
import { Result, Spin, message } from 'antd';
import { useEffect, useState } from 'react';
import type { LoginParams } from '@/api/types';
import { callback, login } from '@/api/login';
import { useTagsViewStore } from '@/stores/tagsViewStore';
import { getToken, setToken } from '@/utils/auth';
import { appEnv } from '@/utils/env';

export default function SocialCallback() {
  const [params] = useSearchParams();
  const resetTags = useTagsViewStore(state => state.resetTags);
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const socialCode = params.get('code') || '';
  const socialState = params.get('state') || '';
  const source = params.get('source') || '';

  useEffect(() => {
    const finish = () => {
      window.setTimeout(() => {
        history.replace('/index');
      }, 1200);
    };

    const run = async () => {
      if (!socialCode || !socialState || !source) {
        throw new Error('第三方登录回调参数缺失');
      }

      const data: LoginParams = {
        socialCode,
        socialState,
        source,
        clientId: appEnv.clientId,
        grantType: 'social'
      };

      const res = getToken() ? await callback(data) : await login(data);
      if (res.data?.access_token) {
        setToken(res.data.access_token);
        resetTags();
      }
      message.success(res.msg || '授权成功');
      setStatus('success');
      finish();
    };

    run().catch(error => {
      message.error((error as Error).message || '授权失败');
      setStatus('error');
      finish();
    });
  }, [resetTags, socialCode, socialState, source]);

  if (status === 'processing') {
    return (
      <div className="social-callback-page">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="social-callback-page">
      <Result
        status={status === 'success' ? 'success' : 'error'}
        title={status === 'success' ? '授权成功' : '授权失败'}
      />
    </div>
  );
}
