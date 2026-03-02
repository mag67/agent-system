import { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Breadcrumb,
  Tabs,
  Descriptions,
  Button,
  Result,
  Space,
  Card,
  Table,
  Tag,
  Popconfirm,
  App,
} from 'antd';
import { SendOutlined, StopOutlined } from '@ant-design/icons';
import {
  invoices,
  placements,
  getClient,
  formatCurrency,
  formatDate,
  formatPercent,
} from '../data';
import type { Invoice } from '../types';
import { invoiceTypeLabels, deliveryMethodLabels } from '../types';
import { InvoiceStatusTag } from '../components/StatusBadge';

function getPlacement(placementId: string) {
  return placements.find(p => p.id === placementId);
}

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { message } = App.useApp();

  const invoice = useMemo(() => invoices.find(i => i.id === id), [id]);
  const placement = useMemo(
    () => (invoice ? getPlacement(invoice.placementId) : undefined),
    [invoice],
  );
  const client = useMemo(
    () => (invoice ? getClient(invoice.clientId) : undefined),
    [invoice],
  );

  if (!invoice) {
    return (
      <Result
        status="404"
        title="請求書が見つかりません"
        subTitle={`ID: ${id} に該当する請求書は存在しません。`}
        extra={
          <Button type="primary" onClick={() => navigate('/invoices')}>
            一覧に戻る
          </Button>
        }
      />
    );
  }

  const handleMarkSent = () => {
    message.success('請求書を送付済みにしました（モック）');
  };

  const handleCancel = () => {
    message.success('請求書を取消しました（モック）');
  };

  // 請求書情報タブ
  const infoTab = (
    <Descriptions bordered column={2}>
      <Descriptions.Item label="請求書番号">
        {invoice.invoiceNumber}
      </Descriptions.Item>
      <Descriptions.Item label="種別">
        <Tag color={invoice.invoiceType === 'normal' ? 'blue' : 'red'}>
          {invoiceTypeLabels[invoice.invoiceType]}
        </Tag>
      </Descriptions.Item>
      <Descriptions.Item label="取引先企業名">
        {client ? (
          <Link to={`/clients/${client.id}`}>{client.companyName}</Link>
        ) : (
          '-'
        )}
      </Descriptions.Item>
      <Descriptions.Item label="候補者名">
        {placement ? (
          <Link to={`/placements/${placement.id}`}>
            {placement.candidateName}
          </Link>
        ) : (
          '-'
        )}
      </Descriptions.Item>
      <Descriptions.Item label="金額（税抜）">
        <span style={{ color: invoice.amount < 0 ? '#ff4d4f' : undefined }}>
          {formatCurrency(invoice.amount)}
        </span>
      </Descriptions.Item>
      <Descriptions.Item label="消費税率">
        {formatPercent(invoice.taxRate)}
      </Descriptions.Item>
      <Descriptions.Item label="消費税額">
        <span style={{ color: invoice.taxAmount < 0 ? '#ff4d4f' : undefined }}>
          {formatCurrency(invoice.taxAmount)}
        </span>
      </Descriptions.Item>
      <Descriptions.Item label="合計額（税込）">
        <span
          style={{
            fontWeight: 'bold',
            fontSize: 16,
            color: invoice.totalAmount < 0 ? '#ff4d4f' : undefined,
          }}
        >
          {formatCurrency(invoice.totalAmount)}
        </span>
      </Descriptions.Item>
      <Descriptions.Item label="発行日">
        {formatDate(invoice.issuedAt)}
      </Descriptions.Item>
      <Descriptions.Item label="送付日">
        {invoice.sentAt ? formatDate(invoice.sentAt) : '-'}
      </Descriptions.Item>
      <Descriptions.Item label="支払期日">
        {formatDate(invoice.dueDate)}
      </Descriptions.Item>
      <Descriptions.Item label="送付方法">
        {deliveryMethodLabels[invoice.deliveryMethod]}
      </Descriptions.Item>
      <Descriptions.Item label="適格請求書発行事業者番号" span={2}>
        {invoice.qualifiedInvoiceNumber}
      </Descriptions.Item>
      <Descriptions.Item label="ステータス">
        <InvoiceStatusTag status={invoice.status} />
      </Descriptions.Item>
    </Descriptions>
  );

  // プレビュータブ
  const previewTab = (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <Card
        style={{
          width: 595,
          minHeight: 842,
          padding: '40px 48px',
          border: '1px solid #d9d9d9',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
        styles={{ body: { padding: 0 } }}
      >
        {/* ヘッダー */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>
            請求書
          </h1>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 24,
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: '#666' }}>請求書番号</div>
            <div style={{ fontWeight: 'bold' }}>{invoice.invoiceNumber}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#666' }}>発行日</div>
            <div>{formatDate(invoice.issuedAt)}</div>
          </div>
        </div>

        {/* 請求先 */}
        <div
          style={{
            marginBottom: 32,
            padding: '12px 16px',
            borderBottom: '2px solid #333',
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 'bold' }}>
            {client?.companyName ?? '-'} 御中
          </div>
        </div>

        {/* 合計金額 */}
        <div
          style={{
            marginBottom: 32,
            padding: '12px 16px',
            background: '#f5f5f5',
            borderRadius: 4,
          }}
        >
          <div style={{ fontSize: 12, color: '#666' }}>ご請求金額（税込）</div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 'bold',
              color: invoice.totalAmount < 0 ? '#ff4d4f' : undefined,
            }}
          >
            {formatCurrency(invoice.totalAmount)}
          </div>
        </div>

        {/* 請求元 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: 32,
          }}
        >
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 'bold' }}>
              株式会社エージェントパートナーズ
            </div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              〒100-0001 東京都千代田区千代田1-1-1
            </div>
            <div style={{ fontSize: 12, color: '#666' }}>
              TEL: 03-0000-0000
            </div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              適格請求書発行事業者番号: {invoice.qualifiedInvoiceNumber}
            </div>
          </div>
        </div>

        {/* 明細テーブル */}
        <Table
          size="small"
          pagination={false}
          bordered
          dataSource={[
            {
              key: '1',
              item: `人材紹介手数料 / ${placement?.candidateName ?? '-'}`,
              quantity: 1,
              unitPrice: invoice.amount,
              amount: invoice.amount,
            },
          ]}
          columns={[
            {
              title: '品目',
              dataIndex: 'item',
              key: 'item',
            },
            {
              title: '数量',
              dataIndex: 'quantity',
              key: 'quantity',
              width: 60,
              align: 'center',
            },
            {
              title: '単価',
              dataIndex: 'unitPrice',
              key: 'unitPrice',
              width: 120,
              align: 'right',
              render: (v: number) => formatCurrency(v),
            },
            {
              title: '金額',
              dataIndex: 'amount',
              key: 'amount',
              width: 120,
              align: 'right',
              render: (v: number) => formatCurrency(v),
            },
          ]}
          style={{ marginBottom: 16 }}
        />

        {/* 小計・消費税・合計 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: 240 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '4px 0',
              }}
            >
              <span>小計</span>
              <span>{formatCurrency(invoice.amount)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '4px 0',
              }}
            >
              <span>消費税（{formatPercent(invoice.taxRate)}）</span>
              <span>{formatCurrency(invoice.taxAmount)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderTop: '2px solid #333',
                fontWeight: 'bold',
                fontSize: 16,
              }}
            >
              <span>合計</span>
              <span
                style={{
                  color: invoice.totalAmount < 0 ? '#ff4d4f' : undefined,
                }}
              >
                {formatCurrency(invoice.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* 振込先 */}
        <div
          style={{
            marginTop: 32,
            padding: '12px 16px',
            background: '#fafafa',
            borderRadius: 4,
            fontSize: 12,
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
            お振込先
          </div>
          <div>三菱UFJ銀行 丸の内支店 普通 1234567</div>
          <div>カ）エージェントパートナーズ</div>
          <div style={{ marginTop: 4 }}>
            お支払期日: {formatDate(invoice.dueDate)}
          </div>
        </div>

        {/* 社判 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: 32,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              border: '2px solid #d9d9d9',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999',
              fontSize: 12,
            }}
          >
            [社判]
          </div>
        </div>
      </Card>
    </div>
  );

  const tabItems = [
    {
      key: 'info',
      label: '請求書情報',
      children: infoTab,
    },
    {
      key: 'preview',
      label: 'プレビュー',
      children: previewTab,
    },
  ];

  return (
    <div>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <Link to="/invoices">請求書</Link> },
          { title: invoice.invoiceNumber },
        ]}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <h2 style={{ margin: 0 }}>
          {invoice.invoiceNumber}
          <span style={{ marginLeft: 12 }}>
            <InvoiceStatusTag status={invoice.status} />
          </span>
        </h2>
        <Space>
          {invoice.status === 'issued' && (
            <Popconfirm
              title="送付済みにしますか？"
              description="この操作は取り消せません。"
              onConfirm={handleMarkSent}
              okText="送付済みにする"
              cancelText="キャンセル"
            >
              <Button type="primary" icon={<SendOutlined />}>
                送付済みにする
              </Button>
            </Popconfirm>
          )}
          {invoice.status !== 'cancelled' && invoice.status !== 'paid' && (
            <Popconfirm
              title="請求書を取消しますか？"
              description="この操作は取り消せません。取消後は元に戻すことができません。"
              onConfirm={handleCancel}
              okText="取消する"
              cancelText="キャンセル"
              okButtonProps={{ danger: true }}
            >
              <Button danger icon={<StopOutlined />}>
                取消
              </Button>
            </Popconfirm>
          )}
        </Space>
      </div>

      <Tabs items={tabItems} />
    </div>
  );
}
