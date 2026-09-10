import vue from '@vitejs/plugin-vue';

import createUnoCss from './unocss';
import createAutoImport from './auto-import';
import createComponents from './components';
import createSvgIconsPlugin from './svg-icon';
import createCompression from './compression';
import createSetupExtend from './setup-extend';
import { viteCheckTransitionPlugin } from './check-transition';

export default (viteEnv: any, isBuild = false): [] => {
  const vitePlugins: any = [];
  vitePlugins.push(vue());
  vitePlugins.push(createUnoCss());
  vitePlugins.push(createAutoImport());
  vitePlugins.push(createComponents());
  vitePlugins.push(createCompression(viteEnv));
  vitePlugins.push(createSvgIconsPlugin());
  vitePlugins.push(createSetupExtend());
  vitePlugins.push(viteCheckTransitionPlugin())
  return vitePlugins;
};
