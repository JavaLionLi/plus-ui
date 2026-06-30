import { create } from 'zustand';

export type NavLayout = 'mix' | 'top';
export type SideTheme = 'light' | 'realDark';
export type AppLocale = 'zh_CN' | 'en_US';
export type ComponentSize = 'small' | 'middle' | 'large';

export interface LayoutSettingsValue {
  navType: NavLayout;
  sideTheme: SideTheme;
  darkMode: boolean;
  theme: string;
  radiusBase: number;
  tagsView: boolean;
  tagsViewPersist: boolean;
  tagsIcon: boolean;
  fixedHeader: boolean;
  sidebarLogo: boolean;
  dynamicTitle: boolean;
  fullHeightTable: boolean;
}

export const layoutSettingsStorageKey = 'layout-setting-react';
export const tagsStorageKey = 'tags-view-visited-react';

export const defaultLayoutSettings: LayoutSettingsValue = {
  navType: 'mix',
  sideTheme: 'light',
  darkMode: false,
  theme: '#409EFF',
  radiusBase: 6,
  tagsView: true,
  tagsViewPersist: false,
  tagsIcon: true,
  fixedHeader: true,
  sidebarLogo: true,
  dynamicTitle: true,
  fullHeightTable: true
};

export function loadLayoutSettings(): LayoutSettingsValue {
  try {
    const cache = JSON.parse(localStorage.getItem(layoutSettingsStorageKey) || '{}') as Partial<LayoutSettingsValue>;
    return { ...defaultLayoutSettings, ...cache };
  } catch {
    return defaultLayoutSettings;
  }
}

export function saveLayoutSettings(value: LayoutSettingsValue) {
  localStorage.setItem(layoutSettingsStorageKey, JSON.stringify(value));
  if (!value.tagsView || !value.tagsViewPersist) {
    localStorage.removeItem(tagsStorageKey);
  }
}

function loadLocale(): AppLocale {
  const locale = localStorage.getItem('app-locale');
  return locale === 'en_US' ? 'en_US' : 'zh_CN';
}

function loadComponentSize(): ComponentSize {
  const size = localStorage.getItem('antd-component-size');
  return size === 'small' || size === 'middle' || size === 'large' ? size : 'middle';
}

interface AppState {
  settingsOpen: boolean;
  layoutSettings: LayoutSettingsValue;
  appLocale: AppLocale;
  componentSize: ComponentSize;
  setSettingsOpen: (open: boolean) => void;
  setLayoutSettings: (value: LayoutSettingsValue) => void;
  patchLayoutSettings: (patch: Partial<LayoutSettingsValue>) => void;
  resetLayoutSettings: () => void;
  setAppLocale: (locale: AppLocale) => void;
  setComponentSize: (size: ComponentSize) => void;
}

export const useAppStore = create<AppState>(set => ({
  settingsOpen: false,
  layoutSettings: loadLayoutSettings(),
  appLocale: loadLocale(),
  componentSize: loadComponentSize(),
  setSettingsOpen: settingsOpen => set({ settingsOpen }),
  setLayoutSettings: layoutSettings => {
    saveLayoutSettings(layoutSettings);
    set({ layoutSettings });
  },
  patchLayoutSettings: patch =>
    set(state => {
      const layoutSettings = { ...state.layoutSettings, ...patch };
      saveLayoutSettings(layoutSettings);
      return { layoutSettings };
    }),
  resetLayoutSettings: () => {
    localStorage.removeItem(layoutSettingsStorageKey);
    localStorage.removeItem(tagsStorageKey);
    set({ layoutSettings: defaultLayoutSettings });
  },
  setAppLocale: appLocale => {
    localStorage.setItem('app-locale', appLocale);
    set({ appLocale });
  },
  setComponentSize: componentSize => {
    localStorage.setItem('antd-component-size', componentSize);
    set({ componentSize });
  }
}));
