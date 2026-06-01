import type { PageResult, R } from '@/api/types';
import request from '@/api/request';
import type { NoticeForm, NoticeQuery, NoticeVO } from './types';

export function listNotice(query: NoticeQuery) {
  return request<R<PageResult<NoticeVO>>>({
    url: '/system/notice/list',
    method: 'get',
    params: query
  });
}

export function getNotice(noticeId: string | number) {
  return request<R<NoticeVO>>({
    url: `/system/notice/${noticeId}`,
    method: 'get'
  });
}

export function addNotice(data: NoticeForm) {
  return request<R>({
    url: '/system/notice',
    method: 'post',
    data
  });
}

export function updateNotice(data: NoticeForm) {
  return request<R>({
    url: '/system/notice',
    method: 'put',
    data
  });
}

export function delNotice(noticeId: string | number | Array<string | number>) {
  return request<R>({
    url: `/system/notice/${noticeId}`,
    method: 'delete'
  });
}
