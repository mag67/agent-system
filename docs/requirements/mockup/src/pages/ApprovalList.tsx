import { useState, useMemo } from 'react';
import {
  Table,
  Badge,
  Typography,
  Drawer,
  Descriptions,
  Button,
  Space,
  Popconfirm,
  Modal,
  Input,
  Empty,
  message,
} from 'antd';
import { CheckCircleOutlined, RollbackOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  placements,
  getClient,
  getContract,
  formatCurrency,
  formatDate,
  formatPercent,
} from '../data';
import type { Placement } from '../types';
import { PlacementStatusTag } from '../components/StatusBadge';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function ApprovalList() {
  const [selectedPlacement, setSelectedPlacement] = useState<Placement | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // 承認待ち案件のみ表示
  const pendingPlacements = useMemo(
    () => placements.filter(p => p.status === 'pending_approval'),
    [],
  );

  const handleRowClick = (record: Placement) => {
    setSelectedPlacement(record);
    setDrawerOpen(true);
  };

  const handleApprove = () => {
    message.success(`${selectedPlacement?.candidateName} の成約を承認しました（モック）`);
    setDrawerOpen(false);
    setSelectedPlacement(null);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      message.warning('差し戻し理由を入力してください');
      return;
    }
    message.warning(`${selectedPlacement?.candidateName} の成約申請を差し戻しました（モック）`);
    setRejectModalOpen(false);
    setRejectReason('');
    setDrawerOpen(false);
    setSelectedPlacement(null);
  };

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
      title: '理論年収',
      dataIndex: 'theoreticalAnnualSalary',
      key: 'theoreticalAnnualSalary',
      align: 'right',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: '手数料額',
      dataIndex: 'feeAmount',
      key: 'feeAmount',
      align: 'right',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: '担当RA',
      dataIndex: 'responsibleRA',
      key: 'responsibleRA',
    },
    {
      title: '申請日',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDate(date),
    },
  ];

  // Drawer 内の詳細情報
  const selectedClient = selectedPlacement ? getClient(selectedPlacement.clientId) : undefined;
  const selectedContract = selectedPlacement ? getContract(selectedPlacement.contractId) : undefined;

  return (
    <div>
      <Space align="center" style={{ marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>
          承認待ち案件
        </Title>
        <Badge
          count={pendingPlacements.length}
          style={{ backgroundColor: '#faad14' }}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={pendingPlacements}
        rowKey="id"
        onRow={record => ({
          onClick: () => handleRowClick(record),
          style: { cursor: 'pointer' },
        })}
        locale={{
          emptyText: (
            <Empty description="承認待ちの案件はありません" />
          ),
        }}
        pagination={false}
      />

      {/* 詳細 Drawer */}
      <Drawer
        title={
          selectedPlacement ? (
            <Space align="center" size="middle">
              <span>{selectedPlacement.candidateName}</span>
              <PlacementStatusTag status={selectedPlacement.status} />
            </Space>
          ) : null
        }
        placement="right"
        width={560}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedPlacement(null);
        }}
        footer={
          selectedPlacement ? (
            <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Popconfirm
                title="承認の確認"
                description="この成約申請を承認してもよろしいですか？"
                onConfirm={handleApprove}
                okText="承認する"
                cancelText="キャンセル"
                okType="primary"
              >
                <Button type="primary" icon={<CheckCircleOutlined />}>
                  承認
                </Button>
              </Popconfirm>
              <Button
                danger
                icon={<RollbackOutlined />}
                onClick={() => setRejectModalOpen(true)}
              >
                差し戻し
              </Button>
            </Space>
          ) : null
        }
      >
        {selectedPlacement && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="案件ID">
              {selectedPlacement.id}
            </Descriptions.Item>
            <Descriptions.Item label="取引先企業">
              {selectedClient ? (
                <Link to={`/clients/${selectedClient.id}`}>{selectedClient.companyName}</Link>
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="基本契約">
              {selectedContract ? (
                <Link to={`/contracts/${selectedContract.id}`}>{selectedContract.id}</Link>
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="候補者名">
              {selectedPlacement.candidateName}
            </Descriptions.Item>
            <Descriptions.Item label="理論年収">
              {formatCurrency(selectedPlacement.theoreticalAnnualSalary)}
            </Descriptions.Item>
            <Descriptions.Item label="適用手数料率">
              {formatPercent(selectedPlacement.feeRate)}
            </Descriptions.Item>
            <Descriptions.Item label="手数料額">
              <Text strong>{formatCurrency(selectedPlacement.feeAmount)}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="入社予定日">
              {selectedPlacement.expectedStartDate
                ? formatDate(selectedPlacement.expectedStartDate)
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="担当RA">
              {selectedPlacement.responsibleRA}
            </Descriptions.Item>
            <Descriptions.Item label="担当CA">
              {selectedPlacement.responsibleCA ?? '-'}
            </Descriptions.Item>
            <Descriptions.Item label="申請日">
              {formatDate(selectedPlacement.createdAt)}
            </Descriptions.Item>
            <Descriptions.Item label="エビデンスファイル">
              {selectedPlacement.evidenceFiles &&
              selectedPlacement.evidenceFiles.length > 0 ? (
                <Space direction="vertical" size={4}>
                  {selectedPlacement.evidenceFiles.map(file => (
                    <a key={file} href="#" onClick={e => e.preventDefault()}>
                      {file}
                    </a>
                  ))}
                </Space>
              ) : (
                '-'
              )}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>

      {/* 差し戻し理由入力 Modal */}
      <Modal
        title="差し戻し理由"
        open={rejectModalOpen}
        onCancel={() => {
          setRejectModalOpen(false);
          setRejectReason('');
        }}
        onOk={handleReject}
        okText="差し戻す"
        cancelText="キャンセル"
        okButtonProps={{ danger: true }}
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
          差し戻し理由を入力してください。申請者に通知されます。
        </Text>
        <TextArea
          rows={4}
          placeholder="差し戻し理由を入力..."
          value={rejectReason}
          onChange={e => setRejectReason(e.target.value)}
        />
      </Modal>
    </div>
  );
}
