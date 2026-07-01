import { Eye, Trash2 } from 'lucide-react';
import StatusBadge from './StatusBadge';

/**
 * InvoiceTable — responsive table of invoices with hover effects.
 *
 * @param {{
 *   invoices: Array,
 *   onView: (id: string) => void,
 *   onDelete?: (id: string) => void,
 *   showActions?: boolean,
 * }} props
 */
export default function InvoiceTable({
  invoices = [],
  onView,
  onDelete,
  showActions = true,
}) {
  if (!invoices.length) {
    return (
      <div className="glass-card p-12 text-center animate-fade-in">
        <p className="text-surface-400 text-sm">No invoices found.</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden animate-fade-in">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" id="invoice-table">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left text-xs font-semibold text-surface-400 uppercase tracking-wider px-5 py-3.5">
                Invoice #
              </th>
              <th className="text-left text-xs font-semibold text-surface-400 uppercase tracking-wider px-5 py-3.5">
                Customer
              </th>
              <th className="text-left text-xs font-semibold text-surface-400 uppercase tracking-wider px-5 py-3.5 hidden sm:table-cell">
                Date
              </th>
              <th className="text-right text-xs font-semibold text-surface-400 uppercase tracking-wider px-5 py-3.5">
                Amount
              </th>
              <th className="text-center text-xs font-semibold text-surface-400 uppercase tracking-wider px-5 py-3.5">
                Status
              </th>
              {showActions && (
                <th className="text-right text-xs font-semibold text-surface-400 uppercase tracking-wider px-5 py-3.5">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {invoices.map((inv, idx) => (
              <tr
                key={inv._id || idx}
                className="border-b border-white/[0.03] hover:bg-white/[0.03]
                           transition-colors duration-150 cursor-pointer group"
                onClick={() => onView?.(inv._id)}
                id={`invoice-row-${inv._id || idx}`}
              >
                <td className="px-5 py-3.5 font-mono text-brand-400 text-xs">
                  {inv.invoiceNumber || '—'}
                </td>
                <td className="px-5 py-3.5 text-surface-200 font-medium">
                  {inv.customerName || 'N/A'}
                </td>
                <td className="px-5 py-3.5 text-surface-400 hidden sm:table-cell">
                  {inv.createdAt
                    ? new Date(inv.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })
                    : '—'}
                </td>
                <td className="px-5 py-3.5 text-right font-semibold text-white">
                  ₹{(inv.grandTotal ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-5 py-3.5 text-center">
                  <StatusBadge status={inv.status || 'Draft'} />
                </td>
                {showActions && (
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        id={`view-invoice-${inv._id}`}
                        onClick={(e) => { e.stopPropagation(); onView?.(inv._id); }}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-surface-400 hover:text-brand-400 transition-colors cursor-pointer"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      {onDelete && (
                        <button
                          id={`delete-invoice-${inv._id}`}
                          onClick={(e) => { e.stopPropagation(); onDelete(inv._id); }}
                          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-surface-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
