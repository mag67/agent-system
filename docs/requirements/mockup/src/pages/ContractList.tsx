import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Input, Space, Segmented } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { contracts, getClient, formatPercent, formatDate } from '../data';
import type { Contract, ContractStatus } from '../types';
import { renewalTypeLabels } from '../types';
import { ContractStatusTag } from '../components/StatusBadge';

type FilterOption = 'all' | ContractStatus;

const filterOptions: { label: string; value: FilterOption }[] = [
  { label: 'すべて', value: 'all' },
  { label: '有効', value: 'active' },
  { label: '交渉中', value: 'negotiating' },
  { label: '期限切れ', value: 'expired' },
  { label: '解約', value: 'terminated' },
];

export default function ContractList() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<FilterOption>('all');
  const [search, setSearch] = useState('');

  const filteredContracts = useMemo(() => {
    let result = contracts;

    if (statusFilter !== 'all') {
      result = result.filter(c => c.status === statusFilter);
    }

    if (search) {
      result = result.filter(c => {
        const client = getClient(c.clientId);
        const clientName = client?.companyName ?? '';
        return (
          c.id.toLowerCase().includes(search.toLowerCase()) ||
          clientName.toLowerCase().includes(search.toLowerCase())
        );
      });
    }

    return result;
  }, [statusFilter, search]);

  const columns: ColumnsType<Contract> = [
    {
      title: '契約ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '取引先企業名',
      key: 'clientName',
      render: (_, record) => {
        const client = getClient(record.clientId);
        return client?.companyName ?? '-';
      },
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
      title: '支払いサイト',
      dataIndex: 'paymentSiteDays',
      key: 'paymentSiteDays',
      render: (days: number) => `${days}日`,
    },
    {
      title: '契約期間',
      key: 'period',
      render: (_, record) =>
        `${formatDate(record.startDate)} 〜 ${formatDate(record.endDate)}`,
    },
    {
      title: '更新方法',
      dataIndex: 'renewalType',
      key: 'renewalType',
      render: (type) => renewalTypeLabels[type as keyof typeof renewalTypeLabels],
    },
    {
      title: 'ステータス',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <ContractStatusTag status={status} />,
    },
  ];

  return (
    <div>
      <Space
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Segmented
          options={filterOptions}
          value={statusFilter}
          onChange={(val) => setStatusFilter(val as FilterOption)}
        />
        <Input
          placeholder="契約ID・企業名で検索..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 280 }}
          allowClear
        />
      </Space>

      <Table
        columns={columns}
        dataSource={filteredContracts}
        rowKey="id"
        onRow={(record) => ({
          onClick: () => navigate(`/contracts/${record.id}`),
          style: { cursor: 'pointer' },
        })}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
