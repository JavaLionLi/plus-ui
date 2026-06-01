import type { UserInfo } from '@/api/system/user/types';
import type { LoginParams, LoginResult, R, RegisterParams, VerifyCodeResult } from '@/api/types';
import request from '@/api/request';
import { appEnv } from '@/utils/env';

export function login(data: LoginParams) {
  return request<R<LoginResult>>({
    url: '/auth/login',
    method: 'post',
    headers: {
      isToken: false,
      isEncrypt: 'true',
      repeatSubmit: false
    },
    data: {
      ...data,
      clientId: data.clientId || appEnv.clientId,
      grantType: data.grantType || 'password'
    }
  });
}

export function logout() {
  return request<R>({
    url: '/auth/logout',
    method: 'post'
  });
}

export function register(data: RegisterParams) {
  return request<R>({
    url: '/auth/register',
    method: 'post',
    headers: {
      isToken: false,
      isEncrypt: 'true',
      repeatSubmit: false
    },
    data: {
      ...data,
      clientId: appEnv.clientId,
      grantType: 'password'
    }
  });
}

export function callback(data: LoginParams) {
  return request<R<LoginResult>>({
    url: '/auth/social/callback',
    method: 'post',
    data: {
      ...data,
      clientId: appEnv.clientId,
      grantType: 'social'
    }
  });
}

export function getCodeImg() {
  return request<R<VerifyCodeResult>>({
    url: '/auth/code',
    method: 'get',
    headers: {
      isToken: false
    },
    timeout: 20000
  });
}

export function getInfo() {
  return request<R<UserInfo>>({
    url: '/system/user/getInfo',
    method: 'get'
  });
}
