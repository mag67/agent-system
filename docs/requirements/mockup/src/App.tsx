import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import jaJP from 'antd/locale/ja_JP';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import ClientList from './pages/ClientList';
import ClientDetail from './pages/ClientDetail';
import ContractList from './pages/ContractList';
import ContractDetail from './pages/ContractDetail';
import PlacementList from './pages/PlacementList';
import PlacementDetail from './pages/PlacementDetail';
import PlacementForm from './pages/PlacementForm';
import ApprovalList from './pages/ApprovalList';
import InvoiceList from './pages/InvoiceList';
import InvoiceDetail from './pages/InvoiceDetail';
import InvoiceForm from './pages/InvoiceForm';
import PaymentConfirmation from './pages/PaymentConfirmation';
import RefundList from './pages/RefundList';

export default function App() {
  return (
    <ConfigProvider locale={jaJP} theme={{ token: { colorPrimary: '#1677ff' } }}>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            {/* 契約管理 */}
            <Route path="/clients" element={<ClientList />} />
            <Route path="/clients/:id" element={<ClientDetail />} />
            <Route path="/contracts" element={<ContractList />} />
            <Route path="/contracts/:id" element={<ContractDetail />} />
            {/* 成約計上 */}
            <Route path="/placements" element={<PlacementList />} />
            <Route path="/placements/new" element={<PlacementForm />} />
            <Route path="/placements/:id" element={<PlacementDetail />} />
            <Route path="/approvals" element={<ApprovalList />} />
            {/* 請求管理 */}
            <Route path="/invoices" element={<InvoiceList />} />
            <Route path="/invoices/new" element={<InvoiceForm />} />
            <Route path="/invoices/:id" element={<InvoiceDetail />} />
            <Route path="/payment-confirmation" element={<PaymentConfirmation />} />
            <Route path="/refunds" element={<RefundList />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}
