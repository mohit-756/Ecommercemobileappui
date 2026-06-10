import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import Category from './models/Category.js';
import Product from './models/Product.js';
import User from './models/User.js';

const categories = [
  { name: 'Nuts', icon: 'Apple' },
  { name: 'Dried Fruits', icon: 'Cherry' },
  { name: 'Mixed Combos', icon: 'ShoppingBag' },
  { name: 'Seeds & Grains', icon: 'Sprout' },
];

const products = [
  {
    name: 'Premium Almonds',
    price: 15.99,
    originalPrice: 18.99,
    rating: 4.8,
    reviewsCount: 1240,
    images: ['/images/products/almonds.jpg'],

    description: 'Organic premium almonds, rich in protein and healthy fats. Perfect for snacking and recipes.',
    stock: 500,
    discount: '15%',
    tags: ['almonds', 'nuts', 'premium'],
    categoryName: 'Nuts'
  },
  {
    name: 'Cashew Kernels',
    price: 18.99,
    originalPrice: 24.99,
    rating: 4.6,
    reviewsCount: 856,
    images: ['/images/products/cashews.webp'],
    description: 'Premium cashew kernels, freshly roasted with a buttery taste. Great source of minerals.',
    stock: 400,
    discount: '20%',
    tags: ['cashew', 'nuts', 'kaju'],
    categoryName: 'Nuts'
  },
  {
    name: 'Raisins Kishmish',
    price: 8.99,
    originalPrice: 11.99,
    rating: 4.9,
    reviewsCount: 2100,
    images: ['/images/products/raisins.webp'],
    description: 'Premium golden raisins from Kishmish, naturally sweet and full of antioxidants.',
    stock: 600,
    discount: '25%',
    tags: ['raisins', 'kishmish', 'dried-fruits'],
    categoryName: 'Dried Fruits'
  },
  {
    name: 'Dates Combo Pack',
    price: 12.99,
    originalPrice: 16.99,
    rating: 4.7,
    reviewsCount: 432,
    images: ['/images/products/dates.jpg'],
    description: 'Mix of premium ajwa and medjool dates. Rich in fiber and natural sweetness.',
    stock: 300,
    discount: '24%',
    tags: ['dates', 'ajwa', 'medjool'],
    categoryName: 'Dried Fruits'
  },
  {
    name: 'Walnuts Premium',
    price: 14.99,
    originalPrice: 19.99,
    rating: 4.5,
    reviewsCount: 128,
    images: ['/images/products/walnuts.webp'],
    description: 'Organic walnuts, excellent source of omega-3 fatty acids and brain health.',
    stock: 350,
    discount: '25%',
    tags: ['walnuts', 'nuts', 'omega-3'],
    categoryName: 'Nuts'
  },
  {
    name: 'Apricots Dried',
    price: 10.99,
    originalPrice: 13.99,
    rating: 4.7,
    reviewsCount: 654,
    images: ['/images/products/apricots.webp'],
    description: 'Naturally dried apricots, sweet and tangy flavor. Rich in vitamins and minerals.',
    stock: 250,
    discount: '21%',
    tags: ['apricots', 'dried-fruits', 'khumani'],
    categoryName: 'Dried Fruits'
  },
  {
    name: 'Pistachio Premium',
    price: 16.99,
    originalPrice: 21.99,
    rating: 4.8,
    reviewsCount: 987,
    images: ['/images/products/pistachio.png'],
    description: 'Premium californian pistachios, roasted and lightly salted for perfect taste.',
    stock: 450,
    discount: '22%',
    tags: ['pistachio', 'nuts', 'pista'],
    categoryName: 'Nuts'
  },
  {
    name: 'Mixed Dry Fruits',
    price: 19.99,
    originalPrice: 26.99,
    rating: 4.9,
    reviewsCount: 1450,
    images: ['https://images.unsplash.com/photo-1584649925549-6c79efd85c8f?w=600'],
    description: 'Delicious mix of almonds, cashews, walnuts, and raisins in one pack.',
    stock: 500,
    discount: '26%',
    tags: ['mixed', 'combo', 'assorted'],
    categoryName: 'Mixed Combos'
  },
  {
    name: 'Black Raisins Munakka',
    price: 9.99,
    originalPrice: 12.99,
    rating: 4.8,
    reviewsCount: 523,
    images: ['https://images.unsplash.com/photo-1584649925549-6c79efd85c8f?w=600'],
    description: 'Premium black raisins (Munakka) with natural sweetness and high iron content.',
    stock: 400,
    discount: '23%',
    tags: ['munakka', 'raisins', 'dried-fruits'],
    categoryName: 'Dried Fruits'
  },
  {
    name: 'Pecan Nuts',
    price: 17.99,
    originalPrice: 22.99,
    rating: 4.7,
    reviewsCount: 341,
    images: ['https://images.unsplash.com/photo-1599599810694-a5d2f0be27d6?w=600'],
    description: 'Rich and creamy pecan nuts, perfect for baking and snacking.',
    stock: 200,
    discount: '22%',
    tags: ['pecan', 'nuts', 'baking'],
    categoryName: 'Nuts'
  },
  {
    name: 'Cranberries Dried',
    price: 11.99,
    originalPrice: 14.99,
    rating: 4.6,
    reviewsCount: 287,
    images: ['https://images.unsplash.com/photo-1584649925549-6c79efd85c8f?w=600'],
    description: 'Tart and tangy dried cranberries, rich in antioxidants and vitamins.',
    stock: 300,
    discount: '20%',
    tags: ['cranberries', 'dried-fruits', 'antioxidants'],
    categoryName: 'Dried Fruits'
  },
  {
    name: 'Supreme Mix Bundle',
    price: 24.99,
    originalPrice: 34.99,
    rating: 4.9,
    reviewsCount: 876,
    images: ['https://images.unsplash.com/photo-1585518419759-87c1dcf13189?w=600'],
    description: 'Ultimate premium mix: almonds, cashews, walnuts, pistachios, dates, and raisins.',
    stock: 250,
    discount: '29%',
    tags: ['supreme', 'mixed', 'premium', 'combo'],
    categoryName: 'Mixed Combos'
  },
];

async function seed() {
  await connectDB();

  await Category.deleteMany({});
  await Product.deleteMany({});

  const existingGuest = await User.findOne({ email: 'guest@dryfruit.com' });
  if (!existingGuest) {
    await User.create({
      name: 'Guest User',
      email: 'guest@dryfruit.com',
      password: 'guest0000',
      role: 'user',
    });
    console.log('Created guest user');
  }

  const existingAdmin = await User.findOne({ email: 'admin@dryfruit.com' });
  if (!existingAdmin) {
    await User.create({
      name: 'Admin',
      email: 'admin@dryfruit.com',
      password: 'admin0000',
      role: 'admin',
    });
    console.log('Created admin user');
  }

  const createdCategories = await Category.insertMany(categories);
  console.log(`Seeded ${createdCategories.length} categories`);

  const categoryMap = {};
  createdCategories.forEach(cat => {
    categoryMap[cat.name] = cat._id;
  });

  const productData = products.map((p) => {
    const { categoryName, ...rest } = p;
    return {
      ...rest,
      category: categoryMap[categoryName] || createdCategories[0]._id,
    };
  });

  const createdProducts = await Product.insertMany(productData);
  console.log(`Seeded ${createdProducts.length} products`);

  console.log('Seed complete!');
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
