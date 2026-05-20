# 接口/路由目录

## 用户

当前用户路由[user.ts](./user.ts)中，并没有使用加密的用户信息处理（例如用户密码），只实现了核心的基础流程。如果需要使用更为安全的加密传输方式，可以参考以下方式进行改造：

### 前端部分

因为使用的是原生`crypto`模块，所以项目必须运行在<https://>或者<http://localhost>环境下。

```ts
async function getPublicKey() {
  const res = await api.getConfig(); // 通过 /api/config 接口拿到的公钥
  const key = res.code === 1 ? res.data.key : null;
  if (key) {
    return crypto.subtle.importKey(
      "spki",
      pemToArrayBuffer(key),
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      false,
      ["encrypt"],
    );
  }
  return key;
}

function pemToArrayBuffer(pem: string) {
  const base64 = pem
    .replace("-----BEGIN PUBLIC KEY-----", "")
    .replace("-----END PUBLIC KEY-----", "")
    .replace(/\s+/g, "");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

let publicKey: string;

/**
 * 加密文本
 * @param value
 */
export async function encryptText(value: string) {
  if (!publicKey) {
    publicKey = await getPublicKey();
  }
  if (!publicKey) {
    console.log("获取公钥失败!");
    return "";
  }
  const content = new TextEncoder().encode(value);
  const encrypted = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    content,
  );
  return arrayBufferToBase64(encrypted);
}

// 后续可以将需要加密的字段，通过 encryptText 方法加密之后传给后端
```

### 服务端部分

```ts
import { decryptRsa } from "../utils/crypto.js";

const value = decryptRsa("前端传过来加密的密码");
// 之后再做逻辑处理
```
