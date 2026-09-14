import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, subtotal, totalCount } = useCart();

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-gray-50">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
          <Trash2 className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-black text-gray-900 uppercase">Your Cart is Empty</h2>
        <p className="text-xs text-gray-500 mt-1 mb-6 text-center">
          Looks like you haven&apos;t added any gear to your cart yet.
        </p>
        <Link
          to="/"
          className="px-6 py-2.5 bg-black text-white text-xs font-bold rounded-lg hover:bg-neutral-800 transition"
        >
          Browse Equipment
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tight">
            Cart ({totalCount})
          </h1>
          <Link
            to="/"
            className="flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-black uppercase"
          >
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-3">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 items-center shadow-xs"
              >
                <div className="w-20 h-20 bg-gray-50 rounded-lg p-2 flex items-center justify-center shrink-0 border border-gray-100">
                  <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase text-gray-400">{item.brand}</span>
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 truncate">{item.name}</h3>
                  <p className="text-xs font-black text-gray-900 mt-1">
                    ₹{item.price.toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-2 py-1">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 hover:text-red-600 transition"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1 hover:text-black transition"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <button
                  type="button"
                  aria-label="Remove item"
                  onClick={() => removeFromCart(item.id)}
                  className="text-gray-400 hover:text-red-600 p-1.5 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
            <h2 className="text-sm font-black uppercase text-gray-900 mb-4 border-b border-gray-100 pb-3">
              Order Summary
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-bold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Express Shipping</span>
                <span className="font-bold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between text-gray-600 border-t border-gray-100 pt-2 font-bold text-sm text-gray-900">
                <span>Total</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="button"
              className="w-full mt-6 py-3 bg-black hover:bg-neutral-800 text-white rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition active:bg-neutral-900"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Secure 256-Bit SSL Checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}