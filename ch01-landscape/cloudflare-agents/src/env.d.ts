// src/env.d.ts（wrangler.jsonc のバインディングに対応する型）
interface Env {
  AI: Ai;
  MY_AGENT: DurableObjectNamespace<import('./index').MyAgent>;
}
