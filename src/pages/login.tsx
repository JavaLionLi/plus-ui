import { LockOutlined, SafetyOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormCheckbox, ProFormText } from '@ant-design/pro-components';
import { history, useSearchParams } from '@umijs/max';
import { Button, ConfigProvider, message, Space, Tooltip } from 'antd';
import enUS from 'antd/locale/en_US';
import zhCN from 'antd/locale/zh_CN';
import { useCallback, useEffect, useState } from 'react';
import type { VerifyCodeResult } from '@/api/types';
import { getCodeImg, login } from '@/api/login';
import { authRouterUrl } from '@/api/system/social/auth';
import giteeIcon from '@/assets/icons/svg/gitee.svg';
import githubIcon from '@/assets/icons/svg/github.svg';
import maxkeyIcon from '@/assets/icons/svg/maxkey.svg';
import topiamIcon from '@/assets/icons/svg/topiam.svg';
import wechatIcon from '@/assets/icons/svg/wechat.svg';
import LocaleSelect from '@/components/layout/LocaleSelect';
import { useAppStore } from '@/stores/appStore';
import { useTagsViewStore } from '@/stores/tagsViewStore';
import { getToken, setToken } from '@/utils/auth';
import { appEnv } from '@/utils/env';

const DEFAULT_LOGIN_REDIRECT = '/index';

function normalizeLoginRedirect(redirect?: string | null) {
  if (!redirect) return DEFAULT_LOGIN_REDIRECT;
  if (!redirect.startsWith('/') || redirect.startsWith('//')) return DEFAULT_LOGIN_REDIRECT;
  if (redirect === '/login' || redirect.startsWith('/login?')) return DEFAULT_LOGIN_REDIRECT;
  return redirect;
}

const socialProviders = [
  { source: 'wechat', label: '微信登录', icon: wechatIcon },
  { source: 'maxkey', label: 'MaxKey登录', icon: maxkeyIcon },
  { source: 'topiam', label: 'TopIam登录', icon: topiamIcon },
  { source: 'gitee', label: 'Gitee登录', icon: giteeIcon },
  { source: 'github', label: 'Github登录', icon: githubIcon }
];

function getRememberedLogin() {
  if (typeof window === 'undefined') return { rememberMe: false };
  const rememberMe = localStorage.getItem('rememberMe') === 'true';
  const username = localStorage.getItem('username') || undefined;
  return {
    username: rememberMe ? username : 'admin',
    password: rememberMe ? undefined : 'admin123',
    rememberMe
  };
}

const authText = {
  zh_CN: {
    title: '企业级后台管理系统',
    brandDesc:
      '真正面向企业级的应用框架 组件化 模块化 轻耦合 高扩展 针对企业痛点 业界一流技术栈\n' +
      '重写 RuoYi-Vue 所有功能 集成 Sa-Token、Mybatis-Plus、WarmFlow、SpringDoc、Hutool、OSS 定期同步。',
    highlights: ['动态菜单', '细粒度权限', '多主题布局', '工作流集成'],
    metrics: [
      { value: 'React+Ant', label: '前端技术栈' },
      { value: '动态权限控制', label: '细粒度权限管理' },
      { value: '全栈技术集成', label: '主流技术栈' }
    ],
    formSubTitle: '使用现有后端账号登录',
    username: '用户名',
    password: '密码',
    code: '验证码',
    rememberMe: '记住我',
    register: '注册账号',
    social: '第三方登录',
    loginSuccess: '登录成功',
    loginFail: '登录失败',
    usernameRequired: '请输入用户名',
    passwordRequired: '请输入密码',
    codeRequired: '请输入验证码'
  },
  en_US: {
    title: 'Enterprise-level Backend Management System',
    brandDesc:
      'Enterprise-grade application framework featuring componentization, modularization, loose coupling and high scalability. Tailored for enterprise pain points with industry-leading tech stack.\n' +
      'All functions of RuoYi-Vue are fully rewritten, with regular synchronization of integrated components including Sa-Token, Mybatis-Plus, WarmFlow, SpringDoc, Hutool and OSS.',
    highlights: ['Dynamic Menus', 'Fine Permissions', 'Multi Layouts', 'Workflow Ready'],
    metrics: [
      { value: 'React+Ant', label: 'Front-end Tech Stack' },
      { value: 'Dynamic Permission Control', label: 'Fine-grained Permission Management' },
      { value: 'Full-stack Technology Integration', label: 'Mainstream Tech Stack' }
    ],
    formSubTitle: 'Sign in with an existing backend account',
    username: 'Username',
    password: 'Password',
    code: 'Captcha',
    rememberMe: 'Remember me',
    register: 'Create account',
    social: 'Social sign-in',
    loginSuccess: 'Signed in successfully',
    loginFail: 'Sign in failed',
    usernameRequired: 'Please enter username',
    passwordRequired: 'Please enter password',
    codeRequired: 'Please enter captcha'
  }
};

