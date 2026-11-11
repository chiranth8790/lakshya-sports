import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../library/supabase';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  Lock, 
  Package, 
  ChevronRight,
  Tag,
  X,
  Printer,
  Loader2,
  CreditCard,
  Banknote
} from 'lucide-react';
import OrderReceiptModal from '../components/OrderReceiptModal';

function ProductThumbnail({ src, alt }: { src?: string; alt: string }) {
  const [imgError, setImgError] = useState(!src);

  if (imgError || !src) {
    return (
      <div className="w-14 h-14 rounded-xl border border-gray-200 bg-gray-50 flex flex-col items-center justify-center p-1 text-center shrink-0">
        <Package className="w-5 h-5 text-gray-400" />
        <span className="text-[7px] font-black uppercase text-gray-400 tracking-tight mt-0.5 truncate max-w-full">
          Lakshya
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setImgError(true)}
      className="w-14 h-14 object-contain rounded-xl border border-gray-100 p-1 bg-white shrink-0"
    />
  );
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  image: string;
  images?: string[];
  selectedVariant?: string | null;
  selectedColor?: string | null;
  quantity: number;
}

const DEFAULT_COUPONS = [
  { id: '1', code: 'WELCOME10', type: 'PERCENTAGE', value: 10, minOrderValue: 1000, usageCount: 0, expiry: '2026-12-31', active: true },
  { id: '2', code: 'SPORT500', type: 'FIXED', value: 500, minOrderValue: 2000, usageCount: 0, expiry: '2026-10-15', active: true },
];

