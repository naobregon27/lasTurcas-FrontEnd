import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Suspense } from 'react';
import useInventoryStore from './store/useInventoryStore';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import StockEntry from './pages/StockEntry';
import Sales from './pages/Sales';
import SalesHistory from './pages/SalesHistory';
import Reports from './pages/Reports';
import Categories from './pages/Categories';
import Suppliers from './pages/Suppliers';
import Settings from './pages/Settings';

function AuthGuard({ children }) {
  const { isAuthenticated } = useInventoryStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const { isAuthenticated } = useInventoryStore();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/dashboard"
        element={<AuthGuard><Layout><Dashboard /></Layout></AuthGuard>}
      />
      <Route
        path="/products"
        element={<AuthGuard><Layout><Products /></Layout></AuthGuard>}
      />
      <Route
        path="/stock-entry"
        element={<AuthGuard><Layout><StockEntry /></Layout></AuthGuard>}
      />
      <Route
        path="/sales"
        element={<AuthGuard><Layout><Sales /></Layout></AuthGuard>}
      />
      <Route
        path="/sales-history"
        element={<AuthGuard><Layout><SalesHistory /></Layout></AuthGuard>}
      />
      <Route
        path="/reports"
        element={<AuthGuard><Layout><Reports /></Layout></AuthGuard>}
      />
      <Route
        path="/categories"
        element={<AuthGuard><Layout><Categories /></Layout></AuthGuard>}
      />
      <Route
        path="/suppliers"
        element={<AuthGuard><Layout><Suppliers /></Layout></AuthGuard>}
      />
      <Route
        path="/settings"
        element={<AuthGuard><Layout><Settings /></Layout></AuthGuard>}
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#0f1020',
            color: '#f0f4ff',
            border: '1px solid #1a1d2e',
            borderRadius: '14px',
            fontSize: '13px',
            padding: '12px 16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          },
          success: {
            iconTheme: { primary: '#10B981', secondary: '#0f1020' },
            style: { borderLeft: '3px solid #10B981' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#0f1020' },
            style: { borderLeft: '3px solid #EF4444' },
          },
        }}
      />
    </BrowserRouter>
  );
}
