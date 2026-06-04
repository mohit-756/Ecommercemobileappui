import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Category from '../models/Category.js';

export async function getDashboardStats(req, res, next) {
  try {
    const [
      totalOrders,
      totalRevenue,
      totalUsers,
      totalProducts,
      totalCategories,
      recentOrders,
      ordersByStatus,
      lowStockProducts,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      User.countDocuments({ role: 'user' }),
      Product.countDocuments({ isActive: true }),
      Category.countDocuments(),
      Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email'),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Product.find({ stock: { $lte: 5 }, isActive: true }).limit(10),
    ]);

    res.json({
      stats: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalUsers,
        totalProducts,
        totalCategories,
        lowStockCount: lowStockProducts.length,
      },
      recentOrders,
      ordersByStatus: ordersByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      lowStockProducts,
    });
  } catch (error) {
    next(error);
  }
}
