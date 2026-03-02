// ========================================
// 値オブジェクト（Enum）
// ========================================

export type ContractStatus = 'negotiating' | 'active' | 'renewal_negotiating' | 'expired' | 'terminated';
export type PlacementStatus = 'screening' | 'offered' | 'pending_approval' | 'closed' | 'started' | 'cancelled' | 'declined' | 'failed';
export type InvoiceStatus = 'issued' | 'sent' | 'paid' | 'cancelled';
export type InvoiceType = 'normal' | 'credit_note';
export type InvoiceDeliveryMethod = 'postal' | 'email_pdf' | 'invoice_service' | 'electronic';
export type RenewalType = 'auto' | 'manual';
export type RefundStatus = 'pending' | 'processed';

// ========================================
// エンティティ
// ========================================

export interface Client {
  id: string;
  companyName: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  industry: string;
  invoiceDeliveryMethod: InvoiceDeliveryMethod;
  invoiceAddress: string;
  invoiceEmail: string;
  createdAt: string;
}

export interface RefundRule {
  periodFromDays: number;
  periodToDays: number;
  refundRate: number;
}

export interface Contract {
  id: string;
  clientId: string;
  defaultFeeRate: number;
  guaranteePeriodDays: number;
  refundRules: RefundRule[];
  paymentTerms: string;
  paymentSiteDays: number;
  startDate: string;
  endDate: string;
  renewalType: RenewalType;
  status: ContractStatus;
  documentPdf?: string;
  createdAt: string;
}

export interface Placement {
  id: string;
  contractId: string;
  clientId: string;
  candidateName: string;
  theoreticalAnnualSalary: number;
  feeRate: number;
  feeAmount: number;
  status: PlacementStatus;
  responsibleRA: string;
  responsibleCA?: string;
  approvedBy?: string;
  approvedAt?: string;
  closedAt?: string;
  expectedStartDate?: string;
  actualStartDate?: string;
  cancelledAt?: string;
  cancelReason?: string;
  evidenceFiles?: string[];
  createdAt: string;
}

export interface Invoice {
  id: string;
  placementId: string;
  clientId: string;
  invoiceNumber: string;
  invoiceType: InvoiceType;
  amount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  issuedAt: string;
  sentAt?: string;
  dueDate: string;
  deliveryMethod: InvoiceDeliveryMethod;
  qualifiedInvoiceNumber: string;
  status: InvoiceStatus;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paidAt: string;
}

export interface Refund {
  id: string;
  placementId: string;
  originalInvoiceId: string;
  creditNoteId?: string;
  reason: string;
  exitDate: string;
  daysEmployed: number;
  refundRate: number;
  refundAmount: number;
  status: RefundStatus;
  processedAt?: string;
}

// ========================================
// ラベルマッピング
// ========================================

export const contractStatusLabels: Record<ContractStatus, string> = {
  negotiating: '交渉中',
  active: '有効',
  renewal_negotiating: '更新交渉中',
  expired: '期限切れ',
  terminated: '解約',
};

export const placementStatusLabels: Record<PlacementStatus, string> = {
  screening: '選考中',
  offered: '内定',
  pending_approval: '承認待ち',
  closed: '成約確定',
  started: '入社済み',
  cancelled: '入社前キャンセル',
  declined: '内定辞退',
  failed: '不成立',
};

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  issued: '発行済み',
  sent: '送付済み',
  paid: '入金済み',
  cancelled: '取消',
};

export const invoiceTypeLabels: Record<InvoiceType, string> = {
  normal: '通常',
  credit_note: 'マイナス',
};

export const deliveryMethodLabels: Record<InvoiceDeliveryMethod, string> = {
  postal: '郵送',
  email_pdf: 'メールPDF',
  invoice_service: '発行サービス',
  electronic: '電子送付',
};

export const renewalTypeLabels: Record<RenewalType, string> = {
  auto: '自動更新',
  manual: '手動更新',
};

export const refundStatusLabels: Record<RefundStatus, string> = {
  pending: '未処理',
  processed: '処理済み',
};
