// src/mastra/workflows/approval-state.ts
type ApprovalStepOutput =
  | { decision: 'approved'; approvedBy: UserId; approvedAt: number }
  | { decision: 'rejected'; rejectedBy: UserId; reason: string }
  | { decision: 'escalated'; escalatedTo: UserId };
