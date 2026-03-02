import type { Client, Contract, Placement, Invoice, Payment, Refund } from '../types';

// ========================================
// 取引先企業
// ========================================

export const clients: Client[] = [
  {
    id: 'CLI-001',
    companyName: '株式会社テックイノベーション',
    contactPerson: '山田太郎',
    contactEmail: 'yamada@techinnovation.co.jp',
    contactPhone: '03-1234-5678',
    industry: 'IT・通信',
    invoiceDeliveryMethod: 'email_pdf',
    invoiceAddress: '東京都渋谷区神宮前1-2-3',
    invoiceEmail: 'keiri@techinnovation.co.jp',
    createdAt: '2024-04-01',
  },
  {
    id: 'CLI-002',
    companyName: '株式会社グローバルファイナンス',
    contactPerson: '佐藤花子',
    contactEmail: 'sato@globalfinance.co.jp',
    contactPhone: '03-2345-6789',
    industry: '金融・保険',
    invoiceDeliveryMethod: 'postal',
    invoiceAddress: '東京都千代田区丸の内2-3-4',
    invoiceEmail: '',
    createdAt: '2024-06-15',
  },
  {
    id: 'CLI-003',
    companyName: '株式会社メディカルサポート',
    contactPerson: '鈴木一郎',
    contactEmail: 'suzuki@medicalsupport.co.jp',
    contactPhone: '06-3456-7890',
    industry: '医療・ヘルスケア',
    invoiceDeliveryMethod: 'invoice_service',
    invoiceAddress: '大阪府大阪市北区梅田3-4-5',
    invoiceEmail: 'invoice@medicalsupport.co.jp',
    createdAt: '2024-08-20',
  },
  {
    id: 'CLI-004',
    companyName: '合同会社クリエイティブワークス',
    contactPerson: '高橋美咲',
    contactEmail: 'takahashi@creativeworks.co.jp',
    contactPhone: '03-4567-8901',
    industry: '広告・メディア',
    invoiceDeliveryMethod: 'email_pdf',
    invoiceAddress: '東京都港区南青山4-5-6',
    invoiceEmail: 'billing@creativeworks.co.jp',
    createdAt: '2025-01-10',
  },
  {
    id: 'CLI-005',
    companyName: '株式会社ロジスティクスプロ',
    contactPerson: '田中健二',
    contactEmail: 'tanaka@logisticspro.co.jp',
    contactPhone: '045-5678-9012',
    industry: '物流・運輸',
    invoiceDeliveryMethod: 'electronic',
    invoiceAddress: '神奈川県横浜市西区5-6-7',
    invoiceEmail: 'keiri@logisticspro.co.jp',
    createdAt: '2025-03-05',
  },
  {
    id: 'CLI-006',
    companyName: '株式会社エデュケーションラボ',
    contactPerson: '中村由美',
    contactEmail: 'nakamura@edulab.co.jp',
    contactPhone: '03-6789-0123',
    industry: '教育・研修',
    invoiceDeliveryMethod: 'postal',
    invoiceAddress: '東京都文京区本郷6-7-8',
    invoiceEmail: '',
    createdAt: '2025-06-20',
  },
];

// ========================================
// 基本契約
// ========================================

