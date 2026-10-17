// src/types/branded.ts
declare const brand: unique symbol;

type Brand<T, B extends string> = T & { readonly [brand]: B };

type UserId = Brand<string, 'UserId'>;
type ThreadId = Brand<string, 'ThreadId'>;
type AgentId = Brand<string, 'AgentId'>;
type ToolId = Brand<string, 'ToolId'>;
