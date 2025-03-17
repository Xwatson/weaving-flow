import { BaseNode, NodeInput, NodeOutput } from "../core/BaseNode";

export interface LoopNodeConfig {
  // 最大循环次数，防止无限循环导致资源耗尽
  maxIterations?: number;
  // 条件表达式，如果为空则使用默认条件
  condition?: string;
  // 目标节点ID，循环将跳转到这个节点
  targetNodeId?: string;
  // 是否复用目标节点实例
  reuseTargetNode?: boolean;
}

/**
 * 循环节点 - 用于实现工作流中的循环逻辑
 */
export class LoopNode extends BaseNode {
  // 当前循环次数
  private currentIteration: number = 0;
  // 节点配置
  private loopConfig: LoopNodeConfig;
  // 是否继续循环的标志
  private continueLoop: boolean = true;

  constructor(id: string, name: string, config: Record<string, any> = {}) {
    super(id, name, "loop", config);
    this.loopConfig = {
      maxIterations: 100, // 默认最大循环100次
      condition: "true", // 默认条件为true，即一直循环
      targetNodeId: "", // 默认为空，需要在使用时指定
      reuseTargetNode: true, // 默认复用目标节点
      ...config,
    };
  }

  // 获取节点的输入定义
  getInputDefinitions(): NodeInput[] {
    return [
      {
        name: "condition",
        type: "boolean",
        required: false,
        description: "循环条件，如果为true则继续循环",
      },
      {
        name: "data",
        type: "any",
        required: false,
        description: "传递给循环体的数据",
      },
    ];
  }

  // 获取节点的输出定义
  getOutputDefinitions(): NodeOutput[] {
    return [
      {
        name: "targetNodeId",
        type: "string",
        description: "循环目标节点ID",
      },
      {
        name: "continueLoop",
        type: "boolean",
        description: "是否继续循环",
      },
      {
        name: "iteration",
        type: "number",
        description: "当前循环次数",
      },
      {
        name: "data",
        type: "any",
        description: "传递给下一个节点的数据",
      },
    ];
  }

  // 执行节点逻辑
  async execute(): Promise<void> {
    // 获取条件值，如果输入中有条件则使用输入的条件，否则使用配置中的条件
    let conditionValue = this.getInput("condition");
    if (conditionValue === undefined) {
      // 尝试执行条件表达式
      try {
        // 使用 Function 构造函数创建一个函数来执行条件表达式
        // 这里需要注意安全性，在生产环境中应该使用更安全的方式
        const conditionFunc = new Function(
          "iteration",
          "data",
          `return ${this.loopConfig.condition}`
        );
        conditionValue = conditionFunc(
          this.currentIteration,
          this.getInput("data")
        );
      } catch (error) {
        console.error(`执行循环条件表达式失败: ${error}`);
        conditionValue = false;
      }
    }

    // 增加循环计数
    this.currentIteration++;

    // 检查是否达到最大循环次数
    if (this.currentIteration >= this.loopConfig.maxIterations!) {
      console.warn(
        `循环节点 ${this.id} 达到最大循环次数 ${this.loopConfig.maxIterations}`
      );
      this.continueLoop = false;
    } else {
      // 根据条件决定是否继续循环
      this.continueLoop = Boolean(conditionValue);
    }

    // 设置输出
    this.setOutput("targetNodeId", this.loopConfig.targetNodeId);
    this.setOutput("continueLoop", this.continueLoop);
    this.setOutput("iteration", this.currentIteration);
    this.setOutput("data", this.getInput("data")); // 传递数据到下一个节点
  }

  // 重置循环状态
  reset(): void {
    super.reset(); // 调用基类的reset方法
    this.currentIteration = 0;
    this.continueLoop = true;
  }

  // 获取当前循环次数
  getIteration(): number {
    return this.currentIteration;
  }

  // 检查是否应该复用目标节点
  shouldReuseTargetNode(): boolean {
    return this.loopConfig.reuseTargetNode === true;
  }

  // 获取目标节点ID
  getTargetNodeId(): string | undefined {
    return this.loopConfig.targetNodeId;
  }
}