export const contracts: Contract[] = [
  {
    id: 'CON-001',
    clientId: 'CLI-001',
    defaultFeeRate: 0.35,
    guaranteePeriodDays: 90,
    refundRules: [
      { periodFromDays: 0, periodToDays: 30, refundRate: 0.8 },
      { periodFromDays: 31, periodToDays: 90, refundRate: 0.5 },
    ],
    paymentTerms: '月末締め翌月末払い',
    paymentSiteDays: 30,
    startDate: '2024-04-01',
    endDate: '2027-03-31',
    renewalType: 'auto',
    status: 'active',
    documentPdf: 'contract_001.pdf',
    createdAt: '2024-04-01',
  },
  {
    id: 'CON-002',
    clientId: 'CLI-002',
    defaultFeeRate: 0.30,
    guaranteePeriodDays: 90,
    refundRules: [
      { periodFromDays: 0, periodToDays: 30, refundRate: 1.0 },
      { periodFromDays: 31, periodToDays: 60, refundRate: 0.5 },
      { periodFromDays: 61, periodToDays: 90, refundRate: 0.25 },
    ],
    paymentTerms: '月末締め翌々月15日払い',
    paymentSiteDays: 45,
    startDate: '2024-07-01',
    endDate: '2026-06-30',
    renewalType: 'manual',
    status: 'active',
    documentPdf: 'contract_002.pdf',
    createdAt: '2024-06-25',
  },
  {
    id: 'CON-003',
    clientId: 'CLI-003',
    defaultFeeRate: 0.33,
    guaranteePeriodDays: 60,
    refundRules: [
      { periodFromDays: 0, periodToDays: 30, refundRate: 0.8 },
      { periodFromDays: 31, periodToDays: 60, refundRate: 0.4 },
    ],
    paymentTerms: '月末締め翌月末払い',
    paymentSiteDays: 30,
    startDate: '2024-09-01',
    endDate: '2026-08-31',
    renewalType: 'auto',
    status: 'active',
    documentPdf: 'contract_003.pdf',
    createdAt: '2024-08-25',
  },
  {
    id: 'CON-004',
    clientId: 'CLI-004',
    defaultFeeRate: 0.35,
    guaranteePeriodDays: 90,
    refundRules: [
      { periodFromDays: 0, periodToDays: 30, refundRate: 0.8 },
      { periodFromDays: 31, periodToDays: 90, refundRate: 0.5 },
    ],
    paymentTerms: '月末締め翌月末払い',
    paymentSiteDays: 30,
    startDate: '2025-02-01',
    endDate: '2027-01-31',
    renewalType: 'auto',
    status: 'active',
    createdAt: '2025-01-20',
  },
  {
    id: 'CON-005',
    clientId: 'CLI-005',
    defaultFeeRate: 0.30,
    guaranteePeriodDays: 90,
    refundRules: [
      { periodFromDays: 0, periodToDays: 30, refundRate: 0.8 },
      { periodFromDays: 31, periodToDays: 90, refundRate: 0.5 },
    ],
    paymentTerms: '20日締め翌月20日払い',
    paymentSiteDays: 30,
    startDate: '2025-04-01',
    endDate: '2027-03-31',
    renewalType: 'manual',
    status: 'active',
    createdAt: '2025-03-15',
  },
  {
    id: 'CON-006',
    clientId: 'CLI-006',
    defaultFeeRate: 0.32,
    guaranteePeriodDays: 60,
    refundRules: [
      { periodFromDays: 0, periodToDays: 30, refundRate: 0.8 },
      { periodFromDays: 31, periodToDays: 60, refundRate: 0.5 },
    ],
    paymentTerms: '月末締め翌月末払い',
    paymentSiteDays: 30,
    startDate: '2025-07-01',
    endDate: '2026-06-30',
    renewalType: 'manual',
    status: 'negotiating',
    createdAt: '2025-06-25',
  },
];

// ========================================
// 成約（紹介案件）
// ========================================

