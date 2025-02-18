import { prisma } from "../utils/prisma";
import type { Workflow } from "@prisma/client";
import type { Context } from "../trpc";

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
  async execute(id: string, ctx: Context): Promise<void> {
    // 检查工作流是否属于当前用户
    const workflow = await this.findById(id, ctx);
    if (!workflow) {
      throw new Error("工作流不存在");
    }

    // 更新工作流状态为执行中
    await this.update(id, { status: "active" }, ctx);

    try {
      // TODO: 实现工作流执行逻辑
      // 1. 获取工作流配置
      // 2. 解析并执行每个节点
      // 3. 处理节点间数据传递
      // 4. 记录执行日志
    } catch (error) {
      // 发生错误时更新状态
      await this.update(id, { status: "inactive" }, ctx);
      throw error;
    }
  }
}
