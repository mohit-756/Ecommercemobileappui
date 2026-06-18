import { productService } from './productService';
import { orderService } from './orderService';
import { products as mockProducts } from '../data/mock';

interface ProductSummary {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  stock: number;
  category: string;
  description?: string;
  variants?: { weight: string; price: number; originalPrice?: number; stock: number }[];
}

interface OrderInfo {
  _id: string;
  status: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  shippingAddress?: { fullName: string; city: string };
  createdAt: string;
  tracking?: { status: string; label: string; timestamp: string }[];
}

type Intent =
  | 'greeting'
  | 'product_availability'
  | 'product_price'
  | 'stock_status'
  | 'delivery'
  | 'order_tracking'
  | 'store_policies'
  | 'payment_methods'
  | 'contact'
  | 'help'
  | 'unrelated';

const INTENT_KEYWORDS: Record<Exclude<Intent, 'greeting' | 'unrelated'>, string[]> = {
  product_availability: ['available', 'product', 'range', 'collection', 'categories', 'what do you have', 'show me', 'list your', 'tell me about your'],
  product_price: ['price', 'cost', 'rate', 'rupee', 'how much', 'pricing', 'cheap', 'expensive', 'budget', 'afford'],
  stock_status: ['stock', 'in stock', 'out of stock', 'quantity', 'how many', 'left', 'inventory', 'available'],
  delivery: ['delivery', 'shipping', 'ship', 'dispatch', 'timeline', 'when will', 'reach', 'arrive', 'courier', 'free delivery', 'shipping charge', 'delivery charge', 'deliver', 'shipped', 'estimated', 'eta'],
  order_tracking: ['track', 'tracking', 'my order', 'order status', 'where is my', 'order id', 'shipment', 'order placed', 'order number'],
  store_policies: ['return', 'refund', 'cancel', 'cancellation', 'exchange', 'replacement', 'policy', 'warranty', 'guarantee', 'terms'],
  payment_methods: ['payment', 'pay', 'upi', 'card', 'credit', 'debit', 'cod', 'cash on delivery', 'net banking', 'razorpay', 'wallet'],
  contact: ['contact', 'phone', 'call', 'email', 'reach', 'support', 'customer service', 'helpline', 'whatsapp'],
  help: ['help', 'what can you do', 'how can you help', 'capabilities', 'what do you do', 'guide'],
};

const GREETING_KEYWORDS = ['hi', 'hello', 'hey', 'howdy', 'good morning', 'good afternoon', 'good evening'];

const PRODUCT_ALIASES: Record<string, string[]> = {
  'Premium Walnuts': ['walnut', 'walnuts', 'akhrot', 'akrot'],
  'Golden Raisins': ['raisin', 'raisins', 'kishmish', 'kismis', 'dried grape', 'munakka'],
  'Premium Pistachios': ['pistachio', 'pistachios', 'pista'],
  'Green Cardamom (Elaichi)': ['cardamom', 'elaichi', 'elachi', 'green cardamom', 'elaichi'],
  'Premium Apricots': ['apricot', 'apricots', 'khubani', 'dried apricot', 'jaradalu'],
  'Whole Cashews': ['cashew', 'cashews', 'kaju', 'kaju'],
  'Premium Anjeer': ['anjeer', 'fig', 'figs', 'dried fig'],
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  packed: 'Packed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  received: 'Received',
  not_packed: 'Not Packed',
  processed: 'Processed',
  completed: 'Completed',
};

let productsCache: ProductSummary[] | null = null;

function normalize(str: string): string {
  return str.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
}

async function fetchProducts(): Promise<ProductSummary[]> {
  if (productsCache) return productsCache;
  try {
    const res = await productService.getProducts({ limit: 100 });
    const data = res.data?.products || res.data || [];
    productsCache = (Array.isArray(data) ? data : []).map((p: any) => ({
      id: p._id || p.id || '',
      name: p.name || '',
      price: p.price || 0,
      originalPrice: p.originalPrice,
      stock: p.stock ?? 0,
      category: typeof p.category === 'object' && p.category ? p.category.name : (p.category || ''),
      description: p.description,
      variants: p.variants?.map((v: any) => ({
        weight: v.weight,
        price: v.price,
        originalPrice: v.originalPrice,
        stock: v.stock,
      })),
    }));
  } catch {
    productsCache = mockProducts.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice,
      stock: p.variants?.[0]?.stock ?? 0,
      category: p.category,
      description: p.description,
      variants: p.variants?.map(v => ({ weight: v.weight, price: v.price, originalPrice: v.originalPrice, stock: v.stock })),
    }));
  }
  return productsCache!;
}

