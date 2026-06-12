export const products = [
  {
    id: "1",
    name: "Premium Walnuts",
    price: 649,
    originalPrice: 749,
    rating: 4.8,
    reviews: 2100,
    image: "https://res.cloudinary.com/dcdpve12g/image/upload/v1781063664/walnuts_ux9wue.webp",
    category: "Nuts",
    description: "Fresh and crunchy premium walnuts rich in omega-3.",
    discount: "13%",
    variants: [
      { weight: '100g', price: 149, originalPrice: 179, stock: 50 },
      { weight: '250g', price: 349, originalPrice: 399, stock: 50 },
      { weight: '500g', price: 649, originalPrice: 749, stock: 50 },
      { weight: '1kg', price: 1199, originalPrice: 1399, stock: 30 }
    ]
  },
  {
    id: "2",
    name: "Golden Raisins",
    price: 299,
    originalPrice: 349,
    rating: 4.6,
    reviews: 1800,
    image: "https://res.cloudinary.com/dcdpve12g/image/upload/v1781063663/raisins_itpnbe.webp",
    category: "Dried Fruits",
    description: "Naturally sweet golden raisins packed with nutrients.",
    discount: "14%",
    variants: [
      { weight: '100g', price: 79, originalPrice: 99, stock: 75 },
      { weight: '250g', price: 169, originalPrice: 199, stock: 75 },
      { weight: '500g', price: 299, originalPrice: 349, stock: 75 },
      { weight: '1kg', price: 549, originalPrice: 649, stock: 40 }
    ]
  },
  {
    id: "3",
    name: "Premium Pistachios",
    price: 799,
    originalPrice: 899,
    rating: 4.9,
    reviews: 3200,
    image: "https://res.cloudinary.com/dcdpve12g/image/upload/v1781063663/pistachio_hr6ujc.png",
    category: "Nuts",
    description: "Roasted premium pistachios with rich flavor and crunch.",
    discount: "11%",
    variants: [
      { weight: '100g', price: 179, originalPrice: 199, stock: 40 },
      { weight: '250g', price: 419, originalPrice: 469, stock: 40 },
      { weight: '500g', price: 799, originalPrice: 899, stock: 40 },
      { weight: '1kg', price: 1499, originalPrice: 1699, stock: 20 }
    ]
  },
  {
    id: "4",
    name: "Green Cardamom (Elaichi)",
    price: 199,
    originalPrice: 249,
    rating: 4.7,
    reviews: 1500,
    image: "https://res.cloudinary.com/dcdpve12g/image/upload/v1781063663/elachi_ddsbpr.webp",
    category: "Spices",
    description: "Aromatic green cardamom perfect for sweets and tea.",
    discount: "20%",
    variants: [
      { weight: '50g', price: 109, originalPrice: 129, stock: 60 },
      { weight: '100g', price: 199, originalPrice: 249, stock: 60 },
      { weight: '250g', price: 479, originalPrice: 599, stock: 40 },
      { weight: '500g', price: 899, originalPrice: 1099, stock: 20 }
    ]
  },
  {
    id: "5",
    name: "Premium Apricots",
    price: 449,
    originalPrice: 549,
    rating: 4.5,
    reviews: 980,
    image: "https://res.cloudinary.com/dcdpve12g/image/upload/v1781063662/apricots_bhzj9y.webp",
    category: "Dried Fruits",
    description: "Soft and naturally sweet dried apricots.",
    discount: "18%",
    variants: [
      { weight: '100g', price: 109, originalPrice: 129, stock: 45 },
      { weight: '250g', price: 249, originalPrice: 299, stock: 45 },
      { weight: '500g', price: 449, originalPrice: 549, stock: 45 },
      { weight: '1kg', price: 849, originalPrice: 999, stock: 25 }
    ]
  },
  {
    id: "6",
    name: "Whole Cashews",
    price: 599,
    originalPrice: 699,
    rating: 4.8,
    reviews: 4500,
    image: "https://res.cloudinary.com/dcdpve12g/image/upload/v1781063662/cashews_nfiqri.webp",
    category: "Nuts",
    description: "Premium quality whole cashews, rich and creamy.",
    discount: "14%",
    variants: [
      { weight: '100g', price: 139, originalPrice: 159, stock: 70 },
      { weight: '250g', price: 319, originalPrice: 369, stock: 70 },
      { weight: '500g', price: 599, originalPrice: 699, stock: 70 },
      { weight: '1kg', price: 1099, originalPrice: 1299, stock: 35 }
    ]
  },
  {
    id: "7",
    name: "Premium Anjeer",
    price: 699,
    originalPrice: 799,
    rating: 4.7,
    reviews: 1200,
    image: "https://res.cloudinary.com/dcdpve12g/image/upload/v1781063662/anjeer_bdboi8.webp",
    category: "Dried Fruits",
    description: "Naturally dried figs loaded with fiber and minerals.",
    discount: "12%",
    variants: [
      { weight: '100g', price: 169, originalPrice: 199, stock: 35 },
      { weight: '250g', price: 379, originalPrice: 429, stock: 35 },
      { weight: '500g', price: 699, originalPrice: 799, stock: 35 },
      { weight: '1kg', price: 1299, originalPrice: 1499, stock: 15 }
    ]
  }
];

export const cartItems = [
  {
    product: products[0],
    quantity: 1
  },
  {
    product: products[5],
    quantity: 2
  }
];

export const categories = [
  { id: '1', name: 'All', icon: 'LayoutGrid' },
  { id: '2', name: 'Nuts', icon: 'Apple' },
  { id: '3', name: 'Dried Fruits', icon: 'Cherry' },
  { id: '4', name: 'Spices', icon: 'Sprout' },
  { id: '5', name: 'Mixed', icon: 'ShoppingBag' },
];
