import { router } from '../trpc';
import { authRouter } from './auth.router';
import { workflowRouter } from './workflow.router';

export const appRouter = router({
  auth: authRouter,
  workflow: workflowRouter,
});

export type AppRouter = typeof appRouter;
