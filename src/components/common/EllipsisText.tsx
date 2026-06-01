import { Tooltip } from 'antd';

interface EllipsisTextProps {
  value?: unknown;
  maxWidth?: number | string;
  emptyText?: string;
}

export default function EllipsisText({ value, maxWidth = 180, emptyText = '-' }: EllipsisTextProps) {
  const text = value === null || typeof value === 'undefined' || value === '' ? emptyText : String(value);

  return (
    <Tooltip title={text === emptyText ? undefined : text} placement="topLeft">
      <span className="ellipsis-text-react" style={{ maxWidth }}>
        {text}
      </span>
    </Tooltip>
  );
}
