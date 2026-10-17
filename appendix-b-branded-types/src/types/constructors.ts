// src/types/constructors.ts
import { z } from 'zod';

const userIdSchema = z.string().uuid();
const threadIdSchema = z.string().regex(/^thread-[a-z0-9]+$/);

function createUserId(raw: string): UserId {
  userIdSchema.parse(raw);
  return raw as UserId;
}

function createThreadId(raw: string): ThreadId {
  threadIdSchema.parse(raw);
  return raw as ThreadId;
}