function findProduct(query: string): { product: ProductSummary; score: number } | null {
  const normalized = normalize(query);
  const words = normalized.split(/\s+/).filter(Boolean);

  let best: { product: ProductSummary; score: number } | null = null;

  for (const product of productsCache || []) {
    const productName = normalize(product.name);
    const productWords = productName.split(/\s+/).filter(Boolean);
    const aliases = PRODUCT_ALIASES[product.name]?.map(a => normalize(a)) || [];

    let score = 0;

    for (const word of words) {
      if (word.length < 2) continue;

      if (productName.includes(word)) {
        score += word.length;
      }

      for (const pw of productWords) {
        if (pw.includes(word) || word.includes(pw)) {
          score += Math.min(pw.length, word.length);
        }
      }

      for (const alias of aliases) {
        if (alias.includes(word) || word.includes(alias)) {
          score += Math.min(alias.length, word.length) * 2;
        }
      }
    }

    if (score > 0 && (!best || score > best.score)) {
      best = { product, score };
    }
  }

  if (best && best.score >= 3) return best;
  return null;
}

function detectIntent(query: string, matchedProduct: ProductSummary | null): Intent {
  const normalized = normalize(query);

  const normalizedWords = normalized.split(/\s+/).filter(Boolean);
  if (normalizedWords.length <= 3 && GREETING_KEYWORDS.some(k => normalized.includes(k))) {
    return 'greeting';
  }

  const isAskingAboutProduct = matchedProduct !== null;

  const counts: Partial<Record<Intent, number>> = {};

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    counts[intent as Intent] = keywords.filter(kw => normalized.includes(kw)).length;
  }

  const maxIntent = (Object.entries(counts) as [Intent, number][]).sort((a, b) => b[1] - a[1])[0];

  if (!maxIntent || maxIntent[1] === 0) {
    if (isAskingAboutProduct) return 'product_availability';
    if (normalized.includes('unavailable')) return 'unrelated';
    return 'unrelated';
  }

  if (maxIntent[0] === 'stock_status' && normalized.includes('available') && !normalized.includes('stock')) {
    return 'product_availability';
  }

  return maxIntent[0];
}

function formatPrice(price: number): string {
  return `₹${price.toLocaleString('en-IN')}`;
}

function formatProductSummary(product: ProductSummary): string {
  let response = `**${product.name}**`;
  if (product.description) response += `\n${product.description}`;
  response += `\nPrice: ${formatPrice(product.price)}`;
  if (product.originalPrice) response += ` (was ${formatPrice(product.originalPrice)})`;
  response += `\nCategory: ${product.category}`;
  response += `\nStock: ${product.stock > 0 ? product.stock + ' units available' : 'Currently out of stock'}`;
  return response;
}

function formatVariants(product: ProductSummary): string {
  if (!product.variants?.length) return '';
  const lines = product.variants.map(v => {
    const stockInfo = v.stock > 0 ? `In Stock (${v.stock})` : 'Out of Stock';
    const priceInfo = v.originalPrice
      ? `${formatPrice(v.price)} (was ${formatPrice(v.originalPrice)})`
      : formatPrice(v.price);
    return `  • ${v.weight} — ${priceInfo} — ${stockInfo}`;
  });
  return `\nAvailable Variants:\n${lines.join('\n')}`;
}

function formatProductAvailability(matched: ProductSummary | null, allProducts: ProductSummary[]): string {
  if (matched) {
    let response = `Yes, we have **${matched.name}** available!`;
    response += `\n\n${formatProductSummary(matched)}`;
    response += formatVariants(matched);
    return response;
  }

  const categories = [...new Set(allProducts.map(p => p.category))];
  let response = `Here are the products we currently offer:\n\n`;
  for (const cat of categories) {
    const catProducts = allProducts.filter(p => p.category === cat);
    response += `**${cat}:**\n`;
    catProducts.forEach(p => {
      response += `  • ${p.name} — from ${formatPrice(Math.min(...(p.variants?.map(v => v.price) || [p.price])))}`;
      response += p.stock > 0 ? ` ✓ In Stock` : ` ❌ Out of Stock`;
      response += `\n`;
    });
    response += `\n`;
  }
  response += `Would you like pricing, stock details, or more info on any product?`;
  return response;
}

