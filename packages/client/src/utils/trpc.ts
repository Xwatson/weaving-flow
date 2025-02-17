import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@server/routers';
import { QueryClient } from '@tanstack/react-query';

// 创建全局 QueryClient 实例
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      retry: 3,
      cacheTime: 1000 * 60 * 5, // 5分钟的缓存时间
    },
  },
});

export const trpc = createTRPCReact<AppRouter>();
