import { IBrowserService, BrowserOptions } from "../nodes/BrowserNode";
import * as playwright from "playwright";

export class BrowserService implements IBrowserService {
  // 存储已创建的浏览器实例，便于管理和关闭
  private browsers: Map<string, playwright.Browser> = new Map();

  async create(url: string, options: BrowserOptions): Promise<any> {
    const browser = await playwright.chromium.launch({
      headless: !options.visible,
    });

    const context = await browser.newContext({
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

    // 保存浏览器实例
    const id = Date.now().toString();
    this.browsers.set(id, browser);

    // 返回包含浏览器、页面和id的对象
    return {
      id,
      browser,
      page,
      // 添加常用的页面操作方法
      executeJs: async (script: string) => {
        return await page.evaluate(script);
      },
      close: async () => {
        await this.close({ id, browser, page });
      },
    };
  }

  async close(browserInstance: any): Promise<void> {
    if (browserInstance.id && this.browsers.has(browserInstance.id)) {
      const browser = this.browsers.get(browserInstance.id);
      if (browser) {
        await browser.close();
        this.browsers.delete(browserInstance.id);
      }
    } else if (browserInstance.browser) {
      await browserInstance.browser.close();
    }
  }
}
