import { BaseNode, NodeInput, NodeOutput } from "../core/BaseNode";

export interface InputParamConfig {
  name: string;
  type: string;
  required?: boolean;
  default?: any;
  description?: string;
}

export class StartNode extends BaseNode {
  private customInputs: InputParamConfig[];

  constructor(id: string, name: string, config: Record<string, any> = {}) {
    super(id, name, "start", config);
    this.customInputs = config.inputs || [];
  }

  getInputDefinitions(): NodeInput[] {
    // 将用户配置的输入参数转换为 NodeInput 格式
    return this.customInputs.map((input) => ({
      name: input.name,
      type: input.type,
      required: input.required,
      default: input.default,
      description: input.description,
    }));
  }

  getOutputDefinitions(): NodeOutput[] {
    // 开始节点的输出与配置的输入参数相同
    return this.customInputs.map((input) => ({
      name: input.name,
      type: input.type,
    }));
  }

  async execute(): Promise<void> {
    try {
      // 获取所有配置的输入参数值，并设置为输出
      for (const input of this.customInputs) {
        const value = this.getInput(input.name);
        this.setOutput(input.name, value);
      }
    } catch (error) {
      throw error;
    }
  }

  // 添加
  addInput(input: InputParamConfig): void {
    this.customInputs.push(input);
  }

  // 移除
  removeInput(name: string): void {
    this.customInputs = this.customInputs.filter(
      (input) => input.name !== name
    );
  }

  // 获取当前所有配置的输入参数
  getCustomInputs(): InputParamConfig[] {
    return [...this.customInputs];
  }
}
