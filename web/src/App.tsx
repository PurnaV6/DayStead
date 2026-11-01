import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AccountServicePage from './pages/AccountServicePage';
import InfoPage from './pages/InfoPage';
import VerifiedPage from './pages/VerifiedPage';

// DayStead is a phone app. The website is a showcase page plus the pages the stores and
// sign-in emails need: privacy, terms, help, account deletion and the email "verified" page.
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/delete-account" element={<AccountServicePage />} />
        <Route path="/owner" element={<AccountServicePage owner />} />
        <Route path="/verified" element={<VerifiedPage />} />
        {(['pricing', 'privacy', 'terms', 'support'] as const).map((page) => <Route key={page} path={'/' + page} element={<InfoPage page={page} />} />)}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
