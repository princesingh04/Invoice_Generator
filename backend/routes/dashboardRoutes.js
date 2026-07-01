import { Router } from 'express';
import Invoice from '../models/Invoice.js';

const router = Router();

// ---------------------------------------------------------------------------
// GET /api/dashboard/stats – Aggregated dashboard statistics
// ---------------------------------------------------------------------------
router.get('/stats', async (_req, res) => {
  try {
    // Run all aggregation queries in parallel for performance
    const [
      totalRevenueResult,
      pendingCount,
      overdueCount,
      totalInvoices,
      recentInvoices,
    ] = await Promise.all([
      // Sum of grandTotal for all Paid invoices
      Invoice.aggregate([
        { $match: { status: 'Paid' } },
        { $group: { _id: null, total: { $sum: '$grandTotal' } } },
      ]),
      // Count of Pending invoices
      Invoice.countDocuments({ status: 'Pending' }),
      // Count of Overdue invoices
      Invoice.countDocuments({ status: 'Overdue' }),
      // Total number of invoices
      Invoice.countDocuments(),
      // Last 10 invoices, fully populated
      Invoice.find()
        .populate('shopId')
        .populate('customerId')
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    const totalRevenue =
      totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

    res.json({
      totalRevenue,
      pendingCount,
      overdueCount,
      totalInvoices,
      recentInvoices,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
