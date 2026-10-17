// #region retry
import {
  retry,
  handleWhen,
  ExponentialBackoff,
} from 'cockatiel';

const retryPolicy = retry(
  handleWhen((err: any) => {
    const status = err?.status || err?.statusCode;
    return status === 429 || status === 500 || status === 503;
  }),
  {
    maxAttempts: 3,
    backoff: new ExponentialBackoff({
      initialDelay: 1000,
      maxDelay: 30000,
      exponent: 2,
    }),
  }
);

export async function callLLMWithRetry<T>(
  fn: () => Promise<T>
): Promise<T> {
  return retryPolicy.execute(fn);
}
// #endregion

// #region breaker
import {
  circuitBreaker,
  ConsecutiveBreaker,
  CircuitState,
} from 'cockatiel';

export const breaker = circuitBreaker(
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
  console.log(`Circuit breaker state: ${CircuitState[state]}`);
  if (state === CircuitState.Open) {
    // アラート送信: LLM API が応答不能
  }
});
// #endregion
