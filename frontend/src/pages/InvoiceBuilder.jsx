import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Save,
  Send,
  Upload,
  Sparkles,
  CalendarDays,
} from 'lucide-react';
import LineItemRow from '../components/LineItemRow';
import UploadModal from '../components/UploadModal';
import { createInvoice, fetchShops, fetchCustomers } from '../api/invoiceApi';

const EMPTY_ITEM = { description: '', quantity: '', unitPrice: '', taxRate: '' };

/**
 * InvoiceBuilder — full invoice creation form with AI extraction support.
 *
 * @param {{ onCreated: (id: string) => void }} props
 */
export default function InvoiceBuilder({ onCreated }) {
  const queryClient = useQueryClient();
  const [uploadOpen, setUploadOpen] = useState(false);

  // ── Form state ─────────────────────────────────────────
  const [shopId, setShopId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [lineItems, setLineItems] = useState([{ ...EMPTY_ITEM }]);

  // ── Queries ────────────────────────────────────────────
  const { data: shops = [] } = useQuery({ queryKey: ['shops'], queryFn: fetchShops });
  const { data: customers = [] } = useQuery({ queryKey: ['customers'], queryFn: fetchCustomers });

  // Auto-select if only one shop
  useState(() => {
    if (shops.length === 1 && !shopId) setShopId(shops[0]._id);
  });

  // ── Mutations ──────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: createInvoice,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      onCreated?.(data._id || data.id);
    },
  });

  // ── Line-item handlers ─────────────────────────────────
  const handleItemChange = useCallback((index, field, value) => {
    setLineItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  }, []);

  const addRow = () => setLineItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  const removeRow = (index) =>
    setLineItems((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));

  // ── Auto-calc totals ───────────────────────────────────
  const { subTotal, taxTotal, grandTotal } = useMemo(() => {
    let sub = 0;
    let tax = 0;
    for (const item of lineItems) {
      const qty   = Number(item.quantity)  || 0;
      const price = Number(item.unitPrice) || 0;
      const rate  = Number(item.taxRate)   || 0;
      const base  = qty * price;
      sub += base;
      tax += base * (rate / 100);
    }
    return { subTotal: sub, taxTotal: tax, grandTotal: sub + tax };
  }, [lineItems]);

  const fmtCurrency = (v) => `₹${v.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  // ── AI extraction callback ─────────────────────────────
  const handleExtracted = (response) => {
    // The backend returns { message, fileUrl, extractedData }
    const data = response.extractedData;
    if (!data) return;

    if (data.customer?.name) setCustomerName(data.customer.name);
    if (data.customer?.email) setCustomerEmail(data.customer.email);
    if (data.customer?.phone) setCustomerPhone(data.customer.phone);
    if (data.customer?.address) setCustomerAddress(data.customer.address);
    if (data.dueDate) setDueDate(data.dueDate?.slice?.(0, 10) || data.dueDate);
    if (data.issueDate) setIssueDate(data.issueDate?.slice?.(0, 10) || data.issueDate);
    
    if (Array.isArray(data.lineItems) && data.lineItems.length) {
      setLineItems(
        data.lineItems.map((li) => ({
          description: li.description || '',
          quantity: li.quantity ?? '',
          unitPrice: li.unitPrice ?? li.unit_price ?? '',
          taxRate: li.taxRate ?? li.tax_rate ?? '',
        })),
      );
    }
  };

  // ── Submit ─────────────────────────────────────────────
  const handleSubmit = (status) => {
    createMutation.mutate({
      shopId: shopId || undefined,
      customerName,
      lineItems: lineItems.map((li) => ({
        description: li.description,
        quantity: Number(li.quantity) || 0,
        unitPrice: Number(li.unitPrice) || 0,
        taxRate: Number(li.taxRate) || 0,
      })),
      dueDate: dueDate || undefined,
      notes,
      terms,
      status,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in" id="invoice-builder-page">
      {/* ── Header ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Create Invoice</h1>
          <p className="text-sm text-surface-400 mt-1">
            Build a new invoice manually or scan a receipt with AI
          </p>
        </div>
        <button
          id="upload-receipt-btn"
          onClick={() => setUploadOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                     bg-gradient-to-r from-violet-500 to-fuchsia-500
                     hover:from-violet-400 hover:to-fuchsia-400
                     text-white shadow-lg shadow-violet-500/20
                     transition-all duration-200 cursor-pointer"
        >
          <Sparkles size={16} />
          Scan Receipt with AI
        </button>
      </div>

      {/* ── Form body ─────────────────────────────────── */}
      <div className="glass-card p-6 sm:p-8 space-y-8">
        {/* Shop + Dates row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Shop selector */}
          <div>
            <label htmlFor="shop-select" className="block text-xs font-semibold text-surface-400 uppercase tracking-wider mb-1.5">
              Shop / Business
            </label>
            <select
              id="shop-select"
              value={shopId}
              onChange={(e) => setShopId(e.target.value)}
              className="w-full"
            >
              <option value="">Select shop…</option>
              {(Array.isArray(shops) ? shops : []).map((s) => (
                <option key={s._id} value={s._id}>{s.businessName}</option>
              ))}
            </select>
          </div>

          {/* Issue date */}
          <div>
            <label htmlFor="issue-date" className="block text-xs font-semibold text-surface-400 uppercase tracking-wider mb-1.5">
              Issue Date
            </label>
            <div className="relative">
              <CalendarDays size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500 pointer-events-none" />
              <input
                id="issue-date"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full pl-9"
              />
            </div>
          </div>

          {/* Due date */}
          <div>
            <label htmlFor="due-date" className="block text-xs font-semibold text-surface-400 uppercase tracking-wider mb-1.5">
              Due Date
            </label>
            <div className="relative">
              <CalendarDays size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500 pointer-events-none" />
              <input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full pl-9"
              />
            </div>
          </div>
        </div>

        {/* Customer section */}
        <div>
          <h3 className="text-sm font-semibold text-surface-300 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-brand-500/20 flex items-center justify-center text-brand-400 text-xs font-bold">C</span>
            Customer Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input id="cust-name"    type="text" placeholder="Customer name"  value={customerName}    onChange={(e) => setCustomerName(e.target.value)}    className="w-full" />
            <input id="cust-email"   type="email" placeholder="Email address" value={customerEmail}   onChange={(e) => setCustomerEmail(e.target.value)}   className="w-full" />
            <input id="cust-phone"   type="tel"  placeholder="Phone number"   value={customerPhone}   onChange={(e) => setCustomerPhone(e.target.value)}   className="w-full" />
            <input id="cust-address" type="text" placeholder="Address"        value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} className="w-full" />
          </div>
        </div>

        {/* ── Line Items ──────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-surface-300 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-violet-500/20 flex items-center justify-center text-violet-400 text-xs font-bold">L</span>
              Line Items
            </h3>
            <button
              id="add-line-item-btn"
              type="button"
              onClick={addRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                         text-brand-400 hover:bg-brand-500/10 border border-brand-500/20
                         transition-colors cursor-pointer"
            >
              <Plus size={14} />
              Add Row
            </button>
          </div>

          {/* Column headers (desktop) */}
          <div className="hidden sm:grid grid-cols-12 gap-3 text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2 px-0.5">
            <div className="col-span-5">Description</div>
            <div className="col-span-2 text-right">Qty</div>
            <div className="col-span-2 text-right">Unit Price</div>
            <div className="col-span-1 text-right">Tax %</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          <div className="space-y-3">
            {lineItems.map((item, idx) => (
              <LineItemRow
                key={idx}
                item={item}
                index={idx}
                onChange={handleItemChange}
                onRemove={removeRow}
              />
            ))}
          </div>
        </div>

        {/* ── Totals ──────────────────────────────────── */}
        <div className="flex justify-end">
          <div className="w-full max-w-xs p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] space-y-2 text-sm">
            <div className="flex justify-between text-surface-400">
              <span>Subtotal</span>
              <span className="tabular-nums font-medium">{fmtCurrency(subTotal)}</span>
            </div>
            <div className="flex justify-between text-surface-400">
              <span>Tax</span>
              <span className="tabular-nums font-medium">{fmtCurrency(taxTotal)}</span>
            </div>
            <div className="border-t border-white/[0.08] pt-2 flex justify-between text-white font-bold text-base">
              <span>Grand Total</span>
              <span className="tabular-nums">{fmtCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* ── Notes & Terms ───────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="invoice-notes" className="block text-xs font-semibold text-surface-400 uppercase tracking-wider mb-1.5">
              Notes
            </label>
            <textarea
              id="invoice-notes"
              rows={3}
              placeholder="Any notes for the customer…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full resize-none"
            />
          </div>
          <div>
            <label htmlFor="invoice-terms" className="block text-xs font-semibold text-surface-400 uppercase tracking-wider mb-1.5">
              Terms & Conditions
            </label>
            <textarea
              id="invoice-terms"
              rows={3}
              placeholder="Payment terms, late fees, etc…"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className="w-full resize-none"
            />
          </div>
        </div>

        {/* ── Submit buttons ──────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
          <button
            id="save-draft-btn"
            type="button"
            onClick={() => handleSubmit('Draft')}
            disabled={createMutation.isPending}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                       text-surface-300 border border-white/10 hover:bg-white/[0.04]
                       disabled:opacity-40 transition-all cursor-pointer"
          >
            <Save size={16} />
            Save as Draft
          </button>
          <button
            id="create-invoice-btn"
            type="button"
            onClick={() => handleSubmit('Pending')}
            disabled={createMutation.isPending || !customerName.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                       text-white bg-gradient-to-r from-indigo-500 to-violet-500
                       hover:from-indigo-400 hover:to-violet-400
                       shadow-lg shadow-indigo-500/20
                       disabled:opacity-40 disabled:cursor-not-allowed
                       transition-all cursor-pointer"
          >
            <Send size={16} />
            Create Invoice
          </button>
        </div>

        {/* Mutation error */}
        {createMutation.isError && (
          <p className="text-sm text-rose-400 text-right">
            {createMutation.error?.message || 'Failed to create invoice.'}
          </p>
        )}
      </div>

      {/* ── Upload Modal ──────────────────────────────── */}
      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onExtracted={handleExtracted}
      />
    </div>
  );
}
