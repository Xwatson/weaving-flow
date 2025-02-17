import React from "react";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import styles from "./index.module.less";

const { Search } = Input;

const HomePage: React.FC = () => {
  const handleSearch = (value: string) => {
    if (!value) return;
    // 如果URL不包含协议，添加 https://
    const url = value.includes("://") ? value : `https://${value}`;
    window.browser.createTab({ url, active: true });
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.linkWrapper}>
          <a href="/admin/workflow">工作流</a>
        </div>
        <div className={styles.searchWrapper}>
          <Search
            placeholder="输入网址或搜索内容"
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
