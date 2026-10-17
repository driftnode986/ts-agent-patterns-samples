// src/types/agent-state.ts
import type { ToolId } from './branded';

export type AgentState =
  | { status: 'idle' }
  | { status: 'thinking'; startedAt: number }
  | { status: 'executing_tool'; toolId: ToolId; input: unknown }
  | { status: 'waiting_human'; reason: string; suspendedAt: number }
  | { status: 'completed'; result: string; finishedAt: number }
  | { status: 'failed'; error: Error; failedAt: number };
