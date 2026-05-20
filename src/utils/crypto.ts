import {
  constants,
  createCipheriv,
  createDecipheriv,
  createHash,
  generateKeyPairSync,
  privateDecrypt,
  randomBytes,
} from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const algorithm = "aes-256-gcm";
const key = createHash("sha256").update("node-koa-ts").digest();
const dir = dirname(fileURLToPath(import.meta.url));
const rsaFilePath = resolve(dir, "rsa-keys.json");

/**
 * 加密
 * @param data
 */
export function encrypt<T extends object>(data: T) {
  const iv = randomBytes(16);
  const cipher = createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(JSON.stringify(data), "utf8", "base64");
  encrypted += cipher.final("base64");

  const authTag = cipher.getAuthTag().toString("base64");
  const ivBase64 = iv.toString("base64");

  return `${ivBase64}.${authTag}.${encrypted}`;
}

/**
 * 解密
 * @param value
 */
export function decrypt<T = any>(value: string): T {
  const [ivBS64, authTagBS64, encryptedBS64] = value.split(".");

  const decipher = createDecipheriv(algorithm, key, Buffer.from(ivBS64, "base64"));
  decipher.setAuthTag(Buffer.from(authTagBS64, "base64"));

  let decrypted = decipher.update(encryptedBS64, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return JSON.parse(decrypted);
}

// =======================================================
// RSA 非对称加密相关
// =======================================================

function generateRsaKey() {
  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  const keys = {
    public: publicKey,
    private: privateKey,
  };

  writeFileSync(rsaFilePath, JSON.stringify(keys, null, 2), "utf8");

  return keys;
}

function getRsaKeys() {
  if (!existsSync(rsaFilePath)) {
    return generateRsaKey();
  }

  try {
    const content = readFileSync(rsaFilePath, "utf8");
    const keys = JSON.parse(content) as {
      public?: string;
      private?: string;
    };

    if (keys.public && keys.private) {
      return {
        public: keys.public,
        private: keys.private,
      };
    }
  }
  catch (error) {
    console.log("rsa-keys.json 为空或格式错误，已经重新生成", error);
    return generateRsaKey();
  }
}

export const rsaKeys = getRsaKeys();

/**
 * 解密`RSA`加密的字符串
 * @param value
 */
export function decryptRsa(value: string) {
  const res = { data: "", error: null as any };
  try {
    const buffer = privateDecrypt(
      {
        key: rsaKeys.private,
        padding: constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      Buffer.from(value, "base64"),
    );
    res.data = buffer.toString("utf8");
  }
  catch (error) {
    res.error = error;
  }
  return res;
}