export default function Login() {
  const [params] = useSearchParams();
  const appLocale = useAppStore(state => state.appLocale);
  const setAppLocale = useAppStore(state => state.setAppLocale);
  const resetTags = useTagsViewStore(state => state.resetTags);
  const [captcha, setCaptcha] = useState<VerifyCodeResult>({ captchaEnabled: true });
  const [initialValues] = useState(getRememberedLogin);
  const text = authText[appLocale];
  const redirect = params.get('redirect');

  const loadCaptcha = useCallback(async () => {
    const res = await getCodeImg();
    setCaptcha({
      ...res.data,
      captchaEnabled: res.data.captchaEnabled === undefined ? true : res.data.captchaEnabled
    });
  }, []);

  useEffect(() => {
    if (getToken()) {
      history.replace(normalizeLoginRedirect(redirect));
    }
  }, [redirect]);

  useEffect(() => {
    if (getToken()) return;
    loadCaptcha().catch(() => {
      setCaptcha({ captchaEnabled: false });
    });
  }, [loadCaptcha]);

  useEffect(() => {
    document.title = appEnv.title;
  }, []);

  const doSocialLogin = async (source: string) => {
    const res = await authRouterUrl(source);
    window.location.href = res.data;
  };

  return (
    <ConfigProvider locale={appLocale === 'zh_CN' ? zhCN : enUS}>
      <div className="login-page">
        <div className="auth-locale-select">
          <LocaleSelect value={appLocale} onChange={setAppLocale} />
        </div>
        <section className="login-brand">
          <h1>{text.title}</h1>
          <p>{text.brandDesc}</p>
          <div className="login-brand-highlights">
            {text.highlights.map(item => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="login-brand-metrics">
            {text.metrics.map(item => (
              <article key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </article>
            ))}
          </div>
        </section>
        <section className="login-panel">
          <div className="login-panel-inner">
            <LoginForm
              title={appEnv.logoTitle}
              subTitle={text.formSubTitle}
              initialValues={initialValues}
              onFinish={async values => {
                try {
                  if (values.rememberMe) {
                    localStorage.setItem('username', String(values.username || ''));
                    localStorage.setItem('rememberMe', 'true');
                  } else {
                    localStorage.removeItem('username');
                    localStorage.removeItem('rememberMe');
                  }
                  localStorage.removeItem('password');
                  const res = await login({
                    username: values.username,
                    password: values.password,
                    code: values.code,
                    uuid: captcha.uuid,
                    rememberMe: values.rememberMe
                  });
                  setToken(res.data.access_token);
                  resetTags();
                  message.success(text.loginSuccess);
                  history.replace(normalizeLoginRedirect(redirect));
                  return true;
                } catch (error) {
                  if (captcha.captchaEnabled) {
                    loadCaptcha();
                  }
                  message.error((error as Error).message || text.loginFail);
                  return false;
                }
              }}
            >
              <ProFormText
                name="username"
                fieldProps={{ size: 'large', prefix: <UserOutlined /> }}
                placeholder={text.username}
                rules={[{ required: true, message: text.usernameRequired }]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{ size: 'large', prefix: <LockOutlined /> }}
                placeholder={text.password}
                rules={[{ required: true, message: text.passwordRequired }]}
              />
              {captcha.captchaEnabled && (
                <div className="captcha-row">
                  <ProFormText
                    name="code"
                    fieldProps={{ size: 'large', prefix: <SafetyOutlined /> }}
                    placeholder={text.code}
                    rules={[{ required: true, message: text.codeRequired }]}
                  />
                  <button type="button" className="captcha-button" onClick={loadCaptcha}>
                    <img className="captcha-image" src={`data:image/gif;base64,${captcha.img}`} alt="captcha" />
                  </button>
                </div>
              )}
              <div className="login-form-meta">
                <ProFormCheckbox name="rememberMe">{text.rememberMe}</ProFormCheckbox>
                <Button type="link" onClick={() => history.push('/register')}>
                  {text.register}
                </Button>
              </div>
              <div className="login-social-panel">
                <span>{text.social}</span>
                <Space size={8}>
                  {socialProviders.map(item => (
                    <Tooltip key={item.source} title={item.label}>
                      <Button
                        shape="circle"
                        icon={<img className="login-social-icon" src={item.icon} alt="" />}
                        onClick={() => doSocialLogin(item.source)}
                      />
                    </Tooltip>
                  ))}
                </Space>
              </div>
            </LoginForm>
          </div>
        </section>
      </div>
    </ConfigProvider>
  );
}
