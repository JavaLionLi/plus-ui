import { create } from 'zustand';
import type { BackendRoute, RuntimeMenuItem } from '@/api/types';
import { getInfo } from '@/api/login';
import { getRouters } from '@/api/menu';
import { backendRoutesToMenu } from '@/utils/menu';
import { useUserStore } from './userStore';

interface PermissionState {
  backendRoutes: BackendRoute[];
  menuData: RuntimeMenuItem[];
  reloadMenus: () => Promise<void>;
  clearMenus: () => void;
}

export const usePermissionStore = create<PermissionState>(set => ({
  backendRoutes: [],
  menuData: [],
  reloadMenus: async () => {
    const [infoRes, routerRes] = await Promise.all([getInfo(), getRouters()]);
    const backendRoutes = routerRes.data || [];
    useUserStore.getState().setUserInfo(infoRes.data);
    set({
      backendRoutes,
      menuData: backendRoutesToMenu(backendRoutes)
    });
  },
  clearMenus: () => {
    set({ backendRoutes: [], menuData: [] });
  }
}));
