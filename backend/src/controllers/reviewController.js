import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Product from '../models/Product.js';

export async function getProductReviews(req, res, next) {
  try {
    const { productId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ product: productId })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments({ product: productId }),
    ]);

    const aggregation = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]);

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    aggregation.forEach((r) => { ratingDistribution[r._id] = r.count; });

    res.json({
      reviews,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      ratingDistribution,
      averageRating: total > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
        : 0,
      totalReviews: total,
    });
  } catch (error) {
    next(error);
  }
}

export async function createReview(req, res, next) {
  try {
    const { productId } = req.params;
    const { rating, title, comment, images } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const existing = await Review.findOne({ product: productId, user: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating,
      title: title || '',
      comment,
      images: images || [],
    });

    const stats = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    if (stats.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        rating: Math.round(stats[0].avgRating * 10) / 10,
        reviewsCount: stats[0].count,
      });
    }

    await review.populate('user', 'name avatar');
    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
}

export async function checkUserReview(req, res, next) {
  try {
    const { productId } = req.params;
    const review = await Review.findOne({ product: productId, user: req.user._id });
    res.json({ hasReviewed: !!review, review });
  } catch (error) {
    next(error);
  }
}
