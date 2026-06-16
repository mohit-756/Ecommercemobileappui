import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from './src/models/Product.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function run() {
  await mongoose.connect(MONGODB_URI);
  try {
    const products = await Product.find().select('name price stock variants');
    console.log(`Found ${products.length} products in DB:`);
    for (const p of products) {
      console.log({
        id: p._id,
        name: p.name,
        price: p.price,
        stock: p.stock,
        variants: p.variants
      });
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
