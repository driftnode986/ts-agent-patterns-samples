// src/lib/pii-filter.ts
const PII_PATTERNS = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  phone: /0\d{1,4}-?\d{1,4}-?\d{4}/g,
  creditCard: /\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}/g,
  myNumber: /\d{4}\s?\d{4}\s?\d{4}/g,
};

export function maskPII(text: string): string {
  let masked = text;
  for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
    masked = masked.replace(pattern, `[${type.toUpperCase()}_MASKED]`);
  }
  return masked;
}

// Agent 呼び出し前にフィルタリング
export function createPIIFilteredAgent(agent: any) {
  return {
    ...agent,
    generate: async (messages: any[]) => {
      const filteredMessages = messages.map((m) => ({
        ...m,
        content: typeof m.content === 'string' ? maskPII(m.content) : m.content,
      }));
      return agent.generate(filteredMessages);
    },
  };
}
