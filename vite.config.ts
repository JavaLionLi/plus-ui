import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

type AppEnv = Record<string, string>;

type ConfigEnv = {
  mode: string;
  command: string;
};

type ManualChunks = (id: string) => string | undefined;

type ProxyTarget = {
  target: string;
  changeOrigin: boolean;
  ws: boolean;
  rewrite: (path: string) => string;
};

type ViteConfig = {
  base: string;
  resolve: {
    alias?: Record<string, string>;
    extensions: string[];
  };
  optimizeDeps: ReturnType<typeof createViteOptimizeDepsConfig>;
  server: {
    host: string;
    port: number;
    open: boolean;
    proxy: Record<string, ProxyTarget>;
  };
  build: ReturnType<typeof createViteBuildConfig>;
};

const envFiles: Record<string, string> = {
  development: '.env.development',
  production: '.env.production'
};

const resolvePath = (path: string) => resolve(process.cwd(), path);

const stripQuote = (value: string) => {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
};

const readEnvFile = (mode: string) => {
  const envFile = envFiles[mode] || envFiles.development;
  const envPath = resolvePath(envFile);
  const env: AppEnv = {};

  if (!existsSync(envPath)) {
    return env;
  }

  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1);
    if (key) {
      env[key] = stripQuote(value);
    }
  }

  return env;
};

export function getAppEnv(mode = process.env.UMI_ENV || process.env.NODE_ENV || 'development') {
  const normalizedMode = mode === 'production' ? 'production' : 'development';
  return {
    ...readEnvFile(normalizedMode),
    ...process.env
  } as AppEnv;
}

const manualChunks: ManualChunks = id => {
  if (id.includes('@ant-design/pro-components') || id.includes('@ant-design+pro-components')) {
    return 'ant-design-pro-components';
  }
  return undefined;
};

export function createViteOptimizeDepsConfig() {
  return {
    include: [
      '@ant-design/icons',
      '@ant-design/pro-components',
      '@ant-design/x',
      '@wangeditor-next/editor',
      '@wangeditor-next/editor-for-react',
      '@iconify/react',
      '@tanstack/react-query',
      'ahooks',
      'antd',
      'antd/locale/en_US',
      'antd/locale/zh_CN',
      'axios',
      'browser-image-compression',
      'clsx',
      'crypto-js',
      'dayjs',
      'dayjs/locale/zh-cn',
      'echarts',
      'echarts-for-react',
      'jsencrypt',
      'nprogress',
      'react-json-view-lite',
      'react-syntax-highlighter',
      'react-syntax-highlighter/dist/esm/styles/prism',
      'screenfull',
      'zustand'
    ]
  };
}

export function createViteBuildConfig() {
  return {
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      output: {
        manualChunks
      }
    }
  };
}

export function createUmiViteConfig() {
  return {
    resolve: {
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
    },
    optimizeDeps: createViteOptimizeDepsConfig(),
    build: createViteBuildConfig()
  };
}

export function createViteConfig(mode: string): ViteConfig {
  const env = getAppEnv(mode);
  const baseApi = env.VITE_APP_BASE_API || '/dev-api';

  return {
    base: env.VITE_APP_CONTEXT_PATH || '/',
    resolve: {
      alias: {
        '@': resolvePath('./src')
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
    },
    optimizeDeps: createViteOptimizeDepsConfig(),
    server: {
      host: '0.0.0.0',
      port: Number(env.VITE_APP_PORT || 8000),
      open: true,
      proxy: {
        [baseApi]: {
          target: 'http://localhost:8080',
          changeOrigin: true,
          ws: true,
          rewrite: (path: string) => path.replace(new RegExp(`^${baseApi}`), '')
        }
      }
    },
    build: createViteBuildConfig()
  };
}

export function createUmiAppConfig() {
  const env = getAppEnv();
  const vite = createViteConfig(process.env.UMI_ENV || process.env.NODE_ENV || 'development');
  const baseApi = env.VITE_APP_BASE_API || '/dev-api';

  return {
    title: env.VITE_APP_TITLE || 'RuoYi-React-Plus后台管理系统',
    base: vite.base,
    publicPath: vite.base,
    vite: createUmiViteConfig(),
    proxy: {
      [baseApi]: {
        target: vite.server.proxy[baseApi].target,
        changeOrigin: vite.server.proxy[baseApi].changeOrigin,
        ws: vite.server.proxy[baseApi].ws,
        pathRewrite: { [`^${baseApi}`]: '' }
      }
    }
  };
}

export default function viteConfig({ mode }: ConfigEnv) {
  return createViteConfig(mode);
}
