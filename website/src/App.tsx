import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import DashboardLayout from './pages/DashboardLayout';
import Dashboard from './pages/Dashboard';
import LivePage from './pages/dashboard/LivePage';
import HistoryPage from './pages/dashboard/HistoryPage';
import TrendsPage from './pages/dashboard/TrendsPage';
import AlertsPage from './pages/dashboard/AlertsPage';
import SystemPage from './pages/dashboard/SystemPage';
import SettingsPage from './pages/dashboard/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="live" element={<LivePage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="trends" element={<TrendsPage />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="system" element={<SystemPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
