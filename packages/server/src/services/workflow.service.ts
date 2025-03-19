import { Context } from "@/trpc";
import { WorkflowEngine, BaseNode } from "@weaving-flow/workflow";
import { StartNode } from "@weaving-flow/workflow";
import { EndNode } from "@weaving-flow/workflow";
import { BrowserNode } from "@weaving-flow/workflow";
import { LoopNode } from "@weaving-flow/workflow";
import { prisma } from "../lib/prisma";
import { Workflow } from "@prisma/client";

// 导入工作流引擎和节点类
// 存储正在运行的工作流实例
const runningWorkflows = new Map<
  string,
  {
    engine: WorkflowEngine;
    instanceId: string;
    stopRequested: boolean;
    workflowId: string;
  }
>();

// 节点输入输出获取辅助函数
function getAllNodeInputs(node: any): Record<string, any> {
  const inputs: Record<string, any> = {};
  if (Array.isArray(node.inputs)) {
    for (const input of node.inputs) {
      inputs[input] = node.getInput(input);
    }
  }
  return inputs;
}

function getAllNodeOutputs(node: any): Record<string, any> {
  const outputs: Record<string, any> = {};
  if (Array.isArray(node.outputs)) {
    for (const output of node.outputs) {
      outputs[output] = node.getOutput(output);
    }
  }
  return outputs;
}

export class WorkflowService {
  // 创建工作流
  async create(
    data: {
      name: string;
      config: string;
      description?: string | null;
    },
    ctx: Context
  ): Promise<Workflow> {
    return prisma.workflow.create({
      data: {
        name: data.name,
        description: data.description,
        config: data.config,
        status: "inactive",
        userId: ctx.user!.id,
      },
    });
  }

  // 更新工作流
  async update(
    id: string,
    data: {
      name?: string;
      description?: string | null;
      config?: string;
      status?: "active" | "inactive";
    },
    ctx: Context
  ): Promise<Workflow> {
    // 检查工作流是否属于当前用户
    const workflow = await this.findById(id, ctx);
    if (!workflow) {
      throw new Error("工作流不存在");
    }

    const updateData = {
      ...data,
      config: data.config,
      userId: ctx.user!.id,
    };

    return prisma.workflow.update({
      where: { id },
      data: updateData,
    });
  }

  // 删除工作流
  async delete(id: string, ctx: Context): Promise<void> {
    // 检查工作流是否属于当前用户
    const workflow = await this.findById(id, ctx);
    if (!workflow) {
      throw new Error("工作流不存在");
    }

    await prisma.workflow.delete({
      where: { id },
    });
  }

  // 获取工作流列表
  async findAll(userId: string): Promise<Workflow[]> {
    const workflows = await prisma.workflow.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    return workflows;
  }

  // 获取单个工作流
  async findById(id: string, ctx: Context): Promise<Workflow | null> {
    const workflow = await prisma.workflow.findFirst({
      where: {
        id,
        userId: ctx.user!.id,
      },
    });

    if (!workflow) {
      return null;
    }

    return workflow;
  }

  // 执行工作流
  async execute(workflowId: string, ctx: Context): Promise<any> {
    if (!ctx.user) {
      throw new Error("用户未认证");
    }

    // 1. 获取工作流
    const workflow = await this.findById(workflowId, ctx);

    if (!workflow) {
      throw new Error("工作流不存在");
    }
    // 检测已经执行不执行
    let instance = await prisma.workflowInstance.findFirst({
      where: {
        workflowId,
        userId: ctx.user.id,
        status: "running",
      },
    });
    if (instance) {
      throw new Error("工作流正在执行");
    }

    // 2. 创建工作流实例
    instance = await prisma.workflowInstance.create({
      data: {
        workflowId,
        userId: ctx.user.id,
        status: "running",
        startTime: new Date(),
      },
    });
    await prisma.workflow.update({
      where: { id: workflowId },
      data: { status: "active" },
    });

    // 3. 异步执行工作流
    await this.executeWorkflowAsync(workflow, instance.id, ctx);

    // 4. 返回工作流实例信息
    return {
      success: true,
      instanceId: instance.id,
      status: "running",
    };
  }

