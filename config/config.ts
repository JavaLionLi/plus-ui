import { defineConfig } from '@umijs/max';
import { createUmiAppConfig } from '../vite.config';

const appConfig = createUmiAppConfig();

export default defineConfig({
  title: appConfig.title,
  antd: {},
  access: {},
  model: {},
  initialState: {},
  vite: appConfig.vite,
  npmClient: 'pnpm',
  hash: true,
  esbuildMinifyIIFE: true,
  history: {
    type: 'browser'
  },
  base: appConfig.base,
  publicPath: appConfig.publicPath,
  routes: [
    { path: '/login', component: './login', layout: false },
    { path: '/register', component: './register', layout: false },
    { path: '/social-callback', component: './socialCallback', layout: false },
    { path: '/401', component: './error/401', layout: false },
    { path: '/404', component: './error/404', layout: false },
    { path: '/redirect/*', component: './redirect', layout: false },
    {
      path: '/',
      component: '../layouts/BasicLayout',
      routes: [
        { path: '/', redirect: '/index' },
        { path: '/index', component: './index' },
        { path: '/user/profile', component: './system/user/profile' },
        { path: '*', component: './dynamicPage' }
      ]
    }
  ],
  proxy: appConfig.proxy
});
