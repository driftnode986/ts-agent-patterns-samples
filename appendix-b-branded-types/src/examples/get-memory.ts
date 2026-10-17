// src/examples/get-memory.ts
import type { ThreadId, UserId } from '../types/branded';

// #region get-memory
function getMemory(userId: UserId, threadId: ThreadId) {
  return { userId, threadId };
}

const uid = 'user-123' as UserId;
const tid = 'thread-456' as ThreadId;

getMemory(uid, tid);  // OK
// @ts-expect-error 引数の順序が逆なのでコンパイルエラー
getMemory(tid, uid);
// #endregion

export { getMemory };
