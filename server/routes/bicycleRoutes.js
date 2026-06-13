const express = require('express');
const router = express.Router();
const { getBicycles, getBicycleById, createBicycle, updateBicycle, deleteBicycle } = require('../controllers/bicycleController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getBicycles)
  .post(protect, admin, createBicycle);

router.route('/:id')
  .get(protect, getBicycleById)
  .put(protect, admin, updateBicycle)
  .delete(protect, admin, deleteBicycle);

module.exports = router;
