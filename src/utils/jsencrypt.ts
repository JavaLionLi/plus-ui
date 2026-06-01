import { JSEncrypt } from 'jsencrypt';
import { appEnv } from '@/utils/env';

export function encrypt(txt: string) {
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(appEnv.rsaPublicKey);
  return encryptor.encrypt(txt);
}

export function decrypt(txt: string) {
  const encryptor = new JSEncrypt();
  encryptor.setPrivateKey(appEnv.rsaPrivateKey);
  return encryptor.decrypt(txt);
}
