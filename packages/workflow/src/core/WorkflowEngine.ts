import { BaseNode } from "../core/BaseNode";
import { StartNode } from "../nodes/StartNode";
import { EndNode } from "../nodes/EndNode";
import { BrowserNode } from "../nodes/BrowserNode";
import { LoopNode } from "../nodes/LoopNode";
import { BrowserService } from "../services/BrowserService";

// 工作流连接定义
export interface WorkflowConnection {
  sourceNodeId: string;
  targetNodeId: string;
  sourceOutput: string;
  targetInput: string;
}

export class WorkflowEngine {
  private nodes: Map<string, BaseNode> = new Map();
  private connections: WorkflowConnection[] = [];
  private browserService?: BrowserService;
  // 节点执行缓存，用于存储已执行过的节点实例
  private nodeInstanceCache: Map<string, BaseNode> = new Map();
  // 循环执行路径跟踪
  private loopExecutionPath: Set<string> = new Set();
  // 是否正在循环中
  private inLoopExecution: boolean = false;

  constructor() {}

  // 添加节点
  addNode(node: BaseNode): void {
    // 注入服务
    if (node instanceof BrowserNode) {
      this.browserService = new BrowserService();
      node.setBrowserService(this.browserService);
    }

    this.nodes.set(node.id, node);
  }

  // 添加连接
  addConnection(connection: WorkflowConnection): void {
    this.connections.push(connection);
  }

  // 获取节点的所有输出连接
  getNodeOutputConnections(nodeId: string): WorkflowConnection[] {
    return this.connections.filter((conn) => conn.sourceNodeId === nodeId);
  }

  // 获取节点的所有输入连接
  getNodeInputConnections(nodeId: string): WorkflowConnection[] {
    return this.connections.filter((conn) => conn.targetNodeId === nodeId);
  }

  // 执行工作流
  async execute(input: Record<string, any> = {}): Promise<Record<string, any>> {
    // 重置执行状态
    this.nodeInstanceCache.clear();
    this.loopExecutionPath.clear();
    this.inLoopExecution = false;

    // 找到开始节点
    const startNode = Array.from(this.nodes.values()).find(
      (node) => node instanceof StartNode
    ) as StartNode;

    if (!startNode) {
      throw new Error("工作流中未找到开始节点");
    }

    // 设置开始节点的输入
    for (const [key, value] of Object.entries(input)) {
      startNode.setInput(key, value);
    }

    // 执行开始节点
    await this.executeNode(startNode);

    // 找到结束节点
    const endNode = Array.from(this.nodes.values()).find(
      (node) => node instanceof EndNode
    );

    if (!endNode) {
      throw new Error("工作流中未找到结束节点");
    }

    // 收集输出结果
    const result: Record<string, any> = {};
    for (const output of endNode.getCustomOutputs()) {
      result[output.name] = endNode.getOutput(output.name);
    }

    return result;
  }

  // 执行单个节点并传递数据给下游节点
  private async executeNode(node: BaseNode): Promise<void> {
    // 缓存节点实例，用于循环复用
    this.nodeInstanceCache.set(node.id, node);

    // 检查是否是循环节点
    const isLoopNode = node instanceof LoopNode;

    // 执行节点
    await node.execute();

    // 如果是循环节点，处理循环逻辑
    if (isLoopNode) {
      const loopNode = node as LoopNode;
      const continueLoop = loopNode.getOutput("continueLoop");
      const targetNodeId = loopNode.getOutput("targetNodeId");

      if (continueLoop && targetNodeId) {
        // 标记正在循环执行
        this.inLoopExecution = true;

        // 获取目标节点
        let targetNode = this.nodes.get(targetNodeId);

        if (!targetNode) {
          throw new Error(`循环目标节点 ${targetNodeId} 不存在`);
        }

        // 如果应该复用节点实例并且已经有缓存，则使用缓存的实例
        if (
          loopNode.shouldReuseTargetNode() &&
          this.nodeInstanceCache.has(targetNodeId)
        ) {
          targetNode = this.nodeInstanceCache.get(targetNodeId)!;
          console.log(`复用节点实例: ${targetNodeId}`);
        }

        // 记录循环执行路径
        this.loopExecutionPath.add(targetNodeId);

        // 获取循环节点的输出连接
        const loopConnections = this.getNodeOutputConnections(node.id);

        // 传递数据给目标节点
        for (const connection of loopConnections) {
          if (connection.targetNodeId === targetNodeId) {
            const outputValue = node.getOutput(connection.sourceOutput);
            targetNode.setInput(connection.targetInput, outputValue);
          }
        }

        // 执行目标节点
        await this.executeNode(targetNode);
        return; // 直接返回，不执行后续的正常流程
      } else {
        // 循环结束，重置状态
        this.inLoopExecution = false;
        this.loopExecutionPath.clear();
      }
    }

    // 获取节点的输出连接
    const outputConnections = this.getNodeOutputConnections(node.id);

    // 为每个连接传递数据
    for (const connection of outputConnections) {
      const sourceNode = this.nodes.get(connection.sourceNodeId);
      const targetNode = this.nodes.get(connection.targetNodeId);

      if (sourceNode && targetNode) {
        // 获取源节点的输出值
        const outputValue = sourceNode.getOutput(connection.sourceOutput);

        // 设置目标节点的输入值
        targetNode.setInput(connection.targetInput, outputValue);

        // 递归执行目标节点
        await this.executeNode(targetNode);
      }
    }
  }

  // 清理资源
  async cleanup(): Promise<void> {
    // 清理所有节点资源
    for (const node of this.nodes.values()) {
      if (typeof (node as any).cleanup === "function") {
        try {
          await (node as any).cleanup();
        } catch (error) {
          console.error(`清理节点 ${node.id} 资源失败:`, error);
        }
      }
    }

    // 清空节点和连接
    this.nodes.clear();
    this.connections = [];
    this.nodeInstanceCache.clear();

    // 关闭浏览器服务
    if (this.browserService) {
      try {
        await this.browserService.close({});
      } catch (error) {
        console.error("关闭浏览器服务失败:", error);
      }
    }
  }
}
