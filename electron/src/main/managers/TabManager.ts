import { BrowserView, BrowserWindow } from "electron";
import type {
  TabInfo,
  TabCreateOptions,
  TabUpdateOptions,
} from "@weaving-flow/core";
import path from "path";
import isDev from "electron-is-dev";

interface InternalTabInfo extends TabInfo {
  view: BrowserView;
}

export class TabManager {
  private window: BrowserWindow;
  private tabs: Map<string, InternalTabInfo> = new Map();
  private activeTabId: string | null = null;

  constructor(window: BrowserWindow) {
    this.window = window;

    // 监听窗口大小变化
    this.window.on("resize", () => {
      this.updateActiveViewBounds();
    });
  }

  // 生成唯一ID
  private generateId(): string {
    return `tab-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  // 获取所有标签页信息
  getTabs(): TabInfo[] {
    return Array.from(this.tabs.values()).map(({ view, ...tab }) => tab);
  }

  // 获取活动标签页信息
  getActiveTab(): TabInfo | null {
    if (!this.activeTabId) return null;
    const tab = this.tabs.get(this.activeTabId);
    if (!tab) return null;
    const { view, ...info } = tab;
    return info;
  }

  // 创建新标签页
  async createTab(options: TabCreateOptions): Promise<string> {
    const id = this.generateId();
    const view = new BrowserView({
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        preload: path.join(__dirname, "../../preload/index.js"),
      },
    });

    // 设置标签页信息
    const tab: InternalTabInfo = {
      id,
      url: options.url,
      title: options.url,
      active: false,
      loading: true,
      canGoBack: false,
      canGoForward: false,
      view,
    };

    // 监听标签页事件
    this.setupViewEvents(tab);

    this.tabs.set(id, tab);

    // 如果指定为活动标签页或是第一个标签页，则激活
    if (options.active || this.tabs.size === 1) {
      await this.activateTab(id);
    }

    // 加载URL
    if (options.url === "about:home") {
      if (isDev) {
        await view.webContents.loadURL("http://localhost:5173");
      } else {
        await view.webContents.loadFile(
          path.join(__dirname, "../../../client/dist/index.html")
        );
      }
    } else {
      await view.webContents.loadURL(options.url);
    }
    // if (isDev) {
    //   const r = Math.floor(Math.random() * 256);
    //   const g = Math.floor(Math.random() * 256);
    //   const b = Math.floor(Math.random() * 256);
    //   view.webContents.insertCSS(`
    //   body {
    //     border: 1px solid rgb(${r}, ${g}, ${b}) !important;
    //     box-shadow: 0 0 10px rgba(${r}, ${g}, ${b}, 0.5);
    //   }
    // `);
    // }
    return id;
  }

  // 激活标签页
  async activateTab(tabId: string): Promise<void> {
    const tab = this.tabs.get(tabId);
    if (!tab) return;

    // 取消当前活动标签页
    if (this.activeTabId) {
      const activeTab = this.tabs.get(this.activeTabId);
      if (activeTab) {
        this.window.removeBrowserView(activeTab.view);
        activeTab.active = false;
      }
    }

    // 激活新标签页
    this.window.addBrowserView(tab.view);
    tab.active = true;
    this.activeTabId = tabId;

    // 更新视图大小
    this.updateActiveViewBounds();

    this.emitTabsChange();
    console.log("current tab:", tabId);
  }

  // 更新标签页
  async updateTab(tabId: string, options: TabUpdateOptions): Promise<void> {
    const tab = this.tabs.get(tabId);
    if (!tab) return;

    if (options.url) {
      await tab.view.webContents.loadURL(options.url);
      tab.url = options.url;
    }

    if (options.active) {
      await this.activateTab(tabId);
    }
  }

  // 关闭标签页
  async closeTab(tabId: string): Promise<void> {
    const tab = this.tabs.get(tabId);
    if (!tab) return;

    // 如果关闭的是活动标签页，需要先激活其他标签页
    if (tabId === this.activeTabId) {
      const tabIds = Array.from(this.tabs.keys());
      const currentIndex = tabIds.indexOf(tabId);
      const nextTabId = tabIds[currentIndex + 1] || tabIds[currentIndex - 1];

      if (nextTabId) {
        await this.activateTab(nextTabId);
      }
    }

    // 移除标签页
    if (tab.active) {
      this.window.removeBrowserView(tab.view);
    }
    this.tabs.delete(tabId);

    this.emitTabsChange();
  }

  // 前进
  async goForward(tabId: string): Promise<void> {
    const tab = this.tabs.get(tabId);
    if (!tab) return;
    if (tab.canGoForward) {
      await tab.view.webContents.goForward();
    }
  }

  // 后退
  async goBack(tabId: string): Promise<void> {
    const tab = this.tabs.get(tabId);
    if (!tab) return;
    if (tab.canGoBack) {
      await tab.view.webContents.goBack();
    }
  }

  // 刷新
  async reload(tabId: string): Promise<void> {
    const tab = this.tabs.get(tabId);
    if (!tab) return;
    await tab.view.webContents.reload();
  }

  // 更新活动视图的大小和位置
  private updateActiveViewBounds(): void {
    if (!this.activeTabId) return;
    const tab = this.tabs.get(this.activeTabId);
    if (!tab) return;

    const bounds = this.window.getBounds();
    tab.view.setBounds({
      x: 0,
      y: 80, // 标签栏高度
      width: bounds.width,
      height: bounds.height - 80,
    });
  }

  // 设置标签页事件监听
  private setupViewEvents(tab: InternalTabInfo): void {
    const { webContents } = tab.view;

    webContents.on("page-title-updated", (event, title) => {
      tab.title = title;
      this.emitTabsChange();
    });

    webContents.on("did-start-loading", () => {
      tab.loading = true;
      this.emitTabsChange();
    });

    webContents.on("did-stop-loading", () => {
      tab.loading = false;
      this.emitTabsChange();
    });

    webContents.on("did-navigate", (event, url) => {
      tab.url = url;
      tab.canGoBack = webContents.canGoBack();
      tab.canGoForward = webContents.canGoForward();
      this.emitTabsChange();
    });

    webContents.on("did-navigate-in-page", (event, url) => {
      tab.url = url;
      tab.canGoBack = webContents.canGoBack();
      tab.canGoForward = webContents.canGoForward();
      this.emitTabsChange();
    });
  }

  // 通知标签页状态变化
  private emitTabsChange(): void {
    this.window.webContents.send("tabs-changed", this.getTabs());
  }
}
