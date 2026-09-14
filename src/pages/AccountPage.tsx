import { Link } from 'react-router-dom';
import { User, Package, Heart, MapPin, ArrowLeft } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

function AccountPage() {
  const { wishlistCount } = useWishlist();
  const { totalCount } = useCart();

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-black uppercase tracking-wide"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </Link>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-xs flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-black text-xl">
            <User className="w-8 h-8 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase text-gray-900">Lakshya Sports Member</h1>
            <p className="text-xs text-gray-500">Member ID: #LS-884920</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/cart"
            className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs hover:border-black transition flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-4">
              <Package className="w-6 h-6 text-gray-700 group-hover:text-black" />
              <span className="text-xs font-black bg-gray-100 px-2 py-0.5 rounded">{totalCount} items</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Active Bag</h2>
              <p className="text-xs text-gray-500 mt-0.5">Ready for checkout</p>
            </div>
          </Link>

          <Link
            to="/wishlist"
            className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs hover:border-black transition flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-4">
              <Heart className="w-6 h-6 text-red-600" />
              <span className="text-xs font-black bg-red-50 text-red-600 px-2 py-0.5 rounded">
                {wishlistCount} saved
              </span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Wishlist</h2>
              <p className="text-xs text-gray-500 mt-0.5">Saved tournament gear</p>
            </div>
          </Link>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <MapPin className="w-6 h-6 text-gray-700" />
              <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Default</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Delivery Address</h2>
              <p className="text-xs text-gray-500 mt-0.5">Manage default delivery address</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountPage;