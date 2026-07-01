import { Router } from 'express';
import ShopProfile from '../models/ShopProfile.js';

const router = Router();

// ---------------------------------------------------------------------------
// GET /api/shops – Get all shop profiles
// ---------------------------------------------------------------------------
router.get('/', async (_req, res) => {
  try {
    const shops = await ShopProfile.find().sort({ createdAt: -1 });
    res.json(shops);
  } catch (error) {
    console.error('Error fetching shops:', error);
    res.status(500).json({ message: error.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/shops – Create a new shop profile
// ---------------------------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const shop = await ShopProfile.create(req.body);
    res.status(201).json(shop);
  } catch (error) {
    console.error('Error creating shop:', error);
    res.status(500).json({ message: error.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/shops/:id – Get a single shop profile by ID
// ---------------------------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const shop = await ShopProfile.findById(req.params.id);

    if (!shop) {
      return res.status(404).json({ message: 'Shop profile not found.' });
    }

    res.json(shop);
  } catch (error) {
    console.error('Error fetching shop:', error);
    res.status(500).json({ message: error.message });
  }
});

// ---------------------------------------------------------------------------
// PUT /api/shops/:id – Update an existing shop profile
// ---------------------------------------------------------------------------
router.put('/:id', async (req, res) => {
  try {
    const shop = await ShopProfile.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!shop) {
      return res.status(404).json({ message: 'Shop profile not found.' });
    }

    res.json(shop);
  } catch (error) {
    console.error('Error updating shop:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
