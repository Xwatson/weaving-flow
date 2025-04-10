import * as playwright from "playwright";

export interface CreateBrowserResult {
  browser: playwright.Browser;
  context: playwright.BrowserContext;
  page: playwright.Page;
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
export interface IBrowserService {
  create(url: string, options: BrowserOptions): Promise<CreateBrowserResult>;
  close(): Promise<void>;
}
export class BrowserService implements IBrowserService {
  // 存储已创建的浏览器实例，便于管理和关闭
  private browser: playwright.Browser | null = null;

  async create(url: string, options: BrowserOptions) {
    this.browser = await playwright.chromium.launch({
      headless: !options.visible,
    });

    const context = await this.browser.newContext({
      viewport: {
        width: options.width || 1280,
        height: options.height || 800,
      },
      userAgent: options.userAgent,
      proxy: options.proxy ? { server: options.proxy } : undefined,
    });

    // 如果有cookies，设置cookies
    if (options.cookies) {
      const cookieArray = Object.entries(options.cookies).map(
        ([name, value]) => ({
          name,
          value,
          domain: new URL(url).hostname,
          path: "/",
        })
      );
      await context.addCookies(cookieArray);
    }

    const page = await context.newPage();

    // 如果有自定义请求头，设置请求头
    if (options.headers) {
      await page.setExtraHTTPHeaders(options.headers);
    }

    // 设置超时
    if (options.timeout) {
      page.setDefaultNavigationTimeout(options.timeout);
    }

    // 导航到URL
    await page.goto(url);

    // 返回包含浏览器、页面和id的对象
    return {
      browser: this.browser,
      context,
      page,
      // 添加常用的页面操作方法
      executeJs: async (script: string) => {
        return await page.evaluate(script);
      },
      close: async () => {
        await this.close();
      },
    };
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
