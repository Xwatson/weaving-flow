import { v4 as uuidv4 } from 'uuid';
import type { WorkflowNode } from '@weaving-flow/core';

export interface NodeInput {
  name: string;
  type: string;
  required?: boolean;
  default?: any;
}

export interface NodeOutput {
  name: string;
  type: string;
}

export abstract class BaseNode implements WorkflowNode {
  id: string;
  type: string;
  name: string;
  config: Record<string, any>;
  inputs: string[];
  outputs: string[];
  private inputValues: Map<string, any>;
  private outputValues: Map<string, any>;

  constructor(name: string, type: string, config: Record<string, any> = {}) {
    this.id = uuidv4();
    this.name = name;
    this.type = type;
    this.config = config;
    this.inputs = [];
    this.outputs = [];
    this.inputValues = new Map();
    this.outputValues = new Map();
  }

  // 获取节点的输入定义
  abstract getInputDefinitions(): NodeInput[];

  // 获取节点的输出定义
  abstract getOutputDefinitions(): NodeOutput[];

  // 验证输入值
  validateInput(name: string, value: any): boolean {
    const input = this.getInputDefinitions().find(i => i.name === name);
    if (!input) {
      return false;
    }

    // 检查必填项
    if (input.required && (value === undefined || value === null)) {
      return false;
    }

    // 可以在这里添加更多的类型检查逻辑
    return true;
  }

  // 设置输入值
  setInput(name: string, value: any): void {
    if (this.validateInput(name, value)) {
      this.inputValues.set(name, value);
    } else {
      throw new Error(`Invalid input value for ${name}`);
    }
  }

  // 获取输入值
  getInput(name: string): any {
    return this.inputValues.get(name);
  }

  // 设置输出值
  protected setOutput(name: string, value: any): void {
    const output = this.getOutputDefinitions().find(o => o.name === name);
    if (!output) {
      throw new Error(`Output ${name} not defined`);
    }
    this.outputValues.set(name, value);
  }

  // 获取输出值
  getOutput(name: string): any {
    return this.outputValues.get(name);
  }

  // 执行节点
  abstract execute(): Promise<void>;

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
}