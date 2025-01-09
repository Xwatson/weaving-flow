import type { BrowserConfig, TabInfo, TabCreateOptions, TabUpdateOptions } from '@weaving-flow/core';

declare global {
  interface Window {
    browser: {
      create: (config: BrowserConfig) => Promise<void>;
      createTab: (options: TabCreateOptions) => Promise<string>;
      updateTab: (tabId: string, options: TabUpdateOptions) => Promise<void>;
      closeTab: (tabId: string) => Promise<void>;
      activateTab: (tabId: string) => Promise<void>;
      getTabs: () => Promise<TabInfo[]>;
      getActiveTab: () => Promise<TabInfo | null>;
      goBack: (tabId: string) => Promise<void>;
      goForward: (tabId: string) => Promise<void>;
      reload: (tabId: string) => Promise<void>;
      close: () => Promise<void>;
      onTabsChanged: (callback: (tabs: TabInfo[]) => void) => () => void;
    };
  }
}
