import { BaseNode, NodeInput, NodeOutput } from "../core/BaseNode";

export interface OutputParamConfig {
  name: string;
  type: string;
  description?: string;
}

export class EndNode extends BaseNode {
  private workflowService: any; // 这里应该注入工作流服务，用于结束工作流
  private customOutputs: OutputParamConfig[];

  constructor(
    id: string,
    flowName: string,
    nodeName: string,
    config: Record<string, any> = {}
  ) {
    super(id, flowName, nodeName, "end", config);
    this.customOutputs = config.outputs || [];
  }

  getInputDefinitions(): NodeInput[] {
    // 将配置的输出参数转换为输入定义
    return this.customOutputs.map((output) => ({
      name: output.name,
      type: output.type,
      required: true, // 结束节点的输入都是必需的
      description: output.description,
    }));
  }

  getOutputDefinitions(): NodeOutput[] {
    // 结束节点的输出定义与输入相同
    return this.customOutputs.map((output) => ({
      name: output.name,
      type: output.type,
    }));
  }

  async execute(): Promise<void> {
    try {
      const finalResults: Record<string, any> = {};

      // 收集所有输入的值作为最终结果
      for (const output of this.customOutputs) {
        const value = this.getInput(output.name);
        finalResults[output.name] = value;
        // 同时设置为节点输出
        this.setOutput(output.name, value);
      }

      // 执行工作流结束清理工作
      await this.cleanup();

      // 通知工作流服务，工作流执行完成
      if (this.workflowService) {
        await this.workflowService.complete(this.workflowId, finalResults);
      }
    } catch (error) {
      // 如果出错，也需要执行清理工作
      await this.cleanup();
      throw error;
    }
  }

  // 添加
  addOutput(output: OutputParamConfig): void {
    this.customOutputs.push(output);
  }

  // 移除
  removeOutput(name: string): void {
    this.customOutputs = this.customOutputs.filter(
      (output) => output.name !== name
    );
  }

  // 获取当前所有配置的输出参数
  getCustomOutputs(): OutputParamConfig[] {
    return [...this.customOutputs];
  }
}
