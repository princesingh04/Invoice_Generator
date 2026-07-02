import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Mail,
  Phone,
  MapPin,
  FileText,
  X,
  Search,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  fetchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../api/invoiceApi';

/* ── Blank form state ──────────────────────────────────────── */
const EMPTY_FORM = { name: '', email: '', phone: '', address: '', taxId: '' };

/* ── Toast component ───────────────────────────────────────── */
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl
        animate-scale-in backdrop-blur-xl border
        ${type === 'success'
          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
          : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
        }`}
    >
      {type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 cursor-pointer">
        <X size={14} />
      </button>
    </div>
  );
}

/* ── Input field helper ────────────────────────────────────── */
const inputClass =
  'w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-surface-200 placeholder-surface-500 focus:outline-none focus:border-brand-400 transition-colors';

function Field({ id, label, type = 'text', value, onChange, placeholder, required }) {
  const Tag = type === 'textarea' ? 'textarea' : 'input';
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-surface-400 mb-1.5">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      <Tag
        id={id}
        type={type === 'textarea' ? undefined : type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={type === 'textarea' ? 3 : undefined}
        className={`${inputClass} ${type === 'textarea' ? 'resize-none' : ''}`}
      />
    </div>
  );
}

/* ================================================================
   Customers Page
   ================================================================ */
export default function Customers() {
  const queryClient = useQueryClient();

  /* ── Local state ─────────────────────────────────────────── */
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  /* ── Queries & mutations ─────────────────────────────────── */
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: fetchCustomers,
  });

  const createMut = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      resetForm();
      showToast('Customer added successfully!');
    },
    onError: (err) => showToast(err.message || 'Failed to add customer', 'error'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      resetForm();
      showToast('Customer updated successfully!');
    },
    onError: (err) => showToast(err.message || 'Failed to update customer', 'error'),
  });

  const deleteMut = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setConfirmDeleteId(null);
      showToast('Customer deleted.');
    },
    onError: (err) => showToast(err.message || 'Failed to delete customer', 'error'),
  });

  /* ── Helpers ─────────────────────────────────────────────── */
  const resetForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (customer) => {
    setEditingId(customer._id);
    setForm({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      taxId: customer.taxId || '',
    });
    setFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateMut.mutate({ id: editingId, data: form });
    } else {
      createMut.mutate(form);
    }
  };

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  /* ── Filtered list ───────────────────────────────────────── */
  const filtered = search.trim()
    ? customers.filter((c) => {
        const q = search.toLowerCase();
        return (
          (c.name || '').toLowerCase().includes(q) ||
          (c.email || '').toLowerCase().includes(q) ||
          (c.phone || '').toLowerCase().includes(q)
        );
      })
    : customers;

  const isSaving = createMut.isPending || updateMut.isPending;

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <div className="space-y-6 animate-fade-in" id="customers-page">
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Page header ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold gradient-text" id="customers-heading">
            Customers
          </h1>
          <p className="text-sm text-surface-400 mt-1">
            Manage your customer directory
          </p>
        </div>

        <button
          id="add-customer-btn"
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl
                     bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold
                     hover:opacity-90 transition-opacity cursor-pointer
                     shadow-lg shadow-indigo-500/20"
        >
          <Plus size={18} />
          Add Customer
        </button>
      </div>

      {/* ── Slide-down form panel ─────────────────────── */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          formOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <form
          id="customer-form"
          onSubmit={handleSubmit}
          className="glass-card p-6 space-y-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              {editingId ? 'Edit Customer' : 'New Customer'}
            </h2>
            <button
              type="button"
              onClick={resetForm}
              className="text-surface-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.04] transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              id="field-name"
              label="Name"
              value={form.name}
              onChange={setField('name')}
              placeholder="Customer name"
              required
            />
            <Field
              id="field-email"
              label="Email"
              type="email"
              value={form.email}
              onChange={setField('email')}
              placeholder="email@example.com"
            />
            <Field
              id="field-phone"
              label="Phone"
              value={form.phone}
              onChange={setField('phone')}
              placeholder="+91 98765 43210"
            />
            <Field
              id="field-taxid"
              label="Tax ID / GST"
              value={form.taxId}
              onChange={setField('taxId')}
              placeholder="GSTIN / TIN"
            />
          </div>

          <Field
            id="field-address"
            label="Address"
            type="textarea"
            value={form.address}
            onChange={setField('address')}
            placeholder="Street, City, State, PIN"
          />

          <div className="flex items-center gap-3 pt-1">
            <button
              id="save-customer-btn"
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500
                         text-white font-semibold hover:opacity-90 transition-opacity cursor-pointer
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving…' : editingId ? 'Update Customer' : 'Save Customer'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl border border-white/[0.08] text-surface-400
                         hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* ── Search ─────────────────────────────────────── */}
      {customers.length > 0 && (
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
          <input
            id="customer-search"
            type="text"
            placeholder="Search customers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inputClass} pl-9`}
          />
        </div>
      )}

      {/* ── Loading state ──────────────────────────────── */}
      {isLoading && (
        <div className="glass-card p-12 text-center">
          <div
            className="inline-block w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full"
            style={{ animation: 'spin 0.8s linear infinite' }}
          />
          <p className="text-surface-400 text-sm mt-3">Loading customers…</p>
        </div>
      )}

      {/* ── Empty state ────────────────────────────────── */}
      {!isLoading && customers.length === 0 && (
        <div className="glass-card p-16 text-center" id="customers-empty">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-500/10 mb-5">
            <Users size={28} className="text-brand-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No customers yet</h3>
          <p className="text-surface-400 text-sm mb-6 max-w-md mx-auto">
            Start building your customer directory. Add your first customer to get going.
          </p>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl
                       bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold
                       hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Plus size={18} />
            Add Your First Customer
          </button>
        </div>
      )}

      {/* ── Customer list (table on desktop / cards on mobile) */}
      {!isLoading && filtered.length > 0 && (
        <div className="glass-card overflow-hidden" id="customers-list">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-400 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-400 uppercase tracking-wider">
                    Tax&nbsp;ID
                  </th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((c) => (
                  <tr
                    key={c._id}
                    className="group hover:bg-white/[0.03] transition-colors"
                  >
                    {/* Name */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-brand-300 text-sm font-bold">
                          {(c.name || '?')[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-white">{c.name}</span>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-4 space-y-1">
                      {c.email && (
                        <div className="flex items-center gap-1.5 text-surface-300">
                          <Mail size={13} className="text-surface-500" />
                          <span>{c.email}</span>
                        </div>
                      )}
                      {c.phone && (
                        <div className="flex items-center gap-1.5 text-surface-300">
                          <Phone size={13} className="text-surface-500" />
                          <span>{c.phone}</span>
                        </div>
                      )}
                      {!c.email && !c.phone && (
                        <span className="text-surface-500 italic">—</span>
                      )}
                    </td>

                    {/* Address */}
                    <td className="px-5 py-4">
                      {c.address ? (
                        <div className="flex items-start gap-1.5 text-surface-300 max-w-xs">
                          <MapPin size={13} className="text-surface-500 mt-0.5 shrink-0" />
                          <span className="line-clamp-2">{c.address}</span>
                        </div>
                      ) : (
                        <span className="text-surface-500 italic">—</span>
                      )}
                    </td>

                    {/* Tax ID */}
                    <td className="px-5 py-4">
                      {c.taxId ? (
                        <div className="flex items-center gap-1.5 text-surface-300">
                          <FileText size={13} className="text-surface-500" />
                          <span className="font-mono text-xs">{c.taxId}</span>
                        </div>
                      ) : (
                        <span className="text-surface-500 italic">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          title="Edit"
                          onClick={() => openEdit(c)}
                          className="text-surface-400 hover:text-brand-300 hover:bg-brand-500/10 rounded-lg p-2 transition-all cursor-pointer"
                        >
                          <Pencil size={15} />
                        </button>

                        {confirmDeleteId === c._id ? (
                          <div className="flex items-center gap-1 animate-scale-in">
                            <button
                              onClick={() => deleteMut.mutate(c._id)}
                              className="text-xs px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition-all cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-xs px-2 py-1 rounded-lg text-surface-400 hover:text-white transition-all cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            title="Delete"
                            onClick={() => setConfirmDeleteId(c._id)}
                            className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg p-2 transition-all cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="md:hidden divide-y divide-white/[0.04]">
            {filtered.map((c) => (
              <div key={c._id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-brand-300 text-sm font-bold">
                      {(c.name || '?')[0].toUpperCase()}
                    </div>
                    <span className="font-medium text-white">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      title="Edit"
                      onClick={() => openEdit(c)}
                      className="text-surface-400 hover:text-brand-300 hover:bg-brand-500/10 rounded-lg p-2 transition-all cursor-pointer"
                    >
                      <Pencil size={15} />
                    </button>

                    {confirmDeleteId === c._id ? (
                      <div className="flex items-center gap-1 animate-scale-in">
                        <button
                          onClick={() => deleteMut.mutate(c._id)}
                          className="text-xs px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition-all cursor-pointer"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-xs px-2 py-1 rounded-lg text-surface-400 hover:text-white transition-all cursor-pointer"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        title="Delete"
                        onClick={() => setConfirmDeleteId(c._id)}
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg p-2 transition-all cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 text-sm">
                  {c.email && (
                    <div className="flex items-center gap-2 text-surface-300">
                      <Mail size={13} className="text-surface-500" />
                      <span>{c.email}</span>
                    </div>
                  )}
                  {c.phone && (
                    <div className="flex items-center gap-2 text-surface-300">
                      <Phone size={13} className="text-surface-500" />
                      <span>{c.phone}</span>
                    </div>
                  )}
                  {c.address && (
                    <div className="flex items-center gap-2 text-surface-300">
                      <MapPin size={13} className="text-surface-500 shrink-0" />
                      <span className="line-clamp-2">{c.address}</span>
                    </div>
                  )}
                  {c.taxId && (
                    <div className="flex items-center gap-2 text-surface-300">
                      <FileText size={13} className="text-surface-500" />
                      <span className="font-mono text-xs">{c.taxId}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── No search results ──────────────────────────── */}
      {!isLoading && customers.length > 0 && filtered.length === 0 && (
        <div className="glass-card p-12 text-center">
          <Search size={24} className="text-surface-500 mx-auto mb-3" />
          <p className="text-surface-400 text-sm">
            No customers matching "<span className="text-white">{search}</span>"
          </p>
        </div>
      )}

      {/* ── Footer count ───────────────────────────────── */}
      {!isLoading && customers.length > 0 && (
        <p className="text-xs text-surface-500 text-center">
          {filtered.length} of {customers.length} customer{customers.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