export const placements: Placement[] = [
  {
    id: 'PLC-001',
    contractId: 'CON-001',
    clientId: 'CLI-001',
    candidateName: '伊藤大輔',
    theoreticalAnnualSalary: 8000000,
    feeRate: 0.35,
    feeAmount: 2800000,
    status: 'started',
    responsibleRA: '松本浩二',
    responsibleCA: '小林真理',
    approvedBy: '渡辺部長',
    approvedAt: '2025-09-20',
    closedAt: '2025-09-20',
    expectedStartDate: '2025-11-01',
    actualStartDate: '2025-11-01',
    evidenceFiles: ['offer_ito.pdf'],
    createdAt: '2025-09-10',
  },
  {
    id: 'PLC-002',
    contractId: 'CON-001',
    clientId: 'CLI-001',
    candidateName: '木村あゆみ',
    theoreticalAnnualSalary: 6500000,
    feeRate: 0.35,
    feeAmount: 2275000,
    status: 'started',
    responsibleRA: '松本浩二',
    approvedBy: '渡辺部長',
    approvedAt: '2025-10-15',
    closedAt: '2025-10-15',
    expectedStartDate: '2025-12-01',
    actualStartDate: '2025-12-01',
    evidenceFiles: ['offer_kimura.pdf'],
    createdAt: '2025-10-05',
  },
  {
    id: 'PLC-003',
    contractId: 'CON-002',
    clientId: 'CLI-002',
    candidateName: '加藤雅之',
    theoreticalAnnualSalary: 12000000,
    feeRate: 0.30,
    feeAmount: 3600000,
    status: 'started',
    responsibleRA: '斎藤健太',
    responsibleCA: '吉田美穂',
    approvedBy: '渡辺部長',
    approvedAt: '2025-11-10',
    closedAt: '2025-11-10',
    expectedStartDate: '2026-01-06',
    actualStartDate: '2026-01-06',
    evidenceFiles: ['offer_kato.pdf'],
    createdAt: '2025-11-01',
  },
  {
    id: 'PLC-004',
    contractId: 'CON-003',
    clientId: 'CLI-003',
    candidateName: '山口裕子',
    theoreticalAnnualSalary: 7000000,
    feeRate: 0.33,
    feeAmount: 2310000,
    status: 'closed',
    responsibleRA: '松本浩二',
    approvedBy: '渡辺部長',
    approvedAt: '2026-02-01',
    closedAt: '2026-02-01',
    expectedStartDate: '2026-04-01',
    evidenceFiles: ['offer_yamaguchi.pdf'],
    createdAt: '2026-01-20',
  },
  {
    id: 'PLC-005',
    contractId: 'CON-004',
    clientId: 'CLI-004',
    candidateName: '松田拓也',
    theoreticalAnnualSalary: 5500000,
    feeRate: 0.35,
    feeAmount: 1925000,
    status: 'pending_approval',
    responsibleRA: '斎藤健太',
    responsibleCA: '小林真理',
    expectedStartDate: '2026-05-01',
    evidenceFiles: ['offer_matsuda.pdf'],
    createdAt: '2026-02-25',
  },
  {
    id: 'PLC-006',
    contractId: 'CON-001',
    clientId: 'CLI-001',
    candidateName: '渡辺翔太',
    theoreticalAnnualSalary: 9500000,
    feeRate: 0.32,
    feeAmount: 3040000,
    status: 'pending_approval',
    responsibleRA: '松本浩二',
    responsibleCA: '吉田美穂',
    expectedStartDate: '2026-04-01',
    evidenceFiles: ['offer_watanabe.pdf'],
    createdAt: '2026-02-28',
  },
  {
    id: 'PLC-007',
    contractId: 'CON-005',
    clientId: 'CLI-005',
    candidateName: '藤井誠',
    theoreticalAnnualSalary: 6000000,
    feeRate: 0.30,
    feeAmount: 1800000,
    status: 'offered',
    responsibleRA: '斎藤健太',
    createdAt: '2026-02-20',
  },
  {
    id: 'PLC-008',
    contractId: 'CON-002',
    clientId: 'CLI-002',
    candidateName: '中島康平',
    theoreticalAnnualSalary: 10000000,
    feeRate: 0.30,
    feeAmount: 3000000,
    status: 'screening',
    responsibleRA: '斎藤健太',
    responsibleCA: '小林真理',
    createdAt: '2026-03-01',
  },
  {
    id: 'PLC-009',
    contractId: 'CON-001',
    clientId: 'CLI-001',
    candidateName: '前田智子',
    theoreticalAnnualSalary: 7500000,
    feeRate: 0.35,
    feeAmount: 2625000,
    status: 'declined',
    responsibleRA: '松本浩二',
    cancelledAt: '2026-01-15',
    cancelReason: '候補者が他社のオファーを選択',
    createdAt: '2025-12-20',
  },
  {
    id: 'PLC-010',
    contractId: 'CON-003',
    clientId: 'CLI-003',
    candidateName: '岡田直樹',
    theoreticalAnnualSalary: 8500000,
    feeRate: 0.33,
    feeAmount: 2805000,
    status: 'cancelled',
    responsibleRA: '松本浩二',
    approvedBy: '渡辺部長',
    approvedAt: '2025-12-10',
    closedAt: '2025-12-10',
    expectedStartDate: '2026-02-01',
    cancelledAt: '2026-01-25',
    cancelReason: '候補者の都合により入社辞退',
    evidenceFiles: ['offer_okada.pdf'],
    createdAt: '2025-12-01',
  },
];

// ========================================
// 請求書
// ========================================

