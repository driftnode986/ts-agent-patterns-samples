// src/types/agent-config.ts
// #region immutable-config
export type ImmutableAgentConfig = Readonly<{
  name: string;
  instructions: string;
  model: string;
  tools: ReadonlyArray<string>;
  memory: Readonly<{
    backend: 'libsql' | 'postgres';
    scope: 'thread' | 'resource';
  }>;
}>;
// #endregion
