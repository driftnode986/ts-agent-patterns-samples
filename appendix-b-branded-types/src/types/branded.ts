declare const brand: unique symbol;

export type Brand<T, B extends string> = T & { readonly [brand]: B };

export type UserId = Brand<string, 'UserId'>;
export type ThreadId = Brand<string, 'ThreadId'>;
export type AgentId = Brand<string, 'AgentId'>;
export type ToolId = Brand<string, 'ToolId'>;