  // 停止工作流
  async stopWorkflow(instanceId: string, ctx: Context): Promise<any> {
    if (!ctx.user) {
      throw new Error("用户未认证");
    }

    // 1. 获取工作流实例
    const instance = await prisma.workflowInstance.findUnique({
      where: { id: instanceId },
    });

    if (!instance) {
      throw new Error("工作流实例不存在");
    }

    if (instance.userId !== ctx.user.id) {
      throw new Error("无权停止此工作流实例");
    }

    // 2. 检查工作流是否正在运行
    if (instance.status !== "running") {
      throw new Error("工作流实例不在运行状态");
    }

    // 3. 标记工作流停止请求
    const runningWorkflow = runningWorkflows.get(instanceId);
    if (runningWorkflow) {
      runningWorkflow.stopRequested = true;

      // 4. 记录停止事件
      await this.logWorkflowEvent(instanceId, {
        nodeId: "system",
        nodeType: "system",
        status: "stopped",
        message: "工作流执行被用户停止",
      });

      // 5. 更新工作流实例状态
      await prisma.workflowInstance.update({
        where: { id: instanceId },
        data: {
          status: "stopped",
          endTime: new Date(),
        },
      });
      await prisma.workflow.update({
        where: { id: runningWorkflow.workflowId },
        data: { status: "inactive" },
      });

      // 6. 清理资源
      const engineAny = runningWorkflow.engine as any;
      if (typeof engineAny.cleanup === "function") {
        try {
          await engineAny.cleanup();
        } catch (error) {
          console.error("清理工作流引擎资源失败", error);
        }
      }

      // 7. 从运行中的工作流Map中移除
      runningWorkflows.delete(instanceId);

      return { success: true };
    } else {
      // 工作流实例不在内存中，可能是服务重启导致
      // 仍然更新数据库状态
      await prisma.workflowInstance.update({
        where: { id: instanceId },
        data: {
          status: "stopped",
          endTime: new Date(),
        },
      });

      await this.logWorkflowEvent(instanceId, {
        nodeId: "system",
        nodeType: "system",
        status: "stopped",
        message: "工作流执行被用户停止（工作流实例不在内存中）",
      });

      return { success: true };
    }
  }

  // 获取工作流实例状态和日志
  async getWorkflowStatus(instanceId: string, ctx: Context): Promise<any> {
    if (!ctx.user) {
      throw new Error("用户未认证");
    }

    const instance = await prisma.workflowInstance.findUnique({
      where: { id: instanceId },
      include: {
        logs: {
          orderBy: { timestamp: "desc" },
          take: 100,
        },
      },
    });

    if (!instance) {
      return {
        status: "stopped",
        message: "工作流未执行",
      };
    }

    if (instance.userId !== ctx.user.id) {
      throw new Error("无权查看此工作流实例");
    }

    return instance;
  }

