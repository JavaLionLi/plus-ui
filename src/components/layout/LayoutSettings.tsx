import { CheckOutlined, ReloadOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Divider, Drawer, Input, message, Segmented, Slider, Space, Switch } from 'antd';
import { useEffect, useRef } from 'react';
import { defaultLayoutSettings, useAppStore, type LayoutSettingsValue, type NavLayout } from '@/stores/appStore';

interface LayoutSettingsProps {
  open: boolean;
  value: LayoutSettingsValue;
  onChange: (value: LayoutSettingsValue) => void;
  onOpenChange: (open: boolean) => void;
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="layout-settings-row">
      <span>{label}</span>
      <span className="layout-settings-control">{children}</span>
    </div>
  );
}

export default function LayoutSettings({ open, value, onChange, onOpenChange }: LayoutSettingsProps) {
  const resetLayoutSettings = useAppStore(state => state.resetLayoutSettings);
  const preferredSideThemeRef = useRef(value.sideTheme);

  useEffect(() => {
    if (!value.darkMode) {
      preferredSideThemeRef.current = value.sideTheme;
    }
  }, [value.darkMode, value.sideTheme]);

  const patchValue = (patch: Partial<LayoutSettingsValue>) => {
    if (patch.sideTheme) {
      preferredSideThemeRef.current = patch.sideTheme;
    }

    const next = { ...value, ...patch };
    if (patch.darkMode === false) {
      next.sideTheme = preferredSideThemeRef.current;
    }
    if (patch.tagsView === false) {
      next.tagsViewPersist = false;
    }
    onChange(next);
  };

  const resetSettings = () => {
    resetLayoutSettings();
    onChange(defaultLayoutSettings);
    message.success('配置已重置');
  };
  const selectedSideTheme = value.darkMode ? preferredSideThemeRef.current : value.sideTheme;

  return (
    <Drawer
      title="布局设置"
      open={open}
      size={320}
      onClose={() => onOpenChange(false)}
      className="layout-settings-drawer"
    >
      <h3 className="layout-settings-title">菜单导航设置</h3>
      <Segmented
        block
        value={value.navType}
        onChange={navType => patchValue({ navType: navType as NavLayout })}
        options={[
          { label: '混合菜单', value: 'mix' },
          { label: '顶部菜单', value: 'top' }
        ]}
      />

      <h3 className="layout-settings-title">主题风格设置</h3>
      <Space className="layout-theme-preview" size={12}>
        <button
          type="button"
          className={`layout-theme-card dark ${selectedSideTheme === 'realDark' ? 'active' : ''}`}
          onClick={() => patchValue({ sideTheme: 'realDark' })}
        >
          {selectedSideTheme === 'realDark' && <CheckOutlined />}
        </button>
        <button
          type="button"
          className={`layout-theme-card light ${selectedSideTheme === 'light' ? 'active' : ''}`}
          onClick={() => patchValue({ sideTheme: 'light' })}
        >
          {selectedSideTheme === 'light' && <CheckOutlined />}
        </button>
      </Space>
      <SettingRow label="主题颜色">
        <Input
          type="color"
          value={value.theme}
          onChange={event => patchValue({ theme: event.target.value })}
          className="layout-color-input"
        />
      </SettingRow>
      <SettingRow label="深色模式">
        <Switch checked={value.darkMode} onChange={darkMode => patchValue({ darkMode })} />
      </SettingRow>
      <SettingRow label="页面圆角">
        <Slider
          min={0}
          max={32}
          step={2}
          value={value.radiusBase}
          onChange={radiusBase => patchValue({ radiusBase })}
          className="layout-radius-slider"
        />
      </SettingRow>

      <Divider />
      <h3 className="layout-settings-title">系统布局配置</h3>
      <SettingRow label="开启 TagsView">
        <Switch checked={value.tagsView} onChange={tagsView => patchValue({ tagsView })} />
      </SettingRow>
      <SettingRow label="持久化标签页">
        <Switch
          disabled={!value.tagsView}
          checked={value.tagsViewPersist}
          onChange={tagsViewPersist => patchValue({ tagsViewPersist })}
        />
      </SettingRow>
      <SettingRow label="显示页签图标">
        <Switch disabled={!value.tagsView} checked={value.tagsIcon} onChange={tagsIcon => patchValue({ tagsIcon })} />
      </SettingRow>
      <SettingRow label="固定 Header">
        <Switch checked={value.fixedHeader} onChange={fixedHeader => patchValue({ fixedHeader })} />
      </SettingRow>
      <SettingRow label="显示 Logo">
        <Switch checked={value.sidebarLogo} onChange={sidebarLogo => patchValue({ sidebarLogo })} />
      </SettingRow>
      <SettingRow label="动态标题">
        <Switch checked={value.dynamicTitle} onChange={dynamicTitle => patchValue({ dynamicTitle })} />
      </SettingRow>
      <SettingRow label="全高表格">
        <Switch checked={value.fullHeightTable} onChange={fullHeightTable => patchValue({ fullHeightTable })} />
      </SettingRow>

      <Space style={{ marginTop: 18 }}>
        <Button type="primary" icon={<SaveOutlined />} onClick={() => message.success('配置已保存')}>
          保存配置
        </Button>
        <Button icon={<ReloadOutlined />} onClick={resetSettings}>
          重置配置
        </Button>
      </Space>
    </Drawer>
  );
}
