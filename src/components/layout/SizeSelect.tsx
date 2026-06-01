import { ColumnHeightOutlined } from '@ant-design/icons';
import { useBoolean } from 'ahooks';
import { Button, Dropdown, Tooltip, type MenuProps } from 'antd';
import type { ComponentSize } from '@/stores/appStore';

interface SizeSelectProps {
  value: ComponentSize;
  onChange: (value: ComponentSize) => void;
}

const sizeOptions: Array<{ key: ComponentSize; label: string }> = [
  { key: 'large', label: '大型' },
  { key: 'middle', label: '默认' },
  { key: 'small', label: '小型' }
];

export default function SizeSelect({ value, onChange }: SizeSelectProps) {
  const [open, { set: setOpen }] = useBoolean(false);
  const [tooltipOpen, { set: setTooltipOpen, setFalse: closeTooltip }] = useBoolean(false);
  const items: MenuProps['items'] = sizeOptions.map(item => ({
    key: item.key,
    label: item.label,
    disabled: item.key === value,
    onClick: () => onChange(item.key)
  }));

  return (
    <Dropdown
      open={open}
      onOpenChange={nextOpen => {
        setOpen(nextOpen);
        if (nextOpen) closeTooltip();
      }}
      menu={{ items }}
      placement="bottomRight"
      trigger={['click']}
    >
      <Tooltip title="布局大小" open={tooltipOpen && !open} onOpenChange={setTooltipOpen}>
        <Button
          type="text"
          className="layout-action-button"
          icon={<ColumnHeightOutlined />}
          aria-label="布局大小"
          onClick={closeTooltip}
        />
      </Tooltip>
    </Dropdown>
  );
}
