// src/lib/resilience.ts
import {
  circuitBreaker,
  ConsecutiveBreaker,
  SamplingBreaker,
} from 'cockatiel';

const breaker = circuitBreaker(
  handleWhen((err: any) => {
    const status = err?.status || err?.statusCode;
    return status === 429 || status === 500 || status === 503;
  }),
  {
    halfOpenAfter: 30_000,
    breaker: new ConsecutiveBreaker(5),
  }
);

breaker.onStateChange((state) => {
  console.log(`Circuit breaker state: ${state}`);
  if (state === 'open') {
    // アラート送信: LLM API が応答不能
  }
});
