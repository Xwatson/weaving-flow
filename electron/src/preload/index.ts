import { contextBridge, ipcRenderer } from 'electron';
import type {
  BrowserConfig,
  TabInfo,
  TabCreateOptions,
  TabUpdateOptions,
} from "@weaving-flow/core";

// 浏览器 API
contextBridge.exposeInMainWorld('browser', {
  // 创建窗口
  create: (config: BrowserConfig) => ipcRenderer.invoke("browser:create", config),

  // 标签页管理
  createTab: (options: TabCreateOptions) =>
    ipcRenderer.invoke("browser:createTab", options),
  updateTab: (tabId: string, options: TabUpdateOptions) =>
    ipcRenderer.invoke("browser:updateTab", tabId, options),
  closeTab: (tabId: string) => ipcRenderer.invoke("browser:closeTab", tabId),
  activateTab: (tabId: string) =>
    ipcRenderer.invoke("browser:activateTab", tabId),
  getTabs: () => ipcRenderer.invoke("browser:getTabs"),
  getActiveTab: () => ipcRenderer.invoke("browser:getActiveTab"),

  // 导航控制
  goBack: (tabId: string) => ipcRenderer.invoke("browser:goBack", tabId),
  goForward: (tabId: string) => ipcRenderer.invoke("browser:goForward", tabId),
  reload: (tabId: string) => ipcRenderer.invoke("browser:reload", tabId),

  // 关闭窗口
  close: () => ipcRenderer.invoke("browser:close"),

  // 事件监听
  onTabsChanged: (callback: (tabs: TabInfo[]) => void) => {
    const subscription = (_: any, tabs: TabInfo[]) => callback(tabs);
    ipcRenderer.on("tabs-changed", subscription);
    return () => {
      ipcRenderer.removeListener("tabs-changed", subscription);
    };
  },
});

// 存储 API
contextBridge.exposeInMainWorld('store', {
  get: (key: string) => ipcRenderer.invoke("store:get", key),
  set: (key: string, value: any) => ipcRenderer.invoke("store:set", key, value),
});

// 爬虫操作
contextBridge.exposeInMainWorld('crawler', {
  init: () => ipcRenderer.invoke('crawler:init'),
  execute: (config: any) => ipcRenderer.invoke('crawler:execute', config),
  close: () => ipcRenderer.invoke('crawler:close'),
});

// 凭证操作
contextBridge.exposeInMainWorld('credential', {
  save: (domain: string, username: string, password: string) =>
    ipcRenderer.invoke('credential:save', domain, username, password),
  get: (domain: string) => ipcRenderer.invoke('credential:get', domain),
  delete: (domain: string) => ipcRenderer.invoke('credential:delete', domain),
  listDomains: () => ipcRenderer.invoke('credential:list-domains'),
});
