// 环境类型
export type Environment = "electron" | "server" | "mobile";

// 基础服务接口
export interface IBaseService {
  initialize(): Promise<void>;
  destroy(): Promise<void>;
}

// 爬虫相关类型
export interface CrawlerConfig {
  url: string;
  selector?: string;
  waitFor?: string | number;
  isHeadless?: boolean;
}

export interface CrawlerResult {
  success: boolean;
  data: any;
  error?: string | null;
}

// 工作流相关类型
export interface WorkflowNode {
  id: string;
  type: string;
  name: string;
  config: Record<string, any>;
  inputs: Map<string, any>;
  outputs: Map<string, any>;
}

export interface WorkflowConnection {
  id: string;
  sourceNodeId: string;
  sourceOutput: string;
  targetNodeId: string;
  targetInput: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
}

// 浏览器相关类型
export interface BrowserConfig {
  type: "chrome" | "edge";
  userDataDir?: string;
  defaultViewport?: {
    width: number;
    height: number;
  };
}

// 浏览器标签页相关类型
export interface TabInfo {
  id: string;
  url: string;
  title: string;
  active: boolean;
  loading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
}

export interface TabCreateOptions {
  url: string;
  active?: boolean;
}

export interface TabUpdateOptions {
  url?: string;
  active?: boolean;
}

// 收藏夹相关类型
export interface Bookmark {
  id: string;
  title: string;
  url: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// 密码存储相关类型
export interface Credential {
  id: string;
  domain: string;
  username: string;
  password: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
