import { Modal, type ModalFuncProps } from 'antd';
import type { ReactNode } from 'react';

const CANCELLED = new Error('cancelled');

export function confirmModal(options: ModalFuncProps) {
  return new Promise<void>((resolve, reject) => {
    Modal.confirm({
      title: '系统提示',
      ...options,
      onOk: () => resolve(),
      onCancel: () => reject(CANCELLED)
    });
  });
}

export function confirmAction(content: ReactNode, options?: Omit<ModalFuncProps, 'content' | 'onOk' | 'onCancel'>) {
  return confirmModal({ content, ...options });
}

export function confirmTitle(title: ReactNode, options?: Omit<ModalFuncProps, 'title' | 'onOk' | 'onCancel'>) {
  return confirmModal({ title, ...options });
}

export async function confirmTitleSafe(
  title: ReactNode,
  options?: Omit<ModalFuncProps, 'title' | 'onOk' | 'onCancel'>
) {
  try {
    await confirmTitle(title, options);
    return true;
  } catch {
    return false;
  }
}
