import fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { appRouter } from "./routers";
import { createContext } from "./trpc";
import { config } from "./config";
import { CrawlerService } from "./services/crawler";
import { EmailService } from "./utils/emailService";

const server = fastify();
const crawler = new CrawlerService();

// 注册插件
server.register(cors, config.cors);
server.register(jwt, {
  secret: config.jwt.secret,
});

// 注册 tRPC
server.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: {
    router: appRouter,
    createContext,
  },
});

// 爬虫相关路由
server.post("/api/crawler/start", async (request, reply) => {
  const { url } = request.body as { url: string };
  await crawler.crawl({ url });
  return { success: true };
});

server.get("/api/crawler/status", async (request, reply) => {
  // const status = crawler.getStatus();
  // return status;
  return { success: true };
});

// 注册邮件
EmailService.setDefaultConfig({
  host: process.env.EMAIL_HOST || "smtp.example.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER || "your-email@example.com",
    pass: process.env.EMAIL_PASSWORD || "your-password",
  },
});

// 启动服务器
const start = async () => {
  try {
    await crawler.initialize();
    await server.listen({
      port: config.server.port,
      host: config.server.host,
    });
    console.log(
      `Server listening at http://${config.server.host}:${config.server.port}`
    );
  } catch (err) {
    server.log.error(err);
    console.error(err);
    process.exit(1);
  }
};

start();
