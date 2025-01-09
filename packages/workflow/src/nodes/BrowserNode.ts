import { BaseNode, NodeInput, NodeOutput } from '../core/BaseNode';

export class BrowserNode extends BaseNode {
  private browserService: any; // 这里应该注入浏览器服务

  constructor(name: string, config: Record<string, any> = {}) {
    super(name, 'browser', config);
  }

  getInputDefinitions(): NodeInput[] {
    return [
      {
        name: 'url',
        type: 'string',
        required: true,
      },
      {
        name: 'script',
        type: 'string',
        required: false,
      },
      {
        name: 'timeout',
        type: 'number',
        required: false,
        default: 30000,
      },
    ];
  }

  getOutputDefinitions(): NodeOutput[] {
    return [
      {
        name: 'result',
        type: 'any',
      },
      {
        name: 'error',
        type: 'Error',
      },
    ];
  }

  async execute(): Promise<void> {
    try {
      const url = this.getInput('url');
      const script = this.getInput('script');
      const timeout = this.getInput('timeout');

      // 创建浏览器视图
      const viewId = await this.browserService.create(url, {
        x: 0,
        y: 0,
        width: 800,
        height: 600,
      });

      // 等待页面加载
      await new Promise(resolve => setTimeout(resolve, timeout));

      // 如果有脚本则执行
      let result = null;
      if (script) {
        result = await this.browserService.executeJs(viewId, script);
      }

      // 关闭浏览器视图
      await this.browserService.close(viewId);

      this.setOutput('result', result);
    } catch (error) {
      this.setOutput('error', error);
      throw error;
    }
  }
}
