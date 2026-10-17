const INJECTION_PATTERNS = [
  /ignore\s+(previous|above|all)\s+instructions/i,
  /you\s+are\s+now\s+/i,
  /system\s*:\s*/i,
  /\bDAN\b/i,
  /jailbreak/i,
];

export function detectInjection(input: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(input));
}
