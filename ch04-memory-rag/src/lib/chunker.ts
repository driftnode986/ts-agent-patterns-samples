// src/lib/chunker.ts
export function chunkDocument(text: string, options: {
  maxChunkSize: number;
  overlap: number;
}): string[] {
  const { maxChunkSize, overlap } = options;
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + maxChunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += maxChunkSize - overlap;
  }

  return chunks;
}
