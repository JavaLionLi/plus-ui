interface ImportMetaEnv {
  readonly VITE_APP_TITLE?: string;
  readonly VITE_APP_LOGO_TITLE?: string;
  readonly VITE_APP_BASE_API?: string;
  readonly VITE_APP_CONTEXT_PATH?: string;
  readonly VITE_APP_ENV?: string;
  readonly VITE_APP_PORT?: string;
  readonly VITE_APP_CLIENT_ID?: string;
  readonly VITE_APP_ENCRYPT?: string;
  readonly VITE_APP_RSA_PUBLIC_KEY?: string;
  readonly VITE_APP_RSA_PRIVATE_KEY?: string;
  readonly VITE_APP_MESSAGE_ENABLED?: string;
  readonly VITE_APP_MESSAGE_TRANSPORT?: string;
  readonly VITE_APP_MESSAGE_PATH?: string;
  readonly VITE_APP_MONITOR_ADMIN?: string;
  readonly VITE_APP_SNAILJOB_ADMIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  glob: <T = unknown>(pattern: string, options: { eager: true; as: 'url' }) => Record<string, T>;
}

declare module '*.less';
declare module '*.css';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.webp';
declare module '*.gif';
declare module '*.svg';
declare module 'antd/dist/reset.css';
