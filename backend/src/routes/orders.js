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
  cancelOrder,
  updateRiderOrderStatus,
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { adminAuditLog } from '../middleware/adminAudit.js';

const router = Router();

router.post('/', protect, createOrder);
router.post('/verify-payment', protect, verifyPayment);
router.get('/', protect, getUserOrders);

// Admin-specific routes
router.get('/all', protect, adminOnly, adminAuditLog, getAllOrders);
router.get('/admin/dashboard-stats', protect, adminOnly, adminAuditLog, getAdminDashboardStats);
router.get('/admin/analytics', protect, adminOnly, adminAuditLog, getAdminAnalytics);
router.post('/admin/create', protect, adminOnly, adminAuditLog, adminCreateOrder);

// Parametric routes
router.get('/:id', protect, getOrderById);
router.put('/:id/rate', protect, rateOrder);
router.put('/:id/cancel', protect, cancelOrder);
router.put('/:id/rider-status', protect, updateRiderOrderStatus);
router.put('/:id/status', protect, adminOnly, adminAuditLog, updateOrderStatus);
router.put('/:id/items/:itemId/packing', protect, adminOnly, adminAuditLog, updateItemPackingStatus);
router.put('/:id/refund', protect, adminOnly, adminAuditLog, addOrderRefund);
router.put('/:id/notes', protect, adminOnly, adminAuditLog, updateOrderNotes);

export default router;
