// 环境检测
export const getEnvironment = (): "electron" | "server" | "mobile" => {
  if (typeof window !== "undefined" && window.process?.type === "renderer") {
    return "electron";
  }
  if (typeof window !== "undefined" && "cordova" in window) {
    return "mobile";
  }
  return "server";
};

// 错误处理
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = "AppError";
  }
}

// 加密工具
export const encrypt = async (text: string, key: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  // 根据环境选择不同的加密实现
  const env = getEnvironment();
  if (env === "server") {
    // 服务器端使用 Node.js 的 crypto 模块
    const crypto = require("crypto");
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(
      "aes-256-gcm",
      crypto.scryptSync(key, "salt", 32),
      iv
    );

    const encrypted = Buffer.concat([
      cipher.update(text, "utf8"),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();
    const result = Buffer.concat([iv, encrypted, authTag]);
    return result.toString("base64");
  } else {
    // 浏览器端使用 Web Crypto API
    const cryptoKey = await window.crypto.subtle.importKey(
      "raw",
      encoder.encode(key),
      { name: "AES-GCM" },
      false,
      ["encrypt"]
    );

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      data
    );

    const encryptedArray = new Uint8Array(encrypted);
    const result = new Uint8Array(iv.length + encryptedArray.length);
    result.set(iv);
    result.set(encryptedArray, iv.length);

    return btoa(String.fromCharCode(...result));
  }
};

export const decrypt = async (
  encryptedText: string,
  key: string
): Promise<string> => {
  const env = getEnvironment();

  if (env === "server") {
    // 服务器端使用 Node.js 的 crypto 模块
    const crypto = require("crypto");
    const buffer = Buffer.from(encryptedText, "base64");

    // 从加密数据中提取 IV、密文和认证标签
    const iv = buffer.subarray(0, 12);
    const authTag = buffer.subarray(buffer.length - 16);
    const encrypted = buffer.subarray(12, buffer.length - 16);

    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      crypto.scryptSync(key, "salt", 32),
      iv
    );

    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  } else {
    // 浏览器端使用 Web Crypto API
    const binary = atob(encryptedText);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const iv = bytes.slice(0, 12);
    const data = bytes.slice(12);

    const cryptoKey = await window.crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(key),
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );

    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      data
    );

    return new TextDecoder().decode(decrypted);
  }
};

// 密码哈希
export const hashPassword = (password: string): string => {
  const crypto = require("crypto");
  const salt = "your-salt-value"; // 可以从环境变量获取
  return crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
};

// 验证密码
export const verifyPassword = (password: string, hash: string): boolean => {
  const hashedPassword = hashPassword(password);
  return hashedPassword === hash;
};

// 日期格式化
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
};

// 深度克隆
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as any;
  }

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, deepClone(value)])
  ) as T;
};
