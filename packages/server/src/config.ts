import dotenv from "dotenv";

// 加载环境变量
dotenv.config();

// JWT 配置
export const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// 服务器配置
export const PORT = process.env.PORT || 3000;
export const HOST = process.env.HOST || "localhost";

// 数据库配置
export const DATABASE_URL = process.env.DATABASE_URL;

// 其他配置
export const NODE_ENV = process.env.NODE_ENV || "development";

interface ServerConfig {
  port: number;
  host: string;
}

interface JWTConfig {
  secret: string;
  expiresIn: string;
}

interface CorsConfig {
  origin: string[];
  methods: string[];
  credentials: boolean;
}

interface Config {
  server: ServerConfig;
  jwt: JWTConfig;
  cors: CorsConfig;
}

export const config: Config = {
  server: {
    port: Number(PORT),
    host: HOST,
  },
  jwt: {
    secret: JWT_SECRET,
    expiresIn: JWT_EXPIRES_IN,
  },
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  },
};
