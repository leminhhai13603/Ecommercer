const express = require('express');
const { createCoupon, getAllCoupons, updateCoupon, deleteCoupon, getCoupon, validateCoupon } = require('../controller/couponCtrl');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, isAdmin, createCoupon);
router.get('/', getAllCoupons);
router.put('/:id', authMiddleware, isAdmin, updateCoupon);
router.delete('/:id', authMiddleware, isAdmin, deleteCoupon);
router.get('/:id', authMiddleware, isAdmin, getCoupon);
router.post('/validate', validateCoupon);

module.exports = router;
