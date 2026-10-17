// src/observability/pii-redactor.ts
import type {
  SpanOutputProcessor,
  AnySpan,
} from '@mastra/core/observability';

// #region redactor-class
export class PiiRedactor implements SpanOutputProcessor {
  name = 'pii-redactor';

  // カード番号を先に置く (電話番号のパターンがカード番号の一部に一致するため)
  private readonly patterns = [
    { regex: /\d{4}-\d{4}-\d{4}-\d{4}/g, replacement: '[CARD]' },
    { regex: /[\w.-]+@[\w.-]+\.\w+/g, replacement: '[EMAIL]' },
    { regex: /\d{3}-\d{4}-\d{4}/g, replacement: '[PHONE]' },
  ];

  process(span?: AnySpan): AnySpan | undefined {
    if (!span) return span;
    span.input = this.redact(span.input);
    span.output = this.redact(span.output);
    return span;
  }

  async shutdown(): Promise<void> {}
  // #endregion

  // #region redactor-redact
  // 文字列のほか、配列・オブジェクトの中の文字列も伏せる
  private redact(value: unknown): unknown {
    if (typeof value === 'string') {
      return this.patterns.reduce(
        (text, { regex, replacement }) => text.replace(regex, replacement),
        value
      );
    }
    if (Array.isArray(value)) {
      return value.map((item) => this.redact(item));
    }
    if (value && Object.getPrototypeOf(value) === Object.prototype) {
      return Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, this.redact(v)])
      );
    }
    return value;
  }
}
// #endregion
