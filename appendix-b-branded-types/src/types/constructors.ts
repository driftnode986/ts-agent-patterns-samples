import { z } from 'zod';
import type { ThreadId, UserId } from './branded';

const userIdSchema = z.uuid();
const threadIdSchema = z.string().regex(/^thread-[a-z0-9]+$/);

export function createUserId(raw: string): UserId {
  userIdSchema.parse(raw);
  return raw as UserId;
}

export function createThreadId(raw: string): ThreadId {
  threadIdSchema.parse(raw);
  return raw as ThreadId;
}