function formatProductPrice(matched: ProductSummary | null, allProducts: ProductSummary[]): string {
  if (matched) {
    let response = `**${matched.name} — Price Details**\n\n`;
    response += `Starting from ${formatPrice(Math.min(...(matched.variants?.map(v => v.price) || [matched.price])))}`;
    if (matched.originalPrice) {
      const discount = matched.originalPrice > 0
        ? Math.round((1 - matched.price / matched.originalPrice) * 100)
        : 0;
      if (discount > 0) response += ` (${discount}% off)`;
    }
    response += formatVariants(matched);
    return response;
  }

  let response = `Which product would you like pricing for? Here are our products:\n\n`;
  allProducts.forEach(p => {
    const minPrice = Math.min(...(p.variants?.map(v => v.price) || [p.price]));
    response += `  • **${p.name}** — from ${formatPrice(minPrice)}\n`;
  });
  response += `\nJust tell me the product name (e.g., "price of walnuts").`;
  return response;
}

function formatStockStatus(matched: ProductSummary | null): string {
  if (matched) {
    let response = `**${matched.name} — Stock Status**\n\n`;
    if (matched.variants?.length) {
      const totalStock = matched.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
      response += `Overall: ${totalStock > 0 ? `${totalStock} units in stock` : 'Currently out of stock'}\n\n`;
      response += `Variant-wise:\n`;
      matched.variants.forEach(v => {
        const status = v.stock > 10 ? 'In Stock' : v.stock > 0 ? 'Low Stock' : 'Out of Stock';
        response += `  • ${v.weight} — ${v.stock} units — ${status}\n`;
      });
    } else {
      response += matched.stock > 0 ? `In Stock (${matched.stock} units)` : 'Currently out of stock';
    }
    return response;
  }
  return `Which product would you like to check stock for? Just tell me the name (e.g., "stock of cashews").`;
}

function formatDeliveryInfo(): string {
  return `**Delivery Information**\n\n`
    + `📦 **Shipping Charges:**\n`
    + `  • Free delivery on orders above ₹500\n`
    + `  • Flat ₹40 shipping fee for orders below ₹500\n\n`
    + `🚚 **Delivery Timelines:**\n`
    + `  • Metro Cities: 1–3 business days\n`
    + `  • Rest of India: 3–5 business days\n`
    + `  • Hyperlocal (select areas): Same day / next day\n\n`
    + `📋 **Process:**\n`
    + `  • Orders processed within 24 hours\n`
    + `  • All products vacuum-sealed for freshness\n`
    + `  • Tracking link sent via SMS and email once shipped\n\n`
    + `📍 We ship across India. For pincode-specific inquiries, please visit our Shipping Info page.`;
}

function formatPolicies(): string {
  return `**Store Policies**\n\n`
    + `**Cancellation:**\n`
    + `  • Cancel before dispatch for full refund\n`
    + `  • Cannot cancel once shipped\n\n`
    + `**Damaged / Incorrect Items:**\n`
    + `  • Notify within 24 hours of delivery\n`
    + `  • Please provide photos of packaging and product\n\n`
    + `**Returns:**\n`
    + `  • Opened packets cannot be returned (hygiene reasons)\n`
    + `  • Approved returns must be in original packaging\n\n`
    + `**Refunds:**\n`
    + `  • Initiated immediately after approval\n`
    + `  • Reflects in 5–7 business days (bank dependent)\n\n`
    + `For full details, visit our Refund Policy page.`;
}

function formatPaymentMethods(): string {
  return `**Payment Methods**\n\n`
    + `We accept the following payment options:\n`
    + `  • 💳 Credit / Debit Cards (Visa, Mastercard, RuPay)\n`
    + `  • 📱 UPI (Google Pay, PhonePe, Paytm)\n`
    + `  • 🏦 Net Banking\n`
    + `  • 💵 Cash on Delivery (COD)\n`
    + `  • 🔵 Razorpay (all major wallets)\n\n`
    + `All payments are processed securely. Your payment details are encrypted.`;
}

function formatContactInfo(): string {
  return `**Contact Us**\n\n`
    + `📞 Phone: Available on the Support page\n`
    + `📧 Email: Available on the Support page\n`
    + `💬 Live Chat: You're already here!\n\n`
    + `Our support team is available during business hours. We typically reply within a few hours.`;
}

function formatHelp(): string {
  return `**How I Can Help You**\n\n`
    + `I'm your Dry Fruits Store assistant! Here's what I can do:\n\n`
    + `  🔍 **Product Availability** — Ask what products we have\n`
    + `  💰 **Pricing** — Ask about prices (e.g., "price of walnuts")\n`
    + `  📦 **Stock Status** — Check if something is in stock\n`
    + `  🚚 **Delivery Info** — Timelines, charges, coverage\n`
    + `  📋 **Order Tracking** — Check your order status (need order ID)\n`
    + `  📜 **Store Policies** — Returns, refunds, cancellations\n`
    + `  💳 **Payment Methods** — How to pay\n`
    + `  📞 **Contact Info** — How to reach us\n\n`
    + `Try asking me something like:\n`
    + `  • "What products do you have?"\n`
    + `  • "How much are pistachios?"\n`
    + `  • "Is cardamom in stock?"\n`
    + `  • "What are your delivery timelines?"\n`
    + `  • "Track my order"`;
}

