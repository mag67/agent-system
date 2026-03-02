import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Input, Button, Space, Empty } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { clients, getContractsByClient, formatDate } from '../data';
import type { Client } from '../types';
import { deliveryMethodLabels } from '../types';

export default function ClientList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filteredClients = useMemo(() => {
    if (!search) return clients;
    return clients.filter(c =>
      c.companyName.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const columns: ColumnsType<Client> = [
    {
      title: '企業名',
      dataIndex: 'companyName',
      key: 'companyName',
    },
    {
      title: '業種',
      dataIndex: 'industry',
      key: 'industry',
    },
    {
      title: '担当者',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
    },
    {
      title: '有効契約数',
      key: 'activeContracts',
      align: 'center',
      render: (_, record) => {
        const activeCount = getContractsByClient(record.id).filter(
          c => c.status === 'active'
        ).length;
        return activeCount;
      },
    },
    {
      title: '請求書送付方法',
      dataIndex: 'invoiceDeliveryMethod',
      key: 'invoiceDeliveryMethod',
      render: (method) => deliveryMethodLabels[method as keyof typeof deliveryMethodLabels],
    },
    {
      title: '登録日',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDate(date),
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
        <Input
          placeholder="企業名で検索..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 320 }}
          allowClear
        />
        <Button type="primary" icon={<PlusOutlined />}>
          新規登録
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={filteredClients}
        rowKey="id"
        onRow={(record) => ({
          onClick: () => navigate(`/clients/${record.id}`),
          style: { cursor: 'pointer' },
        })}
        locale={{
          emptyText: (
            <Empty description="最初の取引先企業を登録しましょう" />
          ),
        }}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
