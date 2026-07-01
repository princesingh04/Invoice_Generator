import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Calendar,
  Building2,
  User,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { fetchInvoiceById, updateInvoiceStatus, deleteInvoice } from '../api/invoiceApi';

/**
 * InvoiceView — beautiful detail view of a single invoice.
 *
 * @param {{ invoiceId: string, onBack: () => void, onDeleted: () => void }} props
 */
export default function InvoiceView({ invoiceId, onBack, onDeleted }) {
  const queryClient = useQueryClient();

  const { data: inv, isLoading } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: () => fetchInvoiceById(invoiceId),
    enabled: !!invoiceId,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateInvoiceStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      onDeleted();
    },
  });

  const fmt = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—';

  const fmtCurrency = (v) =>
    `₹${(v ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  if (isLoading || !inv) {
    return (
      <div className="flex items-center justify-center py-32 animate-fade-in" id="invoice-view-loading">
        <div className="inline-block w-7 h-7 border-2 border-brand-400 border-t-transparent rounded-full"
             style={{ animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  const STATUS_ACTIONS = [
    { status: 'Paid',    icon: CheckCircle2, label: 'Mark Paid',    color: 'emerald' },
    { status: 'Pending', icon: Clock,         label: 'Mark Pending', color: 'amber' },
    { status: 'Overdue', icon: AlertTriangle, label: 'Mark Overdue', color: 'rose' },
  ].filter((a) => a.status !== inv.status);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto" id="invoice-view-page">
      {/* ── Back + actions ────────────────────────────── */}
      <div className="flex items-center justify-between">
        <button
          id="invoice-back-btn"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-surface-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
          Back to Invoices
        </button>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {STATUS_ACTIONS.map(({ status, icon: Icon, label, color }) => (
            <button
              key={status}
              id={`action-${status.toLowerCase()}`}
              onClick={() => statusMutation.mutate({ id: invoiceId, status })}
              disabled={statusMutation.isPending}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                         transition-all duration-200 cursor-pointer border
                         border-${color}-500/20 text-${color}-400 hover:bg-${color}-500/10
                         disabled:opacity-40`}
              style={{
                borderColor: `var(--color-status-${status.toLowerCase() === 'paid' ? 'paid' : status.toLowerCase()}, rgba(255,255,255,0.1))`,
              }}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
          <button
            id="invoice-delete-btn"
            onClick={() => {
              if (window.confirm('Permanently delete this invoice?'))
                deleteMutation.mutate(invoiceId);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                       border border-rose-500/20 text-rose-400 hover:bg-rose-500/10
                       transition-all duration-200 cursor-pointer"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>

      {/* ── Invoice card ──────────────────────────────── */}
      <div className="glass-card p-8">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <FileText size={24} className="text-brand-400" />
              {inv.invoiceNumber || 'Invoice'}
            </h1>
            <div className="mt-2">
              <StatusBadge status={inv.status || 'Draft'} />
            </div>
          </div>
          <div className="text-right text-sm space-y-1">
            <div className="flex items-center gap-2 text-surface-400 justify-end">
              <Calendar size={14} />
              <span>Issued: {fmt(inv.createdAt)}</span>
            </div>
            {inv.dueDate && (
              <div className="flex items-center gap-2 text-surface-400 justify-end">
                <Calendar size={14} />
                <span>Due: {fmt(inv.dueDate)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Parties */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          {inv.shopId && (
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <p className="text-xs text-surface-500 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                <Building2 size={13} /> From
              </p>
              <p className="text-sm text-surface-200 font-medium">
                {inv.shopId?.businessName || (typeof inv.shopId === 'string' ? inv.shopId : '—')}
              </p>
              {inv.shopId?.address && (
                <p className="text-xs text-surface-400 mt-1">{inv.shopId.address}</p>
              )}
            </div>
          )}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <p className="text-xs text-surface-500 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
              <User size={13} /> Bill To
            </p>
            <p className="text-sm text-surface-200 font-medium">
              {inv.customerName || '—'}
            </p>
            {inv.customerId?.email && (
              <p className="text-xs text-surface-400 mt-1">{inv.customerId.email}</p>
            )}
            {inv.customerId?.address && (
              <p className="text-xs text-surface-400 mt-0.5">{inv.customerId.address}</p>
            )}
          </div>
        </div>

        {/* Line items table */}
        {inv.lineItems?.length > 0 && (
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-sm" id="invoice-detail-items">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider py-2.5 pr-4">
                    Description
                  </th>
                  <th className="text-right text-xs font-semibold text-surface-500 uppercase tracking-wider py-2.5 px-4">
                    Qty
                  </th>
                  <th className="text-right text-xs font-semibold text-surface-500 uppercase tracking-wider py-2.5 px-4">
                    Price
                  </th>
                  <th className="text-right text-xs font-semibold text-surface-500 uppercase tracking-wider py-2.5 px-4">
                    Tax %
                  </th>
                  <th className="text-right text-xs font-semibold text-surface-500 uppercase tracking-wider py-2.5 pl-4">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {inv.lineItems.map((li, idx) => {
                  const rowTotal = (li.quantity || 0) * (li.unitPrice || 0);
                  return (
                    <tr key={idx} className="border-b border-white/[0.03]">
                      <td className="py-3 pr-4 text-surface-200">{li.description || '—'}</td>
                      <td className="py-3 px-4 text-right text-surface-300 tabular-nums">{li.quantity}</td>
                      <td className="py-3 px-4 text-right text-surface-300 tabular-nums">{fmtCurrency(li.unitPrice)}</td>
                      <td className="py-3 px-4 text-right text-surface-300 tabular-nums">{li.taxRate ?? 0}%</td>
                      <td className="py-3 pl-4 text-right text-white font-semibold tabular-nums">{fmtCurrency(rowTotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between text-surface-400">
              <span>Subtotal</span>
              <span className="tabular-nums">{fmtCurrency(inv.subTotal)}</span>
            </div>
            <div className="flex justify-between text-surface-400">
              <span>Tax</span>
              <span className="tabular-nums">{fmtCurrency(inv.taxTotal)}</span>
            </div>
            <div className="border-t border-white/[0.08] pt-2 flex justify-between text-white font-bold text-base">
              <span>Grand Total</span>
              <span className="tabular-nums">{fmtCurrency(inv.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Notes / terms */}
        {(inv.notes || inv.terms) && (
          <div className="mt-8 pt-6 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-2 gap-6">
            {inv.notes && (
              <div>
                <p className="text-xs text-surface-500 uppercase tracking-wider font-semibold mb-1">Notes</p>
                <p className="text-sm text-surface-300 whitespace-pre-line">{inv.notes}</p>
              </div>
            )}
            {inv.terms && (
              <div>
                <p className="text-xs text-surface-500 uppercase tracking-wider font-semibold mb-1">Terms</p>
                <p className="text-sm text-surface-300 whitespace-pre-line">{inv.terms}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
