import { Router } from 'express';
import ShopProfile from '../models/ShopProfile.js';
import Customer from '../models/Customer.js';
import Invoice from '../models/Invoice.js';

const router = Router();

// ---------------------------------------------------------------------------
// POST /api/seed – One-time demo data seeder (safe to call multiple times)
// ---------------------------------------------------------------------------
router.post('/', async (_req, res) => {
  try {
    const results = { shop: null, customers: [], invoices: [] };

    // ── 1. Reuse existing Shop Profile or create one ────────
    let shop = await ShopProfile.findOne();
    if (!shop) {
      shop = await ShopProfile.create({
        businessName: 'Apex Electronics',
        logoUrl: '',
        address: '123 Tech Lane, Silicon Valley, CA 94025',
        email: 'billing@apexelectronics.com',
        phone: '+1 (555) 019-2834',
        taxId: 'TX-998877-US',
        paymentDetails: {
          bankName: 'Silicon Bank',
          accountNumber: '9876543210',
          holderName: 'Apex Electronics Inc.',
          ifscCode: 'SVB12345',
          upiId: 'apex@upi',
        },
        defaultTerms: 'Net 15: Payment is due within 15 days of invoice date.',
      });
      results.shop = shop.businessName;
    } else {
      shop = await ShopProfile.findOne();
    }

    // ── 2. Create Customers ─────────────────────────────────
    // We will append a random number to emails to ensure uniqueness
    const randSuffix = Math.floor(Math.random() * 10000);
    const customersData = [
      {
        name: 'John Doe',
        email: `john.doe${randSuffix}@gmail.com`,
        phone: '+1 (555) 014-9988',
        address: '456 Elm Street, Seattle, WA 98101',
        taxId: 'TAX-JD-982',
      },
      {
        name: 'Sarah Smith',
        email: `sarah.smith${randSuffix}@corporate.com`,
        phone: '+1 (555) 018-7766',
        address: '789 Pine Road, Boston, MA 02108',
        taxId: 'TAX-SS-112',
      },
      {
        name: 'Raj Patel',
        email: `raj.patel${randSuffix}@techstartup.io`,
        phone: '+91 98765 43210',
        address: '42 MG Road, Bengaluru, KA 560001',
        taxId: 'GSTIN-29AABCT1234',
      },
      {
        name: 'Emily Chen',
        email: `emily.chen${randSuffix}@designco.com`,
        phone: '+1 (555) 022-4455',
        address: '101 Creative Blvd, Portland, OR 97201',
        taxId: 'TAX-EC-445',
      },
    ];

    const customers = await Customer.insertMany(customersData);
    results.customers = customers.map((c) => c.name);

    // ── 3. Create Invoices ──────────────────────────────────
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;

    const invoice1 = await Invoice.create({
      shopId: shop._id,
      customerId: customers[0]._id,
      issueDate: new Date(now - 5 * DAY),
      dueDate: new Date(now + 10 * DAY),
      status: 'Paid',
      lineItems: [
        { description: 'Mechanical Keyboard (Cherry MX Blue)', quantity: 2, unitPrice: 80, taxRate: 10, total: 160 },
        { description: 'USB-C Cable (6ft, Braided)', quantity: 3, unitPrice: 15, taxRate: 10, total: 45 },
      ],
      subtotal: 205,
      taxTotal: 20.5,
      grandTotal: 225.5,
      notes: 'Thank you for your purchase!',
      terms: shop.defaultTerms,
    });

    const invoice2 = await Invoice.create({
      shopId: shop._id,
      customerId: customers[1]._id,
      issueDate: new Date(now - 20 * DAY),
      dueDate: new Date(now - 5 * DAY),
      status: 'Overdue',
      lineItems: [
        { description: 'UltraWide Monitor 34"', quantity: 1, unitPrice: 450, taxRate: 18, total: 450 },
      ],
      subtotal: 450,
      taxTotal: 81,
      grandTotal: 531,
      notes: 'Urgent payment required.',
      terms: shop.defaultTerms,
    });

    const invoice3 = await Invoice.create({
      shopId: shop._id,
      customerId: customers[2]._id,
      issueDate: new Date(),
      dueDate: new Date(now + 15 * DAY),
      status: 'Pending',
      lineItems: [
        { description: 'Wireless Gaming Mouse', quantity: 1, unitPrice: 70, taxRate: 12, total: 70 },
        { description: 'RGB Mouse Pad XL', quantity: 1, unitPrice: 35, taxRate: 12, total: 35 },
      ],
      subtotal: 105,
      taxTotal: 12.6,
      grandTotal: 117.6,
      notes: 'Initial invoice draft.',
      terms: shop.defaultTerms,
    });

    const invoice4 = await Invoice.create({
      shopId: shop._id,
      customerId: customers[3]._id,
      issueDate: new Date(now - 2 * DAY),
      dueDate: new Date(now + 28 * DAY),
      status: 'Pending',
      lineItems: [
        { description: 'UI/UX Design Consultation (8 hrs)', quantity: 8, unitPrice: 120, taxRate: 18, total: 960 },
        { description: 'Brand Identity Package', quantity: 1, unitPrice: 500, taxRate: 18, total: 500 },
      ],
      subtotal: 1460,
      taxTotal: 262.8,
      grandTotal: 1722.8,
      notes: 'Design project milestone 1 complete.',
      terms: 'Net 30: Payment is due within 30 days.',
    });

    results.invoices = [invoice1, invoice2, invoice3, invoice4].map((i) => i.invoiceNumber);

    res.status(201).json({
      message: '🎉 Demo data seeded successfully!',
      created: results,
    });
  } catch (error) {
    console.error('Error seeding data:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
