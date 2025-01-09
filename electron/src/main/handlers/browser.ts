import { app, BrowserWindow, ipcMain } from "electron";
import { TabManager } from "../managers/TabManager";
import type {
  BrowserConfig,
  TabCreateOptions,
  TabUpdateOptions,
} from "@weaving-flow/core";
import path from "path";
import isDev from "electron-is-dev";

let mainWindow: BrowserWindow | null = null;
let tabManager: TabManager | null = null;

export const createMainWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1200,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, "../../preload/index.js"),
    },
  });

  // 加载主界面
  if (isDev) {
    await mainWindow.loadURL("http://localhost:5173");
    // mainWindow.webContents.openDevTools();
  } else {
    await mainWindow.loadFile(
      path.join(__dirname, "../../../client/dist/index.html")
    );
  }

  // 初始化标签页管理器
  tabManager = new TabManager(mainWindow);

  mainWindow.on("closed", () => {
    mainWindow = null;
    tabManager = null;
  });

  return mainWindow;
};

export const setupBrowserHandlers = () => {
  // 创建窗口
  ipcMain.handle("browser:create", async (_, config: BrowserConfig) => {
    if (mainWindow) {
      mainWindow.focus();
      return;
    }

    await createMainWindow();
  });

  // 创建标签页
  ipcMain.handle("browser:createTab", async (_, options: TabCreateOptions) => {
    if (!mainWindow || !tabManager) {
      return;
    }
    return await tabManager.createTab(options);
  });

  // 更新标签页
  ipcMain.handle(
    "browser:updateTab",
    async (_, tabId: string, options: TabUpdateOptions) => {
      if (!tabManager) return;
      await tabManager.updateTab(tabId, options);
    }
  );

  // 关闭标签页
  ipcMain.handle("browser:closeTab", async (_, tabId: string) => {
    if (!tabManager) return;
    await tabManager.closeTab(tabId);
  });

  // 激活标签页
  ipcMain.handle("browser:activateTab", async (_, tabId: string) => {
    if (!tabManager) return;
    await tabManager.activateTab(tabId);
  });

  // 获取所有标签页
  ipcMain.handle("browser:getTabs", () => {
    if (!tabManager) return [];
    return tabManager.getTabs();
  });

  // 获取活动标签页
  ipcMain.handle("browser:getActiveTab", () => {
    if (!tabManager) return null;
    return tabManager.getActiveTab();
  });

  // 导航控制
  ipcMain.handle("browser:goBack", async (_, tabId: string) => {
    if (!tabManager) return;
    await tabManager.goBack(tabId);
  });

  ipcMain.handle("browser:goForward", async (_, tabId: string) => {
    if (!tabManager) return;
    await tabManager.goForward(tabId);
  });

  ipcMain.handle("browser:reload", async (_, tabId: string) => {
    if (!tabManager) return;
    await tabManager.reload(tabId);
  });

  // 关闭窗口
  ipcMain.handle("browser:close", () => {
    if (mainWindow) {
      mainWindow.close();
    }
  });
};
