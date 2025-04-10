import { v4 as uuidv4 } from "uuid";
import type { WorkflowNode } from "@weaving-flow/core";

export interface NodeInput {
  name: string;
  type: string;
  required?: boolean;
  default?: any;
  description?: string;
}

export interface NodeOutput {
  name: string;
  type: string;
  description?: string;
}

export interface ExecuteOptions {
  notificationCallback?: (
    subject: string,
    message: string,
    notificationType: "info" | "success" | "warning" | "error"
  ) => Promise<any>;
}

export abstract class BaseNode implements WorkflowNode {
  public id: string;
  public type: string;
  public flowName: string;
  public name: string;
  public config: Record<string, any>;
  public inputs: Map<string, any>;
  public outputs: Map<string, any>;
  protected workflowId: string;
  private inputValues: Map<string, any>;
  private outputValues: Map<string, any>;

  constructor(
    id: string,
    flowName: string,
    nodeName: string,
    type: string,
    config: Record<string, any> = {}
  ) {
    this.id = id;
    this.flowName = flowName;
    this.name = nodeName;
    this.type = type;
    this.config = config;
    this.inputs = new Map();
    this.outputs = new Map();
    this.workflowId = ""; // 初始化为空字符串
    this.inputValues = new Map();
    this.outputValues = new Map();
  }

  // 设置输入值
  setInput(name: string, value: any): void {
    this.inputValues.set(name, value);
  }

  // 获取输入值
  getInput(name: string): any {
    return this.inputValues.get(name);
  }

  // 设置输出值
  protected setOutput(name: string, value: any): void {
    this.outputValues.set(name, value);
  }

  // 获取输出值
  getOutput(name: string): any {
    return this.outputValues.get(name);
  }

  // 执行节点
  abstract execute(options?: ExecuteOptions): Promise<void>;

  // 重置节点状态
  reset(): void {
    this.inputValues.clear();
    this.outputValues.clear();
  }

  // 克隆节点
  clone(): BaseNode {
    const node = Object.create(Object.getPrototypeOf(this));
    Object.assign(node, this);
    node.id = uuidv4();
    node.inputValues = new Map(this.inputValues);
    node.outputValues = new Map(this.outputValues);
    return node;
  }

  // 设置工作流ID
  setWorkflowId(workflowId: string): void {
    this.workflowId = workflowId;
  }

  // 获取工作流ID
  getWorkflowId(): string {
    return this.workflowId;
  }

  // 清理资源方法（默认实现为空，子类可以重写）
  async cleanup(): Promise<void> {
    // 默认不执行任何操作
    // 子类可以重写此方法以清理特定资源
  }
}
