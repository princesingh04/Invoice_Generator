import { useQuery } from '@tanstack/react-query';
import { DollarSign, Clock, AlertTriangle, FileText } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import InvoiceTable from '../components/InvoiceTable';
import { fetchDashboardStats } from '../api/invoiceApi';

/**
 * Dashboard — overview page with stats cards and recent invoices.
 *
 * @param {{ onViewInvoice: (id: string) => void }} props
 */
export default function Dashboard({ onViewInvoice }) {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
    refetchInterval: 30_000, // auto-refresh every 30 s
  });

  const stats = data || {};

  return (
    <div className="space-y-8 animate-fade-in" id="dashboard-page">
      {/* ── Page header ───────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-surface-400 mt-1">
          Overview of your invoicing activity
        </p>
      </div>

      {/* ── Stats grid ────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatsCard
          icon={DollarSign}
          label="Total Revenue"
          value={stats.totalRevenue ?? 0}
          prefix="₹"
          delay={50}
          gradient="from-emerald-500 to-teal-500"
        />
        <StatsCard
          icon={Clock}
          label="Pending"
          value={stats.pendingCount ?? 0}
          delay={120}
          gradient="from-amber-500 to-orange-500"
        />
        <StatsCard
          icon={AlertTriangle}
          label="Overdue"
          value={stats.overdueCount ?? 0}
          delay={190}
          gradient="from-rose-500 to-pink-500"
        />
        <StatsCard
          icon={FileText}
          label="Total Invoices"
          value={stats.totalInvoices ?? 0}
          delay={260}
          gradient="from-indigo-500 to-violet-500"
        />
      </div>

      {/* ── Recent invoices ───────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Recent Invoices</h2>
        {isLoading ? (
          <div className="glass-card p-12 text-center">
            <div className="inline-block w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full"
                 style={{ animation: 'spin 0.8s linear infinite' }} />
            <p className="text-surface-400 text-sm mt-3">Loading…</p>
          </div>
        ) : (
          <InvoiceTable
            invoices={stats.recentInvoices || []}
            onView={onViewInvoice}
            showActions={false}
          />
        )}
      </div>
    </div>
  );
}
