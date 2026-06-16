import dotenv from 'dotenv';
import path from 'path';
import Razorpay from 'razorpay';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

console.log('Testing Razorpay with:');
console.log('Key ID:', key_id);
console.log('Key Secret:', key_secret ? '***' : 'missing');

if (!key_id || !key_secret) {
  console.error('Missing Razorpay credentials in .env!');
  process.exit(1);
}

const rzp = new Razorpay({
  key_id,
  key_secret,
});

async function run() {
  try {
    console.log('Sending request to Razorpay...');
    const order = await rzp.orders.create({
      amount: 100, // 1 INR
      currency: 'INR',
      receipt: 'receipt_test_' + Date.now(),
    });
    console.log('Success!', order);
  } catch (err) {
    console.error('Error occurred:', err);
  }
}

run();
