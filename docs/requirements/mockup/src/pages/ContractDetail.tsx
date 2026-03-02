import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Breadcrumb,
  Tabs,
  Descriptions,
  Table,
  Button,
  Result,
  Drawer,
  Form,
  InputNumber,
  Input,
  Select,
  DatePicker,
  Space,
  message,
} from 'antd';
import {
  EditOutlined,
  PlusOutlined,
  MinusCircleOutlined,
  FilePdfOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  contracts,
  getClient,
  getPlacementsByContract,
  formatCurrency,
  formatDate,
  formatPercent,
} from '../data';
import type { Placement, RefundRule } from '../types';
import { renewalTypeLabels, contractStatusLabels } from '../types';
import { ContractStatusTag, PlacementStatusTag } from '../components/StatusBadge';

export default function ContractDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form] = Form.useForm();

  const contract = useMemo(() => contracts.find(c => c.id === id), [id]);
  const client = useMemo(
    () => (contract ? getClient(contract.clientId) : undefined),
    [contract]
  );
  const contractPlacements = useMemo(
    () => (id ? getPlacementsByContract(id) : []),
    [id]
  );

  if (!contract) {
    return (
      <Result
        status="404"
        title="契約が見つかりません"
        subTitle={`ID: ${id} に該当する契約は存在しません。`}
        extra={
          <Button type="primary" onClick={() => navigate('/contracts')}>
            一覧に戻る
          </Button>
        }
      />
    );
  }

  const openEditDrawer = () => {
    form.setFieldsValue({
      defaultFeeRate: contract.defaultFeeRate * 100,
      guaranteePeriodDays: contract.guaranteePeriodDays,
      paymentTerms: contract.paymentTerms,
      startDate: contract.startDate,
      endDate: contract.endDate,
      refundRules: contract.refundRules.map(rule => ({
        periodFromDays: rule.periodFromDays,
        periodToDays: rule.periodToDays,
        refundRate: rule.refundRate * 100,
      })),
    });
    setDrawerOpen(true);
  };

  const handleSave = () => {
    form.validateFields().then(() => {
      message.success('契約情報を更新しました（デモ）');
      setDrawerOpen(false);
    });
  };

  const refundRuleColumns: ColumnsType<RefundRule> = [
    {
      title: '開始日数',
      dataIndex: 'periodFromDays',
      key: 'periodFromDays',
      render: (days: number) => `${days}日`,
    },
    {
      title: '終了日数',
      dataIndex: 'periodToDays',
      key: 'periodToDays',
      render: (days: number) => `${days}日`,
    },
    {
      title: '返金率',
      dataIndex: 'refundRate',
      key: 'refundRate',
      render: (rate: number) => formatPercent(rate),
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
      label: '契約情報',
      children: (
        <div>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="取引先企業">
              {client ? (
                <Link to={`/clients/${client.id}`}>{client.companyName}</Link>
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="手数料率">
              {formatPercent(contract.defaultFeeRate)}
            </Descriptions.Item>
            <Descriptions.Item label="保証期間">
              {contract.guaranteePeriodDays}日
            </Descriptions.Item>
            <Descriptions.Item label="支払条件">
              {contract.paymentTerms}
            </Descriptions.Item>
            <Descriptions.Item label="支払いサイト">
              {contract.paymentSiteDays}日
            </Descriptions.Item>
            <Descriptions.Item label="契約期間">
              {formatDate(contract.startDate)} 〜 {formatDate(contract.endDate)}
            </Descriptions.Item>
            <Descriptions.Item label="更新方法">
              {renewalTypeLabels[contract.renewalType]}
            </Descriptions.Item>
            <Descriptions.Item label="ステータス">
              <ContractStatusTag status={contract.status} />
            </Descriptions.Item>
            <Descriptions.Item label="返戻金ルール" span={2}>
              <Table
                columns={refundRuleColumns}
                dataSource={contract.refundRules}
                rowKey={(_, index) => String(index)}
                pagination={false}
                size="small"
              />
            </Descriptions.Item>
            <Descriptions.Item label="契約書PDF" span={2}>
              {contract.documentPdf ? (
                <a href="#" onClick={e => e.preventDefault()}>
                  <FilePdfOutlined style={{ marginRight: 4 }} />
                  {contract.documentPdf}
                </a>
              ) : (
                <span style={{ color: '#999' }}>未アップロード</span>
              )}
            </Descriptions.Item>
          </Descriptions>
        </div>
      ),
    },
    {
      key: 'placements',
      label: `成約一覧 (${contractPlacements.length})`,
      children: (
        <Table
          columns={placementColumns}
          dataSource={contractPlacements}
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
          { title: <Link to="/contracts">基本契約</Link> },
          { title: contract.id },
        ]}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: 16,
        }}
      >
        <Button icon={<EditOutlined />} onClick={openEditDrawer}>
          編集
        </Button>
      </div>

      <Tabs items={tabItems} />

      <Drawer
        title="契約情報の編集"
        width={560}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>キャンセル</Button>
            <Button type="primary" onClick={handleSave}>
              保存
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="手数料率 (%)"
            name="defaultFeeRate"
            rules={[{ required: true, message: '手数料率を入力してください' }]}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} suffix="%" />
          </Form.Item>

          <Form.Item
            label="保証期間 (日)"
            name="guaranteePeriodDays"
            rules={[{ required: true, message: '保証期間を入力してください' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} suffix="日" />
          </Form.Item>

          <Form.Item
            label="支払条件"
            name="paymentTerms"
            rules={[{ required: true, message: '支払条件を入力してください' }]}
          >
            <Input />
          </Form.Item>

          <Space style={{ width: '100%' }} size="middle">
            <Form.Item
              label="契約開始日"
              name="startDate"
              rules={[{ required: true, message: '開始日を入力してください' }]}
              style={{ flex: 1 }}
            >
              <Input type="date" />
            </Form.Item>
            <Form.Item
              label="契約終了日"
              name="endDate"
              rules={[{ required: true, message: '終了日を入力してください' }]}
              style={{ flex: 1 }}
            >
              <Input type="date" />
            </Form.Item>
          </Space>

          <div style={{ marginBottom: 8, fontWeight: 600 }}>返戻金ルール</div>
          <Form.List name="refundRules">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    style={{ display: 'flex', marginBottom: 8 }}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, 'periodFromDays']}
                      rules={[{ required: true, message: '開始日数' }]}
                    >
                      <InputNumber placeholder="開始日数" min={0} suffix="日〜" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'periodToDays']}
                      rules={[{ required: true, message: '終了日数' }]}
                    >
                      <InputNumber placeholder="終了日数" min={0} suffix="日" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'refundRate']}
                      rules={[{ required: true, message: '返金率' }]}
                    >
                      <InputNumber placeholder="返金率" min={0} max={100} suffix="%" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    ルールを追加
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Drawer>
    </div>
  );
}
