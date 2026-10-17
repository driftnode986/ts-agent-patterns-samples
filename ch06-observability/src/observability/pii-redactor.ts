// src/observability/pii-redactor.ts
import type { SpanOutputProcessor, AnySpan } from '@mastra/observability';

export class PiiRedactor implements SpanOutputProcessor {
  name = 'pii-redactor';

  private readonly patterns = [
    { regex: /[\w.-]+@[\w.-]+\.\w+/g, replacement: '[EMAIL]' },
    { regex: /\d{3}-\d{4}-\d{4}/g, replacement: '[PHONE]' },
    { regex: /\d{4}-\d{4}-\d{4}-\d{4}/g, replacement: '[CARD]' },
  ];

  process(span: AnySpan): AnySpan {
    for (const { regex, replacement } of this.patterns) {
      if (typeof span.input === 'string') {
        span.input = span.input.replace(regex, replacement);
      }
      if (typeof span.output === 'string') {
        span.output = span.output.replace(regex, replacement);
      }
    }
    return span;
  }

  async shutdown(): Promise<void> {}
}
