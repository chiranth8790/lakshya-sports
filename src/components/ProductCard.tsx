import { ShoppingCart, Zap, Plus, Minus, ArrowRight, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../data/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductCard({ product }: { product: Product }) {
  const { cart, addToCart, updateQuantity, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  const alreadyInCart = isInCart(product.id);
  const isLiked = isInWishlist(product.id);

  const cartItem = cart.find((item) => item.id === product.id);
  const currentQuantity = cartItem ? cartItem.quantity : 0;

  const handleBuyNow = () => {
    if (!alreadyInCart) {
      addToCart(product);
    }
    navigate('/cart');
  };

  return (
    <div className="bg-white rounded-xl shadow-xs hover:shadow-md transition-shadow border border-gray-200 flex flex-col overflow-hidden group">
      {/* Product Image & Badges */}
      <div className="relative aspect-square p-4 bg-gray-50 flex items-center justify-center border-b border-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        <span className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wide">
          {product.badge}
        </span>

        {/* Wishlist Heart Toggle */}
        <button
          type="button"
          aria-label={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 backdrop-blur-xs shadow-xs hover:bg-white active:scale-90 transition"
        >
          <Heart
            className={`w-4 h-4 transition-colors duration-200 ${
              isLiked ? 'fill-red-600 text-red-600 stroke-[2.5]' : 'text-gray-500 hover:text-red-500 stroke-[2]'
            }`}
          />
        </button>
      </div>

      {/* Product Details */}
      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
          {product.brand}
        </span>
        <h3 className="font-bold text-xs sm:text-sm text-gray-800 line-clamp-2 leading-snug mb-2">
          {product.name}
        </h3>
        <div className="mt-auto flex items-baseline gap-2">
          <p className="text-sm sm:text-base font-black text-gray-900">
            ₹{product.price.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-gray-400 line-through">
            ₹{product.originalPrice.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="border-t border-gray-100 bg-white">
        {alreadyInCart ? (
          <div className="grid grid-cols-2 h-10">
            {/* [-] qty [+] Stepper */}
            <div className="flex items-center justify-between px-2 bg-gray-50 border-r border-gray-100">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => updateQuantity(product.id, currentQuantity - 1)}
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
                onClick={() => updateQuantity(product.id, currentQuantity + 1)}
                className="w-7 h-7 flex items-center justify-center rounded bg-white text-gray-700 shadow-2xs hover:bg-gray-200 active:scale-90 transition"
              >
                <Plus className="w-3 h-3 stroke-[2.5]" />
              </button>
            </div>

            {/* View Cart Shortcut */}
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="bg-black hover:bg-neutral-800 text-white flex items-center justify-center gap-1 text-[11px] font-bold tracking-tight active:bg-neutral-900 transition"
            >
              View Cart <ArrowRight className="w-3 h-3 stroke-[2.5]" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 h-10">
            <button
              type="button"
              onClick={() => addToCart(product)}
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