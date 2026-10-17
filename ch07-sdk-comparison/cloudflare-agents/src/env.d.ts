// src/env.d.ts（wrangler.jsonc のバインディングに対応する型）
interface Env {
  AI: Ai;
  CUSTOMER_SUPPORT: DurableObjectNamespace<
    import('./index').CustomerSupport
  >;
  CHAT_AGENT: DurableObjectNamespace<
    import('./index').ChatAgent
  >;
  RESEARCH_AGENT: DurableObjectNamespace<
    import('./index').ResearchAgent
  >;
}
