import { Link } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';

export default function WishlistPage() {
  const { wishlist, wishlistCount } = useWishlist();

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-gray-50">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <Heart className="w-8 h-8 text-red-400 stroke-[1.8]" />
        </div>
        <h2 className="text-xl font-black text-gray-900 uppercase">Your Wishlist is Empty</h2>
        <p className="text-xs text-gray-500 mt-1 mb-6 text-center">
          Tap the heart icon on any equipment to save it here for later.
        </p>
        <Link
          to="/"
          className="px-6 py-2.5 bg-black text-white text-xs font-bold rounded-lg hover:bg-neutral-800 transition"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tight">
            My Wishlist ({wishlistCount})
          </h1>
          <Link
            to="/"
            className="flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-black uppercase"
          >
            <ArrowLeft className="w-4 h-4" /> Continue Browsing
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlist.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}