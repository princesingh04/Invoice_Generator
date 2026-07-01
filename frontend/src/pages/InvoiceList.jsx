import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import InvoiceTable from '../components/InvoiceTable';
import { fetchInvoices, deleteInvoice } from '../api/invoiceApi';

const STATUS_FILTERS = ['All', 'Draft', 'Pending', 'Paid', 'Overdue', 'Partially Paid'];

/**
 * InvoiceList — paginated, filterable invoice list.
 *
 * @param {{ onView: (id: string) => void, onNew: () => void }} props
 */
export default function InvoiceList({ onView, onNew }) {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const limit = 10;
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', page, statusFilter],
    queryFn: () =>
      fetchInvoices({
        page,
        limit,
        status: statusFilter === 'All' ? undefined : statusFilter,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
  });

  // Client-side search filter
  const invoices = useMemo(() => {
    const list = data?.invoices || data || [];
    const arr = Array.isArray(list) ? list : [];
    if (!search.trim()) return arr;
    const q = search.toLowerCase();
    return arr.filter(
      (inv) =>
        (inv.invoiceNumber || '').toLowerCase().includes(q) ||
        (inv.customerName || '').toLowerCase().includes(q),
    );
  }, [data, search]);

  const totalPages = data?.totalPages || 1;

  return (
    <div className="space-y-6 animate-fade-in" id="invoices-page">
      {/* ── Header ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Invoices</h1>
          <p className="text-sm text-surface-400 mt-1">
            Manage and track all your invoices
          </p>
        </div>
        <button
          id="new-invoice-btn"
          onClick={onNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white
                     bg-gradient-to-r from-indigo-500 to-violet-500
                     hover:from-indigo-400 hover:to-violet-400
                     shadow-lg shadow-indigo-500/20
                     transition-all duration-200 cursor-pointer"
        >
          <Plus size={18} />
          New Invoice
        </button>
      </div>

      {/* ── Status filter tabs ────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            id={`filter-${s.toLowerCase().replace(/\s/g, '-')}`}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`
              px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer
              ${statusFilter === s
                ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                : 'text-surface-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
              }
            `}
          >
            {s}
          </button>
        ))}
      </div>

      {/* ── Search ────────────────────────────────────── */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
        <input
          id="invoice-search"
          type="text"
          placeholder="Search by invoice # or customer…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5"
        />
      </div>

      {/* ── Table ─────────────────────────────────────── */}
      {isLoading ? (
        <div className="glass-card p-12 text-center">
          <div className="inline-block w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full"
               style={{ animation: 'spin 0.8s linear infinite' }} />
          <p className="text-surface-400 text-sm mt-3">Loading invoices…</p>
        </div>
      ) : (
        <InvoiceTable
          invoices={invoices}
          onView={onView}
          onDelete={(id) => {
            if (window.confirm('Delete this invoice?')) deleteMutation.mutate(id);
          }}
        />
      )}

      {/* ── Pagination ────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            id="prev-page-btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-2 rounded-lg glass-card text-surface-400 hover:text-white
                       disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm text-surface-400 tabular-nums">
            Page <span className="text-white font-medium">{page}</span> of{' '}
            <span className="text-white font-medium">{totalPages}</span>
          </span>
          <button
            id="next-page-btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-2 rounded-lg glass-card text-surface-400 hover:text-white
                       disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
