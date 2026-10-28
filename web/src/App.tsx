import { HashRouter, Routes, Route } from 'react-router-dom';
import SignInPage from './pages/SignInPage';
import DashboardLayout from './layouts/DashboardLayout';
import OverviewPage from './pages/OverviewPage';
import PlaceholderPage from './pages/PlaceholderPage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
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