export const invoices: Invoice[] = [
  {
    id: 'INV-001',
    placementId: 'PLC-001',
    clientId: 'CLI-001',
    invoiceNumber: '2025-INV-0042',
    invoiceType: 'normal',
    amount: 2800000,
    taxRate: 0.10,
    taxAmount: 280000,
    totalAmount: 3080000,
    issuedAt: '2025-11-05',
    sentAt: '2025-11-05',
    dueDate: '2025-12-31',
    deliveryMethod: 'email_pdf',
    qualifiedInvoiceNumber: 'T1234567890123',
    status: 'paid',
  },
  {
    id: 'INV-002',
    placementId: 'PLC-002',
    clientId: 'CLI-001',
    invoiceNumber: '2025-INV-0055',
    invoiceType: 'normal',
    amount: 2275000,
    taxRate: 0.10,
    taxAmount: 227500,
    totalAmount: 2502500,
    issuedAt: '2025-12-03',
    sentAt: '2025-12-03',
    dueDate: '2026-01-31',
    deliveryMethod: 'email_pdf',
    qualifiedInvoiceNumber: 'T1234567890123',
    status: 'paid',
  },
  {
    id: 'INV-003',
    placementId: 'PLC-003',
    clientId: 'CLI-002',
    invoiceNumber: '2026-INV-0003',
    invoiceType: 'normal',
    amount: 3600000,
    taxRate: 0.10,
    taxAmount: 360000,
    totalAmount: 3960000,
    issuedAt: '2026-01-10',
    sentAt: '2026-01-12',
    dueDate: '2026-03-15',
    deliveryMethod: 'postal',
    qualifiedInvoiceNumber: 'T1234567890123',
    status: 'sent',
  },
  {
    id: 'INV-004',
    placementId: 'PLC-001',
    clientId: 'CLI-001',
    invoiceNumber: '2026-INV-0008',
    invoiceType: 'credit_note',
    amount: -1400000,
    taxRate: 0.10,
    taxAmount: -140000,
    totalAmount: -1540000,
    issuedAt: '2026-02-10',
    sentAt: '2026-02-10',
    dueDate: '2026-03-31',
    deliveryMethod: 'email_pdf',
    qualifiedInvoiceNumber: 'T1234567890123',
    status: 'sent',
  },
];

// ========================================
// 入金
// ========================================

export const payments: Payment[] = [
  {
    id: 'PAY-001',
    invoiceId: 'INV-001',
    amount: 3080000,
    paidAt: '2025-12-28',
  },
  {
    id: 'PAY-002',
    invoiceId: 'INV-002',
    amount: 2502500,
    paidAt: '2026-01-30',
  },
];

// ========================================
// 返戻金
// ========================================

export const refunds: Refund[] = [
  {
    id: 'REF-001',
    placementId: 'PLC-001',
    originalInvoiceId: 'INV-001',
    creditNoteId: 'INV-004',
    reason: '候補者が体調不良により退職（入社後45日）',
    exitDate: '2025-12-16',
    daysEmployed: 45,
    refundRate: 0.5,
    refundAmount: 1400000,
    status: 'processed',
    processedAt: '2026-02-10',
  },
  {
    id: 'REF-002',
    placementId: 'PLC-002',
    originalInvoiceId: 'INV-002',
    reason: '候補者が自己都合により退職（入社後20日）',
    exitDate: '2025-12-21',
    daysEmployed: 20,
    refundRate: 0.8,
    refundAmount: 1820000,
    status: 'pending',
  },
];

// ========================================
// ヘルパー関数
// ========================================

export function getClient(clientId: string): Client | undefined {
  return clients.find(c => c.id === clientId);
}

export function getContract(contractId: string): Contract | undefined {
  return contracts.find(c => c.id === contractId);
}

export function getContractsByClient(clientId: string): Contract[] {
  return contracts.filter(c => c.clientId === clientId);
}

export function getPlacementsByContract(contractId: string): Placement[] {
  return placements.filter(p => p.contractId === contractId);
}

export function getPlacementsByClient(clientId: string): Placement[] {
  return placements.filter(p => p.clientId === clientId);
}

export function getInvoicesByPlacement(placementId: string): Invoice[] {
  return invoices.filter(i => i.placementId === placementId);
}

export function getInvoicesByClient(clientId: string): Invoice[] {
  return invoices.filter(i => i.clientId === clientId);
}

export function getPaymentByInvoice(invoiceId: string): Payment | undefined {
  return payments.find(p => p.invoiceId === invoiceId);
}

export function getRefundByPlacement(placementId: string): Refund | undefined {
  return refunds.find(r => r.placementId === placementId);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(amount);
}

export function formatPercent(rate: number): string {
  return `${(rate * 100).toFixed(0)}%`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ja-JP');
}
