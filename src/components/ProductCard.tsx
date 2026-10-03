import { ShoppingCart, Zap, Plus, Minus, ArrowRight, Heart } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const getHighResImage = (url: string) => {
  if (!url) return '';
  
  let cleanUrl = url;

  // 1. YONEX / MAGENTO FIX: Removes size constraints after the '?'
  if (cleanUrl.includes('?')) {
    cleanUrl = cleanUrl.split('?')[0];
  }

  // 2. AMAZON FIX
  cleanUrl = cleanUrl.replace(/\._[a-zA-Z0-9_]+_\./g, '.');
  // 3. SHOPIFY FIX
  cleanUrl = cleanUrl.replace(/_[0-9]+x[0-9]+(?=\.[a-zA-Z]+$)/g, '');
  // 4. FLIPKART FIX
  cleanUrl = cleanUrl.replace(/\/image\/[0-9]+\/[0-9]+\//g, '/image/original/original/');
  // 5. CLOUDINARY FIX
  cleanUrl = cleanUrl.replace(/\/c_[a-z]+,w_[0-9]+(?:,q_[a-zA-Z0-9]+)?\//g, '/');

  return cleanUrl;
};

export default function ProductCard({ product }: { product: any }) {
  const { cart, addToCart, updateQuantity } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  // 1. SAFE LOOKUP: Match stringified IDs so UUIDs and number IDs always match
  const cartItem = cart?.find((item: any) => String(item?.id) === String(product?.id));
  
  // 2. RELIABLE QUANTITY: Derive active status directly from currentQuantity
  const currentQuantity = Number(cartItem?.quantity || cartItem?.qty || 0);
  const alreadyInCart = currentQuantity > 0;

  const isLiked = isInWishlist(product.id);

  // Supabase Data Handling: fallback to color swatch/gallery images if main image is empty
  const isOutOfStock = Number(product.stock ?? 0) <= 0;
  const firstColor = product.colors && product.colors.length > 0 ? product.colors[0] : null;
  const colorFallbackImage = firstColor ? (firstColor.image || (firstColor.images && firstColor.images[0]) || '') : '';
  const rawImage = product.image || (product.images && product.images.length > 0 ? product.images[0] : '') || colorFallbackImage;
  const displayImage = getHighResImage(rawImage);
  const price = Number(product.price || 0);
  const originalPrice = Number(product.originalPrice || product.original_price || 0);

  // DECREMENT: Passes variant and color so CartContext finds the exact item
  const handleDecrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!cartItem) return;
    const nextQty = currentQuantity - 1;
    (updateQuantity as any)(
      cartItem.id, 
      nextQty, 
      cartItem.selectedVariant || null, 
      cartItem.selectedColor || null
    );
  };

  // INCREMENT: Checks maximum stock before increasing
  const handleIncrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!cartItem) return;
    const maxStock = Number(cartItem.stock || product.stock || 99);
    if (currentQuantity >= maxStock) return;
    const nextQty = currentQuantity + 1;
    (updateQuantity as any)(
      cartItem.id, 
      nextQty, 
      cartItem.selectedVariant || null, 
      cartItem.selectedColor || null
    );
  };

  // ADD TO CART: Uses default variant/color
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    const defaultVariant = product.variants?.[0]?.name || null;
    const defaultColor = product.colors?.[0]?.name || null;
    const defaultImage = product.colors?.[0]?.image || displayImage;

    (addToCart as any)({
      ...product,
      id: product.id,
      name: product.name,
      price: price,
      image: defaultImage,
      images: product.images || [defaultImage],
      selectedVariant: defaultVariant,
      selectedColor: defaultColor,
      stock: Number(product.stock || 10),
      quantity: 1
    });
  };

  // BUY NOW: Bypasses cart and navigates straight to checkout with this single item
  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    const directItem = {
      ...product,
      id: product.id,
      name: product.name,
      price: price,
      image: product.colors?.[0]?.image || displayImage,
      selectedVariant: product.variants?.[0]?.name || null,
      selectedColor: product.colors?.[0]?.name || null,
      stock: Number(product.stock || 10),
      quantity: 1
    };

    navigate('/checkout', { state: { directCheckoutItem: directItem } });
  };

  return (
    <div className="bg-white rounded-xl shadow-xs hover:shadow-md transition-shadow border border-gray-200 flex flex-col overflow-hidden group relative">
      
      {/* 1. WRAP IMAGE & DETAILS IN A LINK TO THE PRODUCT PAGE */}
      <Link to={`/product/${product.id}`} className="flex flex-col flex-grow">
        
        {/* Product Image & Badges */}
        <div className="relative w-full h-64 sm:h-72 bg-white flex items-center justify-center p-6 border-b border-gray-100 overflow-hidden">
          {isOutOfStock ? (
            <span className="absolute top-2.5 left-2.5 z-10 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wide shadow-sm">
              Out of Stock
            </span>
          ) : product.badge ? (
            <span className="absolute top-2.5 left-2.5 z-10 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wide shadow-sm">
              {product.badge}
            </span>
          ) : null}

          <img
            src={displayImage}
            alt={product.name}
            className={`max-h-full max-w-full object-contain transition-transform duration-300 ${
              isOutOfStock ? 'opacity-70' : 'group-hover:scale-105'
            }`}
            loading="lazy"
          />
        </div>

        {/* Product Details */}
        <div className="p-4 flex flex-col flex-grow justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
              {product.brand}
            </span>
            <h3 className="font-bold text-xs sm:text-sm text-gray-800 line-clamp-2 leading-snug mt-1 group-hover:text-black min-h-[2.5rem]">
              {product.name}
            </h3>
          </div>
          
          <div className="pt-3 flex items-baseline gap-2">
            <p className="text-sm sm:text-base font-black text-gray-900">
              ₹{price.toLocaleString('en-IN')}
            </p>
            {originalPrice > price && (
              <p className="text-[11px] text-gray-400 line-through">
                ₹{originalPrice.toLocaleString('en-IN')}
              </p>
            )}
          </div>
        </div>
      </Link>

      {/* Wishlist Heart Toggle */}
      <button
        type="button"
        aria-label={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product);
        }}
        className="absolute top-2.5 right-2.5 z-20 p-2 rounded-full bg-white/90 backdrop-blur-xs shadow-xs hover:bg-white active:scale-90 transition"
      >
        <Heart
          className={`w-4 h-4 transition-colors duration-200 ${
            isLiked ? 'fill-red-600 text-red-600 stroke-[2.5]' : 'text-gray-500 hover:text-red-500 stroke-[2]'
          }`}
        />
      </button>

      {/* Action Footer */}
      <div className="border-t border-gray-100 bg-white">
        {isOutOfStock ? (
          <div className="h-10 flex items-center justify-center bg-gray-50 text-gray-400 text-[11px] font-bold uppercase tracking-widest cursor-not-allowed">
            Unavailable
          </div>
        ) : alreadyInCart ? (
          <div className="grid grid-cols-2 h-10">
            {/* [-] qty [+] Stepper */}
            <div className="flex items-center justify-between px-2 bg-gray-50 border-r border-gray-100">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={handleDecrease}
                className="w-7 h-7 flex items-center justify-center rounded bg-white text-gray-700 shadow-2xs hover:bg-gray-200 active:scale-90 transition"
              >
                <Minus className="w-3 h-3 stroke-[2.5]" />
              </button>

              <span className="text-xs font-black text-gray-900 select-none">
                {currentQuantity}
              </span>

              <button
                type="button"
                aria-label="Increase quantity"
                onClick={handleIncrease}
                disabled={currentQuantity >= (Number(cartItem?.stock || product.stock) || 99)}
                className="w-7 h-7 flex items-center justify-center rounded bg-white text-gray-700 shadow-2xs hover:bg-gray-200 active:scale-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-3 h-3 stroke-[2.5]" />
              </button>
            </div>

            {/* View Cart Shortcut */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate('/cart');
              }}
              className="bg-black hover:bg-neutral-800 text-white flex items-center justify-center gap-1 text-[11px] font-bold tracking-tight active:bg-neutral-900 transition"
            >
              View Cart <ArrowRight className="w-3 h-3 stroke-[2.5]" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 h-10">
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex items-center justify-center gap-1 text-[11px] font-bold text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition border-r border-gray-100"
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Cart
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              className="bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-1 text-[11px] font-bold active:bg-red-800 transition"
            >
              <Zap className="w-3.5 h-3.5 fill-white" /> Buy Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}