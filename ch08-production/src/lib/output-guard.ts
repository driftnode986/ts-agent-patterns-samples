export function validateOutput(output: string): {
  safe: boolean;
  reason?: string;
} {
  // システムプロンプトの漏洩チェック
  if (
    output.includes('instructions:') ||
    output.includes('system prompt')
  ) {
    return { safe: false, reason: 'Potential system prompt leak' };
  }

  // API キーパターンのチェック
  if (/sk-[a-zA-Z0-9]{20,}/.test(output)) {
    return { safe: false, reason: 'Potential API key in output' };
  }

  return { safe: true };
}
