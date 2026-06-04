import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import Category from './models/Category.js';
import Product from './models/Product.js';
import User from './models/User.js';

const categories = [
  { name: 'Electronics', icon: 'Smartphone' },
  { name: 'Fashion', icon: 'Shirt' },
  { name: 'Home', icon: 'Home' },
  { name: 'Beauty', icon: 'Sparkles' },
  { name: 'Wearables', icon: 'Watch' },
  { name: 'Accessories', icon: 'Backpack' },
];

const products = [
  {
    name: 'Sony WH-1000XM5 Wireless Headphones',
    price: 348.00,
    originalPrice: 398.00,
    rating: 4.8,
    reviewsCount: 1240,
    images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600'],
    description: 'Industry leading noise canceling with two processors and 8 microphones. Magnificent sound, engineered to perfection.',
    stock: 50,
    discount: '12%',
    tags: ['headphones', 'wireless', 'noise-cancelling', 'sony'],
  },
  {
    name: 'Minimalist Smart Watch Pro',
    price: 199.99,
    originalPrice: 249.99,
    rating: 4.6,
    reviewsCount: 856,
    images: ['https://images.unsplash.com/photo-1660844817855-3ecc7ef21f12?w=600'],
    description: 'Track your fitness, heart rate, and notifications with this sleek, minimalist smart watch.',
    stock: 100,
    discount: '20%',
    tags: ['smartwatch', 'wearable', 'fitness', 'minimalist'],
  },
  {
    name: 'Urban Explorer Sneakers',
    price: 125.00,
    originalPrice: 150.00,
    rating: 4.9,
    reviewsCount: 2100,
    images: ['https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600'],
    description: 'Comfort meets style with these versatile urban sneakers, perfect for all-day wear.',
    stock: 200,
    discount: '16%',
    tags: ['sneakers', 'shoes', 'fashion', 'urban'],
  },
  {
    name: 'Classic Leather Backpack',
    price: 89.99,
    originalPrice: 120.00,
    rating: 4.7,
    reviewsCount: 432,
    images: ['https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=600'],
    description: 'Premium handcrafted leather backpack with dedicated laptop compartment and multiple pockets.',
    stock: 75,
    discount: '25%',
    tags: ['backpack', 'leather', 'accessories', 'travel'],
  },
  {
    name: 'Nordic Minimalist Vase',
    price: 45.00,
    originalPrice: 45.00,
    rating: 4.5,
    reviewsCount: 128,
    images: ['https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?w=600'],
    description: 'Elegant ceramic vase for modern home decor. Adds a touch of sophistication to any room.',
    stock: 30,
    discount: null,
    tags: ['vase', 'home-decor', 'ceramic', 'minimalist'],
  },
  {
    name: 'Wireless Bluetooth Earbuds',
    price: 79.99,
    originalPrice: 99.99,
    rating: 4.4,
    reviewsCount: 678,
    images: ['https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=600'],
    description: 'Crystal clear audio with deep bass. IPX5 waterproof, 24hr battery life.',
    stock: 150,
    discount: '20%',
    tags: ['earbuds', 'wireless', 'audio', 'bluetooth'],
  },
];

async function seed() {
  await connectDB();

  await Category.deleteMany({});
  await Product.deleteMany({});

  const createdCategories = await Category.insertMany(categories);
  console.log(`Seeded ${createdCategories.length} categories`);

  const categoryMap = {};
  createdCategories.forEach(cat => {
    categoryMap[cat.name] = cat._id;
  });

  const productData = products.map((p, i) => {
    const categoryNames = ['Electronics', 'Wearables', 'Fashion', 'Accessories', 'Home', 'Electronics'];
    return {
      ...p,
      category: categoryMap[categoryNames[i]],
      sizes: p.tags?.includes('sneakers') ? ['US 7', 'US 8', 'US 9', 'US 10', 'US 11'] : undefined,
      colors: p.tags?.includes('sneakers')
        ? [{ name: 'White', hex: '#FFFFFF' }, { name: 'Black', hex: '#000000' }, { name: 'Navy', hex: '#000080' }]
        : undefined,
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
