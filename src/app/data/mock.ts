export const products = [
  {
    id: "1",
    name: "Sony WH-1000XM5 Wireless Headphones",
    price: 348.00,
    originalPrice: 398.00,
    rating: 4.8,
    reviews: 1240,
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3aXJlbGVzcyUyMGhlYWRwaG9uZXN8ZW58MXx8fHwxNzgwMzg5MDc2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "Electronics",
    description: "Industry leading noise canceling with two processors and 8 microphones. Magnificent sound, engineered to perfection.",
    discount: "12%"
  },
  {
    id: "2",
    name: "Minimalist Smart Watch Pro",
    price: 199.99,
    originalPrice: 249.99,
    rating: 4.6,
    reviews: 856,
    image: "https://images.unsplash.com/photo-1660844817855-3ecc7ef21f12?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwc21hcnQlMjB3YXRjaHxlbnwxfHx8fDE3ODA0NzMwMzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "Wearables",
    description: "Track your fitness, heart rate, and notifications with this sleek, minimalist smart watch.",
    discount: "20%"
  },
  {
    id: "3",
    name: "Urban Explorer Sneakers",
    price: 125.00,
    originalPrice: 150.00,
    rating: 4.9,
    reviews: 2100,
    image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHlsaXNoJTIwc25lYWtlcnMlMjBzaG9lc3xlbnwxfHx8fDE3ODA0NzIyOTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "Fashion",
    description: "Comfort meets style with these versatile urban sneakers, perfect for all-day wear.",
    discount: "16%"
  },
  {
    id: "4",
    name: "Classic Leather Backpack",
    price: 89.99,
    originalPrice: 120.00,
    rating: 4.7,
    reviews: 432,
    image: "https://images.unsplash.com/photo-1622560480654-d96214fdc887?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWF0aGVyJTIwYmFja3BhY2slMjBiYWd8ZW58MXx8fHwxNzgwMzAxNjA4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "Accessories",
    description: "Premium handcrafted leather backpack with dedicated laptop compartment and multiple pockets.",
    discount: "25%"
  },
  {
    id: "5",
    name: "Nordic Minimalist Vase",
    price: 45.00,
    originalPrice: 45.00,
    rating: 4.5,
    reviews: 128,
    image: "https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBtaW5pbWFsJTIwaG9tZSUyMGRlY29yfGVufDF8fHx8MTc4MDQ3MzAzN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "Home",
    description: "Elegant ceramic vase for modern home decor. Adds a touch of sophistication to any room.",
    discount: null
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
  { id: '2', name: 'Electronics', icon: 'Smartphone' },
  { id: '3', name: 'Fashion', icon: 'Shirt' },
  { id: '4', name: 'Home', icon: 'Home' },
  { id: '5', name: 'Beauty', icon: 'Sparkles' },
];
