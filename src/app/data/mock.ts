export const products = [
  {
    id: "1",
    name: "Premium Almonds",
    price: 15.99,
    originalPrice: 18.99,
    rating: 4.8,
    reviews: 1240,
    image: "/images/products/almonds.jpg",
    category: "Nuts",
    description: "Organic premium almonds, rich in protein and healthy fats. Perfect for snacking and recipes.",
    discount: "15%"
  },
  {
    id: "2",
    name: "Cashew Kernels",
    price: 18.99,
    originalPrice: 24.99,
    rating: 4.6,
    reviews: 856,
    image: "/images/products/cashews.webp",
    category: "Nuts",
    description: "Premium cashew kernels, freshly roasted with a buttery taste. Great source of minerals.",
    discount: "20%"
  },
  {
    id: "3",
    name: "Raisins Kishmish",
    price: 8.99,
    originalPrice: 11.99,
    rating: 4.9,
    reviews: 2100,
    image: "/images/products/raisins.webp",
    category: "Dried Fruits",
    description: "Premium golden raisins from Kishmish, naturally sweet and full of antioxidants.",
    discount: "25%"
  },
  {
    id: "4",
    name: "Dates Combo Pack",
    price: 12.99,
    originalPrice: 16.99,
    rating: 4.7,
    reviews: 432,
    image: "/images/products/dates.jpg",
    category: "Dried Fruits",
    description: "Mix of premium ajwa and medjool dates. Rich in fiber and natural sweetness.",
    discount: "24%"
  },
  {
    id: "5",
    name: "Walnuts Premium",
    price: 14.99,
    originalPrice: 19.99,
    rating: 4.5,
    reviews: 128,
    image: "/images/products/walnuts.webp",
    category: "Nuts",
    description: "Organic walnuts, excellent source of omega-3 fatty acids and brain health.",
    discount: "25%"
  },
  {
    id: "6",
    name: "Apricots Dried",
    price: 10.99,
    originalPrice: 13.99,
    rating: 4.7,
    reviews: 654,
    image: "/images/products/apricots.webp",
    category: "Dried Fruits",
    description: "Naturally dried apricots, sweet and tangy flavor. Rich in vitamins and minerals.",
    discount: "21%"
  },
  {
    id: "7",
    name: "Pistachio Premium",
    price: 16.99,
    originalPrice: 21.99,
    rating: 4.8,
    reviews: 987,
    image: "/images/products/pistachio.png",
    category: "Nuts",
    description: "Premium californian pistachios, roasted and lightly salted for perfect taste.",
    discount: "22%"
  },
  {
    id: "8",
    name: "Mixed Dry Fruits",
    price: 19.99,
    originalPrice: 26.99,
    rating: 4.9,
    reviews: 1450,
    image: "/images/products/mixed-dry-fruits.jpg",
    category: "Mixed",
    description: "Delicious mix of almonds, cashews, walnuts, and raisins in one pack.",
    discount: "26%"
  },
  {
    id: "9",
    name: "Black Raisins Munakka",
    price: 9.99,
    originalPrice: 12.99,
    rating: 4.8,
    reviews: 523,
    image: "/images/products/munakka.jpg",
    category: "Dried Fruits",
    description: "Premium black raisins (Munakka) with natural sweetness and high iron content.",
    discount: "23%"
  },
  {
    id: "10",
    name: "Pecan Nuts",
    price: 17.99,
    originalPrice: 22.99,
    rating: 4.7,
    reviews: 341,
    image: "/images/products/pecans.jpg",
    category: "Nuts",
    description: "Rich and creamy pecan nuts, perfect for baking and snacking.",
    discount: "22%"
  },
  {
    id: "11",
    name: "Cranberries Dried",
    price: 11.99,
    originalPrice: 14.99,
    rating: 4.6,
    reviews: 287,
    image: "/images/products/cranberries.jpg",
    category: "Dried Fruits",
    description: "Tart and tangy dried cranberries, rich in antioxidants and vitamins.",
    discount: "20%"
  },
  {
    id: "12",
    name: "Supreme Mix Bundle",
    price: 24.99,
    originalPrice: 34.99,
    rating: 4.9,
    reviews: 876,
    image: "/images/products/supreme-mix.jpg",
    category: "Mixed",
    description: "Ultimate premium mix: almonds, cashews, walnuts, pistachios, dates, and raisins.",
    discount: "29%"
  }
];

export const cartItems = [
  {
    product: products[0],
    quantity: 1
  },
  {
    product: products[2],
    quantity: 2
  }
];

export const categories = [
  { id: '1', name: 'All', icon: 'LayoutGrid' },
  { id: '2', name: 'Nuts', icon: 'Apple' },
  { id: '3', name: 'Dried Fruits', icon: 'Cherry' },
  { id: '4', name: 'Mixed', icon: 'ShoppingBag' },
];
