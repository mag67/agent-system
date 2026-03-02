import { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Breadcrumb,
  Tabs,
  Descriptions,
  Table,
  Button,
  Result,
  Space,
} from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  clients,
  getContractsByClient,
  getPlacementsByClient,
  formatCurrency,
  formatDate,
  formatPercent,
} from '../data';
import type { Contract, Placement } from '../types';
import { deliveryMethodLabels, renewalTypeLabels } from '../types';
import { ContractStatusTag, PlacementStatusTag } from '../components/StatusBadge';

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const client = useMemo(() => clients.find(c => c.id === id), [id]);
  const clientContracts = useMemo(
    () => (id ? getContractsByClient(id) : []),
    [id]
  );
  const clientPlacements = useMemo(
    () => (id ? getPlacementsByClient(id) : []),
    [id]
  );

  if (!client) {
    return (
      <Result
        status="404"
        title="取引先企業が見つかりません"
        subTitle={`ID: ${id} に該当する企業は存在しません。`}
        extra={
          <Button type="primary" onClick={() => navigate('/clients')}>
            一覧に戻る
          </Button>
        }
      />
    );
  }

  const contractColumns: ColumnsType<Contract> = [
    {
      title: '契約ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '手数料率',
      dataIndex: 'defaultFeeRate',
      key: 'defaultFeeRate',
      render: (rate: number) => formatPercent(rate),
    },
    {
      title: '保証期間',
      dataIndex: 'guaranteePeriodDays',
      key: 'guaranteePeriodDays',
      render: (days: number) => `${days}日`,
    },
    {
      title: '支払条件',
      dataIndex: 'paymentTerms',
      key: 'paymentTerms',
    },
    {
      title: '契約期間',
      key: 'period',
      render: (_, record) =>
        `${formatDate(record.startDate)} 〜 ${formatDate(record.endDate)}`,
    },
    {
      title: 'ステータス',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <ContractStatusTag status={status} />,
    },
  ];

  const placementColumns: ColumnsType<Placement> = [
    {
      title: '候補者名',
      dataIndex: 'candidateName',
      key: 'candidateName',
    },
    {
      title: '手数料額',
      dataIndex: 'feeAmount',
      key: 'feeAmount',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'ステータス',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <PlacementStatusTag status={status} />,
    },
    {
      title: '成約日',
      dataIndex: 'closedAt',
      key: 'closedAt',
      render: (date: string | undefined) => (date ? formatDate(date) : '-'),
    },
  ];

  const tabItems = [
    {
      key: 'info',
      label: '基本情報',
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <Button icon={<EditOutlined />}>編集</Button>
          </div>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="企業名">
              {client.companyName}
            </Descriptions.Item>
            <Descriptions.Item label="業種">
              {client.industry}
            </Descriptions.Item>
            <Descriptions.Item label="担当者">
              {client.contactPerson}
            </Descriptions.Item>
            <Descriptions.Item label="連絡先">
              <div>{client.contactEmail}</div>
              <div>{client.contactPhone}</div>
            </Descriptions.Item>
            <Descriptions.Item label="請求書送付方法">
              {deliveryMethodLabels[client.invoiceDeliveryMethod]}
            </Descriptions.Item>
            <Descriptions.Item label="送付先住所 / メール">
              {client.invoiceAddress && <div>{client.invoiceAddress}</div>}
              {client.invoiceEmail && <div>{client.invoiceEmail}</div>}
            </Descriptions.Item>
          </Descriptions>
        </div>
      ),
    },
    {
      key: 'contracts',
      label: `契約一覧 (${clientContracts.length})`,
      children: (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Button type="primary" icon={<PlusOutlined />}>
              新規契約登録
            </Button>
          </div>
          <Table
            columns={contractColumns}
            dataSource={clientContracts}
            rowKey="id"
            onRow={(record) => ({
              onClick: () => navigate(`/contracts/${record.id}`),
              style: { cursor: 'pointer' },
            })}
            pagination={false}
          />
        </div>
      ),
    },
    {
      key: 'placements',
      label: `成約一覧 (${clientPlacements.length})`,
      children: (
        <Table
          columns={placementColumns}
          dataSource={clientPlacements}
          rowKey="id"
          onRow={(record) => ({
            onClick: () => navigate(`/placements/${record.id}`),
            style: { cursor: 'pointer' },
          })}
          pagination={false}
        />
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <Link to="/clients">取引先企業</Link> },
          { title: client.companyName },
        ]}
      />

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Tabs items={tabItems} />
      </Space>
    </div>
  );
}
