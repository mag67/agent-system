import { useState, useMemo } from 'react';
import {
  Table,
  Segmented,
  Empty,
  Button,
  Drawer,
  Descriptions,
  Form,
  DatePicker,
  InputNumber,
  Popconfirm,
  Tag,
  App,
} from 'antd';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  invoices,
  placements,
  getClient,
  getPaymentByInvoice,
  formatCurrency,
  formatDate,
} from '../data';
import type { Invoice, Payment } from '../types';

type PaymentFilter = 'all' | 'unpaid' | 'paid';

const filterOptions: { label: string; value: PaymentFilter }[] = [
  { label: 'すべて', value: 'all' },
  { label: '未入金のみ', value: 'unpaid' },
  { label: '入金済み', value: 'paid' },
];

function getPlacement(placementId: string) {
  return placements.find(p => p.id === placementId);
}

function getOverdueDays(dueDate: string): number {
  const now = new Date();
  const due = new Date(dueDate);
  const diff = now.getTime() - due.getTime();
  return diff > 0 ? Math.floor(diff / (1000 * 60 * 60 * 24)) : 0;
}

interface InvoiceWithPayment extends Invoice {
  payment?: Payment;
}

export default function PaymentConfirmation() {
  const { message } = App.useApp();
  const [filter, setFilter] = useState<PaymentFilter>('all');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] =
    useState<InvoiceWithPayment | null>(null);
  const [paymentDate, setPaymentDate] = useState<dayjs.Dayjs | null>(dayjs());
  const [paymentAmount, setPaymentAmount] = useState<number | null>(null);

  // normalタイプのみ表示
  const dataSource: InvoiceWithPayment[] = useMemo(() => {
    let result = invoices.filter(inv => inv.invoiceType === 'normal');

    const enriched = result.map(inv => ({
      ...inv,
      payment: getPaymentByInvoice(inv.id),
    }));

    if (filter === 'unpaid') {
      return enriched.filter(inv => !inv.payment);
    }
    if (filter === 'paid') {
      return enriched.filter(inv => !!inv.payment);
    }
    return enriched;
  }, [filter]);

  const openDrawer = (invoice: InvoiceWithPayment) => {
    setSelectedInvoice(invoice);
    setPaymentDate(dayjs());
    setPaymentAmount(invoice.totalAmount);
    setDrawerVisible(true);
  };

  const handleConfirmPayment = () => {
    message.success('入金を確認しました（モック）');
    setDrawerVisible(false);
    setSelectedInvoice(null);
  };

  const columns: ColumnsType<InvoiceWithPayment> = [
    {
      title: '請求書番号',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      width: 160,
    },
    {
      title: '取引先企業名',
      key: 'clientName',
      render: (_, record) => getClient(record.clientId)?.companyName ?? '-',
    },
    {
      title: '候補者名',
      key: 'candidateName',
      render: (_, record) =>
        getPlacement(record.placementId)?.candidateName ?? '-',
    },
    {
      title: '請求額',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: '支払期日',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 160,
      render: (date: string, record) => {
        const isPaid = !!record.payment;
        const overdueDays = !isPaid ? getOverdueDays(date) : 0;
        const isOverdue = overdueDays > 0;
        return (
          <span style={{ color: isOverdue ? '#ff4d4f' : undefined }}>
            {isOverdue && (
              <ExclamationCircleOutlined style={{ marginRight: 4 }} />
            )}
            {formatDate(date)}
            {isOverdue && (
              <span style={{ fontSize: 12, marginLeft: 4 }}>
                ({overdueDays}日超過)
              </span>
            )}
          </span>
        );
      },
    },
    {
      title: '入金ステータス',
      key: 'paymentStatus',
      width: 120,
      align: 'center',
      render: (_, record) =>
        record.payment ? (
          <Tag icon={<CheckCircleOutlined />} color="green">
            入金済み
          </Tag>
        ) : (
          <Tag color="orange">未入金</Tag>
        ),
    },
    {
      title: '入金日',
      key: 'paidAt',
      width: 120,
      render: (_, record) =>
        record.payment ? formatDate(record.payment.paidAt) : '-',
    },
    {
      title: '入金額',
      key: 'paidAmount',
      width: 130,
      align: 'right',
      render: (_, record) =>
        record.payment ? formatCurrency(record.payment.amount) : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      align: 'center',
      render: (_, record) =>
        !record.payment ? (
          <Button
            type="primary"
            size="small"
            onClick={e => {
              e.stopPropagation();
              openDrawer(record);
            }}
          >
            入金確認
          </Button>
        ) : null,
    },
  ];

  const selectedClient = selectedInvoice
    ? getClient(selectedInvoice.clientId)
    : undefined;
  const selectedPlacement = selectedInvoice
    ? getPlacement(selectedInvoice.placementId)
    : undefined;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <h2 style={{ margin: 0 }}>入金確認</h2>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Segmented
          options={filterOptions}
          value={filter}
          onChange={value => setFilter(value as PaymentFilter)}
        />
      </div>

      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        locale={{
          emptyText: <Empty description="該当する請求書はありません" />,
        }}
        pagination={{ pageSize: 20 }}
      />

      {/* 入金確認Drawer */}
      <Drawer
        title="入金確認"
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={480}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Popconfirm
              title="入金を確認しますか？"
              description={
                paymentAmount != null
                  ? `入金額 ${formatCurrency(paymentAmount)} で消し込みを行います`
                  : undefined
              }
              onConfirm={handleConfirmPayment}
              okText="入金を確認"
              cancelText="キャンセル"
            >
              <Button type="primary" disabled={!paymentDate || !paymentAmount}>
                入金を確認
              </Button>
            </Popconfirm>
          </div>
        }
      >
        {selectedInvoice && (
          <>
            <Descriptions
              bordered
              column={1}
              size="small"
              style={{ marginBottom: 24 }}
            >
              <Descriptions.Item label="請求書番号">
                {selectedInvoice.invoiceNumber}
              </Descriptions.Item>
              <Descriptions.Item label="取引先企業名">
                {selectedClient?.companyName ?? '-'}
              </Descriptions.Item>
              <Descriptions.Item label="候補者名">
                {selectedPlacement?.candidateName ?? '-'}
              </Descriptions.Item>
              <Descriptions.Item label="請求額（税込）">
                <span style={{ fontWeight: 'bold' }}>
                  {formatCurrency(selectedInvoice.totalAmount)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="支払期日">
                {formatDate(selectedInvoice.dueDate)}
              </Descriptions.Item>
            </Descriptions>

            <h4 style={{ marginBottom: 16 }}>入金情報</h4>
            <Form layout="vertical">
              <Form.Item label="入金日" required>
                <DatePicker
                  value={paymentDate}
                  onChange={date => setPaymentDate(date)}
                  style={{ width: '100%' }}
                />
              </Form.Item>
              <Form.Item label="入金額" required>
                <InputNumber
                  value={paymentAmount}
                  onChange={value => setPaymentAmount(value)}
                  style={{ width: '100%' }}
                  formatter={value =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  parser={value =>
                    Number(value?.replace(/,/g, '') ?? 0)
                  }
                  prefix="¥"
                  min={0}
                />
              </Form.Item>
            </Form>
          </>
        )}
      </Drawer>
    </div>
  );
}
