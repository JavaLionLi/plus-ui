import { utf8ToBytes } from '@noble/ciphers/utils.js';
import { ecb } from '@noble/ciphers/aes.js';

function generateRandomString() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32);
}

function bytesToBase64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes));
}

function base64ToBytes(base64: string) {
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

/**
 * 生成 AES-256 密钥 (32 字节随机字符串编码) 兼容后端 SecureUtil.aes(key)
 */
export function generateAesKey(): Uint8Array {
  return utf8ToBytes(generateRandomString());
}

export function encryptBase64(bytes: Uint8Array) {
  return bytesToBase64(bytes);
}

export function decryptBase64(str: string) {
  return base64ToBytes(str);
}

/**
 * AES-256-ECB + PKCS7 填充 输出 Base64 密文 与后端 AES/ECB/PKCS5Padding 格式兼容
 */
export function encryptWithAes(message: string, aesKey: Uint8Array) {
  return bytesToBase64(ecb(aesKey).encrypt(utf8ToBytes(message)));
}

export function decryptWithAes(message: string, aesKey: Uint8Array) {
  return new TextDecoder().decode(ecb(aesKey).decrypt(base64ToBytes(message)));
}