async function fetchOrderById(orderId: string): Promise<OrderInfo | null> {
  try {
    const res = await orderService.getOrderById(orderId);
    return res.data || null;
  } catch {
    return null;
  }
}

function formatOrderDetails(order: OrderInfo): string {
  const statusLabel = ORDER_STATUS_LABELS[order.status] || order.status;
  const itemList = order.items.map(i => `  • ${i.name} x${i.quantity} — ${formatPrice(i.price)}`).join('\n');
  const date = new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  let response = `**Order #${order._id.slice(-8).toUpperCase()}**\n\n`
    + `📅 Placed on: ${date}\n`
    + `📊 Status: **${statusLabel}**\n`
    + `📍 Delivery: ${order.shippingAddress?.city || 'N/A'}\n\n`
    + `**Items:**\n${itemList}\n\n`
    + `**Total: ${formatPrice(order.total)}**\n`;

  if (order.tracking && order.tracking.length > 0) {
    response += `\n**Tracking Updates:**\n`;
    const recent = order.tracking.slice(-3);
    recent.forEach(t => {
      const tDate = new Date(t.timestamp).toLocaleDateString('en-IN');
      response += `  • ${t.label} — ${tDate}\n`;
    });
  }

  response += `\nFor real-time tracking, visit the Orders page in your account.`;
  return response;
}

function formatUnrelated(): string {
  return `I can only assist with Dry Fruits Store products, pricing, stock availability, delivery information, and order-related questions.`;
}

const ORDER_ID_REGEX = /[a-f0-9]{24}/i;

async function handleOrderTracking(query: string): Promise<string> {
  const orderIdMatch = query.match(ORDER_ID_REGEX);
  const token = localStorage.getItem('token');

  if (orderIdMatch) {
    const orderId = orderIdMatch[0];
    const order = await fetchOrderById(orderId);
    if (order) {
      return formatOrderDetails(order);
    }
    if (token) {
      return `I couldn't find an order with that ID. Please check the order ID and try again, or visit the Orders page to see all your orders.`;
    }
    return `I couldn't find that order. Please make sure you're logged in and the order ID is correct. You can check your orders on the Orders page.`;
  }

  if (!token) {
    return `To track your order, please log in to your account and visit the Orders page. If you have an order ID, you can share it with me and I'll look it up.`;
  }

  try {
    const res = await orderService.getUserOrders({ limit: 3 });
    const orders = res.data?.orders || res.data || [];
    const list = Array.isArray(orders) ? orders : [];

    if (list.length === 0) {
      return `You don't have any orders yet. Start shopping to place your first order! If you have an order ID, share it with me and I'll track it.`;
    }

    let response = `Here are your recent orders:\n\n`;
    list.slice(0, 3).forEach((o: any) => {
      const label = ORDER_STATUS_LABELS[o.status] || o.status;
      const date = new Date(o.createdAt).toLocaleDateString('en-IN');
      response += `  • **Order #${(o._id || '').slice(-8).toUpperCase()}** — ${label} — ${date}\n`;
    });
    response += `\nFor full details, visit the Orders page. Or share a specific order ID for live tracking.`;
    return response;
  } catch {
    return `I couldn't fetch your orders right now. Please visit the Orders page in your account to track your orders.`;
  }
}

export const chatbotEngine = {
  async sendMessage(userMessage: string): Promise<string> {
    const products = await fetchProducts();

    const matched = findProduct(userMessage);
    const intent = detectIntent(userMessage, matched ? matched.product : null);

    switch (intent) {
      case 'greeting':
        return `Hello! Welcome to Dry Fruits Store. 👋\n\nI can help you with product information, pricing, stock availability, delivery details, and order tracking. What would you like to know?`;

      case 'product_availability':
        return formatProductAvailability(matched?.product || null, products);

      case 'product_price':
        return formatProductPrice(matched?.product || null, products);

      case 'stock_status':
        return formatStockStatus(matched?.product || null);

      case 'delivery':
        return formatDeliveryInfo();

      case 'order_tracking':
        return handleOrderTracking(userMessage);

      case 'store_policies':
        return formatPolicies();

      case 'payment_methods':
        return formatPaymentMethods();

      case 'contact':
        return formatContactInfo();

      case 'help':
        return formatHelp();

      default:
        return formatUnrelated();
    }
  },

  clearCache() {
    productsCache = null;
  },
};
