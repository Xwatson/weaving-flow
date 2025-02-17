import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { WorkflowService } from "../services/workflow.service";

const workflowService = new WorkflowService();

// 工作流数据验证schema
const workflowSchema = z.object({
  name: z.string().min(1, "名称不能为空"),
  description: z.string().nullable(),
  config: z.record(z.any()).optional().default({}),
});

export const workflowRouter = router({
  // 创建工作流
  create: protectedProcedure
    .input(workflowSchema)
    .mutation(async ({ input, ctx }) => {
      return workflowService.create(input, ctx);
    }),

  // 更新工作流
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: workflowSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return workflowService.update(input.id, input.data, ctx);
    }),

  // 删除工作流
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await workflowService.delete(input.id, ctx);
      return { success: true };
    }),

  // 获取工作流列表
  list: protectedProcedure.query(async ({ ctx }) => {
    return workflowService.findAll(ctx.user.id);
  }),

  // 获取单个工作流
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      return workflowService.findById(input.id, ctx);
    }),

  // 执行工作流
  execute: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await workflowService.execute(input.id, ctx);
      return { success: true };
    }),
});
