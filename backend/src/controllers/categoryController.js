import Category from '../models/Category.js';
import Product from '../models/Product.js';

export async function getCategories(req, res, next) {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    
    const counts = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const countMap = counts.reduce((acc, c) => {
      if (c._id) acc[c._id.toString()] = c.count;
      return acc;
    }, {});

    const categoriesWithCount = categories.map(cat => ({
      ...cat.toObject(),
      productCount: countMap[cat._id.toString()] || 0
    }));

    res.json(categoriesWithCount);
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req, res, next) {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    const count = await Product.countDocuments({ category: req.params.id });
    if (count > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. There are still ${count} product(s) assigned to it.` 
      });
    }
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
}
