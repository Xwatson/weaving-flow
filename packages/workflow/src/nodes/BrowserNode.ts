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
        name: 'width',
        type: 'number',
        required: false,
        default: 1280,
      },
      {
        name: 'height',
        type: 'number',
        required: false,
        default: 800,
      }
    ];
  }

  getOutputDefinitions(): NodeOutput[] {
    return [
      {
        name: 'browser',
        type: 'object',
      },
      {
        name: 'error',
        type: 'Error',
      }
    ];
  }

  async execute(): Promise<void> {
    try {
      const url = this.getInput('url');
      const width = this.getInput('width');
      const height = this.getInput('height');

      // 创建浏览器实例
      const browser = await this.browserService.create(url, {
        x: 0,
        y: 0,
        width,
        height,
      });

      this.setOutput('browser', browser);
    } catch (error) {
      this.setOutput('error', error);
      throw error;
    }
  }
}
