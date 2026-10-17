// 文字の2-gramを1536次元に振り分ける決定的な埋め込み。API を呼ばずに
// 「似た文ほど近いベクトルになる」性質だけを再現する。
import { MockEmbeddingModelV4 } from 'ai/test';

export const DIMENSION = 1536;

export function fakeVector(text: string): number[] {
  const v = new Array<number>(DIMENSION).fill(0);
  const s = text.toLowerCase();
  for (let i = 0; i < s.length - 1; i++) {
    let h = 0;
    for (const c of s.slice(i, i + 2)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    v[h % DIMENSION] += 1;
  }
  const norm = Math.hypot(...v) || 1;
  return v.map((x) => x / norm);
}

export function fakeEmbeddingModel() {
  return new MockEmbeddingModelV4({
    doEmbed: async ({ values }) => ({
      embeddings: values.map((v) => fakeVector(String(v))),
      warnings: [],
    }),
  });
}