export default function CheckoutPage() {
  const location = useLocation();
  const { cart, clearCart } = useCart() as any;
  const { user, profile } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();

  // Load Razorpay checkout script
  useEffect(() => {
    const existing = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (!existing) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // 1. Resolve Checkout Source: Buy Now single-item state takes priority over persistent cart
  const directItem: OrderItem | undefined = location.state?.directCheckoutItem;
  const isDirectCheckout = Boolean(directItem);
  const checkoutItems: OrderItem[] = directItem ? [directItem] : (cart || []);

  // Form State
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    email: user?.email || '',
    phone: profile?.phone_number || '',
    address: '',
    city: '',
    state: 'Karnataka',
    pincode: '',
  });

  // Payment Method Selection: 'online' (Razorpay) or 'cod' (Cash on Delivery)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'online' | 'cod'>('online');

  // Re-sync form if user finishes loading
  useEffect(() => {
    if (user || profile) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || profile?.full_name || '',
        email: prev.email || user?.email || '',
        phone: prev.phone || profile?.phone_number || ''
      }));
    }
  }, [user, profile]);

  const [activeOrderId] = useState(() => `ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [confirmedPaymentDetails, setConfirmedPaymentDetails] = useState<{
    paymentMethod: string;
    paymentId?: string;
    status?: string;
  }>({ paymentMethod: 'card' });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  // Coupons State
  const [availableCoupons, setAvailableCoupons] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('lakshya_coupons');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((c: any) => c.active);
        }
      }
      return DEFAULT_COUPONS;
    } catch {
      return DEFAULT_COUPONS;
    }
  });
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    const syncCoupons = () => {
      try {
        const stored = localStorage.getItem('lakshya_coupons');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAvailableCoupons(parsed.filter((c: any) => c.active));
          }
        }
      } catch {
        // ignore
      }
    };

    async function loadCoupons() {
      syncCoupons();
      try {
        const { data, error } = await supabase
          .from('coupons')
          .select('*')
          .eq('active', true);

        if (!error && data && data.length > 0) {
          const remoteMapped = data.map((c: any) => ({
            id: String(c.id),
            code: String(c.code).toUpperCase().trim(),
            type: c.type,
            value: Number(c.value),
            minOrderValue: c.min_order_value ? Number(c.min_order_value) : undefined,
            usageCount: Number(c.usage_count) || 0,
            expiry: c.expiry || 'No Expiry',
            active: c.active ?? true,
          }));

          setAvailableCoupons(prev => {
            const map = new Map<string, any>();
            remoteMapped.forEach(c => map.set(c.code, c));
            prev.forEach(c => {
              if (!map.has(c.code)) map.set(c.code, c);
            });
            const merged = Array.from(map.values()).filter(c => c.active);
            try {
              localStorage.setItem('lakshya_coupons', JSON.stringify(merged));
            } catch {
              // ignore
            }
            return merged;
          });
        }
      } catch {
        // ignore
      }
    }

    loadCoupons();

    window.addEventListener('storage', syncCoupons);
    window.addEventListener('lakshya_coupons_updated', syncCoupons);
    return () => {
      window.removeEventListener('storage', syncCoupons);
      window.removeEventListener('lakshya_coupons_updated', syncCoupons);
    };
  }, []);

  // Financial Calculations
  const subtotal = checkoutItems.reduce((acc, item) => {
    return acc + Number(item.price) * (Number(item.quantity) || 1);
  }, 0);
  
  const shippingFee = subtotal > 1999 || subtotal === 0 ? 0 : 99;
  
  // Calculate Discount
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'PERCENTAGE') {
      discountAmount = (subtotal * appliedCoupon.value) / 100;
    } else {
      discountAmount = appliedCoupon.value;
    }
    if (discountAmount > subtotal) discountAmount = subtotal;
  }

  const grandTotal = subtotal - discountAmount + shippingFee;

  const handleApplyCoupon = (coupon: any) => {
    setCouponError(null);
    if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
      setCouponError(`Minimum order value of ₹${coupon.minOrderValue} required.`);
      return;
    }
    setAppliedCoupon(coupon);
    setCouponInput('');
    setShowCouponModal(false);
    toastSuccess(`Coupon ${coupon.code} applied successfully!`);
  };

  const handleApplyManualCoupon = () => {
    setCouponError(null);
    const cleaned = couponInput.trim().toUpperCase();
    if (!cleaned) {
      setCouponError("Please enter a coupon code.");
      return;
    }
    
    let pool = availableCoupons;
    try {
      const stored = localStorage.getItem('lakshya_coupons');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          pool = parsed;
        }
      }
    } catch {
      // ignore
    }

    const foundCoupon = pool.find(
      (c) => String(c.code).trim().toUpperCase() === cleaned
    );
    
    if (!foundCoupon) {
      setCouponError(`Coupon code "${cleaned}" is invalid.`);
      return;
    }

    if (!foundCoupon.active) {
      setCouponError(`Coupon code "${cleaned}" is expired or disabled.`);
      return;
    }
    
    handleApplyCoupon(foundCoupon);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateShippingForm = () => {
    if (!formData.fullName.trim()) {
      toastError('Please enter your full name');
      return false;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      toastError('Please enter a valid email address');
      return false;
    }
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!formData.phone.trim() || cleanPhone.length < 10) {
      toastError('Please enter a valid 10-digit mobile number');
      return false;
    }
    if (!formData.address.trim()) {
      toastError('Please enter your street address');
      return false;
    }
    if (!formData.city.trim()) {
      toastError('Please enter your city');
      return false;
    }
    const cleanPin = formData.pincode.replace(/\D/g, '');
    if (!formData.pincode.trim() || cleanPin.length !== 6) {
      toastError('Please enter a valid 6-digit PIN code');
      return false;
    }
    return true;
  };

  // Open Razorpay Standard Checkout
  const openRazorpay = () => {
    if (typeof (window as any).Razorpay === 'undefined') {
      toastError('Razorpay payment gateway is loading. Please try again in a moment or select Cash on Delivery.');
      return;
    }

    const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_TuZm0ssvj8dZ6j';

    const options: any = {
      key: rzpKey,
      amount: Math.round(grandTotal * 100),
      currency: 'INR',
      name: 'Lakshya Sports',
      description: `Order ${activeOrderId}`,
      image: '/website-logo.png',
      prefill: {
        name: formData.fullName,
        email: formData.email,
        contact: formData.phone,
      },
      theme: {
        color: '#dc2626',
      },
      handler: async function (response: any) {
        await finalizeOrder({
          paymentMethod: 'card',
          paymentId: response.razorpay_payment_id,
          status: 'Paid',
        });
      },
      modal: {
        ondismiss: function () {
          setIsSubmitting(false);
        },
      },
    };

    try {
      setIsSubmitting(true);
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        toastError(`Payment Failed: ${resp.error?.description || 'Transaction declined'}`);
        setIsSubmitting(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error('Razorpay launch error:', err);
      toastError('Unable to open Razorpay payment window. Please try Cash on Delivery.');
      setIsSubmitting(false);
    }
  };

  // Single Action Button Handler: Validates form and opens Razorpay or confirms COD
  const handleProceedToPayment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateShippingForm()) return;

    if (selectedPaymentMethod === 'online') {
      openRazorpay();
    } else {
      finalizeOrder({
        paymentMethod: 'cod',
        status: 'Processing',
      });
    }
  };

  // Finalize order in Supabase with payment metadata
  const finalizeOrder = async (details: {
    paymentMethod: 'card' | 'cod';
    paymentId?: string;
    status: 'Paid' | 'Processing';
  }) => {
    if (checkoutItems.length === 0) return;
    setIsSubmitting(true);

    try {
      const orderPayload: any = {
        order_id: activeOrderId,
        user_id: user ? user.id : null,
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
        discount_amount: discountAmount,
        shipping_fee: shippingFee,
        total_amount: grandTotal,
        payment_method: details.paymentMethod,
        payment_id: details.paymentId || null,
        status: details.status,
        created_at: new Date().toISOString()
      };

      const { error: orderError } = await supabase
        .from('orders')
        .insert([orderPayload]);

      if (orderError) {
        throw orderError;
      }

      // 1. Atomically deduct inventory/stock
      try {
        const { error: rpcErr } = await supabase.rpc('decrement_inventory', {
          p_order_items: checkoutItems
        });
        if (rpcErr) {
          for (const item of checkoutItems) {
            if (item.id) {
              const { data: prod } = await supabase.from('products').select('stock, variants').eq('id', item.id).single();
              if (prod) {
                const currentStock = Number(prod.stock || 0);
                const newStock = Math.max(0, currentStock - (Number(item.quantity) || 1));
                await supabase.from('products').update({ stock: newStock }).eq('id', item.id);
              }
            }
          }
        }
      } catch (invErr) {
        console.warn('Inventory decrement warning:', invErr);
      }

      // 2. Increment coupon usage counter
      if (appliedCoupon?.code) {
        try {
          const { error: coupErr } = await supabase.rpc('increment_coupon_usage', {
            p_coupon_code: appliedCoupon.code
          });
          if (coupErr) {
            await supabase
              .from('coupons')
              .update({ usage_count: (Number(appliedCoupon.usageCount) || 0) + 1 })
              .eq('code', appliedCoupon.code);
          }
        } catch (coupErr) {
          console.warn('Coupon usage increment warning:', coupErr);
        }
      }

      if (!isDirectCheckout && typeof clearCart === 'function') {
        clearCart();
      }

      setConfirmedPaymentDetails(details);
      setPlacedOrderId(activeOrderId);
      setOrderComplete(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Checkout error:', err);
      toastError(`Failed to place order: ${err.message || 'Please try again'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION VIEW
  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center">
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

          <div className="bg-gray-50 rounded-2xl p-4 text-left border border-gray-100 mb-6 space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Order Reference</span>
              <span className="font-mono font-bold text-gray-900">{placedOrderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment Mode</span>
              <span className="font-bold text-gray-900 uppercase">
                {confirmedPaymentDetails.paymentMethod === 'card' ? 'Online Payment (Razorpay)' : 'Cash on Delivery (COD)'}
              </span>
            </div>
            {confirmedPaymentDetails.paymentId && (
              <div className="flex justify-between">
                <span className="text-gray-500">Gateway Ref</span>
                <span className="font-mono font-bold text-emerald-600">{confirmedPaymentDetails.paymentId}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-gray-500 font-bold">Total Amount</span>
              <span className="font-black text-gray-900 text-sm">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowInvoice(true)}
            className="w-full mb-3 bg-red-600 hover:bg-red-700 text-white font-black h-12 rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition shadow-sm active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Download / Print Tax Invoice
          </button>

          <Link
            to="/"
            className="w-full bg-black hover:bg-neutral-800 text-white font-bold h-12 rounded-xl flex items-center justify-center text-xs uppercase tracking-wider transition"
          >
            Continue Shopping
          </Link>

          {/* Tax Invoice Modal */}
          <OrderReceiptModal
            isOpen={showInvoice}
            onClose={() => setShowInvoice(false)}
            order={{
              order_id: placedOrderId,
              created_at: new Date().toISOString(),
              total_amount: grandTotal,
              subtotal: subtotal,
              shipping_fee: shippingFee,
              discount_amount: discountAmount,
              payment_method: confirmedPaymentDetails.paymentMethod,
              payment_id: confirmedPaymentDetails.paymentId,
              customer_name: formData.fullName,
              customer_email: formData.email,
              customer_phone: formData.phone,
              shipping_address: {
                street: formData.address,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
              },
              items: checkoutItems
            }}
          />
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
          className="bg-black hover:bg-neutral-800 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Navigation & Trust Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-gray-200 gap-4">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-black uppercase tracking-wider transition">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
          </Link>

          <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-2xs self-start sm:self-auto">
            <Lock className="w-3.5 h-3.5 text-green-600" />
            <span>256-Bit SSL Encrypted Checkout</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT 7 COLUMNS: Delivery Address & Payment Method Form */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Delivery Information */}
            <form onSubmit={handleProceedToPayment} className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-2xs">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-black flex items-center justify-center">1</span>
                  <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">Delivery Information</h2>
                </div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">All Fields Required</span>
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
            </form>

            {/* 2. Payment Method Options */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-black flex items-center justify-center">2</span>
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">Select Payment Method</h2>
              </div>

              <div className="space-y-3">
                {/* Option 1: Pay Online (Razorpay) */}
                <div
                  onClick={() => setSelectedPaymentMethod('online')}
                  className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-start justify-between ${
                    selectedPaymentMethod === 'online'
                      ? 'border-red-600 bg-red-50/20 shadow-xs'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <input
                      type="radio"
                      name="payment_method_radio"
                      checked={selectedPaymentMethod === 'online'}
                      onChange={() => setSelectedPaymentMethod('online')}
                      className="w-4.5 h-4.5 mt-0.5 text-red-600 border-gray-300 focus:ring-red-500 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">Pay Online</span>
                        <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                          Instant Confirmation
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        UPI (Google Pay, PhonePe, Paytm, QR Code), Debit &amp; Credit Cards, Netbanking, Wallets
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400 font-medium">
                        <span className="flex items-center gap-1 text-gray-600 font-semibold">
                          <Lock className="w-3 h-3 text-emerald-600" /> Razorpay Secure Gateway
                        </span>
                      </div>
                    </div>
                  </div>

                  <CreditCard className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                </div>

                {/* Option 2: Cash on Delivery (COD) */}
                <div
                  onClick={() => setSelectedPaymentMethod('cod')}
                  className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-start justify-between ${
                    selectedPaymentMethod === 'cod'
                      ? 'border-red-600 bg-red-50/20 shadow-xs'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <input
                      type="radio"
                      name="payment_method_radio"
                      checked={selectedPaymentMethod === 'cod'}
                      onChange={() => setSelectedPaymentMethod('cod')}
                      className="w-4.5 h-4.5 mt-0.5 text-red-600 border-gray-300 focus:ring-red-500 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">Cash on Delivery (COD)</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Pay with cash or UPI QR directly to the courier agent when your package arrives
                      </p>
                    </div>
                  </div>

                  <Banknote className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT 5 COLUMNS: Order Summary & SINGLE Payment Action Button */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-2xs">
              
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
              <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto pr-1">
                {checkoutItems.map((item, index) => (
                  <div key={index} className="py-3 flex items-center gap-3">
                    <ProductThumbnail
                      src={item.image || (item.images && item.images[0]) || ''}
                      alt={item.name}
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

              {/* Professional Coupon Section */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-black text-gray-900 uppercase flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-red-600" /> Coupons &amp; Offers
                  </h4>
                  {availableCoupons.length > 0 && !appliedCoupon && (
                    <button
                      type="button"
                      onClick={() => setShowCouponModal(true)}
                      className="text-[11px] font-bold text-red-600 hover:text-red-700 uppercase tracking-wider transition underline cursor-pointer"
                    >
                      View All ({availableCoupons.length})
                    </button>
                  )}
                </div>

                {appliedCoupon ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-emerald-700 text-xs tracking-wider">
                          {appliedCoupon.code}
                        </span>
                        <span className="text-[10px] bg-emerald-200 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                          APPLIED
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-600 mt-0.5">
                        {appliedCoupon.type === 'PERCENTAGE'
                          ? `${appliedCoupon.value}% discount applied`
                          : `Flat ₹${appliedCoupon.value} discount applied`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-gray-400 hover:text-red-600 transition p-1 cursor-pointer"
                      title="Remove coupon"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(e.target.value.toUpperCase());
                            setCouponError(null);
                          }}
                          placeholder="Enter coupon code"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider placeholder:normal-case placeholder:font-normal focus:outline-none focus:border-black"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyManualCoupon}
                        className="bg-black hover:bg-neutral-800 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>

                    {couponError && (
                      <p className="text-[11px] text-red-500 font-medium mt-1.5">{couponError}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Cost Breakdown */}
              <div className="pt-4 border-t border-gray-100 space-y-2.5 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span className="font-semibold">-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                
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

              {/* ONLY ONE PROCEED BUTTON ON THE ENTIRE PAGE */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleProceedToPayment}
                className="w-full mt-6 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black h-13 rounded-2xl uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition shadow-md hover:shadow-lg cursor-pointer active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing Order...
                  </>
                ) : selectedPaymentMethod === 'online' ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay with Razorpay • ₹{grandTotal.toLocaleString('en-IN')}</span>
                    <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                ) : (
                  <>
                    <Truck className="w-4 h-4" />
                    <span>Place Order (COD) • ₹{grandTotal.toLocaleString('en-IN')}</span>
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

        </div>
      </div>

      {/* Available Coupons Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-red-600" /> Available Offers
              </h3>
              <button
                onClick={() => setShowCouponModal(false)}
                className="text-gray-400 hover:text-gray-600 transition p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
              {availableCoupons.map((coupon) => {
                const isEligible = !coupon.minOrderValue || subtotal >= coupon.minOrderValue;
                const shortfall = coupon.minOrderValue ? coupon.minOrderValue - subtotal : 0;

                return (
                  <div
                    key={coupon.id}
                    className={`border rounded-xl p-4 transition ${
                      isEligible
                        ? 'border-dashed border-red-300 bg-red-50/30 hover:border-red-500'
                        : 'border-gray-200 bg-gray-50/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="font-mono font-black text-sm text-red-600 tracking-wider bg-white border border-red-200 px-2.5 py-1 rounded-md inline-block mb-1.5">
                          {coupon.code}
                        </span>
                        <h4 className="text-sm font-bold text-gray-900 mb-1">
                          {coupon.type === 'PERCENTAGE' ? `Get ${coupon.value}% OFF` : `Flat ₹${coupon.value} OFF`}
                        </h4>
                        {coupon.minOrderValue && (
                          <p className="text-[11px] text-gray-500 font-medium">
                            Valid on orders above ₹{coupon.minOrderValue.toLocaleString('en-IN')}
                          </p>
                        )}
                      </div>
                      
                      {isEligible ? (
                        <button
                          onClick={() => handleApplyCoupon(coupon)}
                          className="shrink-0 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition shadow-sm cursor-pointer"
                        >
                          Apply
                        </button>
                      ) : (
                        <button disabled className="shrink-0 bg-gray-100 text-gray-400 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider cursor-not-allowed">
                          Apply
                        </button>
                      )}
                    </div>
                    
                    {!isEligible && shortfall > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-[10px] text-red-500 font-bold uppercase">
                          Add items worth ₹{shortfall.toLocaleString('en-IN')} more to unlock
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
