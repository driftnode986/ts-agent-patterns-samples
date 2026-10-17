// IdP（Okta など）が発行したトークンからセッションを引く部分の代わり。
// 本番では JWT の署名を検証してロールを取り出す
export interface Session {
  user: { id: string; role: string };
}

const sessions = new Map<string, Session>();

export function saveSession(token: string, session: Session): void {
  sessions.set(token, session);
}

export async function getSession(req: Request): Promise<Session | null> {
  const auth = req.headers.get('authorization') ?? '';
  const token = auth.replace(/^Bearer /, '');
  return sessions.get(token) ?? null;
}
