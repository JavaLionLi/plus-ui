import type { DeptTreeVO } from '@/api/system/dept/types';
import type { PageResult, R } from '@/api/types';
import request from '@/api/request';
import type { PostForm, PostQuery, PostVO } from './types';

export function listPost(query: PostQuery) {
  return request<R<PageResult<PostVO>>>({
    url: '/system/post/list',
    method: 'get',
    params: query
  });
}

export function getPost(postId: string | number) {
  return request<R<PostVO>>({
    url: `/system/post/${postId}`,
    method: 'get'
  });
}

export function optionSelect(deptId?: number | string, postIds?: Array<number | string>) {
  return request<R<PostVO[]>>({
    url: '/system/post/optionselect',
    method: 'get',
    params: {
      postIds,
      deptId
    }
  });
}

export function addPost(data: PostForm) {
  return request<R>({
    url: '/system/post',
    method: 'post',
    data
  });
}

export function updatePost(data: PostForm) {
  return request<R>({
    url: '/system/post',
    method: 'put',
    data
  });
}

export function delPost(postId: string | number | Array<string | number>) {
  return request<R>({
    url: `/system/post/${postId}`,
    method: 'delete'
  });
}

export function postDeptTreeSelect() {
  return request<R<DeptTreeVO[]>>({
    url: '/system/post/deptTree',
    method: 'get'
  });
}

export function deptTreeSelect() {
  return postDeptTreeSelect();
}
