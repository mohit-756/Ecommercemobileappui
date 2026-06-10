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
    discount: "13%"
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
    discount: "14%"
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
    discount: "11%"
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
    discount: "20%"
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
    discount: "18%"
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
    discount: "14%"
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
    discount: "12%"
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
