const STORAGE_KEY = 'recently_viewed';
const MAX_ITEMS = 12;

export interface RecentlyViewedItem {
  id: string;
  _id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  category: string;
}

export const recentlyViewedService = {
  get(): RecentlyViewedItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  add(product: any): void {
    const item: RecentlyViewedItem = {
      id: product._id || product.id,
      _id: product._id || product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || product.image || '',
      rating: product.rating || 0,
      category: typeof product.category === 'object' ? product.category?.name : product.category || '',
    };

    let list = this.get();
    list = list.filter((p) => p.id !== item.id);
    list.unshift(item);
    if (list.length > MAX_ITEMS) list = list.slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};
