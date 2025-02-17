import { initTRPC, TRPCError } from "@trpc/server";
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import type { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";
import { config } from "./config";

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Context {
  req: FastifyRequest;
  res: FastifyReply;
  user: User | null;
}

// 初始化 createContext
export const createContext = async ({
  req,
  res,
}: CreateFastifyContextOptions): Promise<Context> => {
  let user: User | null = null;

  // 从请求头获取 token
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    try {
      // 验证 token
      const decoded = jwt.verify(token, config.jwt.secret) as User;
      user = decoded;
    } catch (error) {
      // token 无效，不设置用户信息
    }
  }

  return {
    req,
    res,
    user,
  };
};

// 初始化 tRPC
const t = initTRPC.context<Context>().create();

// 导出基础路由构建器
export const router = t.router;

// 导出公共过程构建器
export const publicProcedure = t.procedure;

// 导出中间件
export const middleware = t.middleware;

// 认证中间件
const isAuthed = middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "请先登录",
    });
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

// 导出受保护的过程构建器
export const protectedProcedure = publicProcedure.use(isAuthed);
