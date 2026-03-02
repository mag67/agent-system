import { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Descriptions,
  Tabs,
  Table,
  Timeline,
  Button,
  Space,
  Breadcrumb,
  Card,
  Typography,
  Result,
  message,
} from 'antd';
import {
  CheckCircleOutlined,
  RollbackOutlined,
  FileTextOutlined,
  UserSwitchOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  placements,
  getClient,
  getContract,
  getInvoicesByPlacement,
  getRefundByPlacement,
  formatCurrency,
  formatDate,
  formatPercent,
} from '../data';
import type { Invoice, PlacementStatus } from '../types';
import { invoiceTypeLabels } from '../types';
import { PlacementStatusTag, InvoiceStatusTag, RefundStatusTag } from '../components/StatusBadge';

const { Title } = Typography;

// ステータス履歴のダミーデータ生成
function getStatusHistory(placementId: string) {
  const p = placements.find(pl => pl.id === placementId);
  if (!p) return [];

  const history: {
    status: string;
    date: string;
    description: string;
    color: string;
    icon: React.ReactNode;
  }[] = [];

  history.push({
    status: '選考中',
    date: p.createdAt,
    description: '成約案件が作成されました',
    color: 'blue',
    icon: <ClockCircleOutlined />,
  });

  if (['offered', 'pending_approval', 'closed', 'started', 'cancelled', 'declined'].includes(p.status)) {
    history.push({
      status: '内定',
      date: p.createdAt,
      description: '候補者に内定が出されました',
      color: 'cyan',
      icon: <UserSwitchOutlined />,
    });
  }

  if (['pending_approval', 'closed', 'started', 'cancelled'].includes(p.status)) {
    history.push({
      status: '承認待ち',
      date: p.createdAt,
      description: '成約申請が提出されました',
      color: 'orange',
      icon: <ExclamationCircleOutlined />,
    });
  }

  if (['closed', 'started', 'cancelled'].includes(p.status)) {
    history.push({
      status: '成約確定',
      date: p.approvedAt ?? p.closedAt ?? '',
      description: `${p.approvedBy ?? '承認者'}により承認されました`,
      color: 'geekblue',
      icon: <CheckCircleOutlined />,
    });
  }

  if (p.status === 'started') {
    history.push({
      status: '入社済み',
      date: p.actualStartDate ?? p.expectedStartDate ?? '',
      description: '候補者が入社しました',
      color: 'green',
      icon: <CheckCircleOutlined />,
    });
  }

  if (p.status === 'cancelled') {
    history.push({
      status: '入社前キャンセル',
      date: p.cancelledAt ?? '',
      description: p.cancelReason ?? '入社前にキャンセルされました',
      color: 'red',
      icon: <CloseCircleOutlined />,
    });
  }

  if (p.status === 'declined') {
    history.push({
      status: '内定辞退',
      date: p.cancelledAt ?? '',
      description: p.cancelReason ?? '候補者が内定を辞退しました',
      color: 'volcano',
      icon: <CloseCircleOutlined />,
    });
  }

  return history;
}

