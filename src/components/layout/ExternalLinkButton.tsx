import { GithubOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';

interface ExternalLinkButtonProps {
  type: 'git' | 'doc';
}

const linkMap = {
  git: {
    title: 'Gitee',
    url: 'https://gitee.com/dromara/RuoYi-Vue-Plus',
    icon: <GithubOutlined />
  },
  doc: {
    title: '文档',
    url: 'https://plus-doc.dromara.org/',
    icon: <QuestionCircleOutlined />
  }
};

export default function ExternalLinkButton({ type }: ExternalLinkButtonProps) {
  const link = linkMap[type];

  return (
    <Tooltip title={link.title}>
      <Button
        type="text"
        className="layout-action-button"
        icon={link.icon}
        aria-label={link.title}
        onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
      />
    </Tooltip>
  );
}
