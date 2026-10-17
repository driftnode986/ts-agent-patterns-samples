// src/middleware/rbac.ts
// #region permissions
import { z } from 'zod';
import { getSession } from '../lib/session';

const RoleSchema = z.enum(['admin', 'developer', 'viewer']);
type Role = z.infer<typeof RoleSchema>;

const agentPermissions: Record<string, Role[]> = {
  'code-review': ['admin', 'developer'],
  'customer-support': ['admin', 'developer', 'viewer'],
  'data-migration': ['admin'],
  'report-generator': ['admin', 'developer', 'viewer'],
};

export function checkAgentAccess(
  agentName: string,
  userRole: Role
): boolean {
  const allowedRoles = agentPermissions[agentName];
  if (!allowedRoles) return false;
  return allowedRoles.includes(userRole);
}
// #endregion

// #region middleware
// Next.js middleware での使用例
export async function agentMiddleware(
  req: Request,
  agentName: string
): Promise<Response | null> {
  const session = await getSession(req);
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const role = RoleSchema.parse(session.user.role);
  if (!checkAgentAccess(agentName, role)) {
    return new Response('Forbidden', { status: 403 });
  }

  return null; // アクセス許可
}
// #endregion
