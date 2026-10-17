// Slack・承認者・当番への通知の代わり。送った内容を配列に残す
export const sent: string[] = [];

export async function notifySlack(message: string): Promise<void> {
  sent.push(`slack: ${message}`);
}

export async function notifyApprover(paths: string[][]): Promise<void> {
  sent.push(`approver: ${paths.map((p) => p.join('.')).join(', ')}`);
}

export async function notifyOncall(error: Error): Promise<void> {
  sent.push(`oncall: ${error.message}`);
}
