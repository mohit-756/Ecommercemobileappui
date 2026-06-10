import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number) {
  return `₹${price.toFixed(2)}`;
}

export function normalizeProduct(p: any) {
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
