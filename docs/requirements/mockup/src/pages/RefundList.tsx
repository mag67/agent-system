import { useState, useMemo } from 'react';
import {
  Table,
  Segmented,
  Empty,
  Button,
  Drawer,
  Descriptions,
  Modal,
  Form,
  Select,
  DatePicker,
  Popconfirm,
  App,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  refunds,
  placements,
  invoices,
  getClient,
  getContract,
  formatCurrency,
  formatDate,
  formatPercent,
} from '../data';
import type { Refund, RefundStatus, RefundRule } from '../types';
import { RefundStatusTag } from '../components/StatusBadge';

type RefundFilter = 'all' | RefundStatus;

const filterOptions: { label: string; value: RefundFilter }[] = [
  { label: 'すべて', value: 'all' },
  { label: '未処理', value: 'pending' },
  { label: '処理済み', value: 'processed' },
];

function getPlacement(placementId: string) {
  return placements.find(p => p.id === placementId);
}

function getInvoice(invoiceId: string) {
  return invoices.find(i => i.id === invoiceId);
}

export default function RefundList() {
  const { message } = App.useApp();
  const [filter, setFilter] = useState<RefundFilter>('all');

  // Drawer state
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);

  // Modal state (新規返戻金登録)
  const [modalVisible, setModalVisible] = useState(false);
  const [modalPlacementId, setModalPlacementId] = useState<string | undefined>(
    undefined,
  );
  const [modalExitDate, setModalExitDate] = useState<dayjs.Dayjs | null>(null);

  const filteredRefunds = useMemo(() => {
    if (filter === 'all') return refunds;
    return refunds.filter(r => r.status === filter);
  }, [filter]);

  // Drawer用データ
  const drawerPlacement = useMemo(
    () => (selectedRefund ? getPlacement(selectedRefund.placementId) : undefined),
    [selectedRefund],
  );
  const drawerClient = useMemo(
    () =>
      drawerPlacement ? getClient(drawerPlacement.clientId) : undefined,
    [drawerPlacement],
  );
  const drawerContract = useMemo(
    () =>
      drawerPlacement ? getContract(drawerPlacement.contractId) : undefined,
    [drawerPlacement],
  );
  const drawerOriginalInvoice = useMemo(
    () =>
      selectedRefund
        ? getInvoice(selectedRefund.originalInvoiceId)
        : undefined,
    [selectedRefund],
  );

  // Modal用データ
  const eligiblePlacements = useMemo(
    () => placements.filter(p => p.status === 'started'),
    [],
  );
  const modalPlacement = useMemo(
    () =>
      modalPlacementId
        ? eligiblePlacements.find(p => p.id === modalPlacementId)
        : undefined,
    [modalPlacementId, eligiblePlacements],
  );
  const modalContract = useMemo(
    () =>
      modalPlacement ? getContract(modalPlacement.contractId) : undefined,
    [modalPlacement],
  );

  // Modal: 在籍日数・返金率・返金額の自動計算
  const modalDaysEmployed = useMemo(() => {
    if (!modalPlacement?.actualStartDate || !modalExitDate) return 0;
    const start = dayjs(modalPlacement.actualStartDate);
    return modalExitDate.diff(start, 'day');
  }, [modalPlacement, modalExitDate]);

  const modalMatchedRule = useMemo<RefundRule | undefined>(() => {
    if (!modalContract || modalDaysEmployed <= 0) return undefined;
    return modalContract.refundRules.find(
      rule =>
        modalDaysEmployed >= rule.periodFromDays &&
        modalDaysEmployed <= rule.periodToDays,
    );
  }, [modalContract, modalDaysEmployed]);

  const modalRefundRate = modalMatchedRule?.refundRate ?? 0;
  const modalRefundAmount = modalPlacement
    ? Math.floor(modalPlacement.feeAmount * modalRefundRate)
    : 0;

  // テーブル列
  const columns: ColumnsType<Refund> = [
    {
      title: '返戻金ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '候補者名',
      key: 'candidateName',
      render: (_, record) =>
        getPlacement(record.placementId)?.candidateName ?? '-',
    },
    {
      title: '取引先企業名',
      key: 'clientName',
      render: (_, record) => {
        const p = getPlacement(record.placementId);
        return p ? (getClient(p.clientId)?.companyName ?? '-') : '-';
      },
    },
    {
      title: '退職日',
      dataIndex: 'exitDate',
      key: 'exitDate',
      width: 120,
      render: (date: string) => formatDate(date),
    },
    {
      title: '在籍日数',
      dataIndex: 'daysEmployed',
      key: 'daysEmployed',
      width: 100,
      align: 'right',
      render: (days: number) => `${days}日`,
    },
    {
      title: '返金率',
      dataIndex: 'refundRate',
      key: 'refundRate',
      width: 80,
      align: 'right',
      render: (rate: number) => formatPercent(rate),
    },
    {
      title: '返金額',
      dataIndex: 'refundAmount',
      key: 'refundAmount',
      width: 140,
      align: 'right',
      render: (amount: number) => (
        <span style={{ color: '#ff4d4f' }}>
          {formatCurrency(amount)}
        </span>
      ),
    },
    {
      title: 'ステータス',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: RefundStatus) => <RefundStatusTag status={status} />,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      align: 'center',
      render: (_, record) =>
        record.status === 'pending' ? (
          <Button
            type="primary"
            size="small"
            onClick={e => {
              e.stopPropagation();
              setSelectedRefund(record);
              setDrawerVisible(true);
            }}
          >
            処理する
          </Button>
        ) : null,
    },
  ];

  // 返戻金ルールテーブル
  const refundRuleColumns: ColumnsType<RefundRule> = [
    {
      title: '期間（開始日）',
      dataIndex: 'periodFromDays',
      key: 'periodFromDays',
      render: (d: number) => `${d}日`,
    },
    {
      title: '期間（終了日）',
      dataIndex: 'periodToDays',
      key: 'periodToDays',
      render: (d: number) => `${d}日`,
    },
    {
      title: '返金率',
      dataIndex: 'refundRate',
      key: 'refundRate',
      render: (rate: number) => formatPercent(rate),
    },
  ];

  const handleProcessRefund = () => {
    message.success('マイナス請求書を発行し、返戻金を処理しました（モック）');
    setDrawerVisible(false);
    setSelectedRefund(null);
  };

  const handleCreateRefund = () => {
    message.success('返戻金を登録しました（モック）');
    setModalVisible(false);
    setModalPlacementId(undefined);
    setModalExitDate(null);
  };

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
        <h2 style={{ margin: 0 }}>返戻金処理</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          新規返戻金登録
        </Button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Segmented
          options={filterOptions}
          value={filter}
          onChange={value => setFilter(value as RefundFilter)}
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredRefunds}
        rowKey="id"
        locale={{
          emptyText: <Empty description="該当する返戻金はありません" />,
        }}
        pagination={{ pageSize: 20 }}
      />

      {/* 返戻金処理Drawer */}
      <Drawer
        title="返戻金処理"
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={480}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Popconfirm
              title="マイナス請求書を発行して処理しますか？"
              description={
                selectedRefund
                  ? `返金額 ${formatCurrency(selectedRefund.refundAmount)} のマイナス請求書を発行します`
                  : undefined
              }
              onConfirm={handleProcessRefund}
              okText="発行して処理"
              cancelText="キャンセル"
            >
              <Button type="primary">マイナス請求書を発行して処理</Button>
            </Popconfirm>
          </div>
        }
      >
        {selectedRefund && (
          <>
            {/* 案件情報 */}
            <h4 style={{ marginBottom: 12 }}>案件情報</h4>
            <Descriptions
              bordered
              column={1}
              size="small"
              style={{ marginBottom: 24 }}
            >
              <Descriptions.Item label="候補者名">
                {drawerPlacement?.candidateName ?? '-'}
              </Descriptions.Item>
              <Descriptions.Item label="取引先企業名">
                {drawerClient?.companyName ?? '-'}
              </Descriptions.Item>
              <Descriptions.Item label="元の手数料額">
                {drawerOriginalInvoice
                  ? formatCurrency(drawerOriginalInvoice.amount)
                  : drawerPlacement
                    ? formatCurrency(drawerPlacement.feeAmount)
                    : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="入社日">
                {drawerPlacement?.actualStartDate
                  ? formatDate(drawerPlacement.actualStartDate)
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="退職日">
                {formatDate(selectedRefund.exitDate)}
              </Descriptions.Item>
              <Descriptions.Item label="在籍日数">
                {selectedRefund.daysEmployed}日
              </Descriptions.Item>
            </Descriptions>

            {/* 返戻金ルール参照 */}
            <h4 style={{ marginBottom: 12 }}>返戻金ルール（契約条件）</h4>
            {drawerContract && (
              <Table
                size="small"
                pagination={false}
                bordered
                dataSource={drawerContract.refundRules}
                columns={refundRuleColumns}
                rowKey={(rule) => `${rule.periodFromDays}-${rule.periodToDays}`}
                rowClassName={(rule) =>
                  selectedRefund.daysEmployed >= rule.periodFromDays &&
                  selectedRefund.daysEmployed <= rule.periodToDays
                    ? 'ant-table-row-selected'
                    : ''
                }
                style={{ marginBottom: 24 }}
              />
            )}

            {/* 返金額 */}
            <h4 style={{ marginBottom: 12 }}>返金額</h4>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="適用返金率">
                {formatPercent(selectedRefund.refundRate)}
              </Descriptions.Item>
              <Descriptions.Item label="返金額">
                <span
                  style={{
                    fontWeight: 'bold',
                    fontSize: 16,
                    color: '#ff4d4f',
                  }}
                >
                  {formatCurrency(selectedRefund.refundAmount)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="計算式">
                {drawerPlacement
                  ? `${formatCurrency(drawerPlacement.feeAmount)} x ${formatPercent(selectedRefund.refundRate)}`
                  : '-'}
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Drawer>

      {/* 新規返戻金登録Modal */}
      <Modal
        title="新規返戻金登録"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setModalPlacementId(undefined);
          setModalExitDate(null);
        }}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button
              style={{ marginRight: 8 }}
              onClick={() => {
                setModalVisible(false);
                setModalPlacementId(undefined);
                setModalExitDate(null);
              }}
            >
              キャンセル
            </Button>
            <Popconfirm
              title="返戻金を登録しますか？"
              description={
                modalPlacement
                  ? `${modalPlacement.candidateName} の返戻金 ${formatCurrency(modalRefundAmount)} を登録します`
                  : undefined
              }
              onConfirm={handleCreateRefund}
              okText="登録する"
              cancelText="キャンセル"
              disabled={!modalPlacement || !modalExitDate || modalDaysEmployed <= 0}
            >
              <Button
                type="primary"
                disabled={
                  !modalPlacement || !modalExitDate || modalDaysEmployed <= 0
                }
              >
                返戻金を登録
              </Button>
            </Popconfirm>
          </div>
        }
        width={560}
      >
        <Form layout="vertical">
          <Form.Item label="対象案件（入社済み）" required>
            <Select
              placeholder="企業名 - 候補者名 で選択"
              options={eligiblePlacements.map(p => {
                const c = getClient(p.clientId);
                return {
                  label: `${c?.companyName ?? '-'} - ${p.candidateName}`,
                  value: p.id,
                };
              })}
              value={modalPlacementId}
              onChange={value => {
                setModalPlacementId(value);
                setModalExitDate(null);
              }}
              showSearch
              optionFilterProp="label"
              allowClear
            />
          </Form.Item>

          {modalPlacement && (
            <>
              <Form.Item label="退職日" required>
                <DatePicker
                  value={modalExitDate}
                  onChange={date => setModalExitDate(date)}
                  style={{ width: '100%' }}
                  disabledDate={current =>
                    current &&
                    modalPlacement?.actualStartDate
                      ? current.isBefore(
                          dayjs(modalPlacement.actualStartDate),
                          'day',
                        )
                      : false
                  }
                />
              </Form.Item>

              {modalExitDate && modalDaysEmployed > 0 && (
                <>
                  <Descriptions
                    bordered
                    column={1}
                    size="small"
                    style={{ marginBottom: 16 }}
                  >
                    <Descriptions.Item label="入社日">
                      {modalPlacement.actualStartDate
                        ? formatDate(modalPlacement.actualStartDate)
                        : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="退職日">
                      {formatDate(modalExitDate.format('YYYY-MM-DD'))}
                    </Descriptions.Item>
                    <Descriptions.Item label="在籍日数">
                      {modalDaysEmployed}日
                    </Descriptions.Item>
                  </Descriptions>

                  {/* 返戻金ルール */}
                  {modalContract && (
                    <>
                      <h4 style={{ marginBottom: 8 }}>返戻金ルール</h4>
                      <Table
                        size="small"
                        pagination={false}
                        bordered
                        dataSource={modalContract.refundRules}
                        columns={refundRuleColumns}
                        rowKey={(rule) =>
                          `${rule.periodFromDays}-${rule.periodToDays}`
                        }
                        rowClassName={(rule) =>
                          modalDaysEmployed >= rule.periodFromDays &&
                          modalDaysEmployed <= rule.periodToDays
                            ? 'ant-table-row-selected'
                            : ''
                        }
                        style={{ marginBottom: 16 }}
                      />
                    </>
                  )}

                  <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="適用返金率">
                      {modalMatchedRule
                        ? formatPercent(modalRefundRate)
                        : '該当ルールなし（保証期間外）'}
                    </Descriptions.Item>
                    <Descriptions.Item label="元手数料額">
                      {formatCurrency(modalPlacement.feeAmount)}
                    </Descriptions.Item>
                    <Descriptions.Item label="返金額">
                      <span
                        style={{
                          fontWeight: 'bold',
                          fontSize: 16,
                          color: modalRefundAmount > 0 ? '#ff4d4f' : undefined,
                        }}
                      >
                        {formatCurrency(modalRefundAmount)}
                      </span>
                    </Descriptions.Item>
                  </Descriptions>
                </>
              )}
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
}
