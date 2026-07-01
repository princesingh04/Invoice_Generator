import { Router } from 'express';
import Customer from '../models/Customer.js';

const router = Router();

// ---------------------------------------------------------------------------
// GET /api/customers – Get all customers
// ---------------------------------------------------------------------------
router.get('/', async (_req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: error.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/customers – Create a new customer
// ---------------------------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ message: error.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/customers/:id – Get a single customer by ID
// ---------------------------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
