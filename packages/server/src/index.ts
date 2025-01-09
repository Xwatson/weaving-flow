import fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { config } from "./config";
import { CrawlerService } from "./services/crawler";
import { AuthService } from "./services/auth";

const server = fastify();
const crawler = new CrawlerService();
const auth = new AuthService();

// 注册插件
server.register(cors, config.cors);
server.register(jwt, {
  secret: config.jwt.secret,
});

// 认证中间件
server.addHook("onRequest", async (request, reply) => {
  try {
    if (
      request.routerPath === "/api/auth/login" ||
      request.routerPath === "/api/auth/register"
    ) {
      return;
    }
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

// 认证路由
server.post("/api/auth/register", async (request, reply) => {
  const { email, password, name } = request.body as any;
  const user = await auth.createUser(email, password, name);
  const token = server.jwt.sign(
    { id: user.id },
    { expiresIn: config.jwt.expiresIn }
  );
  reply.send({ token });
});

server.post("/api/auth/login", async (request, reply) => {
  const { email, password } = request.body as any;
  const user = await auth.validateUser(email, password);
  if (!user) {
    reply.code(401).send({ error: "Invalid credentials" });
    return;
  }
  const token = server.jwt.sign(
    { id: user.id },
    { expiresIn: config.jwt.expiresIn }
  );
  reply.send({ token });
});

// 爬虫路由
server.post("/api/crawler", async (request, reply) => {
  const config = request.body as any;
  const result = await crawler.crawl(config);
  reply.send(result);
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
