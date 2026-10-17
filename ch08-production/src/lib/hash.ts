// 文字列から 0 以上の整数を作る。同じ文字列なら毎回同じ値になる
export function hashCode(text: string): number {
  let hash = 0;
  for (const char of text) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash;
}
