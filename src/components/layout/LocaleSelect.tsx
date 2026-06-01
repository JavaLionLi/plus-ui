import { GlobalOutlined } from '@ant-design/icons';
import { useBoolean } from 'ahooks';
import { Button, Dropdown, message, Tooltip, type MenuProps } from 'antd';
import type { AppLocale } from '@/stores/appStore';

interface LocaleSelectProps {
  value: AppLocale;
  onChange: (value: AppLocale) => void;
}

const localeItems = [
  { key: 'zh_CN', label: '中文' },
  { key: 'en_US', label: 'English' }
] satisfies NonNullable<MenuProps['items']>;

export default function LocaleSelect({ value, onChange }: LocaleSelectProps) {
  const [open, { set: setOpen }] = useBoolean(false);
  const [tooltipOpen, { set: setTooltipOpen, setFalse: closeTooltip }] = useBoolean(false);
  const items = localeItems.map(item => (item && 'key' in item ? { ...item, disabled: item.key === value } : item));

  return (
    <Dropdown
      open={open}
      onOpenChange={nextOpen => {
        setOpen(nextOpen);
        if (nextOpen) closeTooltip();
      }}
      menu={{
        items,
        onClick: ({ key }) => {
          const nextLocale = key as AppLocale;
          onChange(nextLocale);
          message.success(nextLocale === 'zh_CN' ? '切换语言成功！' : 'Switch Language Successful!');
        }
      }}
      placement="bottomRight"
      trigger={['click']}
    >
      <Tooltip
        title={value === 'zh_CN' ? '语言' : 'Language'}
        open={tooltipOpen && !open}
        onOpenChange={setTooltipOpen}
      >
        <Button
          type="text"
          className="layout-action-button"
          icon={<GlobalOutlined />}
          aria-label={value === 'zh_CN' ? '语言' : 'Language'}
          onClick={closeTooltip}
        />
      </Tooltip>
    </Dropdown>
  );
}
