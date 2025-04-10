import {
  BrowserOptions,
  CreateBrowserResult,
  IBrowserService,
} from "../services/BrowserService";
import {
  BaseNode,
  ExecuteOptions,
  NodeInput,
  NodeOutput,
} from "../core/BaseNode";
import * as playwright from "playwright";

export class BrowserNode extends BaseNode {
  private browserService: IBrowserService | null = null;

  constructor(
    id: string,
    flowName: string,
    nodeName: string,
    config: Record<string, any> = {}
  ) {
    super(id, flowName, nodeName, "browser", config);
  }

  // 注入浏览器服务
  setBrowserService(service: IBrowserService): void {
    this.browserService = service;
  }

  getDefaultConfig(): NodeInput[] {
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

  async execute(executeOptions?: ExecuteOptions): Promise<void> {
    try {
      // 检查服务是否已注入
      if (!this.browserService) {
        throw new Error("BrowserService未注入，无法执行浏览器节点");
      }
      const defaultConfig = this.getDefaultConfig()
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
      console.log("options", options);
      // 创建浏览器实例
      const browser = await this.browserService.create(url, options);
      // 执行脚本
      const scripts = this.config["scripts"];
      const results: any[] = [];
      const newPages: any[] = [];
      if (scripts) {
        let index = 0;
        while (index < scripts.length) {
          const beforeScript = this.config["beforeScript"];
          if (beforeScript) {
            const type = beforeScript["type"];
            let pass = false;
            let isBreak = false;
            let message = `判断类型：${type}`;
            switch (type) {
              case "getPageUrl":
                const delay = beforeScript.getPageUrlDelay;
                if (delay) {
                  await new Promise((resolve) => setTimeout(resolve, delay));
                }
                const operator = beforeScript.operator;
                const value = beforeScript.value;
                const url = await browser.page?.url();
                message += `，获取到URL：${url}，运算符：${operator}，判断值：${value}`;
                if (url) {
                  switch (operator) {
                    case "==":
                      if (url === value) {
                        pass = true;
                      }
                      break;
                    case "!=":
                      if (url !== value) {
                        pass = true;
                      }
                      break;
                    case "includes":
                      if (url.includes(value)) {
                        pass = true;
                      }
                      break;
                  }
                }
                break;
              case "waitForSelector":
                await this.waitSelector(browser, beforeScript.selector);
                message += `，获取到Selector：${beforeScript.selector}`;
                pass = true;
                break;
              default:
                break;
            }
            // 命中条件采取措施
            if (pass) {
              const action = beforeScript.action;
              message += `，采取措施：${action}`;

              switch (action) {
                case "waitTime":
                  const waitTime = beforeScript.actionWaitTime;
                  await new Promise((resolve) => setTimeout(resolve, waitTime));
                  message += `，等待时间：${waitTime}`;
                  break;
                case "waitSelector":
                  const waitSelector = beforeScript.actionWaitSelector;
                  await this.waitSelector(browser, waitSelector);
                  message += `，获取到Selector：${waitSelector}`;
                  break;
                case "continue":
                  break;
                case "break":
                  isBreak = true;
                  break;
                case "jumpIndex":
                  const jumpIndex = parseInt(beforeScript.actionJumpIndex, 10);
                  index = jumpIndex;
                  break;
              }
              if (
                beforeScript.sendNotification &&
                executeOptions?.notificationCallback
              ) {
                await executeOptions?.notificationCallback(
                  "《Weaving Flow》自动化流程通知",
                  `自动化流程：${this.flowName}，节点：${this.name}，执行脚本前判断条件成立！<br/>${message}`,
                  "info"
                );
              }
            }
            if (isBreak) {
              break;
            }
          }
          const script = scripts[index];
          switch (script.type) {
            case "script":
              results.push(
                await browser.page?.evaluate(
                  new Function("results", `${script.script}`) as any,
                  results
                )
              );
              break;
            case "delay":
              await new Promise((resolve) => setTimeout(resolve, script.delay));
              break;
            case "getPageUrl":
              results.push(await browser.page?.url());
              break;
            case "waitForSelector":
              await this.waitSelector(browser, script.selector, script.timeout);
              break;
            case "waitPage":
              const pageWinner = await this.waitPage(script, browser);
              if (pageWinner.type === "newPage" && pageWinner.value) {
                const newPage = pageWinner.value;
                browser.page = newPage;
                results.push(await newPage.url());
                newPages.push(newPage);
              } else if (pageWinner.type === "navigation") {
                results.push(await browser.page?.url());
              } else {
                results.push("页面加载完成，但未检测到页面变化");
              }
              break;
            case "click":
              await browser.page?.click(script.selector);
              const clickWinner = await this.waitPage(script, browser);
              // 如果新页面被创建，切换到新页面
              if (clickWinner.type === "newPage" && clickWinner.value) {
                const newPage = clickWinner.value;
                await newPage.waitForLoadState("load");
                browser.page = newPage;
                results.push(await newPage.url());
                newPages.push(newPage);
              } else if (clickWinner.type === "navigation") {
                results.push(await browser.page?.url());
              } else {
                results.push("点击操作完成，但未检测到页面变化");
              }
              break;
            case "returnPreviousPage":
              if (newPages.length > 0) {
                const previousPage = newPages.pop();
                browser.page = previousPage;
                results.push(await previousPage.url());
              } else {
                results.push("未检测到上一个页面");
              }
              break;
            case "fill":
              await browser.page?.fill(script.selector, script.value, {
                timeout: script.timeout || 30000,
              });
              results.push(`已填充表单 ${script.selector} 为 ${script.value}`);
              break;
            case "type":
              await browser.page?.type(script.selector, script.text, {
                delay: script.delay || 100,
              });
              results.push(`已在 ${script.selector} 中键入文本`);
              break;
            case "press":
              if (script.selector) {
                await browser.page?.press(script.selector, script.key);
                results.push(
                  `已在元素 ${script.selector} 上按下 ${script.key} 键`
                );
              } else {
                await browser.page?.keyboard.press(script.key);
                results.push(`已按下 ${script.key} 键`);
              }
              break;
            case "hover":
              await browser.page?.hover(script.selector, {
                timeout: script.timeout || 30000,
              });
              results.push(`已悬停在 ${script.selector} 上`);
              break;
            case "screenshot":
              if (script.selector) {
                const element = await browser.page?.$(script.selector);
                if (element) {
                  await element.screenshot({ path: script.path });
                  results.push(
                    `已对元素 ${script.selector} 截图并保存至 ${script.path}`
                  );
                } else {
                  results.push(`未找到元素 ${script.selector} 进行截图`);
                }
              } else {
                await browser.page?.screenshot({
                  path: script.path,
                  fullPage: script.fullPage || false,
                });
                results.push(`已对页面截图并保存至 ${script.path}`);
              }
              break;
            case "evaluate":
              const evaluateResult = await browser.page?.evaluate(
                (expression) => {
                  return eval(expression);
                },
                script.expression
              );
              results.push(evaluateResult);
              break;
            case "waitForLoadState":
              await browser.page?.waitForLoadState(script.state || "load", {
                timeout: script.timeout || 30000,
              });
              results.push(`页面已达到 ${script.state || "load"} 状态`);
              break;
            case "selectOption":
              const selectedValues = await browser.page?.selectOption(
                script.selector,
                script.value
              );
              results.push(
                `已在 ${script.selector} 中选择选项 ${script.value}`
              );
              break;
            case "checkOrUncheck":
              if (script.checked) {
                await browser.page?.check(script.selector);
                results.push(`已选中 ${script.selector}`);
              } else {
                await browser.page?.uncheck(script.selector);
                results.push(`已取消选中 ${script.selector}`);
              }
              break;
            case "goBack":
              await browser.page?.goBack({
                timeout: script.timeout || 30000,
              });
              results.push(`已返回上一页`);
              break;
            case "goForward":
              await browser.page?.goForward({
                timeout: script.timeout || 30000,
              });
              results.push(`已前进到下一页`);
              break;
            case "reload":
              await browser.page?.reload({
                waitUntil: script.waitUntil || "load",
              });
              results.push(`已刷新页面`);
              break;
          }
          index++;
        }
      }

      console.log("results", results);
      // 设置输出
      this.setOutput("browser", browser);

      // 输出页面信息
      if (browser && browser.page) {
        this.setOutput("page", browser.page);
        this.setOutput("url", await browser.page.url());
        this.setOutput("title", await browser.page.title());
        this.setOutput("results", results);
      }
    } catch (error) {
      this.setOutput("error", error);
      throw error;
    }
  }

  private async waitSelector(
    browser: CreateBrowserResult,
    selector: string,
    timeout: number = 30000
  ): Promise<void> {
    try {
      await browser.page?.waitForSelector(selector, {
        timeout: timeout,
      });
    } catch (error: any) {
      console.error("等待选择器时出错:", error);
      if (error.name === "TimeoutError") {
        // 超时继续
        console.log("继续等待选择器");
        return this.waitSelector(browser, selector);
      } else {
        throw error;
      }
    }
  }

  private async waitPage(
    script: any,
    browser: CreateBrowserResult
  ): Promise<{ type: string; value: void | playwright.Page }> {
    // 尝试等待新页面创建
    const pagePromise = browser.context
      .waitForEvent("page", {
        timeout: script.timeout || 30000,
      })
      .catch(() => console.log("未检测到新页面创建"));

    // 同时等待当前页面导航（以防不是新标签页打开）
    const navPromise = browser.page
      ?.waitForNavigation({
        timeout: script.timeout || 30000,
      })
      .then(() => browser.page)
      .catch(() => console.log("未检测到页面导航"));

    // 等待任一事件发生
    const winner = await Promise.race([
      pagePromise.then((page) => ({
        type: "newPage",
        value: page,
      })),
      navPromise.then((nav) => ({
        type: "navigation",
        value: nav,
      })),
    ]);

    try {
      if (winner.type === "newPage" && winner.value) {
        const newPage = winner.value;
        await newPage.waitForLoadState("load", {
          timeout: script.timeout || 30000,
        });
      }
      await browser.page?.waitForLoadState("load", {
        timeout: script.timeout || 30000,
      });
      return winner;
    } catch (error: any) {
      console.error("等待页面加载时出错:", error);
      if (error.name === "TimeoutError") {
        // 超时继续
        console.log("继续等待页面加载");
        return this.waitPage(script, browser);
      } else {
        throw error;
      }
    }
  }

  // 清理资源
  async cleanup(): Promise<void> {
    try {
      // 获取浏览器实例
      const browser = this.getOutput("browser");

      // 如果存在浏览器实例且服务可用，则关闭浏览器
      if (browser && this.browserService) {
        await this.browserService.close();
        console.log(`已关闭浏览器节点 ${this.id} 的资源`);
      }
    } catch (error) {
      console.error(`关闭浏览器节点 ${this.id} 资源时出错:`, error);
    }
  }
}
