import { z } from 'zod';

const AuditLogSchema = z.object({
  timestamp: z.iso.datetime(),
  userId: z.string(),
  agentName: z.string(),
  action: z.enum(['invoke', 'tool_call', 'complete', 'error']),
  input: z.string().optional(),
  output: z.string().optional(),
  tokensUsed: z.number().optional(),
  durationMs: z.number().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

type AuditLog = z.infer<typeof AuditLogSchema>;

export async function writeAuditLog(log: AuditLog): Promise<void> {
  // 構造化ログとして出力 (Datadog / CloudWatch / BigQuery 等で集約)
  console.log(JSON.stringify({
    ...log,
    _type: 'agent_audit_log',
    _version: '1.0',
  }));
}
