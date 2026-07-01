import { Router } from 'express';
import Invoice from '../models/Invoice.js';
import Customer from '../models/Customer.js';
import ShopProfile from '../models/ShopProfile.js';

const router = Router();

// ---------------------------------------------------------------------------
// POST /api/invoices – Create a new invoice
// ---------------------------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const { shopId, customerId, customerName, lineItems, dueDate, notes, terms, status } = req.body;

    // --- Resolve or create customer (find-or-create pattern) ---
    let resolvedCustomerId = customerId;

    if (!resolvedCustomerId && customerName) {
      // Try to find an existing customer by name, or create a new one
      let customer = await Customer.findOne({ name: customerName.trim() });
      if (!customer) {
        customer = await Customer.create({ name: customerName.trim() });
      }
      resolvedCustomerId = customer._id;
    }

    if (!resolvedCustomerId) {
      return res.status(400).json({ message: 'Customer ID or customer name is required.' });
    }

    // --- Resolve or create default shop profile ---
    let resolvedShopId = shopId;

    if (!resolvedShopId) {
      // Use the first available shop profile, or create a default one
      let shop = await ShopProfile.findOne();
      if (!shop) {
        shop = await ShopProfile.create({ businessName: 'My Business' });
      }
      resolvedShopId = shop._id;
    }

    // --- Calculate totals from line items ---
    const processedItems = (lineItems || []).map((item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unitPrice) || 0;
      const taxRate = Number(item.taxRate) || 0;
      const lineTotal = qty * price * (1 + taxRate / 100);
      return {
        description: item.description,
        quantity: qty,
        unitPrice: price,
        taxRate,
        total: Math.round(lineTotal * 100) / 100,
      };
    });

    const subtotal = processedItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const taxTotal = processedItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice * (item.taxRate / 100),
      0
    );
    const grandTotal = processedItems.reduce((sum, item) => sum + item.total, 0);

    // --- Create the invoice document ---
    const invoice = await Invoice.create({
      shopId: resolvedShopId,
      customerId: resolvedCustomerId,
      lineItems: processedItems,
      dueDate,
      notes: notes || '',
      terms: terms || '',
      status: status || 'Draft',
      subtotal: Math.round(subtotal * 100) / 100,
      taxTotal: Math.round(taxTotal * 100) / 100,
      grandTotal: Math.round(grandTotal * 100) / 100,
    });

    // Populate refs before returning
    const populated = await Invoice.findById(invoice._id)
      .populate('shopId')
      .populate('customerId');

    res.status(201).json(populated);
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ message: error.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/invoices – Fetch all invoices (paginated, filterable by status)
// ---------------------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    // Optional status filter
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [invoices, total] = await Promise.all([
      Invoice.find(filter)
        .populate('shopId')
        .populate('customerId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Invoice.countDocuments(filter),
    ]);

    res.json({
      invoices,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalCount: total,
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ message: error.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/invoices/:id – Fetch single invoice by ID
// ---------------------------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('shopId')
      .populate('customerId');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found.' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ message: error.message });
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/invoices/:id/status – Update invoice status only
// ---------------------------------------------------------------------------
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required.' });
    }

    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('shopId')
      .populate('customerId');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found.' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Error updating invoice status:', error);
    res.status(500).json({ message: error.message });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/invoices/:id – Delete an invoice
// ---------------------------------------------------------------------------
router.delete('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found.' });
    }

    res.json({ message: 'Invoice deleted successfully.' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
