import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Breadcrumb,
  Form,
  Select,
  DatePicker,
  Button,
  Card,
  Descriptions,
  Space,
  Popconfirm,
  App,
} from 'antd';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  placements,
  getClient,
  getContract,
  formatCurrency,
  formatPercent,
} from '../data';
import type { Placement } from '../types';
import { deliveryMethodLabels } from '../types';

const TAX_RATE = 0.1;

export default function InvoiceForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { message } = App.useApp();

  const preselectedPlacementId = searchParams.get('placementId') ?? undefined;

  const [selectedPlacementId, setSelectedPlacementId] = useState<
    string | undefined
  >(preselectedPlacementId);
  const [issueDate, setIssueDate] = useState(dayjs());
  const [deliveryMethod, setDeliveryMethod] = useState<string>('email_pdf');
  const [dueDateManual, setDueDateManual] = useState<dayjs.Dayjs | null>(null);

  // status=started のPlacementだけ選択肢にする
  const eligiblePlacements = useMemo(
    () => placements.filter(p => p.status === 'started'),
    [],
  );

  const selectedPlacement = useMemo(
    () =>
      selectedPlacementId
        ? eligiblePlacements.find(p => p.id === selectedPlacementId)
        : undefined,
    [selectedPlacementId, eligiblePlacements],
  );

  const client = useMemo(
    () => (selectedPlacement ? getClient(selectedPlacement.clientId) : undefined),
    [selectedPlacement],
  );

  const contract = useMemo(
    () =>
      selectedPlacement
        ? getContract(selectedPlacement.contractId)
        : undefined,
    [selectedPlacement],
  );

  // 金額計算
  const feeAmount = selectedPlacement?.feeAmount ?? 0;
  const taxAmount = Math.floor(feeAmount * TAX_RATE);
  const totalAmount = feeAmount + taxAmount;

  // 支払期日の自動計算
  const autoPaymentSiteDays = contract?.paymentSiteDays ?? 30;
  const autoDueDate = useMemo(
    () => issueDate.add(autoPaymentSiteDays, 'day'),
    [issueDate, autoPaymentSiteDays],
  );
  const dueDate = dueDateManual ?? autoDueDate;

  // 請求書番号の自動採番
  const autoInvoiceNumber = useMemo(() => {
    const year = issueDate.year();
    return `${year}-INV-${String(Math.floor(Math.random() * 900) + 100).padStart(4, '0')}`;
  }, [issueDate]);

  // Placementが変わったらクライアントの送付方法をセット
  useEffect(() => {
    if (client) {
      setDeliveryMethod(client.invoiceDeliveryMethod);
    }
  }, [client]);

  const handleSubmit = () => {
    message.success('請求書を発行しました（モック）');
    navigate('/invoices');
  };

  const placementOptions = eligiblePlacements.map((p: Placement) => {
    const c = getClient(p.clientId);
    return {
      label: `${c?.companyName ?? '-'} - ${p.candidateName}`,
      value: p.id,
    };
  });

  return (
    <div>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <Link to="/invoices">請求書</Link> },
          { title: '請求書発行' },
        ]}
      />

      <h2 style={{ marginBottom: 24 }}>請求書発行</h2>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 対象案件の選択 */}
        <Card title="対象案件の選択" size="small">
          <Form layout="vertical">
            <Form.Item
              label="成約案件（入社済み）"
              required
              style={{ maxWidth: 480 }}
            >
              <Select
                placeholder="企業名 - 候補者名 で選択"
                options={placementOptions}
                value={selectedPlacementId}
                onChange={value => {
                  setSelectedPlacementId(value);
                  setDueDateManual(null);
                }}
                showSearch
                optionFilterProp="label"
                allowClear
              />
            </Form.Item>
          </Form>
        </Card>

        {/* 自動入力エリア */}
        {selectedPlacement && (
          <Card title="計算結果" size="small">
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="取引先企業名">
                {client?.companyName ?? '-'}
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
              <Descriptions.Item label="手数料額（税抜）">
                <span style={{ fontWeight: 'bold' }}>
                  {formatCurrency(feeAmount)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="消費税率">
                {formatPercent(TAX_RATE)}
              </Descriptions.Item>
              <Descriptions.Item label="消費税額">
                {formatCurrency(taxAmount)}
              </Descriptions.Item>
              <Descriptions.Item label="合計額（税込）">
                <span style={{ fontWeight: 'bold', fontSize: 16 }}>
                  {formatCurrency(totalAmount)}
                </span>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {/* 請求書情報 */}
        <Card title="請求書情報" size="small">
          <Form layout="vertical" style={{ maxWidth: 480 }}>
            <Form.Item label="請求書番号">
              <span style={{ fontWeight: 'bold' }}>{autoInvoiceNumber}</span>
              <span
                style={{ marginLeft: 8, fontSize: 12, color: '#999' }}
              >
                （自動採番）
              </span>
            </Form.Item>

            <Form.Item label="発行日" required>
              <DatePicker
                value={issueDate}
                onChange={date => {
                  if (date) {
                    setIssueDate(date);
                    setDueDateManual(null);
                  }
                }}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              label="支払期日"
              help={
                contract
                  ? `支払いサイト: ${contract.paymentSiteDays}日（${contract.paymentTerms}）`
                  : undefined
              }
            >
              <DatePicker
                value={dueDate}
                onChange={date => setDueDateManual(date)}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item label="送付方法" required>
              <Select
                value={deliveryMethod}
                onChange={setDeliveryMethod}
                options={Object.entries(deliveryMethodLabels).map(
                  ([value, label]) => ({ label, value }),
                )}
              />
            </Form.Item>
          </Form>
        </Card>

        {/* アクション */}
        <Space>
          <Popconfirm
            title="請求書を発行しますか？"
            description={
              selectedPlacement ? (
                <div>
                  <div>取引先: {client?.companyName}</div>
                  <div>候補者: {selectedPlacement.candidateName}</div>
                  <div>
                    請求額（税込）:{' '}
                    <strong>{formatCurrency(totalAmount)}</strong>
                  </div>
                </div>
              ) : undefined
            }
            onConfirm={handleSubmit}
            okText="発行する"
            cancelText="キャンセル"
            disabled={!selectedPlacement}
          >
            <Button
              type="primary"
              size="large"
              disabled={!selectedPlacement}
            >
              請求書を発行
            </Button>
          </Popconfirm>
          <Button size="large" onClick={() => navigate('/invoices')}>
            キャンセル
          </Button>
        </Space>
      </Space>
    </div>
  );
}
