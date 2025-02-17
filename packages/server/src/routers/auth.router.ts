import { publicProcedure, router } from '../trpc';
import { z } from 'zod';
import { AuthService } from '../services/auth';
import { TRPCError } from '@trpc/server';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middleware/auth.middleware';

const authService = new AuthService();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  name: z.string().optional(),
});

const protectedProcedure = publicProcedure.use(authMiddleware);

export const authRouter = router({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input }) => {
      const user = await authService.createUser(
        input.email,
        input.password,
        input.name
      );

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    }),

  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ input }) => {
      const user = await authService.validateUser(input.email, input.password);

      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: '邮箱或密码错误',
        });
      }

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    }),

  me: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await authService.getCurrentUser(ctx.user.id);
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '用户不存在',
        });
      }

      return user;
    }),

  logout: protectedProcedure
    .mutation(() => {
      return { success: true };
    }),
});
