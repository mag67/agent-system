import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Col, Row, Statistic, Table, List, Typography } from 'antd';
import {
  DollarOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Placement } from '../types';
import {
  placements,
  invoices,
  refunds,
  getClient,
  formatCurrency,
  formatDate,
} from '../data';
import { PlacementStatusTag } from '../components/StatusBadge';

const { Title, Text, Link } = Typography;

/** 今日の日付（仕様上 2026-03-03 で固定） */
const TODAY = '2026-03-03';
const THIS_MONTH_PREFIX = '2026-03';

export default function Dashboard() {
  const navigate = useNavigate();

  // ==================================================
  // KPI 算出
  // ==================================================

  /** 今月の成約見込み額: 今月（2026-03）の closed / pending_approval の feeAmount 合計 */
  const monthlyClosedAmount = useMemo(() => {
    return placements
      .filter(
        (p) =>
          (p.status === 'closed' || p.status === 'pending_approval') &&
          p.createdAt.startsWith(THIS_MONTH_PREFIX),
      )
      .reduce((sum, p) => sum + p.feeAmount, 0);
  }, []);

  /** 未入金請求額: status=issued/sent の Invoice の totalAmount 合計 */
  const unpaidInvoiceAmount = useMemo(() => {
    return invoices
      .filter((inv) => inv.status === 'issued' || inv.status === 'sent')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
  }, []);

  /** 承認待ち件数 */
  const pendingApprovalPlacements = useMemo(() => {
    return placements.filter((p) => p.status === 'pending_approval');
  }, []);

  /** 今月の返戻金: status=pending の Refund の refundAmount 合計 */
  const pendingRefundAmount = useMemo(() => {
    return refunds
      .filter((r) => r.status === 'pending')
      .reduce((sum, r) => sum + r.refundAmount, 0);
  }, []);

  // ==================================================
  // 要対応セクション
  // ==================================================

  /** 入金期日超過: dueDate <= TODAY && status=sent/issued */
  const overdueInvoices = useMemo(() => {
    return invoices.filter(
      (inv) =>
        (inv.status === 'sent' || inv.status === 'issued') &&
        inv.dueDate <= TODAY,
    );
  }, []);

  /** 未処理返戻金 */
  const pendingRefunds = useMemo(() => {
    return refunds.filter((r) => r.status === 'pending');
  }, []);

  // ==================================================
  // 最近の成約一覧（上位5件）
  // ==================================================

  const recentPlacements = useMemo(() => {
    return [...placements].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  }, []);

  const columns: ColumnsType<Placement> = [
    {
      title: '候補者名',
      dataIndex: 'candidateName',
      key: 'candidateName',
    },
    {
      title: '取引先企業',
      key: 'clientName',
      render: (_, record) => getClient(record.clientId)?.companyName ?? '-',
    },
    {
      title: 'ステータス',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <PlacementStatusTag status={status} />,
    },
    {
      title: '手数料額',
      dataIndex: 'feeAmount',
      key: 'feeAmount',
      align: 'right',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: '作成日',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDate(date),
    },
  ];

  // ==================================================
  // レンダリング
  // ==================================================

  return (
    <div style={{ padding: 24 }}>
      <Title level={3} style={{ marginBottom: 24 }}>
        ダッシュボード
      </Title>

      {/* ========== KPI カード ========== */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="今月の成約見込み額"
              value={monthlyClosedAmount}
              precision={0}
              prefix={<DollarOutlined />}
              suffix="円"
              formatter={(value) =>
                Number(value).toLocaleString('ja-JP')
              }
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="未入金請求額"
              value={unpaidInvoiceAmount}
              precision={0}
              prefix={<FileTextOutlined />}
              suffix="円"
              formatter={(value) =>
                Number(value).toLocaleString('ja-JP')
              }
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            onClick={() => navigate('/approvals')}
            style={{ cursor: 'pointer' }}
          >
            <Statistic
              title="承認待ち件数"
              value={pendingApprovalPlacements.length}
              prefix={<CheckCircleOutlined />}
              suffix="件"
              valueStyle={{ color: pendingApprovalPlacements.length > 0 ? '#fa8c16' : undefined }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="今月の返戻金"
              value={pendingRefundAmount}
              precision={0}
              prefix={<WarningOutlined />}
              suffix="円"
              valueStyle={{ color: pendingRefundAmount > 0 ? '#cf1322' : undefined }}
              formatter={(value) =>
                Number(value).toLocaleString('ja-JP')
              }
            />
          </Card>
        </Col>
      </Row>

      {/* ========== 要対応セクション ========== */}
      <Title level={4} style={{ marginBottom: 16 }}>
        要対応
      </Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        {/* 承認待ち案件 */}
        <Col xs={24} md={8}>
          <Card
            title="承認待ち案件"
            extra={
              <Link onClick={() => navigate('/approvals')}>
                すべて見る &rarr;
              </Link>
            }
          >
            <List
              dataSource={pendingApprovalPlacements}
              locale={{ emptyText: '承認待ちの案件はありません' }}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.candidateName}
                    description={
                      <>
                        <Text type="secondary">
                          {getClient(item.clientId)?.companyName}
                        </Text>
                        <br />
                        <Text strong>{formatCurrency(item.feeAmount)}</Text>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 入金期日超過 */}
        <Col xs={24} md={8}>
          <Card
            title="入金期日超過"
            extra={
              <Link onClick={() => navigate('/payment-confirmation')}>
                すべて見る &rarr;
              </Link>
            }
          >
            <List
              dataSource={overdueInvoices}
              locale={{ emptyText: '期日超過の請求はありません' }}
              renderItem={(item) => {
                const client = getClient(item.clientId);
                return (
                  <List.Item>
                    <List.Item.Meta
                      title={item.invoiceNumber}
                      description={
                        <>
                          <Text type="secondary">
                            {client?.companyName}
                          </Text>
                          <br />
                          <Text strong>{formatCurrency(item.totalAmount)}</Text>
                          <br />
                          <Text type="danger" style={{ fontSize: 12 }}>
                            期日: {formatDate(item.dueDate)}
                          </Text>
                        </>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          </Card>
        </Col>

        {/* 未処理返戻金 */}
        <Col xs={24} md={8}>
          <Card
            title="未処理返戻金"
            extra={
              <Link onClick={() => navigate('/refunds')}>
                すべて見る &rarr;
              </Link>
            }
          >
            <List
              dataSource={pendingRefunds}
              locale={{ emptyText: '未処理の返戻金はありません' }}
              renderItem={(item) => {
                const placement = placements.find(
                  (p) => p.id === item.placementId,
                );
                return (
                  <List.Item>
                    <List.Item.Meta
                      title={placement?.candidateName ?? '-'}
                      description={
                        <Text strong style={{ color: '#cf1322' }}>
                          {formatCurrency(item.refundAmount)}
                        </Text>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* ========== 最近の成約一覧 ========== */}
      <Title level={4} style={{ marginBottom: 16 }}>
        最近の成約一覧
      </Title>
      <Card>
        <Table<Placement>
          columns={columns}
          dataSource={recentPlacements}
          rowKey="id"
          pagination={false}
          onRow={(record) => ({
            onClick: () => navigate(`/placements/${record.id}`),
            style: { cursor: 'pointer' },
          })}
        />
      </Card>
    </div>
  );
}
