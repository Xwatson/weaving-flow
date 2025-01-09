// 环境检测
export const getEnvironment = (): 'electron' | 'server' | 'mobile' => {
  if (typeof window !== 'undefined' && window.process?.type === 'renderer') {
    return 'electron';
  }
  if (typeof window !== 'undefined' && 'cordova' in window) {
    return 'mobile';
  }
  return 'server';
};

// 错误处理
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// 加密工具
export const encrypt = async (text: string, key: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    data
  );
  
  const encryptedArray = new Uint8Array(encrypted);
  const result = new Uint8Array(iv.length + encryptedArray.length);
  result.set(iv);
  result.set(encryptedArray, iv.length);
  
  return btoa(String.fromCharCode(...result));
};

export const decrypt = async (encryptedText: string, key: string): Promise<string> => {
  const encoder = new TextEncoder();
  const encryptedData = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0));
  
  const iv = encryptedData.slice(0, 12);
  const data = encryptedData.slice(12);
  
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
  
  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    data
  );
  
  return new TextDecoder().decode(decrypted);
};

// 日期格式化
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
};

// 深度克隆
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as any;
  }

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, deepClone(value)])
  ) as T;
};
