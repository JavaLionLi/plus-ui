import type { R } from '@/api/types';
import request from '@/api/request';
import type { CategoryForm, CategoryQuery, CategoryTreeVO, CategoryVO } from './types';

export function listCategory(query?: CategoryQuery) {
  return request<R<CategoryVO[]>>({
    url: '/workflow/category/list',
    method: 'get',
    params: query
  });
}

export function getCategory(categoryId: string | number) {
  return request<R<CategoryVO>>({
    url: `/workflow/category/${categoryId}`,
    method: 'get'
  });
}

export function addCategory(data: CategoryForm) {
  return request<R>({
    url: '/workflow/category',
    method: 'post',
    data
  });
}

export function updateCategory(data: CategoryForm) {
  return request<R>({
    url: '/workflow/category',
    method: 'put',
    data
  });
}

export function delCategory(categoryId: string | number | Array<string | number>) {
  return request<R>({
    url: `/workflow/category/${categoryId}`,
    method: 'delete'
  });
}

export function categoryTree(query?: CategoryForm) {
  return request<R<CategoryTreeVO[]>>({
    url: '/workflow/category/categoryTree',
    method: 'get',
    params: query
  });
}
