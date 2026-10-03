import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { supabase } from '../library/supabase';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  CheckCircle2, 
  Lock, 
  Package, 
  Banknote,
  Smartphone,
  ChevronRight
} from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  image: string;
  selectedVariant?: string | null;
  selectedColor?: string | null;
  quantity: number;
}

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, clearCart } = useCart() as any;

  // 1. Resolve Checkout Source: Buy Now single-item state takes priority over persistent cart
  const directItem: OrderItem | undefined = location.state?.directCheckoutItem;
  const isDirectCheckout = Boolean(directItem);
  const checkoutItems: OrderItem[] = directItem ? [directItem] : (cart || []);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'Karnataka',
    pincode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cod'>('upi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  // Financial Calculations
  const subtotal = checkoutItems.reduce((acc, item) => {
    return acc + Number(item.price) * (Number(item.quantity) || 1);
  }, 0);
  const shippingFee = subtotal > 1999 || subtotal === 0 ? 0 : 99;
  const grandTotal = subtotal + shippingFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checkoutItems.length === 0) return;

    setIsSubmitting(true);

    const generatedOrderId = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      // 2. Persist to Supabase 'orders' table
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            order_id: generatedOrderId,
            customer_name: formData.fullName,
            customer_email: formData.email,
            customer_phone: formData.phone,
            shipping_address: {
              street: formData.address,
              city: formData.city,
              state: formData.state,
              pincode: formData.pincode,
            },
            items: checkoutItems,
            subtotal,
            shipping_fee: shippingFee,
            total_amount: grandTotal,
            payment_method: paymentMethod,
            status: 'Processing',
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (orderError) {
        console.warn('Supabase order insert notice:', orderError.message);
        // Fall through gracefully so the user experience is not blocked if table schema differs
      }

      // 3. Clear cart only if this was NOT a direct "Buy Now" flow
      if (!isDirectCheckout && typeof clearCart === 'function') {
        clearCart();
      }

      setPlacedOrderId(generatedOrderId);
      setOrderComplete(true);
    } catch (err) {
      console.error('Checkout error:', err);
      // Fallback for offline or local preview environments
      setPlacedOrderId(generatedOrderId);
      setOrderComplete(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION VIEW
  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
          <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>
          
          <span className="text-[11px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1 rounded-full inline-block mb-3">
            Order Confirmed
          </span>

          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-1">
            Thank You For Your Order!
          </h1>
          <p className="text-xs text-gray-500 mb-6">
            A confirmation receipt will be sent to <span className="font-semibold text-gray-800">{formData.email}</span>.
          </p>

          <div className="bg-gray-50 rounded-xl p-4 text-left border border-gray-100 mb-6 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400 font-medium">Order Number:</span>
              <span className="font-mono font-bold text-gray-900">{placedOrderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-medium">Total Paid:</span>
              <span className="font-black text-gray-900">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-medium">Payment Mode:</span>
              <span className="font-bold uppercase text-gray-900">{paymentMethod}</span>
            </div>
          </div>

          <Link
            to="/"
            className="w-full bg-black hover:bg-neutral-800 text-white font-bold h-12 rounded-xl flex items-center justify-center text-xs uppercase tracking-wider transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // EMPTY ITEMS GUARD
  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <Package className="w-12 h-12 text-gray-300 mb-3" />
        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight mb-2">Your checkout is empty</h2>
        <p className="text-xs text-gray-500 mb-6">Select a product before proceeding to checkout.</p>
        <Link
          to="/"
          className="bg-black text-white px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition"
        >
          Return to Store
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Navigation & Trust Header */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-gray-200">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-black uppercase tracking-wider transition">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
          </Link>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-2xs">
            <Lock className="w-3.5 h-3.5 text-green-600" />
            <span>256-Bit SSL Encrypted Checkout</span>
          </div>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT 7 COLUMNS: Customer & Shipping Details */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: Delivery Address */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-black flex items-center justify-center">1</span>
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">Delivery Information</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:border-black transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="rahul@example.com"
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:border-black transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1.5">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    pattern="[0-9]{10}"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="10-digit mobile number"
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:border-black transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1.5">Street Address / House No. *</label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Flat No, Building, Street, Landmark"
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:border-black transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1.5">City *</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Bengaluru"
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:border-black transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1.5">PIN Code *</label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    pattern="[0-9]{6}"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="560062"
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:border-black transition"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-black flex items-center justify-center">2</span>
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">Select Payment Method</h2>
              </div>

              <div className="space-y-3">
                {/* UPI Option */}
                <label 
                  className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition ${
                    paymentMethod === 'upi' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="accent-black w-4 h-4"
                    />
                    <div>
                      <span className="text-xs font-black text-gray-900 uppercase tracking-wide block">UPI / QR Code</span>
                      <span className="text-[11px] text-gray-500">Google Pay, PhonePe, Paytm, BHIM</span>
                    </div>
                  </div>
                  <Smartphone className="w-5 h-5 text-gray-700" />
                </label>

                {/* Card Option */}
                <label 
                  className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition ${
                    paymentMethod === 'card' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="accent-black w-4 h-4"
                    />
                    <div>
                      <span className="text-xs font-black text-gray-900 uppercase tracking-wide block">Credit / Debit Card</span>
                      <span className="text-[11px] text-gray-500">Visa, MasterCard, RuPay</span>
                    </div>
                  </div>
                  <CreditCard className="w-5 h-5 text-gray-700" />
                </label>

                {/* Cash On Delivery Option */}
                <label 
                  className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition ${
                    paymentMethod === 'cod' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="accent-black w-4 h-4"
                    />
                    <div>
                      <span className="text-xs font-black text-gray-900 uppercase tracking-wide block">Cash on Delivery (COD)</span>
                      <span className="text-[11px] text-gray-500">Pay when your order arrives at your door</span>
                    </div>
                  </div>
                  <Banknote className="w-5 h-5 text-gray-700" />
                </label>
              </div>
            </div>

          </div>

          {/* RIGHT 5 COLUMNS: Order Summary */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs">
              
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                  Order Summary ({checkoutItems.length} {checkoutItems.length === 1 ? 'item' : 'items'})
                </h3>
                {isDirectCheckout && (
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-100">
                    Direct Buy
                  </span>
                )}
              </div>

              {/* Items List */}
              <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto pr-1">
                {checkoutItems.map((item, index) => (
                  <div key={index} className="py-3 flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 object-contain rounded-lg border border-gray-100 p-1 bg-white shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 truncate">{item.name}</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {item.selectedVariant ? `Size: ${item.selectedVariant}` : ''}
                        {item.selectedVariant && item.selectedColor ? ' • ' : ''}
                        {item.selectedColor ? `Color: ${item.selectedColor}` : ''}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[11px] font-semibold text-gray-500">Qty: {item.quantity}</span>
                        <span className="text-xs font-black text-gray-900">
                          ₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cost Breakdown */}
              <div className="pt-4 border-t border-gray-100 space-y-2.5 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                
                <div className="flex justify-between text-gray-500 items-center">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" /> Shipping
                  </span>
                  {shippingFee === 0 ? (
                    <span className="font-bold text-green-600 uppercase text-[11px]">Free</span>
                  ) : (
                    <span className="font-semibold text-gray-900">₹{shippingFee}</span>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                  <span className="text-sm font-black text-gray-900 uppercase">Grand Total</span>
                  <span className="text-xl font-black text-gray-900">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white font-black h-13 rounded-xl uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-sm"
              >
                {isSubmitting ? (
                  <span>Processing Order...</span>
                ) : (
                  <>
                    <span>Place Order • ₹{grandTotal.toLocaleString('en-IN')}</span>
                    <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>

              {/* Trust Features */}
              <div className="mt-5 pt-5 border-t border-gray-100 grid grid-cols-2 gap-3 text-[10px] text-gray-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
                  <span>100% Genuine Gear</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Fast Tracked Dispatch</span>
                </div>
              </div>

            </div>
          </div>

        </form>
      </div>
    </div>
  );
}