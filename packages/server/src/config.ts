import { config as dotenv } from "dotenv";

// 加载 .env 文件
dotenv();

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
    port: parseInt(process.env.PORT || "9001", 10),
    host: process.env.HOST || "127.0.0.1",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "your-secret-key",
    expiresIn: "7d",
  },
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  },
};
