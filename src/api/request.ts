import { history } from '@umijs/max';
import { message, Modal } from 'antd';
import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';
import { useAppStore } from '@/stores/appStore';
import { useTagsViewStore } from '@/stores/tagsViewStore';
import { getToken, removeToken } from '@/utils/auth';
import { decryptBase64, decryptWithAes, encryptBase64, encryptWithAes, generateAesKey } from '@/utils/crypto';
import { appEnv } from '@/utils/env';
import { decrypt, encrypt } from '@/utils/jsencrypt';
import { tansParams } from '@/utils/ruoyi';

const SUCCESS = 200;
const WARN = 601;
const SERVER_ERROR = 500;
const encryptHeader = 'encrypt-key';
const repeatSubmitStorageKey = 'sessionObj';
const repeatSubmitInterval = 500;

export interface RequestConfig<D = unknown> extends AxiosRequestConfig<D> {
  headers?: AxiosRequestConfig<D>['headers'] & {
    isToken?: false;
    isEncrypt?: 'true' | 'false' | boolean;
    repeatSubmit?: false;
  };
}

export const isRelogin = { show: false };

type HandledRequestError = Error & { isHandled?: boolean };

function createHandledError(message: string) {
  const error = new Error(message) as HandledRequestError;
  error.isHandled = true;
  return error;
}

export function isHandledRequestError(error: unknown) {
  return Boolean((error as { isHandled?: boolean } | undefined)?.isHandled);
}

export function globalHeaders() {
  return {
    Authorization: `Bearer ${getToken() || ''}`,
    clientid: appEnv.clientId
  };
}

function showRequestError(content: string) {
  message.error({ content, key: `request-error:${content}` });
}

function showReloginConfirm() {
  if (isRelogin.show) return;
  isRelogin.show = true;
  Modal.confirm({
    title: '系统提示',
    content: '登录状态已过期，您可以继续留在该页面，或者重新登录',
    okText: '重新登录',
    cancelText: '取消',
    onOk: () => {
      isRelogin.show = false;
      removeToken();
      useTagsViewStore.getState().resetTags();
      history.replace(
        `/login?redirect=${encodeURIComponent(`${window.location.pathname || '/'}${window.location.search || ''}`)}`
      );
    },
    onCancel: () => {
      isRelogin.show = false;
    }
  });
}

function stableDataString(data: unknown) {
  if (data instanceof FormData) return '';
  if (typeof data === 'string') return data;
  if (typeof data === 'undefined' || data === null) return '';
  if (typeof data === 'object') return JSON.stringify(data);
  return String(data);
}

function getSessionSubmitRecord() {
  try {
    const text = sessionStorage.getItem(repeatSubmitStorageKey);
    return text ? (JSON.parse(text) as { url?: string; data?: string; time?: number }) : undefined;
  } catch {
    sessionStorage.removeItem(repeatSubmitStorageKey);
    return undefined;
  }
}

function setSessionSubmitRecord(record: { url?: string; data?: string; time: number }) {
  sessionStorage.setItem(repeatSubmitStorageKey, JSON.stringify(record));
}

const service = axios.create({
  baseURL: appEnv.baseApi,
  timeout: 50000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
    clientid: appEnv.clientId
  },
  transitional: {
    clarifyTimeoutError: true
  }
});

