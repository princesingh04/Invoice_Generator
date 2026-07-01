/**
 * Invoice API — thin fetch wrapper for the backend REST API.
 * Base URL points to the Express server on port 5000.
 */

const BASE_URL = 'http://localhost:5000';

/* ── Helper ──────────────────────────────────────────────── */
async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'API request failed');
  }
  return res.json();
}

/* ── Dashboard ───────────────────────────────────────────── */
export const fetchDashboardStats = () => request('/api/dashboard/stats');

/* ── Invoices ────────────────────────────────────────────── */
export const fetchInvoices = ({ page = 1, limit = 10, status } = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (status) params.append('status', status);
  return request(`/api/invoices?${params}`);
};

export const fetchInvoiceById = (id) => request(`/api/invoices/${id}`);

export const createInvoice = (data) =>
  request('/api/invoices', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateInvoiceStatus = (id, status) =>
  request(`/api/invoices/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

export const deleteInvoice = (id) =>
  request(`/api/invoices/${id}`, { method: 'DELETE' });

/* ── Receipt upload (multipart — no JSON header) ─────────── */
export const uploadReceipt = async (file) => {
  const formData = new FormData();
  formData.append('receipt', file);
  const res = await fetch(`${BASE_URL}/api/upload-receipt`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Upload failed');
  }
  return res.json();
};

/* ── Shops ───────────────────────────────────────────────── */
export const fetchShops = () => request('/api/shops');
export const createShop = (data) =>
  request('/api/shops', { method: 'POST', body: JSON.stringify(data) });

/* ── Customers ───────────────────────────────────────────── */
export const fetchCustomers = () => request('/api/customers');
export const createCustomer = (data) =>
  request('/api/customers', { method: 'POST', body: JSON.stringify(data) });
