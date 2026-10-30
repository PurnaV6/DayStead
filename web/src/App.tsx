import { HashRouter, Routes, Route } from 'react-router-dom';
import SignInPage from './pages/SignInPage';
import DashboardLayout from './layouts/DashboardLayout';
import OverviewPage from './pages/OverviewPage';
import AccountServicePage from './pages/AccountServicePage';
import InfoPage from './pages/InfoPage';
import { AppointmentsPage, BillsPage, MedicinesPage } from './pages/ListPages';
import VerifiedPage from './pages/VerifiedPage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/delete-account" element={<AccountServicePage/>}/>
        <Route path="/owner" element={<AccountServicePage owner/>}/>
        <Route path="/verified" element={<VerifiedPage />} />
        {(['pricing','privacy','terms','support'] as const).map(page=><Route key={page} path={'/'+page} element={<InfoPage page={page}/>}/>)}
        <Route path="/" element={<SignInPage />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="bills" element={<BillsPage />} />
          <Route path="medicines" element={<MedicinesPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