service.interceptors.request.use(config => {
  config.headers.set('Content-Language', useAppStore.getState().appLocale);

  const isToken = config.headers.get('isToken') === false;
  const isEncrypt = config.headers.get('isEncrypt') === 'true' || config.headers.get('isEncrypt') === true;
  const isRepeatSubmitDisabled = config.headers.get('repeatSubmit') === false;

  if (getToken() && !isToken) {
    config.headers.set('Authorization', `Bearer ${getToken()}`);
  }

  if (config.method === 'get' && config.params) {
    let url = `${config.url}?${tansParams(config.params)}`;
    url = url.slice(0, -1);
    config.params = {};
    config.url = url;
  }

  if (!isRepeatSubmitDisabled && (config.method === 'post' || config.method === 'put')) {
    const requestObj = {
      url: config.url,
      data: stableDataString(config.data),
      time: Date.now()
    };
    const sessionObj = getSessionSubmitRecord();
    if (
      sessionObj &&
      sessionObj.url === requestObj.url &&
      sessionObj.data === requestObj.data &&
      requestObj.time - (sessionObj.time || 0) < repeatSubmitInterval
    ) {
      return Promise.reject(new Error('数据正在处理，请勿重复提交'));
    }
    setSessionSubmitRecord(requestObj);
  }

  if (appEnv.encryptEnabled && isEncrypt && (config.method === 'post' || config.method === 'put')) {
    const aesKey = generateAesKey();
    const encryptedKey = encrypt(encryptBase64(aesKey));
    if (encryptedKey) {
      config.headers.set(encryptHeader, encryptedKey);
    }
    const data = typeof config.data === 'object' ? JSON.stringify(config.data) : String(config.data ?? '');
    config.data = encryptWithAes(data, aesKey);
  }

  if (config.data instanceof FormData) {
    config.headers.delete('Content-Type');
  }

  config.headers.delete('isToken');
  config.headers.delete('isEncrypt');
  config.headers.delete('repeatSubmit');

  return config;
});

function normalizeErrorMessage(message?: string) {
  if (!message) return undefined;
  if (message === 'Network Error') return '后端接口连接异常';
  if (message.includes('timeout')) return '系统接口请求超时';
  if (message.includes('Request failed with status code')) return `系统接口${message.slice(-3)}异常`;
  return message;
}

async function parseResponseErrorData(data: unknown): Promise<string | undefined> {
  if (!data) return undefined;
  if (data instanceof Blob) return parseResponseErrorData(await data.text());
  if (data instanceof ArrayBuffer) return parseResponseErrorData(new TextDecoder().decode(data));
  if (typeof data === 'string') {
    const text = data.trim();
    if (!text) return undefined;
    try {
      return parseResponseErrorData(JSON.parse(text));
    } catch {
      return text;
    }
  }
  if (typeof data === 'object') {
    const payload = data as { msg?: string; message?: string };
    return payload.msg || payload.message;
  }
  return undefined;
}

async function getErrorMessage(error: AxiosError) {
  const responseMessage = await parseResponseErrorData(error.response?.data);
  return responseMessage || normalizeErrorMessage(error.message) || '系统未知错误';
}

service.interceptors.response.use(
  response => {
    const keyStr = response.headers[encryptHeader];
    if (appEnv.encryptEnabled && keyStr) {
      const base64Str = decrypt(keyStr);
      if (base64Str) {
        const aesKey = decryptBase64(base64Str);
        response.data = JSON.parse(decryptWithAes(response.data, aesKey));
      }
    }

    if (response.request.responseType === 'blob' || response.request.responseType === 'arraybuffer') {
      return response.data;
    }

    const code = response.data?.code || SUCCESS;
    const msg = response.data?.msg || '系统未知错误';

    if (code === 401) {
      showReloginConfirm();
      return Promise.reject(createHandledError('无效的会话，或者会话已过期，请重新登录。'));
    }

    if (code === SERVER_ERROR || code === WARN || code !== SUCCESS) {
      showRequestError(msg);
      return Promise.reject(createHandledError(msg));
    }

    return response.data;
  },
  async error => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      showReloginConfirm();
      return Promise.reject(createHandledError('无效的会话，或者会话已过期，请重新登录。'));
    }

    const msg = axios.isAxiosError(error)
      ? await getErrorMessage(error)
      : normalizeErrorMessage((error as Error | undefined)?.message) || '系统未知错误';
    showRequestError(msg);
    return Promise.reject(createHandledError(msg));
  }
);

export default function request<T = unknown, D = unknown>(config: RequestConfig<D>): Promise<T> {
  return service.request<T, T, D>(config);
}
