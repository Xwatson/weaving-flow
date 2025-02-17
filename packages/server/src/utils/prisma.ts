import { PrismaClient } from "@prisma/client";

// 创建 Prisma 客户端实例
export const prisma = new PrismaClient();

// 关闭
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});
