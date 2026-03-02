import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, theme, Badge } from 'antd';
import {
  DashboardOutlined,
  BankOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  TeamOutlined,
  AuditOutlined,
  CreditCardOutlined,
  RollbackOutlined,
} from '@ant-design/icons';
import { placements } from '../data';

const { Header, Sider, Content } = Layout;

const pendingApprovalCount = placements.filter(p => p.status === 'pending_approval').length;

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'ダッシュボード',
    },
    {
      key: 'contract',
      icon: <BankOutlined />,
      label: '契約管理',
      children: [
        { key: '/clients', icon: <TeamOutlined />, label: '取引先企業' },
        { key: '/contracts', icon: <FileTextOutlined />, label: '基本契約' },
      ],
    },
    {
      key: 'placement',
      icon: <CheckCircleOutlined />,
      label: '成約計上',
      children: [
        { key: '/placements', icon: <AuditOutlined />, label: '成約一覧' },
        {
          key: '/approvals',
          icon: <CheckCircleOutlined />,
          label: (
            <span>
              承認
              {pendingApprovalCount > 0 && (
                <Badge count={pendingApprovalCount} size="small" style={{ marginLeft: 8 }} />
              )}
            </span>
          ),
        },
      ],
    },
    {
      key: 'billing',
      icon: <DollarOutlined />,
      label: '請求管理',
      children: [
        { key: '/invoices', icon: <FileTextOutlined />, label: '請求書' },
        { key: '/payment-confirmation', icon: <CreditCardOutlined />, label: '入金確認' },
        { key: '/refunds', icon: <RollbackOutlined />, label: '返戻金' },
      ],
    },
  ];

  const selectedKey = location.pathname === '/' ? '/' : location.pathname;
  const openKeys = location.pathname.startsWith('/clients') || location.pathname.startsWith('/contracts')
    ? ['contract']
    : location.pathname.startsWith('/placements') || location.pathname.startsWith('/approvals')
      ? ['placement']
      : location.pathname.startsWith('/invoices') || location.pathname.startsWith('/payment') || location.pathname.startsWith('/refunds')
        ? ['billing']
        : [];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{ background: token.colorBgContainer }}
        width={240}
      >
        <div style={{
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          fontWeight: 700,
          fontSize: collapsed ? 14 : 16,
          color: token.colorPrimary,
        }}>
          {collapsed ? 'AG' : 'AgentFlow'}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          defaultOpenKeys={openKeys}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ border: 'none' }}
        />
      </Sider>
      <Layout>
        <Header style={{
          background: token.colorBgContainer,
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          height: 48,
        }}>
          <span style={{ color: token.colorTextSecondary, fontSize: 13 }}>
            営業部 松本浩二
          </span>
        </Header>
        <Content style={{ margin: 24, minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
