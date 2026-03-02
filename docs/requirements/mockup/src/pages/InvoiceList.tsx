import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Input, Button, Space, Segmented, Tag, Empty } from 'antd';
import { SearchOutlined, PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  invoices,
  placements,
  getClient,
  formatCurrency,
  formatDate,
} from '../data';
import type { Invoice, InvoiceStatus, InvoiceType } from '../types';
import { invoiceTypeLabels, deliveryMethodLabels } from '../types';
import { InvoiceStatusTag } from '../components/StatusBadge';

type StatusFilter = 'all' | InvoiceStatus;
type TypeFilter = 'all' | InvoiceType;

const statusOptions: { label: string; value: StatusFilter }[] = [
  { label: 'すべて', value: 'all' },
  { label: '発行済み', value: 'issued' },
  { label: '送付済み', value: 'sent' },
  { label: '入金済み', value: 'paid' },
  { label: '取消', value: 'cancelled' },
];

const typeOptions: { label: string; value: TypeFilter }[] = [
  { label: 'すべて', value: 'all' },
  { label: '通常', value: 'normal' },
  { label: 'マイナス', value: 'credit_note' },
];

function getPlacement(placementId: string) {
  return placements.find(p => p.id === placementId);
}

function isOverdue(dueDate: string, status: InvoiceStatus): boolean {
  if (status === 'paid' || status === 'cancelled') return false;
  return new Date(dueDate) < new Date();
}

export default function InvoiceList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  const filteredInvoices = useMemo(() => {
    let result = invoices;

    if (statusFilter !== 'all') {
      result = result.filter(inv => inv.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      result = result.filter(inv => inv.invoiceType === typeFilter);
    }

    if (search) {
      const lower = search.toLowerCase();
      result = result.filter(inv => {
        const client = getClient(inv.clientId);
        return (
          inv.invoiceNumber.toLowerCase().includes(lower) ||
          (client?.companyName ?? '').toLowerCase().includes(lower)
        );
      });
    }

    return result;
  }, [search, statusFilter, typeFilter]);

  const columns: ColumnsType<Invoice> = [
    {
      title: '請求書番号',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      width: 160,
    },
    {
      title: '種別',
      dataIndex: 'invoiceType',
      key: 'invoiceType',
      width: 100,
      render: (type: InvoiceType) => (
        <Tag color={type === 'normal' ? 'blue' : 'red'}>
          {invoiceTypeLabels[type]}
        </Tag>
      ),
    },
    {
      title: '取引先企業名',
      key: 'clientName',
      render: (_, record) => getClient(record.clientId)?.companyName ?? '-',
    },
    {
      title: '候補者名',
      key: 'candidateName',
      render: (_, record) => getPlacement(record.placementId)?.candidateName ?? '-',
    },
    {
      title: '金額（税込）',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right',
      render: (amount: number) => (
        <span style={{ color: amount < 0 ? '#ff4d4f' : undefined }}>
          {formatCurrency(amount)}
        </span>
      ),
    },
    {
      title: '発行日',
      dataIndex: 'issuedAt',
      key: 'issuedAt',
      width: 120,
      render: (date: string) => formatDate(date),
    },
    {
      title: '支払期日',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 140,
      render: (date: string, record) => {
        const overdue = isOverdue(date, record.status);
        return (
          <span style={{ color: overdue ? '#ff4d4f' : undefined }}>
            {overdue && <ExclamationCircleOutlined style={{ marginRight: 4 }} />}
            {formatDate(date)}
          </span>
        );
      },
    },
    {
      title: '送付方法',
      dataIndex: 'deliveryMethod',
      key: 'deliveryMethod',
      width: 120,
      render: (method: string) =>
        deliveryMethodLabels[method as keyof typeof deliveryMethodLabels],
    },
    {
      title: 'ステータス',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: InvoiceStatus) => <InvoiceStatusTag status={status} />,
    },
  ];

  return (
    <div>
      <Space
        direction="vertical"
        size="middle"
        style={{ display: 'flex', marginBottom: 16 }}
      >
        <Space style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Input
            placeholder="請求書番号、企業名で検索..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 320 }}
            allowClear
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/invoices/new')}
          >
            請求書発行
          </Button>
        </Space>

        <Space size="middle">
          <Segmented
            options={statusOptions}
            value={statusFilter}
            onChange={value => setStatusFilter(value as StatusFilter)}
          />
          <Segmented
            options={typeOptions}
            value={typeFilter}
            onChange={value => setTypeFilter(value as TypeFilter)}
          />
        </Space>
      </Space>

      <Table
        columns={columns}
        dataSource={filteredInvoices}
        rowKey="id"
        onRow={record => ({
          onClick: () => navigate(`/invoices/${record.id}`),
          style: { cursor: 'pointer' },
        })}
        locale={{
          emptyText: <Empty description="該当する請求書はありません" />,
        }}
        pagination={{ pageSize: 20 }}
      />
    </div>
  );
}
