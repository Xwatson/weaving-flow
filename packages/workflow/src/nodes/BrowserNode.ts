import { BaseNode, NodeInput, NodeOutput } from "../core/BaseNode";

// 浏览器服务接口定义
export interface IBrowserService {
  create(url: string, options: BrowserOptions): Promise<any>;
  close(browser: any): Promise<void>;
}

// 浏览器配置选项
export interface BrowserOptions {
  url?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  userAgent?: string;
  proxy?: string;
  cookies?: Record<string, string>;
  headers?: Record<string, string>;
  timeout?: number;
  visible?: boolean;
}

export class BrowserNode extends BaseNode {
  private browserService: IBrowserService | null = null;

  constructor(id: string, name: string, config: Record<string, any> = {}) {
    super(id, name, "browser", config);
  }

  // 注入浏览器服务
  setBrowserService(service: IBrowserService): void {
    this.browserService = service;
  }

  getInputDefinitions(): NodeInput[] {
    return [
      {
        name: "url",
        type: "string",
        required: true,
        description: "要访问的URL地址",
      },
      {
        name: "width",
        type: "number",
        required: false,
        default: 1280,
        description: "浏览器窗口宽度",
      },
      {
        name: "height",
        type: "number",
        required: false,
        default: 800,
        description: "浏览器窗口高度",
      },
      {
        name: "userAgent",
        type: "string",
        required: false,
        description: "自定义User-Agent",
      },
      {
        name: "proxy",
        type: "string",
        required: false,
        description: "代理服务器地址",
      },
      {
        name: "cookies",
        type: "object",
        required: false,
        description: "Cookie信息",
      },
      {
        name: "headers",
        type: "object",
        required: false,
        description: "自定义请求头",
      },
      {
        name: "timeout",
        type: "number",
        required: false,
        default: 30000,
        description: "超时时间(毫秒)",
      },
      {
        name: "visible",
        type: "boolean",
        required: false,
        default: true,
        description: "是否显示浏览器窗口",
      },
    ];
  }

  getOutputDefinitions(): NodeOutput[] {
    return [
      {
        name: "browser",
        type: "object",
        description: "浏览器实例",
      },
      {
        name: "page",
        type: "object",
        description: "页面实例",
      },
      {
        name: "url",
        type: "string",
        description: "当前页面URL",
      },
      {
        name: "title",
        type: "string",
        description: "页面标题",
      },
      {
        name: "error",
        type: "object",
        description: "错误信息",
      },
    ];
  }

  async execute(): Promise<void> {
    try {
      // 检查服务是否已注入
      if (!this.browserService) {
        throw new Error("BrowserService未注入，无法执行浏览器节点");
      }
      const defaultConfig = this.getInputDefinitions()
        .filter((item) => item.default)
        .reduce((acc, item) => ({ ...acc, [item.name]: item.default }), {});

      const config: BrowserOptions = { ...defaultConfig, ...this.config };
      const url = config["url"];
      if (!url) {
        throw new Error("url 不能为空");
      }
      const options: BrowserOptions = {
        x: 0,
        y: 0,
        width: config["width"],
        height: config["height"],
        userAgent: config["userAgent"],
        proxy: config["proxy"],
        cookies: config["cookies"],
        headers: config["headers"],
        timeout: config["timeout"],
        visible: config["visible"],
      };

      // 创建浏览器实例
      const browser = await this.browserService.create(url, options);

      // 设置输出
      this.setOutput("browser", browser);

      // 输出页面信息
      if (browser && browser.page) {
        this.setOutput("page", browser.page);
        this.setOutput("url", await browser.page.url());
        this.setOutput("title", await browser.page.title());
      }
    } catch (error) {
      this.setOutput("error", error);
      throw error;
    }
  }

  // 清理资源
  async cleanup(): Promise<void> {
    try {
      // 获取浏览器实例
      const browser = this.getOutput("browser");

      // 如果存在浏览器实例且服务可用，则关闭浏览器
      if (browser && this.browserService) {
        await this.browserService.close(browser);
        console.log(`已关闭浏览器节点 ${this.id} 的资源`);
      }
    } catch (error) {
      console.error(`关闭浏览器节点 ${this.id} 资源时出错:`, error);
    }
  }
}
