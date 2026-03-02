import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Input, Button, Space, Segmented, Empty } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { placements, getClient, formatCurrency, formatDate, formatPercent } from '../data';
import type { Placement, PlacementStatus } from '../types';
import { placementStatusLabels } from '../types';
import { PlacementStatusTag } from '../components/StatusBadge';

type FilterValue = 'all' | PlacementStatus;

const filterOptions: { label: string; value: FilterValue }[] = [
  { label: 'すべて', value: 'all' },
  { label: '選考中', value: 'screening' },
  { label: '内定', value: 'offered' },
  { label: '承認待ち', value: 'pending_approval' },
  { label: '成約確定', value: 'closed' },
  { label: '入社済み', value: 'started' },
  { label: 'キャンセル', value: 'cancelled' },
  { label: '内定辞退', value: 'declined' },
  { label: '不成立', value: 'failed' },
];

export default function PlacementList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterValue>('all');

  const filteredPlacements = useMemo(() => {
    let result = placements;

    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }

    if (search) {
      result = result.filter(p =>
        p.candidateName.toLowerCase().includes(search.toLowerCase()),
      );
    }

    return result;
  }, [search, statusFilter]);

  const columns: ColumnsType<Placement> = [
    {
      title: '案件ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '候補者名',
      dataIndex: 'candidateName',
      key: 'candidateName',
    },
    {
      title: '取引先企業名',
      key: 'clientName',
      render: (_, record) => getClient(record.clientId)?.companyName ?? '-',
    },
    {
      title: '手数料率',
      dataIndex: 'feeRate',
      key: 'feeRate',
      align: 'right',
      render: (rate: number) => formatPercent(rate),
    },
    {
      title: '手数料額',
      dataIndex: 'feeAmount',
      key: 'feeAmount',
      align: 'right',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: '入社予定日',
      dataIndex: 'expectedStartDate',
      key: 'expectedStartDate',
      render: (date: string) => (date ? formatDate(date) : '-'),
    },
    {
      title: '担当RA',
      dataIndex: 'responsibleRA',
      key: 'responsibleRA',
    },
    {
      title: 'ステータス',
      dataIndex: 'status',
      key: 'status',
      render: (status: PlacementStatus) => <PlacementStatusTag status={status} />,
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
            placeholder="候補者名で検索..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 320 }}
            allowClear
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/placements/new')}
          >
            新規成約申請
          </Button>
        </Space>

        <Segmented
          options={filterOptions}
          value={statusFilter}
          onChange={value => setStatusFilter(value as FilterValue)}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={filteredPlacements}
        rowKey="id"
        onRow={record => ({
          onClick: () => navigate(`/placements/${record.id}`),
          style: { cursor: 'pointer' },
        })}
        locale={{
          emptyText: (
            <Empty description="該当する成約案件はありません" />
          ),
        }}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
