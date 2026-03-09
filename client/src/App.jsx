import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UthConfigPage from './pages/UthConfigPage';
import CalendarConfigPage from './pages/CalendarConfigPage';
import SubjectsPage from './pages/SubjectsPage';
import LogsPage from './pages/LogsPage';
import './index.css';

function Layout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{
        flex: 1,
        marginLeft: '260px',
        padding: '32px 40px',
        maxWidth: 'calc(100vw - 260px)',
      }}>
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout><DashboardPage /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/uth-config" element={
          <ProtectedRoute>
            <Layout><UthConfigPage /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/calendar-config" element={
          <ProtectedRoute>
            <Layout><CalendarConfigPage /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/subjects" element={
          <ProtectedRoute>
            <Layout><SubjectsPage /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/logs" element={
          <ProtectedRoute>
            <Layout><LogsPage /></Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
