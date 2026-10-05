import express from 'express';
import { getProduct } from '../services/productsProvider.js';
import { evaluateProductSafety } from '../services/safetyEvaluator.js';
import { UserConstraintsModel } from '../db/models/userConstraints.js';
import { ProductModel } from '../db/models/product.js';

const router = express.Router();

// Lookup Barcode & evaluate safety
router.get('/lookup/:barcode', async (req, res, next) => {
  const { barcode } = req.params;
  const userId = req.user?.id || 'temp-user-id';

  try {
    const product = await getProduct(barcode);
    if (!product) {
      return res.status(404).json({
        error: { message: `Product with barcode ${barcode} not found` },
      });
    }

    // Retrieve user constraints if available
    const constraints = (await UserConstraintsModel.getByUserId(userId)) || {};

    // Evaluate safety
    const safety = evaluateProductSafety(product, constraints);

    res.json({
      product,
      safety,
    });
  } catch (error) {
    next(error);
  }
});

// Save Scan History
router.post('/history', async (req, res, next) => {
  const userId = req.body.userId || req.user?.id || 'temp-user-id';
  const { barcode, productName, verdict = 'safe' } = req.body;

  if (!barcode) {
    return res.status(400).json({ error: { message: 'barcode is required' } });
  }

  try {
    let name = productName;
    if (!name) {
      const product = await getProduct(barcode);
      name = product?.name || 'Unknown Product';
    }

    const scan = await ProductModel.recordScan(userId, barcode, name, verdict);
    res.status(201).json(scan);
  } catch (error) {
    next(error);
  }
});

// Get Scan History
router.get('/history', async (req, res, next) => {
  const userId = req.query.userId || req.user?.id || 'temp-user-id';
  const limit = parseInt(req.query.limit, 10) || 50;

  try {
    const history = await ProductModel.getScanHistory(userId, limit);
    res.json(history);
  } catch (error) {
    next(error);
  }
});

export default router;
