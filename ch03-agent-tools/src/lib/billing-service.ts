// 請求システムの代わり。作成した請求書をメモリ上に保持する
type Invoice = {
  id: string;
  customerId: string;
  amount: number;
  currency: 'JPY' | 'USD' | 'EUR';
  dueDate: Date;
  status: 'draft' | 'sent' | 'paid';
};

const invoices: Invoice[] = [];

export const billingService = {
  async create(input: Omit<Invoice, 'id' | 'status'>): Promise<Invoice> {
    const invoice: Invoice = {
      ...input,
      id: `inv-${invoices.length + 1}`,
      status: 'draft',
    };
    invoices.push(invoice);
    return invoice;
  },
};
