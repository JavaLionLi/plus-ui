import type { R } from '@/api/types';
import request from '@/api/request';
import type { MessageBoxVO } from './types';

export function getMessageBox() {
  return request<R<MessageBoxVO>>({
    url: '/resource/message/box',
    method: 'get'
  });
}
