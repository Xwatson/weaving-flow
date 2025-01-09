import React, { useEffect, useState } from "react";
import { Input, Button } from "antd";
import {
  LeftOutlined,
  RightOutlined,
  ReloadOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { TabBar } from "./TabBar";
import styles from "./index.module.less";

export const Browser: React.FC = () => {
  const [isNewTab, setIsNewTab] = useState<boolean>(false);
  const [activeTabId, setActiveTabId] = useState<string>();
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    window.browser.getTabs().then((tabs) => {
      setIsNewTab(tabs.length > 0);
    });
    // 监听活动标签页变化
    return window.browser.onTabsChanged((tabs) => {
      const activeTab = tabs.find((tab) => tab.active);
      if (activeTab) {
        setActiveTabId(activeTab.id);
        setCurrentUrl(activeTab.url);
      }
    });
  }, []);

  const handleNewTab = async () => {
    try {
      const tabId = await window.browser.createTab({
        url: "about:home",
        active: true,
      });
      console.log("New tab created:", tabId);
    } catch (error) {
      console.error("Failed to create new tab:", error);
    }
  };

  const handleUrlChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && activeTabId) {
      const url = e.currentTarget.value;
      const fullUrl = url.includes("://") ? url : `https://${url}`;
      window.browser.updateTab(activeTabId, { url: fullUrl });
    }
  };

  const handleGoBack = () => {
    if (activeTabId) {
      window.browser.goBack(activeTabId);
    }
  };

  const handleGoForward = () => {
    if (activeTabId) {
      window.browser.goForward(activeTabId);
    }
  };

  const handleReload = () => {
    if (activeTabId) {
      window.browser.reload(activeTabId);
    }
  };

  const handleHome = () => {
    if (activeTabId) {
      window.browser.updateTab(activeTabId, { url: "about:home" });
    }
  };

  if (isNewTab) {
    return null;
  }

  return (
    <div className={styles.browser}>
      <TabBar onNewTab={handleNewTab} />
      <div className={styles.toolbar}>
        <div className={styles.navigationButtons}>
          <Button
            type="text"
            icon={<LeftOutlined />}
            onClick={handleGoBack}
            disabled={!activeTabId}
          />
          <Button
            type="text"
            icon={<RightOutlined />}
            onClick={handleGoForward}
            disabled={!activeTabId}
          />
          <Button
            type="text"
            icon={<ReloadOutlined />}
            onClick={handleReload}
            disabled={!activeTabId}
          />
          <Button
            type="text"
            icon={<HomeOutlined />}
            onClick={handleHome}
            disabled={!activeTabId}
          />
        </div>
        <Input
          className={styles.urlInput}
          value={currentUrl}
          onChange={(e) => setCurrentUrl(e.target.value)}
          onKeyPress={handleUrlChange}
          placeholder="输入网址或搜索内容"
        />
      </div>
    </div>
  );
};
