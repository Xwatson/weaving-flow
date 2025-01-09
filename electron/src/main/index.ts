import { app, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import isDev from "electron-is-dev";
import Store from "electron-store";
import { setupCrawlerHandlers } from "./handlers/crawler";
import { createMainWindow, setupBrowserHandlers } from "./handlers/browser";
import { setupCredentialHandlers } from "./handlers/credential";

// 初始化存储
Store.initRenderer();
const store = new Store();

let mainWindow: BrowserWindow | null = null;

// 应用程序准备就绪时创建窗口
app.whenReady().then(async () => {
  mainWindow = await createMainWindow();

  // 设置IPC处理程序
  setupCrawlerHandlers();
  setupBrowserHandlers();
  setupCredentialHandlers();

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = await createMainWindow();
    }
  });
});

// 所有窗口关闭时退出应用
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// 设置全局错误处理
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

// IPC 通信处理
ipcMain.handle("store:get", async (_, key: string) => {
  return store.get(key);
});

ipcMain.handle("store:set", async (_, key: string, value: any) => {
  store.set(key, value);
});

// 导出主窗口实例，供其他模块使用
export { mainWindow };
