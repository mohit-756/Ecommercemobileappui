import { Router } from 'express';
import {
  createOrder,
  verifyPayment,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getAdminDashboardStats,
  getAdminAnalytics,
  updateItemPackingStatus,
  addOrderRefund,
  updateOrderNotes,
  adminCreateOrder,
  rateOrder,
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.post('/', protect, createOrder);
router.post('/verify-payment', protect, verifyPayment);
router.get('/', protect, getUserOrders);

// Admin-specific routes
router.get('/all', protect, adminOnly, getAllOrders);
router.get('/admin/dashboard-stats', protect, adminOnly, getAdminDashboardStats);
router.get('/admin/analytics', protect, adminOnly, getAdminAnalytics);
router.post('/admin/create', protect, adminOnly, adminCreateOrder);

// Parametric routes
router.get('/:id', protect, getOrderById);
router.put('/:id/rate', protect, rateOrder);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);
router.put('/:id/items/:itemId/packing', protect, adminOnly, updateItemPackingStatus);
router.put('/:id/refund', protect, adminOnly, addOrderRefund);
router.put('/:id/notes', protect, adminOnly, updateOrderNotes);

export default router;
