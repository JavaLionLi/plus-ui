// umi 在构建时将 react-router-dom 别名到与 @umijs/max 相同的实例
// 这里仅补充 tsc 需要的 UNSAFE_LocationContext 类型声明 供 KeepAliveTabs 冻结缓存页的路由上下文
declare module 'react-router-dom' {
  import type { Context } from 'react';

  export interface RouteLocation {
    pathname: string;
    search: string;
    hash: string;
    state: unknown;
    key: string;
  }

  export const UNSAFE_LocationContext: Context<{ location: RouteLocation }>;
}
