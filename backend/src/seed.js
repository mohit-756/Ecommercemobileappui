import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import Category from './models/Category.js';
import Product from './models/Product.js';
import User from './models/User.js';

const categories = [
  { name: 'Nuts', icon: 'Apple' },
  { name: 'Dried Fruits', icon: 'Cherry' },
  { name: 'Spices', icon: 'Sprout' },
  { name: 'Mixed', icon: 'ShoppingBag' },
];

const products = [
  {
    name: 'Premium Walnuts',
    price: 649,
    originalPrice: 749,
    rating: 4.8,
    reviewsCount: 2100,
    images: ['https://res.cloudinary.com/dcdpve12g/image/upload/v1781063664/walnuts_ux9wue.webp'],
    description: 'Fresh and crunchy premium walnuts rich in omega-3.',
    stock: 50,
    discount: '13%',
    tags: ['walnuts', 'nuts', 'omega-3', 'premium'],
    categoryName: 'Nuts',
    variants: [
      { weight: '100g', price: 149, originalPrice: 179, stock: 50 },
      { weight: '250g', price: 349, originalPrice: 399, stock: 50 },
      { weight: '500g', price: 649, originalPrice: 749, stock: 50 },
      { weight: '1kg', price: 1199, originalPrice: 1399, stock: 30 }
    ]
  },
  {
    name: 'Golden Raisins',
    price: 299,
    originalPrice: 349,
    rating: 4.6,
    reviewsCount: 1800,
    images: ['https://res.cloudinary.com/dcdpve12g/image/upload/v1781063663/raisins_itpnbe.webp'],
    description: 'Naturally sweet golden raisins packed with nutrients.',
    stock: 75,
    discount: '14%',
    tags: ['raisins', 'dried fruits', 'golden', 'kishmish'],
    categoryName: 'Dried Fruits',
    variants: [
      { weight: '100g', price: 79, originalPrice: 99, stock: 75 },
      { weight: '250g', price: 169, originalPrice: 199, stock: 75 },
      { weight: '500g', price: 299, originalPrice: 349, stock: 75 },
      { weight: '1kg', price: 549, originalPrice: 649, stock: 40 }
    ]
  },
  {
    name: 'Premium Pistachios',
    price: 799,
    originalPrice: 899,
    rating: 4.9,
    reviewsCount: 3200,
    images: ['https://res.cloudinary.com/dcdpve12g/image/upload/v1781063663/pistachio_hr6ujc.png'],
    description: 'Roasted premium pistachios with rich flavor and crunch.',
    stock: 40,
    discount: '11%',
    tags: ['pistachio', 'nuts', 'premium', 'roasted'],
    categoryName: 'Nuts',
    variants: [
      { weight: '100g', price: 179, originalPrice: 199, stock: 40 },
      { weight: '250g', price: 419, originalPrice: 469, stock: 40 },
      { weight: '500g', price: 799, originalPrice: 899, stock: 40 },
      { weight: '1kg', price: 1499, originalPrice: 1699, stock: 20 }
    ]
  },
  {
    name: 'Green Cardamom (Elaichi)',
    price: 199,
    originalPrice: 249,
    rating: 4.7,
    reviewsCount: 1500,
    images: ['https://res.cloudinary.com/dcdpve12g/image/upload/v1781063663/elachi_ddsbpr.webp'],
    description: 'Aromatic green cardamom perfect for sweets and tea.',
    stock: 60,
    discount: '20%',
    tags: ['cardamom', 'elaichi', 'spices', 'aromatic'],
    categoryName: 'Spices',
    variants: [
      { weight: '50g', price: 109, originalPrice: 129, stock: 60 },
      { weight: '100g', price: 199, originalPrice: 249, stock: 60 },
      { weight: '250g', price: 479, originalPrice: 599, stock: 40 },
      { weight: '500g', price: 899, originalPrice: 1099, stock: 20 }
    ]
  },
  {
    name: 'Premium Apricots',
    price: 449,
    originalPrice: 549,
    rating: 4.5,
    reviewsCount: 980,
    images: ['https://res.cloudinary.com/dcdpve12g/image/upload/v1781063662/apricots_bhzj9y.webp'],
    description: 'Soft and naturally sweet dried apricots.',
    stock: 45,
    discount: '18%',
    tags: ['apricots', 'dried fruits', 'premium', 'khumani'],
    categoryName: 'Dried Fruits',
    variants: [
      { weight: '100g', price: 109, originalPrice: 129, stock: 45 },
      { weight: '250g', price: 249, originalPrice: 299, stock: 45 },
      { weight: '500g', price: 449, originalPrice: 549, stock: 45 },
      { weight: '1kg', price: 849, originalPrice: 999, stock: 25 }
    ]
  },
  {
    name: 'Whole Cashews',
    price: 599,
    originalPrice: 699,
    rating: 4.8,
    reviewsCount: 4500,
    images: ['https://res.cloudinary.com/dcdpve12g/image/upload/v1781063662/cashews_nfiqri.webp'],
    description: 'Premium quality whole cashews, rich and creamy.',
    stock: 70,
    discount: '14%',
    tags: ['cashews', 'nuts', 'kaju', 'premium'],
    categoryName: 'Nuts',
    variants: [
      { weight: '100g', price: 139, originalPrice: 159, stock: 70 },
      { weight: '250g', price: 319, originalPrice: 369, stock: 70 },
      { weight: '500g', price: 599, originalPrice: 699, stock: 70 },
      { weight: '1kg', price: 1099, originalPrice: 1299, stock: 35 }
    ]
  },
  {
    name: 'Premium Anjeer',
    price: 699,
    originalPrice: 799,
    rating: 4.7,
    reviewsCount: 1200,
    images: ['https://res.cloudinary.com/dcdpve12g/image/upload/v1781063662/anjeer_bdboi8.webp'],
    description: 'Naturally dried figs loaded with fiber and minerals.',
    stock: 35,
    discount: '12%',
    tags: ['anjeer', 'figs', 'dried fruits', 'premium'],
    categoryName: 'Dried Fruits',
    variants: [
      { weight: '100g', price: 169, originalPrice: 199, stock: 35 },
      { weight: '250g', price: 379, originalPrice: 429, stock: 35 },
      { weight: '500g', price: 699, originalPrice: 799, stock: 35 },
      { weight: '1kg', price: 1299, originalPrice: 1499, stock: 15 }
    ]
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
