import { useState, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import InvoiceBuilder from './pages/InvoiceBuilder';
import InvoiceList from './pages/InvoiceList';
import InvoiceView from './pages/InvoiceView';

/**
 * React Query client — shared across the entire app.
 * Configured with sensible defaults for stale time & retries.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * App — root component providing React Query context,
 * a glass sidebar, and state-based page routing.
 */
export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [viewingInvoiceId, setViewingInvoiceId] = useState(null);

  // Navigate to a page (resets the invoice viewer when switching away)
  const navigate = useCallback((page) => {
    setCurrentPage(page);
    if (page !== 'view') setViewingInvoiceId(null);
  }, []);

  // Open a specific invoice detail view
  const viewInvoice = useCallback((id) => {
    setViewingInvoiceId(id);
    setCurrentPage('view');
  }, []);

  // After an invoice is created, go to the detail view
  const handleCreated = useCallback((id) => {
    if (id) viewInvoice(id);
    else navigate('invoices');
  }, [viewInvoice, navigate]);

  // Render the active page
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onViewInvoice={viewInvoice} />;
      case 'builder':
        return <InvoiceBuilder onCreated={handleCreated} />;
      case 'invoices':
        return (
          <InvoiceList
            onView={viewInvoice}
            onNew={() => navigate('builder')}
          />
        );
      case 'view':
        return (
          <InvoiceView
            invoiceId={viewingInvoiceId}
            onBack={() => navigate('invoices')}
            onDeleted={() => navigate('invoices')}
          />
        );
      case 'customers':
        return (
          <div className="animate-fade-in" id="customers-page">
            <h1 className="text-2xl font-bold text-white mb-2">Customers</h1>
            <p className="text-sm text-surface-400">Customer management coming soon.</p>
          </div>
        );
      case 'settings':
        return (
          <div className="animate-fade-in" id="settings-page">
            <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
            <p className="text-sm text-surface-400">Settings page coming soon.</p>
          </div>
        );
      default:
        return <Dashboard onViewInvoice={viewInvoice} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen" id="app-root">
        {/* Sidebar */}
        <Sidebar currentPage={currentPage} onNavigate={navigate} />

        {/* Main content area — offset by sidebar width */}
        <main
          className="flex-1 ml-64 p-6 sm:p-8 lg:p-10 transition-all duration-300"
          id="main-content"
        >
          {renderPage()}
        </main>
      </div>
    </QueryClientProvider>
  );
}
