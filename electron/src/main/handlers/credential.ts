import { ipcMain } from 'electron';
import Store from 'electron-store';
import { encrypt, decrypt } from '@weaving-flow/core';

const store = new Store();
const ENCRYPTION_KEY = 'your-secret-encryption-key';

export const setupCredentialHandlers = () => {
  // 保存凭证
  ipcMain.handle('credential:save', async (_, domain: string, username: string, password: string) => {
    try {
      const encryptedPassword = await encrypt(password, ENCRYPTION_KEY);
      const credentials = store.get('credentials', {}) as Record<string, any>;
      
      credentials[domain] = {
        username,
        password: encryptedPassword,
        updatedAt: new Date().toISOString(),
      };

      store.set('credentials', credentials);
      return true;
    } catch (error) {
      console.error('Failed to save credential:', error);
      return false;
    }
  });

  // 获取凭证
  ipcMain.handle('credential:get', async (_, domain: string) => {
    try {
      const credentials = store.get('credentials', {}) as Record<string, any>;
      const credential = credentials[domain];

      if (!credential) {
        return null;
      }

      const decryptedPassword = await decrypt(credential.password, ENCRYPTION_KEY);
      return {
        username: credential.username,
        password: decryptedPassword,
        updatedAt: credential.updatedAt,
      };
    } catch (error) {
      console.error('Failed to get credential:', error);
      return null;
    }
  });

  // 删除凭证
  ipcMain.handle('credential:delete', async (_, domain: string) => {
    try {
      const credentials = store.get('credentials', {}) as Record<string, any>;
      delete credentials[domain];
      store.set('credentials', credentials);
      return true;
    } catch (error) {
      console.error('Failed to delete credential:', error);
      return false;
    }
  });

  // 获取所有凭证域名
  ipcMain.handle('credential:list-domains', async () => {
    try {
      const credentials = store.get('credentials', {}) as Record<string, any>;
      return Object.keys(credentials);
    } catch (error) {
      console.error('Failed to list credential domains:', error);
      return [];
    }
  });
};
