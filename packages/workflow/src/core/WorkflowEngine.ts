import EventEmitter from 'eventemitter3';
import type { Workflow, WorkflowConnection } from '@weaving-flow/core';
import { BaseNode } from './BaseNode';

export interface WorkflowStatus {
  status: 'idle' | 'running' | 'completed' | 'error';
  currentNode?: string;
  error?: Error;
}

export class WorkflowEngine extends EventEmitter {
  private nodes: Map<string, BaseNode>;
  private connections: WorkflowConnection[];
  private status: WorkflowStatus;

  constructor() {
    super();
    this.nodes = new Map();
    this.connections = [];
    this.status = { status: 'idle' };
  }

  // 添加节点
  addNode(node: BaseNode): void {
    this.nodes.set(node.id, node);
  }

  // 删除节点
  removeNode(nodeId: string): void {
    this.nodes.delete(nodeId);
    // 删除相关的连接
    this.connections = this.connections.filter(
      conn => conn.sourceNodeId !== nodeId && conn.targetNodeId !== nodeId
    );
  }

  // 添加连接
  addConnection(connection: WorkflowConnection): void {
    const sourceNode = this.nodes.get(connection.sourceNodeId);
    const targetNode = this.nodes.get(connection.targetNodeId);

    if (!sourceNode || !targetNode) {
      throw new Error('Source or target node not found');
    }

    // 验证输出和输入是否存在
    if (!sourceNode.outputs.includes(connection.sourceOutput)) {
      throw new Error(`Output ${connection.sourceOutput} not found in source node`);
    }
    if (!targetNode.inputs.includes(connection.targetInput)) {
      throw new Error(`Input ${connection.targetInput} not found in target node`);
    }

    this.connections.push(connection);
  }

  // 删除连接
  removeConnection(connectionId: string): void {
    this.connections = this.connections.filter(conn => conn.id !== connectionId);
  }

  // 获取节点的输入连接
  private getInputConnections(nodeId: string): WorkflowConnection[] {
    return this.connections.filter(conn => conn.targetNodeId === nodeId);
  }

  // 获取节点的输出连接
  private getOutputConnections(nodeId: string): WorkflowConnection[] {
    return this.connections.filter(conn => conn.sourceNodeId === nodeId);
  }

  // 获取入度为0的节点（起始节点）
  private getStartNodes(): BaseNode[] {
    return Array.from(this.nodes.values()).filter(node => 
      !this.connections.some(conn => conn.targetNodeId === node.id)
    );
  }

  // 检查是否存在循环依赖
  private checkForCycles(): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) {
        return true;
      }
      if (visited.has(nodeId)) {
        return false;
      }

      visited.add(nodeId);
      recursionStack.add(nodeId);

      const outputConnections = this.getOutputConnections(nodeId);
      for (const conn of outputConnections) {
        if (hasCycle(conn.targetNodeId)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const nodeId of this.nodes.keys()) {
      if (hasCycle(nodeId)) {
        return true;
      }
    }

    return false;
  }

  // 执行工作流
  async execute(): Promise<void> {
    if (this.status.status === 'running') {
      throw new Error('Workflow is already running');
    }

    if (this.checkForCycles()) {
      throw new Error('Circular dependency detected in workflow');
    }

    this.status = { status: 'running' };
    this.emit('start');

    try {
      const startNodes = this.getStartNodes();
      await Promise.all(startNodes.map(node => this.executeNode(node)));

      this.status = { status: 'completed' };
      this.emit('complete');
    } catch (error) {
      this.status = { status: 'error', error: error as Error };
      this.emit('error', error);
      throw error;
    }
  }

  // 执行单个节点
  private async executeNode(node: BaseNode): Promise<void> {
    this.status.currentNode = node.id;
    this.emit('nodeStart', node);

    try {
      // 获取并设置输入值
      const inputConnections = this.getInputConnections(node.id);
      for (const conn of inputConnections) {
        const sourceNode = this.nodes.get(conn.sourceNodeId);
        if (sourceNode) {
          const value = sourceNode.getOutput(conn.sourceOutput);
          node.setInput(conn.targetInput, value);
        }
      }

      // 执行节点
      await node.execute();

      // 执行下一个节点
      const outputConnections = this.getOutputConnections(node.id);
      await Promise.all(
        outputConnections.map(async conn => {
          const targetNode = this.nodes.get(conn.targetNodeId);
          if (targetNode) {
            await this.executeNode(targetNode);
          }
        })
      );

      this.emit('nodeComplete', node);
    } catch (error) {
      this.emit('nodeError', node, error);
      throw error;
    }
  }

  // 导出工作流配置
  export(): Workflow {
    return {
      id: '',  // 由外部设置
      name: '', // 由外部设置
      nodes: Array.from(this.nodes.values()),
      connections: this.connections,
    };
  }

  // 从配置导入工作流
  import(workflow: Workflow): void {
    this.nodes.clear();
    this.connections = [];

    workflow.nodes.forEach(node => {
      if (node instanceof BaseNode) {
        this.addNode(node);
      }
    });

    workflow.connections.forEach(conn => {
      this.addConnection(conn);
    });
  }

  // 获取当前状态
  getStatus(): WorkflowStatus {
    return this.status;
  }

  // 重置工作流
  reset(): void {
    this.nodes.forEach(node => node.reset());
    this.status = { status: 'idle' };
    this.emit('reset');
  }
}
