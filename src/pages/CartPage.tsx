import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag, Shield, Truck, RefreshCw } from 'lucide-react';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, subtotal } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center bg-gray-50">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-200">
          <ShoppingBag className="w-10 h-10 text-gray-300" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-wider mb-3">Your Bag is Empty</h2>
        <p className="text-gray-500 mb-8 max-w-sm text-sm">Looks like you haven't added any sports gear yet. Let's fix that!</p>
        <button
          onClick={() => navigate('/')}
          className="px-8 py-3 bg-black text-white font-bold text-sm tracking-wide uppercase rounded-xl hover:bg-neutral-800 transition shadow-sm flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </button>
      </div>
    );
  }

  const cartTotal = cart.reduce((acc: number, item: any) => {
    return acc + (Number(item.price) || 0) * (Number(item.quantity) || 1);
  }, 0);

  const savings = cart.reduce((acc: number, item: any) => {
    const orig = Number(item.original_price || item.originalPrice || 0);
    const curr = Number(item.price || 0);
    return acc + (orig > curr ? (orig - curr) * Number(item.quantity || 1) : 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition text-gray-600 shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-wider">Your Bag</h1>
            <p className="text-xs text-gray-500 font-medium">{cart.reduce((s, i) => s + i.quantity, 0)} item(s)</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1 space-y-4">
            {cart.map((item: any, index: number) => {
              const itemImage = item.image || (item.images && item.images[0]) || '';
              const originalPrice = Number(item.original_price || item.originalPrice || 0);
              const currentPrice = Number(item.price || 0);
              const hasSavings = originalPrice > currentPrice;

              return (
                <div
                  key={`${item.id}-${item.selectedVariant ?? 'null'}-${item.selectedColor ?? 'null'}-${index}`}
                  className="flex gap-4 p-4 bg-white border border-gray-200 rounded-2xl shadow-xs hover:shadow-sm transition-shadow"
                >
                  {/* Product Image */}
                  <div className="w-28 h-28 sm:w-36 sm:h-36 bg-gray-50 rounded-xl border border-gray-100 p-3 shrink-0 flex items-center justify-center">
                    {itemImage ? (
                      <img
                        src={itemImage}
                        alt={item.name}
                        className="w-full h-full object-contain mix-blend-multiply"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <ShoppingBag className="w-10 h-10 text-gray-300" />
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                    <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{item.brand}</p>
                        <h3 className="font-bold text-gray-900 leading-tight text-sm sm:text-base line-clamp-2">{item.name}</h3>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {item.selectedVariant && (
                            <span className="text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                              Size: {item.selectedVariant}
                            </span>
                          )}
                          {item.selectedColor && (
                            <span className="text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                              Color: {item.selectedColor}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right shrink-0">
                        <p className="font-black text-gray-900 text-base">₹{(currentPrice * item.quantity).toLocaleString('en-IN')}</p>
                        {hasSavings && (
                          <p className="text-[10px] text-gray-400 line-through">₹{(originalPrice * item.quantity).toLocaleString('en-IN')}</p>
                        )}
                        <p className="text-[10px] text-gray-500 mt-0.5">₹{currentPrice.toLocaleString('en-IN')} each</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-gray-200 rounded-xl h-10 bg-white shadow-xs">
                        <button
                          onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1, item.selectedVariant, item.selectedColor)}
                          className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-l-xl transition text-gray-600"
                        >
                          <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                        <span className="w-10 text-center text-sm font-black text-gray-900 select-none">{item.quantity || 1}</span>
                        <button
                          onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1, item.selectedVariant, item.selectedColor)}
                          className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-r-xl transition text-gray-600"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeFromCart(item.id, item.selectedVariant, item.selectedColor)}
                        className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl transition-all uppercase tracking-wider"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs sticky top-24 space-y-0">
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-5">Order Summary</h2>

              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between text-gray-600">
                  <span className="font-medium">Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-bold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span className="font-medium">You Save</span>
                    <span className="font-bold">−₹{savings.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span className="font-medium">Shipping</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-black text-gray-900 uppercase">Total</span>
                  <span className="text-2xl font-black text-gray-900">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-[10px] text-gray-400 font-medium text-right mt-1">Inclusive of all taxes</p>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                disabled={!cart || cart.length === 0}
                className="w-full bg-black hover:bg-neutral-800 text-white font-bold h-12 rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-40 shadow-sm active:scale-[0.99]"
              >
                Proceed to Checkout
              </button>

              {/* Trust badges */}
              <div className="mt-5 pt-5 border-t border-gray-100 grid grid-cols-3 gap-3 text-center">
                <div className="flex flex-col items-center gap-1">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide leading-tight">Secure Payment</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Truck className="w-4 h-4 text-gray-400" />
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide leading-tight">Free Delivery</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <RefreshCw className="w-4 h-4 text-gray-400" />
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide leading-tight">Easy Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}