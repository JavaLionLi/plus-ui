import { Tooltip } from 'antd';

interface UserNameDisplayProps {
  content?: string | null;
  emptyText?: string;
  maxLines?: number;
}

function formatUserNames(content?: string | null, emptyText = '无') {
  const text = content
    ?.split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .join('、');
  return text || emptyText;
}

export default function UserNameDisplay({ content, emptyText = '无', maxLines = 3 }: UserNameDisplayProps) {
  const text = formatUserNames(content, emptyText);

  return (
    <Tooltip title={text} placement="topLeft">
      <div className="user-name-display-react" style={{ WebkitLineClamp: maxLines }}>
        {text}
      </div>
    </Tooltip>
  );
}
