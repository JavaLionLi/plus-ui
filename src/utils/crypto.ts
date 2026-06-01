import * as CryptoJSModule from 'crypto-js';

const CryptoJS = ('default' in CryptoJSModule ? CryptoJSModule.default : CryptoJSModule) as typeof CryptoJSModule;

function generateRandomString() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32);
}

export function generateAesKey(): CryptoJSModule.lib.WordArray {
  return CryptoJS.enc.Utf8.parse(generateRandomString());
}

export function encryptBase64(str: CryptoJSModule.lib.WordArray) {
  return CryptoJS.enc.Base64.stringify(str);
}

export function decryptBase64(str: string) {
  return CryptoJS.enc.Base64.parse(str);
}

export function encryptWithAes(message: string, aesKey: CryptoJSModule.lib.WordArray) {
  return CryptoJS.AES.encrypt(message, aesKey, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  }).toString();
}

export function decryptWithAes(message: string, aesKey: CryptoJSModule.lib.WordArray) {
  const decrypted = CryptoJS.AES.decrypt(message, aesKey, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}
