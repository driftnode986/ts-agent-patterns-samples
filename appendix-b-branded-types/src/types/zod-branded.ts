// src/types/zod-branded.ts
import { z } from 'zod';

const UserIdSchema = z.string().uuid().transform((val) => val as UserId);
const ThreadIdSchema = z.string().regex(/^thread-/).transform((val) => val as ThreadId);

const toolInputSchema = z.object({
  userId: UserIdSchema,
  threadId: ThreadIdSchema,
  query: z.string().min(1).max(1000),
});

type ToolInput = z.infer<typeof toolInputSchema>;
// ToolInput.userId は UserId 型、ToolInput.threadId は ThreadId 型
