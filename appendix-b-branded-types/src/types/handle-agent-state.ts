// src/types/handle-agent-state.ts
import type { AgentState } from './agent-state';

// #region exhaustive
export function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(x)}`);
}

export function handleAgentState(state: AgentState): string {
  switch (state.status) {
    case 'idle':
      return 'Agent is ready';
    case 'thinking':
      return `Thinking since ${state.startedAt}`;
    case 'executing_tool':
      return `Executing ${state.toolId}`;
    case 'waiting_human':
      return `Waiting for human: ${state.reason}`;
    case 'completed':
      return `Done: ${state.result}`;
    case 'failed':
      return `Error: ${state.error.message}`;
    default:
      return assertNever(state);
  }
}
// #endregion
