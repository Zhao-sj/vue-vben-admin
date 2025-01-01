import { decrypt, encrypt } from 'crypto-js/aes';
import Base64 from 'crypto-js/enc-base64';
import UTF8, { parse } from 'crypto-js/enc-utf8';
import md5 from 'crypto-js/md5';
import ECB from 'crypto-js/mode-ecb';
import Pkcs7 from 'crypto-js/pad-pkcs7';
import sha256 from 'crypto-js/sha256';

export interface EncryptionParams {
  iv: string;
  key: string;
}

export class AesEncryption {
  private iv?: CryptoJS.lib.WordArray;
  private key?: CryptoJS.lib.WordArray;

  constructor(opt: Partial<EncryptionParams> = {}) {
    const { iv, key } = opt;
    if (key) {
      this.key = parse(key);
    }
    if (iv) {
      this.iv = parse(iv);
    }
  }

  decryptByAES(cipherText: string) {
    if (!this.key) {
      return;
    }

    return decrypt(cipherText, this.key, this.getOptions()).toString(UTF8);
  }

  encryptByAES(cipherText: string) {
    if (!this.key) {
      return;
    }

    return encrypt(cipherText, this.key, this.getOptions()).toString();
  }

  private getOptions() {
    return {
      iv: this.iv,
      mode: ECB,
      padding: Pkcs7,
    };
  }
}

export function encryptByBase64(cipherText: string) {
  return UTF8.parse(cipherText).toString(Base64);
}

export function decodeByBase64(cipherText: string) {
  return Base64.parse(cipherText).toString(UTF8);
}

export function encryptByMd5(password: string) {
  return md5(password).toString();
}

export function encryptBySha256(password: string) {
  return sha256(password).toString();
}
