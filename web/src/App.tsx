import { HashRouter, Routes, Route } from 'react-router-dom';
import SignInPage from './pages/SignInPage';
import DashboardLayout from './layouts/DashboardLayout';
import OverviewPage from './pages/OverviewPage';
import AccountServicePage from './pages/AccountServicePage';
import InfoPage from './pages/InfoPage';
import PlaceholderPage from './pages/PlaceholderPage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/delete-account" element={<AccountServicePage/>}/>
        <Route path="/owner" element={<AccountServicePage owner/>}/>
        {(['pricing','privacy','terms','support'] as const).map(page=><Route key={page} path={'/'+page} element={<InfoPage page={page}/>}/>)}
        <Route path="/" element={<SignInPage />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="bills" element={<PlaceholderPage title="Bills & payments" />} />
          <Route path="medicines" element={<PlaceholderPage title="Medicines" />} />
          <Route path="appointments" element={<PlaceholderPage title="Appointments" />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
