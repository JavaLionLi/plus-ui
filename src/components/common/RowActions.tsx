import type { ReactNode } from 'react';
import { Button, Popconfirm, Space, Tooltip, type ButtonProps, type PopconfirmProps } from 'antd';

export interface RowActionItem {
  key: string;
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
  confirm?: PopconfirmProps['title'];
  confirmProps?: Omit<PopconfirmProps, 'title' | 'children' | 'onConfirm'>;
  buttonProps?: Omit<ButtonProps, 'type' | 'size' | 'icon' | 'danger' | 'disabled' | 'onClick'>;
}

export interface RowActionsProps {
  actions: Array<RowActionItem | false | null | undefined>;
}

export default function RowActions({ actions }: RowActionsProps) {
  const visibleActions = actions.filter(Boolean) as RowActionItem[];

  return (
    <Space size={2} className="row-actions-react">
      {visibleActions.map(action => {
        const button = (
          <Button
            {...action.buttonProps}
            aria-label={action.label}
            type="link"
            size="small"
            icon={action.icon}
            danger={action.danger}
            disabled={action.disabled}
            onClick={action.confirm ? undefined : action.onClick}
          />
        );

        const actionNode = action.confirm ? (
          <Popconfirm title={action.confirm} onConfirm={action.onClick} {...action.confirmProps}>
            {button}
          </Popconfirm>
        ) : (
          button
        );

        return (
          <Tooltip key={action.key} title={action.label} placement="top">
            {actionNode}
          </Tooltip>
        );
      })}
    </Space>
  );
}
