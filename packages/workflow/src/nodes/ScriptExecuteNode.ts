import { BaseNode, NodeInput, NodeOutput } from "../core/BaseNode";

export class ScriptExecuteNode extends BaseNode {
  private browserService: any; // 这里应该注入浏览器服务

  constructor(id: string, name: string, config: Record<string, any> = {}) {
    super(id, name, "scriptExecute", config);
  }

  getInputDefinitions(): NodeInput[] {
    return [
      {
        name: "browser",
        type: "object",
        required: true,
      },
      {
        name: "script",
        type: "string",
        required: true,
      },
      {
        name: "enableCaptchaCheck",
        type: "boolean",
        required: false,
        default: false,
      },
      {
        name: "captchaCheckScript",
        type: "string",
        required: false,
        description:
          "验证码检测脚本，需要返回布尔值：true表示存在验证码，false表示无验证码或验证码已处理",
      },
      {
        name: "captchaTimeout",
        type: "number",
        required: false,
        default: 300000, // 5分钟超时
      },
      {
        name: "captchaCheckInterval",
        type: "number",
        required: false,
        default: 1000, // 每秒检查一次
      },
    ];
  }

  getOutputDefinitions(): NodeOutput[] {
    return [
      {
        name: "results",
        type: "array",
      },
      {
        name: "error",
        type: "Error",
      },
    ];
  }

  private async waitForCaptcha(
    browser: any,
    checkScript: string
  ): Promise<boolean> {
    const hasCaptcha = await browser.executeJs(checkScript);
    return !!hasCaptcha; // 确保返回布尔值
  }

  async execute(): Promise<void> {
    try {
      const browser = this.getInput("browser");
      const script = this.getInput("script");
      const enableCaptchaCheck = this.getInput("enableCaptchaCheck");
      const captchaCheckScript = this.getInput("captchaCheckScript");
      const captchaTimeout = this.getInput("captchaTimeout");
      const captchaCheckInterval = this.getInput("captchaCheckInterval");

      let results: any[] = [];
      let shouldContinue = true;

      while (shouldContinue) {
        // 检查是否需要验证码检测
        if (enableCaptchaCheck && captchaCheckScript) {
          const startTime = Date.now();
          while (await this.waitForCaptcha(browser, captchaCheckScript)) {
            if (Date.now() - startTime > captchaTimeout) {
              throw new Error("等待验证码处理超时");
            }
            // 等待用户处理验证码
            await new Promise((resolve) =>
              setTimeout(resolve, captchaCheckInterval)
            );
          }
        }

        // 执行脚本
        const result = await browser.executeJs(script);

        // 期望脚本返回格式 { data: any, shouldContinue: boolean }
        if (result && result.data) {
          results.push(result.data);
          shouldContinue = result.shouldContinue === true;
        } else {
          shouldContinue = false;
        }
      }

      this.setOutput("results", results);
    } catch (error) {
      this.setOutput("error", error);
      throw error;
    }
  }
}
