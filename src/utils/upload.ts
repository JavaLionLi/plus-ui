import { message } from 'antd';

export interface UploadValidationOptions {
  fileTypes?: string[];
  maxSizeMB?: number;
  fileKind?: string;
  allowComma?: boolean;
  matchMime?: boolean;
}

export function getFileExtension(fileName?: string) {
  if (!fileName?.includes('.')) return '';
  return fileName.split('.').pop()?.toLowerCase() || '';
}

export function buildAccept(fileTypes?: string[]) {
  return (fileTypes || []).map(item => `.${item}`).join(',');
}

export function getUploadErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error) return error;
  return fallback;
}

export function formatUploadResponseMessage(messageText?: string) {
  return String(messageText || '导入完成')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/&nbsp;/gi, ' ');
}

export function validateUploadFile(file: File, options: UploadValidationOptions) {
  const { fileTypes = [], maxSizeMB, fileKind = '文件', allowComma = false, matchMime = false } = options;
  const ext = getFileExtension(file.name);
  const normalizedTypes = fileTypes.map(item => item.toLowerCase());

  if (normalizedTypes.length) {
    const typeMatched =
      normalizedTypes.includes(ext) ||
      (matchMime && normalizedTypes.some(item => file.type.toLowerCase().includes(item)));
    if (!typeMatched) {
      message.error(`${fileKind}格式不正确，请上传 ${normalizedTypes.join('/')} 格式`);
      return false;
    }
  }

  if (!allowComma && file.name.includes(',')) {
    message.error(`${fileKind}名不正确，不能包含英文逗号`);
    return false;
  }

  if (maxSizeMB && file.size / 1024 / 1024 > maxSizeMB) {
    message.error(`${fileKind}大小不能超过 ${maxSizeMB} MB`);
    return false;
  }

  return true;
}
