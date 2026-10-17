import { describe, it, expect } from 'vitest';
import { chunkDocument } from '../../src/lib/chunker';

describe('chunkDocument', () => {
  it('前のチャンクの末尾 overlap 文字が次の先頭に入る', () => {
    const text = 'a'.repeat(1000) + 'b'.repeat(1000) + 'c'.repeat(500);
    const chunks = chunkDocument(text, { maxChunkSize: 1000, overlap: 200 });
    expect(chunks).toHaveLength(3);
    expect(chunks.every((c) => c.length <= 1000)).toBe(true);
    expect(chunks[1].slice(0, 200)).toBe(chunks[0].slice(-200));
    expect(chunks.at(-1)?.endsWith('c')).toBe(true);
  });

  it('末尾に届いたら終わり、前のチャンクに含まれる断片を作らない', () => {
    const chunks = chunkDocument('x'.repeat(1000), { maxChunkSize: 1000, overlap: 200 });
    expect(chunks).toEqual(['x'.repeat(1000)]);
  });
});
