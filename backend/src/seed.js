import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import Category from './models/Category.js';
import Product from './models/Product.js';
import User from './models/User.js';

const categories = [
  { name: 'Grocery', icon: 'ShoppingCart' },
  { name: 'Dairy & Eggs', icon: 'Milk' },
  { name: 'Snacks', icon: 'Candy' },
  { name: 'Beverages', icon: 'CupSoda' },
  { name: 'Fruits & Veg', icon: 'Apple' },
  { name: 'Electronics', icon: 'Smartphone' },
  { name: 'Fashion', icon: 'Shirt' },
  { name: 'Home', icon: 'Home' },
  { name: 'Beauty', icon: 'Sparkles' },
];

const products = [
  // Grocery / Staples
  {
    name: 'Fortune Sunlite Refined Sunflower Oil',
    price: 155.00,
    originalPrice: 175.00,
    rating: 4.8,
    reviewsCount: 5400,
    images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600'],
    description: 'Fortune Sunlite Refined Sunflower Oil is a light, healthy and nutritious cooking oil. Being rich in vitamins and consisting mainly of polyunsaturated fatty acids, it makes it edible and good for cooking.',
    stock: 500,
    discount: '11%',
    tags: ['oil', 'staples', 'grocery'],
    categoryName: 'Grocery'
  },
  {
    name: 'Aashirvaad Select Sharbati Atta',
    price: 280.00,
    originalPrice: 320.00,
    rating: 4.9,
    reviewsCount: 8900,
    images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600'],
    description: 'Aashirvaad Select is a premium quality atta made from the King of Wheat – Sharbati wheat grains which are sourced from the select regions of Madhya Pradesh.',
    stock: 300,
    discount: '12%',
    tags: ['atta', 'staples', 'flour'],
    categoryName: 'Grocery'
  },
  {
    name: 'TATA Salt - Vaccum Evaporated',
    price: 28.00,
    originalPrice: 28.00,
    rating: 4.9,
    reviewsCount: 15000,
    images: ['https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=600'],
    description: 'Desh Ka Namak - Tata Salt offers a consistent salty taste. It is iodine-fortified and vacuum evaporated.',
    stock: 1000,
    discount: null,
    tags: ['salt', 'staples'],
    categoryName: 'Grocery'
  },

  // Dairy & Eggs
  {
    name: 'Amul Taaza Homogenised Toned Milk',
    price: 72.00,
    originalPrice: 72.00,
    rating: 4.7,
    reviewsCount: 12000,
    images: ['https://images.unsplash.com/photo-1563636619-e9107da5a76a?w=600'],
    description: 'Amul Taaza Toned Milk is fresh and healthy milk. It is enriched with Vitamin A and D.',
    stock: 200,
    discount: null,
    tags: ['milk', 'dairy'],
    categoryName: 'Dairy & Eggs'
  },
  {
    name: 'Amul Butter - Pasteurized',
    price: 275.00,
    originalPrice: 280.00,
    rating: 4.9,
    reviewsCount: 9500,
    images: ['https://images.unsplash.com/photo-1589923188900-85dae523342b?w=600'],
    description: 'Amul Butter is made from the finest fresh cream and has a delicious taste.',
    stock: 150,
    discount: '2%',
    tags: ['butter', 'dairy'],
    categoryName: 'Dairy & Eggs'
  },
  {
    name: 'Farm Fresh White Eggs - Pack of 6',
    price: 55.00,
    originalPrice: 65.00,
    rating: 4.6,
    reviewsCount: 4500,
    images: ['https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=600'],
    description: 'Farm fresh white eggs, high in protein and nutrition.',
    stock: 100,
    discount: '15%',
    tags: ['eggs', 'protein', 'dairy'],
    categoryName: 'Dairy & Eggs'
  },

  // Snacks & Beverages
  {
    name: 'Lay\'s Classic Salted Potato Chips',
    price: 20.00,
    originalPrice: 20.00,
    rating: 4.5,
    reviewsCount: 20000,
    images: ['https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600'],
    description: 'Lay\'s Classic Salted Potato Chips are made from best quality potatoes and seasoned with salt.',
    stock: 800,
    discount: null,
    tags: ['chips', 'snacks', 'lays'],
    categoryName: 'Snacks'
  },
  {
    name: 'Coca-Cola Soft Drink 750ml',
    price: 45.00,
    originalPrice: 50.00,
    rating: 4.7,
    reviewsCount: 15000,
    images: ['https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600'],
    description: 'Refresh yourself with the great taste of Coca-Cola.',
    stock: 400,
    discount: '10%',
    tags: ['drink', 'beverages', 'coke'],
    categoryName: 'Beverages'
  },
  {
    name: 'Cadbury Dairy Milk Silk Chocolate',
    price: 80.00,
    originalPrice: 85.00,
    rating: 4.9,
    reviewsCount: 12000,
    images: ['https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600'],
    description: 'The classic taste of Cadbury chocolates enriched with the goodness of milk.',
    stock: 600,
    discount: '6%',
    tags: ['chocolate', 'snacks', 'sweet'],
    categoryName: 'Snacks'
  },

  // Fruits & Veg
  {
    name: 'Fresh Banana (Robusta) - 1kg',
    price: 48.00,
    originalPrice: 60.00,
    rating: 4.5,
    reviewsCount: 8000,
    images: ['https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=600'],
    description: 'Fresh and ripe bananas, high in potassium and energy.',
    stock: 100,
    discount: '20%',
    tags: ['fruit', 'banana', 'fresh'],
    categoryName: 'Fruits & Veg'
  },
  {
    name: 'Onion (Pyaj) - 1kg',
    price: 35.00,
    originalPrice: 45.00,
    rating: 4.4,
    reviewsCount: 15000,
    images: ['https://images.unsplash.com/photo-1508747703725-719777637510?w=600'],
    description: 'Fresh pink onions, perfect for every kitchen.',
    stock: 200,
    discount: '22%',
    tags: ['vegetable', 'onion', 'fresh'],
    categoryName: 'Fruits & Veg'
  },

  // Electronics (Existing/Updated)
  {
    name: 'Sony WH-1000XM5 Wireless Headphones',
    price: 24990.00,
    originalPrice: 34990.00,
    rating: 4.8,
    reviewsCount: 1240,
    images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600'],
    description: 'Industry leading noise canceling with two processors and 8 microphones. Magnificent sound, engineered to perfection.',
    stock: 50,
    discount: '28%',
    tags: ['headphones', 'wireless', 'noise-cancelling', 'sony'],
    categoryName: 'Electronics'
  },
  {
    name: 'Minimalist Smart Watch Pro',
    price: 4999.00,
    originalPrice: 7999.00,
    rating: 4.6,
    reviewsCount: 856,
    images: ['https://images.unsplash.com/photo-1660844817855-3ecc7ef21f12?w=600'],
    description: 'Track your fitness, heart rate, and notifications with this sleek, minimalist smart watch.',
    stock: 100,
    discount: '37%',
    tags: ['smartwatch', 'wearable', 'fitness', 'minimalist'],
    categoryName: 'Electronics'
  },
  {
    name: 'Urban Explorer Sneakers',
    price: 2999.00,
    originalPrice: 4500.00,
    rating: 4.9,
    reviewsCount: 2100,
    images: ['https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600'],
    description: 'Comfort meets style with these versatile urban sneakers, perfect for all-day wear.',
    stock: 200,
    discount: '33%',
    tags: ['sneakers', 'shoes', 'fashion', 'urban'],
    categoryName: 'Fashion'
  },
  {
    name: 'Classic Leather Backpack',
    price: 1899.00,
    originalPrice: 2499.00,
    rating: 4.7,
    reviewsCount: 432,
    images: ['https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=600'],
    description: 'Premium handcrafted leather backpack with dedicated laptop compartment and multiple pockets.',
    stock: 75,
    discount: '24%',
    tags: ['backpack', 'leather', 'accessories', 'travel'],
    categoryName: 'Beauty'
  },
];

async function seed() {
  await connectDB();

  await Category.deleteMany({});
  await Product.deleteMany({});

  const existingGuest = await User.findOne({ email: 'guest@luminar.app' });
  if (!existingGuest) {
    await User.create({
      name: 'Guest User',
      email: 'guest@luminar.app',
      password: 'guest0000',
      role: 'user',
    });
    console.log('Created guest user');
  }

  const existingAdmin = await User.findOne({ email: 'admin@luminar.app' });
  if (!existingAdmin) {
    await User.create({
      name: 'Admin',
      email: 'admin@luminar.app',
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
      category: categoryMap[categoryName] || categoryMap['Electronics'],
      sizes: p.tags?.includes('sneakers') ? ['7', '8', '9', '10'] : undefined,
      colors: p.tags?.includes('sneakers')
        ? [{ name: 'White', hex: '#FFFFFF' }, { name: 'Black', hex: '#000000' }]
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
