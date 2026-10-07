import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../library/supabase';
import {
  ShoppingBag,
  Check,
  Plus,
  Minus,
  Zap,
  Shield,
  Truck,
  RefreshCw,
  Star,
  ChevronRight,
  Heart,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface Variant {
  name: string;
  stock: number;
}

interface ColorOption {
  name: string;
  image: string;      // swatch thumbnail
  images?: string[];  // per-color gallery
}

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  original_price?: number;
  description?: string;
  images?: string[];
  stock: number;
  badge?: string;
  variants?: Variant[];
  colors?: ColorOption[];
}

// Strip size constraints from CDN URLs so the product page shows full-resolution images
function getHighResUrl(url: string): string {
  if (!url) return '';
  // Yonex / Magento: strip query params that force small sizes
  if (url.includes('yonex.com') || url.includes('magento')) {
    return url.split('?')[0];
  }
  // Amazon: remove resize directives like ._SL500_.
  let cleaned = url.replace(/\._[a-zA-Z0-9_]+_\./g, '.');
  // Shopify: remove _WIDTHxHEIGHT before extension
  cleaned = cleaned.replace(/_[0-9]+x[0-9]+(?=\.[a-zA-Z]+$)/g, '');
  return cleaned;
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedColor, setSelectedColor] = useState<ColorOption | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        setProduct(data);
        const firstColor = data.colors && data.colors.length > 0 ? data.colors[0] : null;
        setSelectedColor(firstColor);

        const initialVariants = firstColor?.variants && firstColor.variants.length > 0
          ? firstColor.variants
          : (data.variants || []);
        if (initialVariants.length > 0) {
          const firstInStock = initialVariants.find((v: Variant) => Number(v.stock) > 0) || initialVariants[0];
          setSelectedVariant(firstInStock);
        }
      }
      setLoading(false);
    }
    fetchProduct();
  }, [id]);

  // When color changes, reset image index and auto-select matching size variant for that color
  useEffect(() => {
    setActiveImageIndex(0);
    if (selectedColor) {
      const colorVars = (selectedColor as any).variants;
      if (colorVars && colorVars.length > 0) {
        // Try to match previously selected size name if possible
        const matchingSize = selectedVariant
          ? colorVars.find((v: Variant) => v.name === selectedVariant.name)
          : null;
        setSelectedVariant(matchingSize || colorVars[0]);
      }
    }
  }, [selectedColor]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="font-bold text-gray-500">Product not found.</p>
        <Link to="/" className="text-sm font-black text-red-600 uppercase hover:underline">Go Home</Link>
      </div>
    );
  }

  // Determine active variants for selected color (or product fallback)
  const displayVariants: Variant[] = (selectedColor as any)?.variants && (selectedColor as any).variants.length > 0
    ? (selectedColor as any).variants
    : (product.variants || []);

  const hasVariants = displayVariants.length > 0;
  const hasColors = product.colors && product.colors.length > 0;

  // Determine active variant object matching selected size name
  const activeVariantObj = selectedVariant
    ? displayVariants.find((v: Variant) => v.name === selectedVariant.name) || selectedVariant
    : displayVariants[0] || null;

  const currentStock = hasVariants
    ? (activeVariantObj ? Number(activeVariantObj.stock || 0) : 0)
    : Number(product.stock || 0);
  const isOutOfStock = currentStock <= 0;

  // Determine which images to show in the gallery
  const colorImages = selectedColor?.images && selectedColor.images.length > 0
    ? selectedColor.images
    : null;
  const galleryImages = colorImages || (product.images && product.images.length > 0 ? product.images : ['']);
  const safeIndex = Math.min(activeImageIndex, galleryImages.length - 1);
  const activeImageRaw = galleryImages[safeIndex] || '';
  const activeImage = getHighResUrl(activeImageRaw);

  const price = Number(product.price || 0);
  const originalPrice = Number(product.original_price || 0);
  const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const isLiked = isInWishlist(product.id);

  const buildOrderItem = () => ({
    id: product.id,
    name: product.name,
    brand: product.brand,
    price: price,
    original_price: originalPrice,
    image: selectedColor?.image || galleryImages[0] || '',
    images: galleryImages,
    category: product.category,
    stock: currentStock,
    quantity,
    selectedVariant: selectedVariant ? selectedVariant.name : null,
    selectedColor: selectedColor ? selectedColor.name : null,
  });

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(buildOrderItem() as any);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    navigate('/checkout', { state: { directCheckoutItem: buildOrderItem() } });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-6">
          <Link to="/" className="hover:text-black transition">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to={`/category/${product.category}`} className="hover:text-black transition capitalize">{product.category.replace(/-/g, ' ')}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-700 font-bold line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 items-start">

          {/* ── LEFT: GALLERY ── */}
          <div className="space-y-3 lg:sticky lg:top-6">
            {/* Main Image */}
            <div className="relative aspect-square bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden group">
              {isOutOfStock && (
                <span className="absolute top-4 left-4 z-10 bg-red-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-sm">
                  Out of Stock
                </span>
              )}
              {product.badge && !isOutOfStock && (
                <span className="absolute top-4 left-4 z-10 bg-black text-white text-[10px] font-black uppercase px-3 py-1 rounded-full">
                  {product.badge}
                </span>
              )}
              {discount > 0 && (
                <span className="absolute top-4 right-14 z-10 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-full">
                  -{discount}%
                </span>
              )}

              {/* Wishlist */}
              <button
                onClick={() => toggleWishlist(product as any)}
                className="absolute top-3.5 right-3.5 z-10 w-9 h-9 bg-white rounded-full shadow-sm border border-gray-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </button>

              <img
                key={activeImage}
                src={activeImage}
                alt={product.name}
                className={`w-full h-full object-contain p-8 transition-all duration-300 ${
                  isOutOfStock ? 'opacity-50' : 'group-hover:scale-105'
                }`}
                loading="eager"
                fetchPriority="high"
                decoding="sync"
              />
            </div>

            {/* Thumbnail Strip */}
            {galleryImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`shrink-0 w-16 h-16 rounded-xl border-2 p-1 bg-white transition-all ${
                      safeIndex === idx
                        ? 'border-black shadow-sm'
                        : 'border-gray-200 opacity-60 hover:opacity-100 hover:border-gray-400'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" loading="lazy" decoding="async" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: DETAILS ── */}
          <div className="flex flex-col gap-5">
            {/* Brand & Title */}
            <div>
              <Link
                to={`/category/${product.category}`}
                className="text-xs font-black text-red-600 uppercase tracking-widest hover:underline"
              >
                {product.brand}
              </Link>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1 leading-tight">
                {product.name}
              </h1>

              {/* Rating placeholder */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className={`w-4 h-4 ${ s <= 4 ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}`} />
                  ))}
                </div>
                <span className="text-xs font-bold text-gray-500">4.0 · Official Brand Certified</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl font-black text-gray-900">₹{price.toLocaleString('en-IN')}</span>
                {originalPrice > price && (
                  <>
                    <span className="text-base text-gray-400 line-through font-medium">₹{originalPrice.toLocaleString('en-IN')}</span>
                    <span className="text-sm font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{discount}% OFF</span>
                  </>
                )}
              </div>
              {originalPrice > price && (
                <p className="text-xs text-emerald-600 font-bold mt-1">
                  You save ₹{(originalPrice - price).toLocaleString('en-IN')}
                </p>
              )}
              <p className="text-[11px] text-gray-400 font-medium mt-1">Inclusive of all taxes</p>
            </div>

            {/* COLOR SELECTOR */}
            {hasColors && (
              <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide mb-3">
                  Color: <span className="text-red-600">{selectedColor?.name || 'Select'}</span>
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors!.map((color, idx) => {
                    const isSelected = selectedColor?.name === color.name;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedColor(color);
                          setActiveImageIndex(0);
                        }}
                        title={color.name}
                        className={`flex flex-col items-center gap-1.5 group transition-all`}
                      >
                        <div className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all p-1 bg-gray-50 flex items-center justify-center ${
                          isSelected
                            ? 'border-black ring-2 ring-black/20 shadow-sm scale-105'
                            : 'border-gray-200 hover:border-gray-400 hover:scale-102'
                        }`}>
                          {color.image ? (
                            <img src={getHighResUrl(color.image)} alt={color.name} className="w-full h-full object-contain" />
                          ) : (
                            <div 
                              className="w-full h-full rounded-lg border border-gray-200"
                              style={{ 
                                backgroundColor: color.name.split('/')[0].replace(' ', '').toLowerCase() 
                              }}
                            />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SIZE / VARIANT SELECTOR */}
            {hasVariants && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">
                    Size / Variant
                  </h3>
                  {selectedVariant && (
                    <span className={`text-xs font-bold flex items-center gap-1 px-2 py-1 rounded-full ${
                      Number(selectedVariant.stock) > 0
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-600'
                    }`}>
                      {Number(selectedVariant.stock) > 0 ? (
                        <><Check className="w-3 h-3 stroke-[3]" /> {selectedVariant.stock} in stock</>
                      ) : 'Out of Stock'}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {displayVariants.map((variant, idx) => {
                    const isAvailable = Number(variant.stock) > 0;
                    const isSelected = selectedVariant?.name === variant.name;
                    return (
                      <button
                        key={idx}
                        disabled={!isAvailable}
                        onClick={() => {
                          setSelectedVariant(variant);
                          setActiveImageIndex(0);
                        }}
                        className={`min-w-[3.5rem] px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                          !isAvailable
                            ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed line-through'
                            : isSelected
                            ? 'border-black bg-black text-white shadow-sm'
                            : 'border-gray-200 text-gray-800 hover:border-gray-400 bg-white'
                        }`}
                      >
                        {variant.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity + Actions */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider">Quantity</h3>

              {/* Qty Stepper */}
              <div className="flex items-center border-2 border-gray-200 rounded-xl h-12 w-36 bg-white">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="flex-1 h-full flex items-center justify-center hover:bg-gray-50 rounded-l-xl transition"
                >
                  <Minus className="w-4 h-4 stroke-[2.5] text-gray-700" />
                </button>
                <span className="w-12 text-center font-black text-gray-900 select-none text-base">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q < currentStock ? q + 1 : q)}
                  disabled={quantity >= currentStock || isOutOfStock}
                  className="flex-1 h-full flex items-center justify-center hover:bg-gray-50 rounded-r-xl transition disabled:opacity-40"
                >
                  <Plus className="w-4 h-4 stroke-[2.5] text-gray-700" />
                </button>
              </div>

              {/* CTA Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`h-14 sm:h-16 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm ${
                    isOutOfStock
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                      : addedToCart
                      ? 'bg-green-600 text-white shadow-md scale-[0.99]'
                      : 'bg-black text-white hover:bg-neutral-800 active:scale-[0.97]'
                  }`}
                >
                  {addedToCart ? (
                    <><Check className="w-5 h-5 stroke-[3]" /> Added!</>
                  ) : (
                    <><ShoppingBag className="w-5 h-5 shrink-0" /> <span className="truncate">{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span></>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className={`h-14 sm:h-16 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md ${
                    isOutOfStock
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                      : 'bg-red-600 text-white hover:bg-red-700 active:scale-[0.97]'
                  }`}
                >
                  <Zap className="w-5 h-5 fill-white shrink-0" /> <span className="truncate">Buy Now</span>
                </button>
              </div>
            </div>

            {/* Delivery strip */}
            <div className="grid grid-cols-3 gap-3 py-4 border-y border-gray-100">
              <div className="flex flex-col items-center text-center gap-1.5">
                <Truck className="w-5 h-5 text-gray-500" />
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide leading-tight">Free Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1.5">
                <Shield className="w-5 h-5 text-gray-500" />
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide leading-tight">100% Genuine</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1.5">
                <RefreshCw className="w-5 h-5 text-gray-500" />
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide leading-tight">Easy Returns</span>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-3">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Description</h3>
                <div
                  className="text-sm text-gray-700 leading-relaxed [&_strong]:font-black [&_strong]:text-gray-900 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h2]:text-base [&_h2]:font-black [&_h3]:text-sm [&_h3]:font-bold [&_p]:mb-2"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}