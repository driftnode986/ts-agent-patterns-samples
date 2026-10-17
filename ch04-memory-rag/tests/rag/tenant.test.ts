import { describe, it, expect, beforeAll } from 'vitest';
import { indexTenantDocument } from '../../src/scripts/index-tenant-documents';
import { searchTenantDocs } from '../../src/lib/search-tenant';

beforeAll(async () => {
  await indexTenantDocument('tenant-a', '1', 'a.md', 'A 社の請求書は月末締めです。');
  await indexTenantDocument('tenant-b', '1', 'b.md', 'B 社の請求書は月末締めです。');
});

describe('searchTenantDocs', () => {
  it('指定したテナントのドキュメントだけを返す', async () => {
    const a = await searchTenantDocs('請求書の締め日', 'tenant-a');
    expect(a).toEqual(['A 社の請求書は月末締めです。']);

    const b = await searchTenantDocs('請求書の締め日', 'tenant-b');
    expect(b).toEqual(['B 社の請求書は月末締めです。']);
  });
});
