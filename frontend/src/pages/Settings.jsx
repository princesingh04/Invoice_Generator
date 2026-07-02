import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  CreditCard,
  FileText,
  Save,
  Mail,
  Phone,
  MapPin,
  Image,
  Hash,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { fetchShops, createShop, updateShop } from '../api/invoiceApi';

/* ── Reusable input classes ─────────────────────────────── */
const INPUT_CLS =
  'w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-surface-200 placeholder-surface-500 focus:outline-none focus:border-brand-400 transition-colors';
const LABEL_CLS =
  'block text-xs font-semibold text-surface-400 uppercase tracking-wider mb-1.5';
const BTN_PRIMARY =
  'inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';

/* ── Initial empty form state ───────────────────────────── */
const EMPTY_FORM = {
  businessName: '',
  logoUrl: '',
  address: '',
  email: '',
  phone: '',
  taxId: '',
  paymentDetails: {
    bankName: '',
    accountNumber: '',
    holderName: '',
    ifscCode: '',
    upiId: '',
  },
  defaultTerms: '',
};

/**
 * Settings — Shop / Business Profile management.
 * Fetches existing shops; if one exists it pre-fills the form for editing,
 * otherwise it shows an empty creation form.
 */
export default function Settings() {
  const queryClient = useQueryClient();

  // ── Query ──────────────────────────────────────────────
  const {
    data: shops = [],
    isLoading,
    isError,
    error: fetchError,
  } = useQuery({ queryKey: ['shops'], queryFn: fetchShops });

  const existingShop = shops.length > 0 ? shops[0] : null;
  const isEditMode = !!existingShop;

  // ── Form state ─────────────────────────────────────────
  const [form, setForm] = useState(EMPTY_FORM);
  const [toast, setToast] = useState(null); // { type, message }

  // Populate form when shop data arrives
  useEffect(() => {
    if (existingShop) {
      setForm({
        businessName: existingShop.businessName || '',
        logoUrl: existingShop.logoUrl || '',
        address: existingShop.address || '',
        email: existingShop.email || '',
        phone: existingShop.phone || '',
        taxId: existingShop.taxId || '',
        paymentDetails: {
          bankName: existingShop.paymentDetails?.bankName || '',
          accountNumber: existingShop.paymentDetails?.accountNumber || '',
          holderName: existingShop.paymentDetails?.holderName || '',
          ifscCode: existingShop.paymentDetails?.ifscCode || '',
          upiId: existingShop.paymentDetails?.upiId || '',
        },
        defaultTerms: existingShop.defaultTerms || '',
      });
    }
  }, [existingShop]);

  // ── Helpers ────────────────────────────────────────────
  const updateField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updatePayment = useCallback((field, value) => {
    setForm((prev) => ({
      ...prev,
      paymentDetails: { ...prev.paymentDetails, [field]: value },
    }));
  }, []);

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // ── Mutations ──────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: createShop,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      showToast('success', 'Shop profile created successfully!');
    },
    onError: (err) => {
      showToast('error', err.message || 'Failed to create shop profile.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateShop(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      showToast('success', 'Shop profile updated successfully!');
    },
    onError: (err) => {
      showToast('error', err.message || 'Failed to update shop profile.');
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // ── Submit ─────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.businessName.trim()) {
      showToast('error', 'Business name is required.');
      return;
    }

    const payload = { ...form };

    if (isEditMode) {
      updateMutation.mutate({ id: existingShop._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  // ── Loading state ──────────────────────────────────────
  if (isLoading) {
    return (
      <div className="animate-fade-in flex items-center justify-center py-32" id="settings-page">
        <div className="text-center space-y-3">
          <Loader2
            size={28}
            className="mx-auto text-brand-400"
            style={{ animation: 'spin 0.8s linear infinite' }}
          />
          <p className="text-surface-400 text-sm">Loading settings…</p>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────
  if (isError) {
    return (
      <div className="animate-fade-in" id="settings-page">
        <div className="glass-card p-8 text-center max-w-lg mx-auto">
          <AlertCircle size={32} className="mx-auto text-rose-400 mb-3" />
          <p className="text-rose-400 text-sm">
            {fetchError?.message || 'Failed to load shop profile.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in" id="settings-page">
      {/* ── Toast notification ─────────────────────────── */}
      {toast && (
        <div
          id="settings-toast"
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl animate-fade-in ${
            toast.type === 'success'
              ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/20 border border-rose-500/30 text-rose-300'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* ── Page header ────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-surface-400 mt-1">
          Manage your shop &amp; business profile
        </p>
      </div>

      {/* ── Form ───────────────────────────────────────── */}
      <form onSubmit={handleSubmit} id="settings-form">
        <div className="glass-card p-6 sm:p-8 space-y-8">

          {/* ── Section: Business Info ──────────────────── */}
          <section id="business-info-section">
            <h3 className="text-sm font-semibold text-surface-300 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-400">
                <Building2 size={15} />
              </span>
              Business Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Business Name */}
              <div className="sm:col-span-2">
                <label htmlFor="businessName" className={LABEL_CLS}>
                  Business Name <span className="text-rose-400">*</span>
                </label>
                <input
                  id="businessName"
                  type="text"
                  required
                  placeholder="e.g. Acme Corp"
                  value={form.businessName}
                  onChange={(e) => updateField('businessName', e.target.value)}
                  className={INPUT_CLS}
                />
              </div>

              {/* Logo URL */}
              <div className="sm:col-span-2">
                <label htmlFor="logoUrl" className={LABEL_CLS}>
                  <span className="inline-flex items-center gap-1.5">
                    <Image size={12} /> Logo URL
                  </span>
                </label>
                <input
                  id="logoUrl"
                  type="text"
                  placeholder="https://example.com/logo.png"
                  value={form.logoUrl}
                  onChange={(e) => updateField('logoUrl', e.target.value)}
                  className={INPUT_CLS}
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className={LABEL_CLS}>
                  <span className="inline-flex items-center gap-1.5">
                    <Mail size={12} /> Email
                  </span>
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="billing@acme.com"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className={INPUT_CLS}
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className={LABEL_CLS}>
                  <span className="inline-flex items-center gap-1.5">
                    <Phone size={12} /> Phone
                  </span>
                </label>
                <input
                  id="phone"
                  type="text"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className={INPUT_CLS}
                />
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label htmlFor="address" className={LABEL_CLS}>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={12} /> Address
                  </span>
                </label>
                <textarea
                  id="address"
                  rows={2}
                  placeholder="Full business address"
                  value={form.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  className={`${INPUT_CLS} resize-none`}
                />
              </div>

              {/* Tax ID */}
              <div className="sm:col-span-2">
                <label htmlFor="taxId" className={LABEL_CLS}>
                  <span className="inline-flex items-center gap-1.5">
                    <Hash size={12} /> Tax ID / GST Number
                  </span>
                </label>
                <input
                  id="taxId"
                  type="text"
                  placeholder="e.g. 29AABCU9603R1ZM"
                  value={form.taxId}
                  onChange={(e) => updateField('taxId', e.target.value)}
                  className={INPUT_CLS}
                />
              </div>
            </div>
          </section>

          {/* ── Divider ────────────────────────────────── */}
          <div className="border-t border-white/[0.06]" />

          {/* ── Section: Payment Details ────────────────── */}
          <section id="payment-details-section">
            <h3 className="text-sm font-semibold text-surface-300 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CreditCard size={15} />
              </span>
              Payment Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Bank Name */}
              <div>
                <label htmlFor="bankName" className={LABEL_CLS}>
                  Bank Name
                </label>
                <input
                  id="bankName"
                  type="text"
                  placeholder="e.g. State Bank of India"
                  value={form.paymentDetails.bankName}
                  onChange={(e) => updatePayment('bankName', e.target.value)}
                  className={INPUT_CLS}
                />
              </div>

              {/* Account Number */}
              <div>
                <label htmlFor="accountNumber" className={LABEL_CLS}>
                  Account Number
                </label>
                <input
                  id="accountNumber"
                  type="text"
                  placeholder="1234567890"
                  value={form.paymentDetails.accountNumber}
                  onChange={(e) => updatePayment('accountNumber', e.target.value)}
                  className={INPUT_CLS}
                />
              </div>

              {/* Holder Name */}
              <div>
                <label htmlFor="holderName" className={LABEL_CLS}>
                  Account Holder Name
                </label>
                <input
                  id="holderName"
                  type="text"
                  placeholder="As per bank records"
                  value={form.paymentDetails.holderName}
                  onChange={(e) => updatePayment('holderName', e.target.value)}
                  className={INPUT_CLS}
                />
              </div>

              {/* IFSC Code */}
              <div>
                <label htmlFor="ifscCode" className={LABEL_CLS}>
                  IFSC Code
                </label>
                <input
                  id="ifscCode"
                  type="text"
                  placeholder="e.g. SBIN0001234"
                  value={form.paymentDetails.ifscCode}
                  onChange={(e) => updatePayment('ifscCode', e.target.value)}
                  className={INPUT_CLS}
                />
              </div>

              {/* UPI ID */}
              <div className="sm:col-span-2">
                <label htmlFor="upiId" className={LABEL_CLS}>
                  UPI ID
                </label>
                <input
                  id="upiId"
                  type="text"
                  placeholder="business@upi"
                  value={form.paymentDetails.upiId}
                  onChange={(e) => updatePayment('upiId', e.target.value)}
                  className={INPUT_CLS}
                />
              </div>
            </div>
          </section>

          {/* ── Divider ────────────────────────────────── */}
          <div className="border-t border-white/[0.06]" />

          {/* ── Section: Default Terms ──────────────────── */}
          <section id="default-terms-section">
            <h3 className="text-sm font-semibold text-surface-300 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400">
                <FileText size={15} />
              </span>
              Default Terms &amp; Conditions
            </h3>

            <div>
              <label htmlFor="defaultTerms" className={LABEL_CLS}>
                Terms
              </label>
              <textarea
                id="defaultTerms"
                rows={4}
                placeholder="Payment is due within 30 days of the invoice date…"
                value={form.defaultTerms}
                onChange={(e) => updateField('defaultTerms', e.target.value)}
                className={`${INPUT_CLS} resize-none`}
              />
            </div>
          </section>

          {/* ── Submit button ──────────────────────────── */}
          <div className="flex justify-end pt-2">
            <button
              id="settings-submit-btn"
              type="submit"
              disabled={isSaving}
              className={BTN_PRIMARY}
            >
              {isSaving ? (
                <Loader2
                  size={16}
                  style={{ animation: 'spin 0.8s linear infinite' }}
                />
              ) : (
                <Save size={16} />
              )}
              {isEditMode ? 'Update Profile' : 'Create Shop Profile'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
