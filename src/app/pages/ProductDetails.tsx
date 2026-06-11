import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ChevronLeft, Heart, Share2, Star, Minus, Plus, ShoppingBag, Check } from 'lucide-react';
import { products as mockProducts } from '../data/mock';
import useEmblaCarousel from 'embla-carousel-react';
import { recentlyViewedService } from '../services/recentlyViewedService';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { cn, normalizeProduct, formatPrice } from '../lib/utils';
import { motion } from 'motion/react';
import { hapticService } from '../services/hapticService';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { Skeleton } from '../components/ui/skeleton';
import { ProductCard } from '../components/ProductCard';
import { wishlistService } from '../services/wishlistService';
import { productService } from '../services/productService';
import { reviewService } from '../services/reviewService';

export function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [emblaRef] = useEmblaCarousel();
  const [quantity, setQuantity] = useState(1);
  const [isWishlist, setIsWishlist] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<any>(null);

  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewStats, setReviewStats] = useState<any>(null);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  const [copied, setCopied] = useState(false);

  function checkWishlistStatus(prod: any) {
    const saved = localStorage.getItem('user_wishlist');
    if (saved) {
      const wl = JSON.parse(saved);
      setIsWishlist(wl.some((p: any) => (p.id || p._id) === (prod.id || prod._id)));
    }
    if (user) {
      wishlistService.getWishlist().then((res) => {
        const serverIds = (res.data || []).map((p: any) => p._id || p.id);
        setIsWishlist(serverIds.includes(prod.id || prod._id));
      }).catch(() => {});
    }
  }

  useEffect(() => {
    if (!id) return;

    async function loadProductDetails() {
      setLoading(true);
      setReviewsLoading(true);
      try {
        const [prodRes, reviewsRes] = await Promise.all([
          productService.getProductById(id),
          reviewService.getProductReviews(id).catch(() => ({ data: [] })),
        ]);
        const prod = normalizeProduct(prodRes.data);
        setProduct(prod);
        if (prod.sizes?.length > 0) setSelectedSize(prod.sizes[0]);
        if (prod.colors?.length > 0) setSelectedColor(prod.colors[0]);
        checkWishlistStatus(prod);
        recentlyViewedService.add(prod);
        setReviews(reviewsRes.data || []);

        try {
          const catId = prodRes.data.category?._id || prodRes.data.category;
          const relatedRes = await productService.getProducts({ category: catId, limit: 5 });
          const normalizedRelated = (relatedRes.data.products || [])
            .filter((p: any) => (p._id || p.id) !== id)
            .map(normalizeProduct)
            .slice(0, 4);
          setRelatedProducts(normalizedRelated);
        } catch {
          setRelatedProducts([]);
        }
      } catch (err) {
        console.warn('Product not found in backend or backend down, trying mock data:', err);
        const mockProd = mockProducts.find((p: any) => p.id === id);
        if (mockProd) {
          const prod = normalizeProduct(mockProd);
          setProduct(prod);
          if (prod.sizes?.length > 0) setSelectedSize(prod.sizes[0]);
          if (prod.colors?.length > 0) setSelectedColor(prod.colors[0]);
          checkWishlistStatus(prod);
          recentlyViewedService.add(mockProd);
          setRelatedProducts(mockProducts.filter((p: any) => p.id !== id).map(normalizeProduct).slice(0, 4));
        } else {
          toast.error('Product not found');
          navigate('/home');
        }
      } finally {
        setLoading(false);
        setReviewsLoading(false);
      }
    }

    loadProductDetails();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-full bg-white flex flex-col pb-24 relative">
        <div className="h-[400px] bg-gray-100">
          <Skeleton className="w-full h-full rounded-none" />
        </div>
        <div className="px-6 pt-6 flex-1 bg-white -mt-4 rounded-t-3xl relative z-20 space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-64" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="h-6 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const handleAddToCart = async () => {
    try {
      await hapticService.impact();
      await addToCart(product.id, product, quantity);
      toast.success(`Added ${quantity} to cart`);
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (Capacitor.isNativePlatform()) {
      await Share.share({
        title: product.name,
        text: `Check out this ${product.name} on DryFruit Hub!`,
        url,
        dialogTitle: 'Share with friends',
      });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleWishlist = async () => {
    hapticService.impact();
    const saved = localStorage.getItem('user_wishlist');
    let wishlist = saved ? JSON.parse(saved) : [];

    if (isWishlist) {
      wishlist = wishlist.filter((p: any) => (p.id || p._id) !== (product.id || product._id));
      toast.success('Removed from wishlist');
      if (user) {
        wishlistService.removeFromWishlist(product.id || product._id).catch(() => {});
      }
    } else {
      wishlist.push(product);
      toast.success('Added to wishlist');
      if (user) {
        wishlistService.addToWishlist(product.id || product._id).catch(() => {});
      }
    }

    localStorage.setItem('user_wishlist', JSON.stringify(wishlist));
    setIsWishlist(!isWishlist);
    window.dispatchEvent(new Event('wishlist-updated'));
  };

  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) {
      toast.error('Please write a review');
      return;
    }
    if (!user) {
      toast.error('Please login to review');
      return;
    }
    setReviewSubmitting(true);
    try {
      const res = await reviewService.createReview(product.id || product._id, {
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });
      setReviews(prev => [res.data, ...prev]);
      setHasReviewed(true);
      setShowReviewForm(false);
      setReviewComment('');
      setReviewTitle('');
      setReviewRating(5);
      toast.success('Review submitted!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="min-h-full bg-white flex flex-col pb-24 lg:pb-6 relative lg:max-w-full lg:mx-0 lg:my-0 lg:rounded-none lg:shadow-none lg:border-none overflow-hidden">
      <div className="absolute top-0 w-full z-10 flex justify-between items-center px-6 pt-12 lg:pt-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-900 shadow-sm"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-900 shadow-sm"
          >
            {copied ? <Check size={20} className="text-green-500" /> : <Share2 size={20} />}
          </button>
        </div>
      </div>

      <div className="lg:max-w-[1536px] lg:mx-auto lg:px-6 lg:py-6 w-full flex-1">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start mb-8">
          {/* Left Column: Image gallery */}
          <div className="h-[400px] lg:h-[600px] bg-gray-100 relative overflow-hidden lg:rounded-3xl" ref={emblaRef}>
            <div className="flex h-full">
              {product.images.length > 0 ? (
                product.images.map((img: string, idx: number) => (
                  <div key={idx} className="flex-[0_0_100%] h-full relative">
                    <img
                      src={img}
                      alt={`${product.name} - View ${idx + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))
              ) : (
                <div className="flex-[0_0_100%] h-full flex items-center justify-center text-gray-400">
                  No image available
                </div>
              )}
            </div>
            <div className="absolute bottom-6 w-full flex justify-center gap-2">
              {product.images.map((_: any, idx: number) => (
                <div key={idx} className={cn("w-1.5 h-1.5 rounded-full", idx === 0 ? "w-6 bg-blue-600" : "bg-white/60")} />
              ))}
            </div>
          </div>

          {/* Right Column: Product details */}
          <div className="px-6 pt-6 pb-4 flex-1 flex flex-col bg-white -mt-4 lg:mt-0 rounded-t-3xl lg:rounded-none relative z-20 overflow-y-auto">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-blue-600 font-medium text-sm mb-1">{product.category}</p>
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">{product.name}</h1>
              </div>
              <button
                onClick={handleToggleWishlist}
                className="mt-1 flex-shrink-0"
              >
                <Heart size={24} className={cn("transition-colors", isWishlist ? "text-red-500 fill-red-500" : "text-gray-400")} />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                <Star size={16} className="text-amber-500 fill-amber-500" />
                <span className="font-bold text-amber-700">{product.rating}</span>
              </div>
              <span className="text-gray-500 text-sm underline cursor-pointer" onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}>
                {product.reviews} review{product.reviews !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
            </div>

            {product.colors && product.colors.length > 0 && (
              <div className="mb-8">
                <h3 className="font-bold text-gray-900 mb-3">Color</h3>
                <div className="flex gap-3">
                  {product.colors.map((c: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedColor(c)}
                      className={cn(
                        "w-10 h-10 rounded-full border-2 cursor-pointer flex items-center justify-center transition-all",
                        selectedColor?.name === c.name ? "border-blue-600 p-0.5" : "border-transparent"
                      )}
                    >
                      <div className="w-full h-full rounded-full" style={{ backgroundColor: c.hex || c.name }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-8">
                <h3 className="font-bold text-gray-900 mb-3">Size</h3>
                <div className="flex gap-3">
                  {product.sizes.map((s: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSize(s)}
                      className={cn(
                        "px-4 py-2 rounded-xl border text-sm font-medium transition-colors cursor-pointer",
                        selectedSize === s
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-200 text-gray-600 hover:border-blue-300"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Desktop Add to Cart Section */}
            <div className="hidden lg:flex items-center gap-4 p-4 border border-gray-100 rounded-2xl bg-gray-50/50 mb-8">
              <div className="flex flex-col">
                <p className="text-xs text-gray-500 font-medium">Total Price</p>
                <span className="text-xl font-bold text-gray-900">{formatPrice(product.price * quantity)}</span>
              </div>

              <div className="flex items-center bg-gray-100 rounded-full px-1 ml-auto">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 cursor-pointer">
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center font-semibold text-gray-900">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-900 my-1 mr-1 cursor-pointer">
                  <Plus size={16} />
                </button>
              </div>

              <button onClick={handleAddToCart} className="flex-1 bg-blue-600 text-white font-semibold rounded-xl py-3.5 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors cursor-pointer">
                <ShoppingBag size={20} />
                <span>Add to Cart</span>
              </button>
            </div>

            {/* Reviews Section */}
            <div id="reviews-section" className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 text-lg">Reviews</h3>
                {user && !hasReviewed && (
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="text-blue-600 text-sm font-semibold"
                  >
                    {showReviewForm ? 'Cancel' : 'Write a Review'}
                  </button>
                )}
              </div>

              {showReviewForm && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 rounded-2xl p-4 mb-4 space-y-3"
                >
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} onClick={() => setReviewRating(star)}>
                          <Star size={20} className={star <= reviewRating ? "text-amber-400 fill-amber-400" : "text-gray-300"} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">Title (Optional)</label>
                    <input
                      type="text"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      placeholder="Summarize your review"
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">Comment</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Write your comment here..."
                      rows={3}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-600 resize-none"
                    />
                  </div>
                  <button
                    onClick={handleSubmitReview}
                    disabled={reviewSubmitting || !reviewComment.trim()}
                    className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl disabled:opacity-50"
                  >
                    Submit Review
                  </button>
                </motion.div>
              )}

              {reviewsLoading ? (
                <div className="flex justify-center py-4"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
              ) : reviews.length > 0 ? (
                <div className="space-y-3">
                  {reviews.map((review: any) => (
                    <div key={review._id} className="bg-white rounded-2xl p-4 border border-gray-100">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
                            {review.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{review.user?.name || 'Anonymous'}</p>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} size={12} className={star <= review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      {review.title && <p className="text-sm font-bold text-gray-900 mb-1">{review.title}</p>}
                      <p className="text-sm text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-white rounded-2xl border border-gray-100">
                  <Star size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500 text-sm">No reviews yet</p>
                  {user && (
                    <button onClick={() => setShowReviewForm(true)} className="text-blue-600 text-sm font-semibold mt-2">
                      Be the first to review
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-8">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Related Products</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {relatedProducts.map((p: any) => (
                <ProductCard key={p._id || p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="lg:hidden sticky bottom-0 w-full bg-white border-t border-gray-100 p-4 pb-8 flex items-center gap-4 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] z-50">
        <div className="flex flex-col">
          <p className="text-xs text-gray-500 font-medium">Total Price</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{formatPrice(product.price * quantity)}</span>
          </div>
        </div>

        <div className="flex items-center bg-gray-100 rounded-full px-1 ml-auto">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600">
            <Minus size={16} />
          </button>
          <span className="w-8 text-center font-semibold text-gray-900">{quantity}</span>
          <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-900 my-1 mr-1">
            <Plus size={16} />
          </button>
        </div>

        <motion.button whileTap={{ scale: 0.95 }} onClick={handleAddToCart} className="flex-1 bg-blue-600 text-white font-semibold rounded-full py-4 flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
          <ShoppingBag size={20} />
          <span>Add</span>
        </motion.button>
      </div>
    </div>
  );
}