  // 私有方法：异步执行工作流
  private async executeWorkflowAsync(
    workflow: Workflow,
    instanceId: string,
    ctx: Context
  ): Promise<void> {
    // 在后台执行，不阻塞主线程
    setTimeout(async () => {
      try {
        // 1. 获取工作流配置
        const config = JSON.parse(workflow.config);
        const { nodes = [], edges = [] } = config;

        if (!nodes.length) {
          throw new Error("工作流配置中未找到节点");
        }

        // 2. 创建工作流引擎实例
        const engine = new WorkflowEngine();

        // 3. 将工作流实例存储到全局Map中
        runningWorkflows.set(instanceId, {
          engine,
          instanceId,
          stopRequested: false,
          workflowId: workflow.id,
        });

        // 4. 创建节点并添加到引擎
        for (const nodeConfig of nodes) {
          let node;

          switch (nodeConfig.type) {
            case "start":
              node = new StartNode(
                nodeConfig.id,
                nodeConfig.name,
                nodeConfig.data || {}
              );
              break;
            case "end":
              node = new EndNode(
                nodeConfig.id,
                nodeConfig.name,
                nodeConfig.data || {}
              );
              break;
            case "browser":
              node = new BrowserNode(
                nodeConfig.id,
                nodeConfig.name,
                nodeConfig.data || {}
              );
              break;
            case "loop":
              node = new LoopNode(
                nodeConfig.id,
                nodeConfig.name,
                nodeConfig.data || {}
              );
              break;
            default:
              console.warn(`未知节点类型: ${nodeConfig.type}`);
              continue;
          }

          // 添加节点执行前后的钩子函数，用于记录日志
          const originalExecute = node.execute.bind(node);
          node.execute = async () => {
            // 检查是否请求停止
            const runningWorkflow = runningWorkflows.get(instanceId);
            if (runningWorkflow?.stopRequested) {
              throw new Error("工作流执行已被用户停止");
            }

            // 记录节点开始执行
            await this.logWorkflowEvent(instanceId, {
              nodeId: node.id,
              nodeName: nodeConfig.data?.label || node.constructor.name,
              nodeType: nodeConfig.type,
              status: "running",
              message: `开始执行节点: ${nodeConfig.data?.label || node.constructor.name}`,
            });

            try {
              // 执行原始方法
              await originalExecute();

              // 记录节点执行成功
              await this.logWorkflowEvent(instanceId, {
                nodeId: node.id,
                nodeName: nodeConfig.data?.label || node.constructor.name,
                nodeType: nodeConfig.type,
                status: "completed",
                message: `节点执行完成: ${nodeConfig.data?.label || node.constructor.name}`,
                data: JSON.stringify({
                  inputs: getAllNodeInputs(node),
                  outputs: getAllNodeOutputs(node),
                }),
              });
            } catch (error: any) {
              // 记录节点执行失败
              await this.logWorkflowEvent(instanceId, {
                nodeId: node.id,
                nodeName: nodeConfig.data?.label || node.constructor.name,
                nodeType: nodeConfig.type,
                status: "error",
                message: `节点执行失败: ${error.message}`,
              });

              throw error;
            }
          };

          engine.addNode(node);
        }

        // 5. 创建节点连接
        for (const edge of edges) {
          // 使用as any临时解决类型问题
          const connection = {
            sourceNodeId: edge.source,
            targetNodeId: edge.target,
            sourceOutput: edge.sourceHandle || "output",
            targetInput: edge.targetHandle || "input",
          } as any;

          engine.addConnection(connection);
        }

        // 6. 执行工作流
        console.log(`开始执行工作流实例: ${instanceId}`);
        const result = await engine.execute();
        console.log(`工作流实例执行完成: ${instanceId}`, result);

        // 7. 更新工作流实例状态
        await prisma.workflowInstance.update({
          where: { id: instanceId },
          data: {
            status: "completed",
            endTime: new Date(),
            result: JSON.stringify(result),
          },
        });
        await prisma.workflow.update({
          where: { id: workflow.id },
          data: { status: "inactive" },
        });

        // 8. 清理资源
        const engineAny = engine as any;
        if (typeof engineAny.cleanup === "function") {
          await engineAny.cleanup();
        }

        // 9. 从运行中的工作流Map中移除
        runningWorkflows.delete(instanceId);
      } catch (error: any) {
        console.error(`工作流实例执行错误: ${error.message}`, error);

        // 记录错误日志
        await this.logWorkflowEvent(instanceId, {
          nodeId: "system",
          nodeType: "system",
          status: "error",
          message: `工作流执行错误: ${error.message}`,
        });

        // 更新工作流实例状态
        await prisma.workflowInstance.update({
          where: { id: instanceId },
          data: {
            status: "error",
            endTime: new Date(),
          },
        });

        // 从运行中的工作流Map中移除
        runningWorkflows.delete(instanceId);
      }
    }, 0);
  }

  // 私有方法：记录工作流事件
  private async logWorkflowEvent(
    instanceId: string,
    data: {
      nodeId: string;
      nodeName?: string;
      nodeType: string;
      status: string;
      message?: string;
      data?: string;
    }
  ): Promise<void> {
    await prisma.workflowLog.create({
      data: {
        workflowInstanceId: instanceId,
        nodeId: data.nodeId,
        nodeName: data.nodeName,
        nodeType: data.nodeType,
        status: data.status,
        message: data.message,
        data: data.data,
      },
    });
  }
}
