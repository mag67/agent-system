import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Upload,
  Button,
  Space,
  Card,
  Typography,
  Breadcrumb,
  Divider,
  message,
} from 'antd';
import { InboxOutlined, SaveOutlined, SendOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { clients, contracts, getContractsByClient, formatCurrency, formatPercent } from '../data';

const { Title, Text } = Typography;
const { Dragger } = Upload;

export default function PlacementForm() {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // フォームの値をウォッチ
  const selectedClientId = Form.useWatch('clientId', form);
  const theoreticalSalary = Form.useWatch('theoreticalAnnualSalary', form);
  const feeRate = Form.useWatch('feeRate', form);

  // 選択された取引先の有効契約一覧
  const clientContracts = useMemo(() => {
    if (!selectedClientId) return [];
    return getContractsByClient(selectedClientId).filter(c => c.status === 'active');
  }, [selectedClientId]);

  // 手数料額の自動計算
  const calculatedFeeAmount = useMemo(() => {
    if (theoreticalSalary && feeRate) {
      return Math.round(theoreticalSalary * (feeRate / 100));
    }
    return 0;
  }, [theoreticalSalary, feeRate]);

  // 取引先変更時に契約とデフォルト手数料率をセット
  const handleClientChange = (clientId: string) => {
    const activeContracts = getContractsByClient(clientId).filter(c => c.status === 'active');
    if (activeContracts.length === 1) {
      const contract = activeContracts[0];
      form.setFieldsValue({
        contractId: contract.id,
        feeRate: contract.defaultFeeRate * 100,
      });
    } else {
      form.setFieldsValue({
        contractId: undefined,
        feeRate: undefined,
      });
    }
  };

  // 契約変更時にデフォルト手数料率をセット
  const handleContractChange = (contractId: string) => {
    const contract = contracts.find(c => c.id === contractId);
    if (contract) {
      form.setFieldsValue({
        feeRate: contract.defaultFeeRate * 100,
      });
    }
  };

  const handleSubmit = () => {
    form.validateFields().then(() => {
      message.success('成約申請を提出しました（モック）');
      navigate('/placements');
    });
  };

  const handleDraft = () => {
    message.info('下書きを保存しました（モック）');
  };

  // RA/CA の選択肢（ダミー）
  const raOptions = [
    { label: '松本浩二', value: '松本浩二' },
    { label: '斎藤健太', value: '斎藤健太' },
  ];

  const caOptions = [
    { label: '小林真理', value: '小林真理' },
    { label: '吉田美穂', value: '吉田美穂' },
  ];

  return (
    <div>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <Link to="/placements">成約一覧</Link> },
          { title: '新規成約申請' },
        ]}
      />

      <Title level={3} style={{ marginBottom: 24 }}>
        新規成約申請
      </Title>

      <Form
        form={form}
        layout="vertical"
        requiredMark={(label, { required }) => (
          <>
            {label}
            {!required && <Text type="secondary" style={{ marginLeft: 4, fontSize: 12 }}>(任意)</Text>}
          </>
        )}
      >
        {/* 契約情報セクション */}
        <Card title="契約情報" style={{ marginBottom: 16 }}>
          <Form.Item
            name="clientId"
            label="取引先企業"
            rules={[{ required: true, message: '取引先企業を選択してください' }]}
          >
            <Select
              placeholder="取引先企業を選択"
              showSearch
              optionFilterProp="label"
              options={clients.map(c => ({ label: c.companyName, value: c.id }))}
              onChange={handleClientChange}
            />
          </Form.Item>

          <Form.Item
            name="contractId"
            label="基本契約"
            rules={[{ required: true, message: '基本契約を選択してください' }]}
          >
            <Select
              placeholder={selectedClientId ? '基本契約を選択' : '先に取引先企業を選択してください'}
              disabled={!selectedClientId}
              options={clientContracts.map(c => ({
                label: `${c.id} (手数料率: ${formatPercent(c.defaultFeeRate)}, ${c.startDate} ~ ${c.endDate})`,
                value: c.id,
              }))}
              onChange={handleContractChange}
            />
          </Form.Item>
        </Card>

        {/* 候補者情報セクション */}
        <Card title="候補者情報" style={{ marginBottom: 16 }}>
          <Form.Item
            name="candidateName"
            label="候補者名"
            rules={[{ required: true, message: '候補者名を入力してください' }]}
          >
            <Input placeholder="例: 山田太郎" />
          </Form.Item>

          <Space size="large" style={{ display: 'flex' }}>
            <Form.Item
              name="theoreticalAnnualSalary"
              label="理論年収"
              rules={[{ required: true, message: '理論年収を入力してください' }]}
              style={{ flex: 1 }}
            >
              <InputNumber
                placeholder="例: 8000000"
                style={{ width: '100%' }}
                min={0}
                step={100000}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => Number(value?.replace(/,/g, '') ?? 0)}
                addonAfter="円"
              />
            </Form.Item>

            <Form.Item
              name="feeRate"
              label="適用手数料率"
              rules={[{ required: true, message: '手数料率を入力してください' }]}
              style={{ flex: 1 }}
            >
              <InputNumber
                placeholder="例: 35"
                style={{ width: '100%' }}
                min={0}
                max={100}
                step={1}
                addonAfter="%"
              />
            </Form.Item>
          </Space>

          <Divider dashed style={{ margin: '8px 0 16px' }} />

          <Form.Item label="手数料額（自動計算）">
            <InputNumber
              value={calculatedFeeAmount}
              disabled
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              addonAfter="円"
            />
            {calculatedFeeAmount > 0 && (
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                {formatCurrency(calculatedFeeAmount)}
              </Text>
            )}
          </Form.Item>
        </Card>

        {/* 入社予定セクション */}
        <Card title="入社予定" style={{ marginBottom: 16 }}>
          <Form.Item
            name="expectedStartDate"
            label="入社予定日"
            rules={[{ required: true, message: '入社予定日を選択してください' }]}
          >
            <DatePicker style={{ width: '100%' }} placeholder="入社予定日を選択" />
          </Form.Item>
        </Card>

        {/* 担当者セクション */}
        <Card title="担当者" style={{ marginBottom: 16 }}>
          <Space size="large" style={{ display: 'flex' }}>
            <Form.Item
              name="responsibleRA"
              label="担当RA"
              rules={[{ required: true, message: '担当RAを選択してください' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="担当RAを選択" options={raOptions} />
            </Form.Item>

            <Form.Item
              name="responsibleCA"
              label="担当CA"
              required={false}
              style={{ flex: 1 }}
            >
              <Select placeholder="担当CAを選択" options={caOptions} allowClear />
            </Form.Item>
          </Space>
        </Card>

        {/* エビデンスセクション */}
        <Card title="エビデンス" style={{ marginBottom: 24 }}>
          <Form.Item
            name="evidenceFiles"
            required={false}
          >
            <Dragger
              multiple
              beforeUpload={() => {
                message.info('ファイルアップロード（モック）');
                return false;
              }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                クリックまたはドラッグでファイルをアップロード
              </p>
              <p className="ant-upload-hint">
                オファーレター、条件通知書などのエビデンスファイル
              </p>
            </Dragger>
          </Form.Item>
        </Card>

        {/* アクションボタン */}
        <Space>
          <Button type="primary" icon={<SendOutlined />} onClick={handleSubmit}>
            成約申請を提出
          </Button>
          <Button icon={<SaveOutlined />} onClick={handleDraft}>
            下書き保存
          </Button>
          <Button onClick={() => navigate('/placements')}>キャンセル</Button>
        </Space>
      </Form>
    </div>
  );
}
