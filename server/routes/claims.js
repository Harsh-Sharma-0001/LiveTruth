import express from 'express';
import Claim from '../models/Claim.js';

const router = express.Router();

// Get all claims
router.get('/', async (req, res) => {
  try {
    const claims = await Claim.find().sort({ timestamp: -1 }).limit(100);
    res.json(claims);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get claim by ID
router.get('/:id', async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }
    res.json(claim);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new claim
router.post('/', async (req, res) => {
  try {
    const claim = new Claim(req.body);
    await claim.save();
    res.status(201).json(claim);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const total = await Claim.countDocuments();
    const trueCount = await Claim.countDocuments({ verdict: 'true' });
    const falseCount = await Claim.countDocuments({ verdict: 'false' });
    const misleadingCount = await Claim.countDocuments({ verdict: 'misleading' });
    
    res.json({
      total,
      true: trueCount,
      false: falseCount,
      misleading: misleadingCount,
      unverified: total - trueCount - falseCount - misleadingCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
