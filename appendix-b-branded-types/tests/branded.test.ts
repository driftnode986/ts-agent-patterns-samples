import { describe, expect, expectTypeOf, it } from 'vitest';
import { getMemory } from '../src/examples/get-memory';
import type { ThreadId, UserId } from '../src/types/branded';
import { createThreadId, createUserId } from '../src/types/constructors';
import { toolInputSchema, type ToolInput } from '../src/types/zod-branded';

const VALID_UUID = '3f2b6c1e-8a4d-4c2b-9e1f-0a7d5b3c9e21';

describe('Branded Types', () => {
  it('UserId と ThreadId は互いに代入できない', () => {
    expectTypeOf<UserId>().not.toEqualTypeOf<ThreadId>();
    expectTypeOf<ThreadId>().not.toMatchTypeOf<UserId>();
    const uid = 'user-1' as UserId;
    const tid = 'thread-1' as ThreadId;
    expect(getMemory(uid, tid)).toEqual({ userId: 'user-1', threadId: 'thread-1' });
  });

  it('コンストラクタ関数は検証を通った値だけを返す', () => {
    expect(createUserId(VALID_UUID)).toBe(VALID_UUID);
    expect(() => createUserId('user-123')).toThrow();
    expect(createThreadId('thread-abc123')).toBe('thread-abc123');
    expect(() => createThreadId('THREAD-1')).toThrow();
  });

  it('Zod の transform で Branded 型に変換される', () => {
    const input = toolInputSchema.parse({
      userId: VALID_UUID,
      threadId: 'thread-1',
      query: 'Mastra',
    });
    expectTypeOf(input.userId).toEqualTypeOf<UserId>();
    expectTypeOf<ToolInput['threadId']>().toEqualTypeOf<ThreadId>();
    expect(input.userId).toBe(VALID_UUID);
    expect(() =>
      toolInputSchema.parse({ userId: 'x', threadId: 'thread-1', query: 'a' }),
    ).toThrow();
  });
});
