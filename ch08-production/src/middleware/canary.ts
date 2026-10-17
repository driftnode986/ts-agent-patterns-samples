// src/middleware/canary.ts
import { hashCode } from '../lib/hash';

export function selectAgentVersion(userId: string): 'v1' | 'v2' {
  const hash = hashCode(userId);
  const canaryPercentage = parseInt(process.env.CANARY_PERCENTAGE || '0');
  return (hash % 100) < canaryPercentage ? 'v2' : 'v1';
}