export default function PlacementDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const placement = useMemo(() => placements.find(p => p.id === id), [id]);
  const client = useMemo(() => (placement ? getClient(placement.clientId) : undefined), [placement]);
  const contract = useMemo(() => (placement ? getContract(placement.contractId) : undefined), [placement]);
  const relatedInvoices = useMemo(() => (placement ? getInvoicesByPlacement(placement.id) : []), [placement]);
  const refund = useMemo(() => (placement ? getRefundByPlacement(placement.id) : undefined), [placement]);
  const statusHistory = useMemo(() => (placement ? getStatusHistory(placement.id) : []), [placement]);

  if (!placement) {
    return <Result status="404" title="成約案件が見つかりません" subTitle={`ID: ${id} に該当する案件はありません`} />;
  }

  // 操作ボタンの描画
  const renderActionButtons = (status: PlacementStatus) => {
    switch (status) {
      case 'pending_approval':
        return (
          <Space>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => message.success('承認しました（モック）')}
            >
              承認する
            </Button>
            <Button
              danger
              icon={<RollbackOutlined />}
              onClick={() => message.warning('差し戻しました（モック）')}
            >
              差し戻す
            </Button>
          </Space>
        );
      case 'closed':
        return (
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => message.success('入社確認しました（モック）')}
          >
            入社確認
          </Button>
        );
      case 'started':
        return (
          <Button
            type="primary"
            icon={<FileTextOutlined />}
            onClick={() => navigate(`/invoices/new?placementId=${placement.id}`)}
          >
            請求書発行へ
          </Button>
        );
      default:
        return null;
    }
  };

  // 請求・入金タブの請求書テーブル列
  const invoiceColumns: ColumnsType<Invoice> = [
    {
      title: '請求書番号',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
    },
    {
      title: '種別',
      dataIndex: 'invoiceType',
      key: 'invoiceType',
      render: (type: Invoice['invoiceType']) => invoiceTypeLabels[type],
    },
    {
      title: '金額',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: '発行日',
      dataIndex: 'issuedAt',
      key: 'issuedAt',
      render: (date: string) => formatDate(date),
    },
    {
      title: '支払期日',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'ステータス',
      dataIndex: 'status',
      key: 'status',
      render: (status: Invoice['status']) => <InvoiceStatusTag status={status} />,
    },
  ];

  const tabItems = [
    {
      key: 'basic',
      label: '基本情報',
      children: (
        <Descriptions bordered column={2} size="middle">
          <Descriptions.Item label="取引先企業名" span={1}>
            {client ? (
              <Link to={`/clients/${client.id}`}>{client.companyName}</Link>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="基本契約" span={1}>
            {contract ? (
              <Link to={`/contracts/${contract.id}`}>{contract.id}</Link>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="候補者名" span={1}>
            {placement.candidateName}
          </Descriptions.Item>
          <Descriptions.Item label="理論年収" span={1}>
            {formatCurrency(placement.theoreticalAnnualSalary)}
          </Descriptions.Item>
          <Descriptions.Item label="適用手数料率" span={1}>
            {formatPercent(placement.feeRate)}
          </Descriptions.Item>
          <Descriptions.Item label="手数料額" span={1}>
            {formatCurrency(placement.feeAmount)}
          </Descriptions.Item>
          <Descriptions.Item label="入社予定日" span={1}>
            {placement.expectedStartDate ? formatDate(placement.expectedStartDate) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="実際の入社日" span={1}>
            {placement.actualStartDate ? formatDate(placement.actualStartDate) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="担当RA" span={1}>
            {placement.responsibleRA}
          </Descriptions.Item>
          <Descriptions.Item label="担当CA" span={1}>
            {placement.responsibleCA ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item label="承認者" span={1}>
            {placement.approvedBy ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item label="承認日" span={1}>
            {placement.approvedAt ? formatDate(placement.approvedAt) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="成約日" span={1}>
            {placement.closedAt ? formatDate(placement.closedAt) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="エビデンスファイル" span={1}>
            {placement.evidenceFiles && placement.evidenceFiles.length > 0 ? (
              <Space direction="vertical" size={4}>
                {placement.evidenceFiles.map(file => (
                  <a key={file} href="#" onClick={e => e.preventDefault()}>
                    <FileTextOutlined style={{ marginRight: 4 }} />
                    {file}
                  </a>
                ))}
              </Space>
            ) : (
              '-'
            )}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: 'billing',
      label: '請求・入金',
      children: (
        <Space direction="vertical" size="large" style={{ display: 'flex' }}>
          <div>
            <Title level={5} style={{ marginBottom: 12 }}>
              請求書一覧
            </Title>
            <Table
              columns={invoiceColumns}
              dataSource={relatedInvoices}
              rowKey="id"
              pagination={false}
              size="small"
              locale={{ emptyText: '関連する請求書はありません' }}
            />
          </div>

          {refund && (
            <Card title="返戻金情報" size="small">
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="返戻金ID">{refund.id}</Descriptions.Item>
                <Descriptions.Item label="ステータス">
                  <RefundStatusTag status={refund.status} />
                </Descriptions.Item>
                <Descriptions.Item label="退職理由" span={2}>
                  {refund.reason}
                </Descriptions.Item>
                <Descriptions.Item label="退職日">
                  {formatDate(refund.exitDate)}
                </Descriptions.Item>
                <Descriptions.Item label="在籍日数">
                  {refund.daysEmployed}日
                </Descriptions.Item>
                <Descriptions.Item label="返戻率">
                  {formatPercent(refund.refundRate)}
                </Descriptions.Item>
                <Descriptions.Item label="返戻額">
                  {formatCurrency(refund.refundAmount)}
                </Descriptions.Item>
                {refund.processedAt && (
                  <Descriptions.Item label="処理日" span={2}>
                    {formatDate(refund.processedAt)}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          )}
        </Space>
      ),
    },
    {
      key: 'history',
      label: 'ステータス履歴',
      children: (
        <Timeline
          items={statusHistory.map(item => ({
            color: item.color,
            dot: item.icon,
            children: (
              <div>
                <strong>{item.status}</strong>
                <br />
                <span style={{ color: '#999', fontSize: 12 }}>
                  {item.date ? formatDate(item.date) : ''}
                </span>
                <br />
                {item.description}
              </div>
            ),
          }))}
        />
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <Link to="/placements">成約一覧</Link> },
          { title: placement.candidateName },
        ]}
      />

      <Card style={{ marginBottom: 16 }}>
        <Space
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Space align="center" size="middle">
            <Title level={3} style={{ margin: 0 }}>
              {placement.candidateName}
            </Title>
            <PlacementStatusTag status={placement.status} />
          </Space>
          {renderActionButtons(placement.status)}
        </Space>
      </Card>

      <Card>
        <Tabs items={tabItems} defaultActiveKey="basic" />
      </Card>
    </div>
  );
}
