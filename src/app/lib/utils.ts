import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number) {
  if (price % 1 === 0) {
    return `₹${price}`;
  }
  return `₹${price.toFixed(2)}`;
}

export function normalizeProduct(p: any) {
  if (!p) return null;
  return {
    ...p,
    id: p._id || p.id,
    image: p.images?.[0] || p.image || '',
    images: p.images || (p.image ? [p.image] : []),
    reviews: p.reviewsCount ?? p.reviews ?? 0,
    category: typeof p.category === 'object' && p.category ? p.category.name : p.category || '',
    originalPrice: p.originalPrice ?? p.price,
  };
}

export function saveRecentSearch(query: string) {
  if (!query || !query.trim()) return;
  const term = query.trim();
  try {
    const saved = localStorage.getItem('recent_searches');
    const prev = saved ? JSON.parse(saved) : ['Almonds', 'Cashews', 'Dates', 'Walnuts', 'Raisins'];
    const filtered = prev.filter((x: string) => x.toLowerCase() !== term.toLowerCase());
    const updated = [term, ...filtered].slice(0, 8);
    localStorage.setItem('recent_searches', JSON.stringify(updated));
    window.dispatchEvent(new Event('recent-searches-updated'));
  } catch (e) {
    console.error('Failed to save recent search:', e);
  }
}

export function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  e.currentTarget.src = '/images/products/cashews.webp';
}
