import { Tag } from 'antd';
import type { PlacementStatus, InvoiceStatus, ContractStatus, RefundStatus } from '../types';
import { placementStatusLabels, invoiceStatusLabels, contractStatusLabels, refundStatusLabels } from '../types';

const placementStatusColors: Record<PlacementStatus, string> = {
  screening: 'blue',
  offered: 'cyan',
  pending_approval: 'orange',
  closed: 'geekblue',
  started: 'green',
  cancelled: 'red',
  declined: 'volcano',
  failed: 'default',
};

const invoiceStatusColors: Record<InvoiceStatus, string> = {
  issued: 'blue',
  sent: 'cyan',
  paid: 'green',
  cancelled: 'red',
};

const contractStatusColors: Record<ContractStatus, string> = {
  negotiating: 'orange',
  active: 'green',
  renewal_negotiating: 'orange',
  expired: 'default',
  terminated: 'red',
};

const refundStatusColors: Record<RefundStatus, string> = {
  pending: 'orange',
  processed: 'green',
};

export function PlacementStatusTag({ status }: { status: PlacementStatus }) {
  return <Tag color={placementStatusColors[status]}>{placementStatusLabels[status]}</Tag>;
}

export function InvoiceStatusTag({ status }: { status: InvoiceStatus }) {
  return <Tag color={invoiceStatusColors[status]}>{invoiceStatusLabels[status]}</Tag>;
}

export function ContractStatusTag({ status }: { status: ContractStatus }) {
  return <Tag color={contractStatusColors[status]}>{contractStatusLabels[status]}</Tag>;
}

export function RefundStatusTag({ status }: { status: RefundStatus }) {
  return <Tag color={refundStatusColors[status]}>{refundStatusLabels[status]}</Tag>;
}
