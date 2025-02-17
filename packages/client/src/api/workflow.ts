import { trpc } from "../utils/trpc";

export interface WorkflowData {
  name: string;
  description?: string;
  config: Record<string, any>;
}

export interface WorkflowCreateData extends WorkflowData {
  userId: string;
}

export const useWorkflowApi = () => {
  const utils = trpc.useUtils();

  return {
    // 获取工作流列表
    list: trpc.workflow.list.useQuery(),

    // 创建工作流
    create: trpc.workflow.create.useMutation({
      onSuccess: () => {
        utils.workflow.list.invalidate();
      },
    }),

    // 更新工作流
    update: trpc.workflow.update.useMutation({
      onSuccess: () => {
        utils.workflow.list.invalidate();
      },
    }),

    // 删除工作流
    delete: trpc.workflow.delete.useMutation({
      onSuccess: () => {
        utils.workflow.list.invalidate();
      },
    }),

    // 获取单个工作流
    getById: trpc.workflow.getById.useQuery,

    // 执行工作流
    execute: trpc.workflow.execute.useMutation(),
  };
};
