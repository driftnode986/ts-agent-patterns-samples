import { z } from 'zod';
import type { ThreadId, UserId } from './branded';

const UserIdSchema = z.uuid().transform((val) => val as UserId);
const ThreadIdSchema = z
  .string()
  .regex(/^thread-/)
  .transform((val) => val as ThreadId);

export const toolInputSchema = z.object({
  userId: UserIdSchema,
  threadId: ThreadIdSchema,
  query: z.string().min(1).max(1000),
});

export type ToolInput = z.infer<typeof toolInputSchema>;
// ToolInput.userId は UserId 型、ToolInput.threadId は ThreadId 型
