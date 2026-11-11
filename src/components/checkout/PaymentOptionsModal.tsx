import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  QrCode, 
  Check, 
  ShieldCheck, 
  Loader2,
  Plus,
  ArrowLeft,
  Smartphone,
  Copy
} from 'lucide-react';

interface PaymentOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  grandTotal: number;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  appliedCouponCode?: string | null;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddressSummary: string;
  isSubmitting: boolean;
  onPaymentComplete: (details: {
    paymentMethod: 'upi_direct' | 'card' | 'cod' | 'pay_at_store';
    paymentId?: string;
    utrNumber?: string;
    pickupStore?: string;
    status: 'Paid' | 'Processing';
  }) => Promise<void>;
}

export default function PaymentOptionsModal({
  isOpen,
  onClose,
  grandTotal,
  subtotal,
  discountAmount,
  shippingFee,
  appliedCouponCode,
  orderId,
  customerName,
  customerPhone,
  customerEmail,
  deliveryAddressSummary,
  isSubmitting,
  onPaymentComplete,
}: PaymentOptionsModalProps) {
  const merchantUpiId = import.meta.env.VITE_MERCHANT_UPI_ID || '8050856366@okaxis';
  const merchantName = import.meta.env.VITE_MERCHANT_NAME || 'Lakshya Sports';

  // State
  const [showBillDetails, setShowBillDetails] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showUpiConfirmModal, setShowUpiConfirmModal] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [utrError, setUtrError] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [showAllWallets, setShowAllWallets] = useState(false);
  const [selectedCod, setSelectedCod] = useState(false);
  const [qrFallback, setQrFallback] = useState(false);

  // Device Detection
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  useEffect(() => {
    const checkDevice = () => {
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isNarrow = window.innerWidth < 768;
      setIsMobileDevice(isMobileUA || isNarrow);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  if (!isOpen) return null;

  // Copy UPI ID
  const handleCopyUpi = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(merchantUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // UPI payment URI
  const upiPaymentUri = `upi://pay?pa=${merchantUpiId}&pn=${encodeURIComponent(
    merchantName
  )}&am=${grandTotal}&cu=INR&tn=${encodeURIComponent(`Order ${orderId}`)}`;

  // QR Code Image URLs (Primary & Failover)
  const primaryQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=8&data=${encodeURIComponent(
    upiPaymentUri
  )}`;
  const fallbackQrUrl = `https://quickchart.io/qr?size=280&margin=2&text=${encodeURIComponent(
    upiPaymentUri
  )}`;

  // 1. Pay by any UPI app (Mobile intent redirect)
  const handlePayByAnyUpiApp = () => {
    window.location.href = upiPaymentUri;
    setShowUpiConfirmModal(true);
  };

  // 2. Direct UPI confirmation with optional UTR
  const handleConfirmDirectUpi = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUtr = utrNumber.trim();
    if (!cleanUtr || cleanUtr.length < 6) {
      setUtrError('Please enter the 12-digit transaction / UTR reference number.');
      return;
    }
    setUtrError(null);
    await onPaymentComplete({
      paymentMethod: 'upi_direct',
      utrNumber: cleanUtr,
      status: 'Processing',
    });
  };

  // Dynamically ensure Razorpay script is ready
  const ensureRazorpayLoaded = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof (window as any).Razorpay !== 'undefined') {
        resolve(true);
        return;
      }
      const existing = document.querySelector('script[src*="checkout.razorpay.com"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(true));
        existing.addEventListener('error', () => resolve(false));
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // 3. Open Razorpay Gateway for Cards, Netbanking, or Wallets
  const openRazorpay = async (methodLabel: string) => {
    const isLoaded = await ensureRazorpayLoaded();
    if (!isLoaded || typeof (window as any).Razorpay === 'undefined') {
      alert('Payment gateway is loading. You can also complete your order via Cash on Delivery.');
      return;
    }

    const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_TuZm0ssvj8dZ6j';

    const options: any = {
      key: rzpKey,
      amount: Math.round(grandTotal * 100),
      currency: 'INR',
      name: 'Lakshya Sports',
      description: `Order ${orderId}`,
      image: '/website-logo.png',
      prefill: {
        name: customerName,
        email: customerEmail,
        contact: customerPhone,
        method: methodLabel.startsWith('card')
          ? 'card'
          : methodLabel.startsWith('wallet')
          ? 'wallet'
          : methodLabel.startsWith('netbanking')
          ? 'netbanking'
          : undefined,
      },
      theme: {
        color: '#dc2626',
      },
      handler: async function (response: any) {
        await onPaymentComplete({
          paymentMethod: 'card',
          paymentId: response.razorpay_payment_id,
          status: 'Paid',
        });
      },
    };

    try {
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        alert(`Payment failed: ${resp.error?.description || 'Transaction declined'}`);
      });
      rzp.open();
    } catch (err: any) {
      console.error('Razorpay launch error:', err);
      alert('Unable to launch gateway. You can also complete your order via Cash on Delivery or QR.');
    }
  };

  // 4. Confirm Cash on Delivery
  const handleConfirmCod = async () => {
    await onPaymentComplete({
      paymentMethod: 'cod',
      status: 'Processing',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 font-sans animate-in fade-in duration-200">
      
      {/* Main Payment Options Container (Zepto Style) */}
      <div className="bg-[#F4F6FB] w-full sm:max-w-xl md:max-w-2xl max-h-[92vh] sm:max-h-[88vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 border border-gray-200/80">
        
        {/* ── TOP HEADER (Zepto Style) ── */}
        <div className="bg-white px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 -ml-1 text-gray-700 hover:text-black rounded-full hover:bg-gray-100 transition cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <div>
              <h2 className="text-base font-extrabold text-gray-900 tracking-tight">Payment Options</h2>
              <p className="text-[11px] text-gray-500 truncate max-w-[240px] sm:max-w-sm">
                Delivering to {deliveryAddressSummary || 'your address'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── TO PAY / VIEW BILL BAR (Zepto Style) ── */}
        <div className="bg-white px-6 py-3 border-b border-gray-100 flex items-center justify-between shadow-2xs shrink-0">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-bold text-gray-600">To Pay:</span>
            <span className="text-lg font-black text-[#10845B]">₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowBillDetails((prev) => !prev)}
            className="text-xs font-extrabold text-[#D81B60] hover:text-[#AD1457] transition flex items-center gap-1 cursor-pointer select-none"
          >
            <span>{showBillDetails ? 'Hide Bill' : 'View Bill'}</span>
            {showBillDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* ── COLLAPSIBLE BILL DETAILS BREAKDOWN ── */}
        {showBillDetails && (
          <div className="bg-white px-6 py-3.5 border-b border-gray-100 text-xs space-y-2 animate-in fade-in duration-150 shrink-0">
            <div className="flex justify-between text-gray-600">
              <span>Items Total</span>
              <span className="font-semibold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Coupon Discount ({appliedCouponCode})</span>
                <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              {shippingFee === 0 ? (
                <span className="font-bold text-emerald-600 uppercase text-[11px]">Free</span>
              ) : (
                <span className="font-semibold text-gray-900">₹{shippingFee}</span>
              )}
            </div>
            <div className="pt-2 border-t border-gray-100 flex justify-between font-black text-gray-900 text-sm">
              <span>Grand Total</span>
              <span className="text-[#10845B]">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}

        {/* ── SCROLLABLE SECTIONS BODY ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* ═════════ 1. PAY BY UPI SECTION ═════════ */}
          <div>
            <div className="flex items-center gap-1.5 px-1 mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-gray-700">UPI</span>
              <span className="text-xs font-bold text-gray-500">• Pay by UPI</span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden divide-y divide-gray-100">
              
              {/* Option 1A: Pay by any UPI app (MOBILE ONLY) */}
              <div
                onClick={handlePayByAnyUpiApp}
                className={`${
                  isMobileDevice ? 'block' : 'hidden'
                } md:hidden p-4 hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center p-1.5 shrink-0">
                      <Smartphone className="w-5 h-5 text-gray-800" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Pay by any UPI app</h4>
                      <p className="text-[11px] text-gray-500">Use any UPI app on the phone to pay</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>

                {/* UPI Apps Grid Icons */}
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 pt-3 mt-3 border-t border-gray-100">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-[10px] font-black text-blue-600">
                      GPay
                    </div>
                    <span className="text-[9px] font-bold text-gray-500">GPay</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-[10px] font-black text-purple-600">
                      Pe
                    </div>
                    <span className="text-[9px] font-bold text-gray-500">PhonePe</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-[10px] font-black text-sky-600">
                      Paytm
                    </div>
                    <span className="text-[9px] font-bold text-gray-500">Paytm</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-[10px] font-black text-orange-600">
                      BHIM
                    </div>
                    <span className="text-[9px] font-bold text-gray-500">BHIM</span>
                  </div>
                </div>
              </div>

              {/* Option 1B: Pay via QR Code (LAPTOP & MOBILE) */}
              <div
                onClick={() => setShowQrModal(true)}
                className="p-4 hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center p-1.5 shrink-0 text-gray-800">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-gray-900">Pay via QR Code</h4>
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                        Instant
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      {isMobileDevice
                        ? 'Generate QR to scan from another device'
                        : 'Scan directly with any UPI app on your phone'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-block text-[11px] font-extrabold text-[#D81B60] uppercase">
                    Show QR
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>

            </div>
          </div>

          {/* ═════════ 2. CREDIT & DEBIT CARDS SECTION ═════════ */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-700 px-1 mb-2">
              Credit &amp; Debit Cards
            </h3>

            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
              <div
                onClick={() => openRazorpay('card')}
                className="p-4 hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-[#D81B60] shrink-0">
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#D81B60]">Add New Card</h4>
                    <p className="text-[11px] text-gray-500">Visa, Mastercard, RuPay &amp; more</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* ═════════ 3. WALLETS SECTION ═════════ */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-700 px-1 mb-2">
              Wallets
            </h3>

            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden divide-y divide-gray-100">
              {/* PhonePe Wallet */}
              <div
                onClick={() => openRazorpay('wallet_phonepe')}
                className="p-4 hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                    पे
                  </div>
                  <span className="text-sm font-bold text-gray-900">PhonePe Wallet</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>

              {/* Amazon Pay Balance */}
              <div
                onClick={() => openRazorpay('wallet_amazon')}
                className="p-4 hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-[10px] shrink-0 shadow-2xs">
                    pay
                  </div>
                  <div>
                    <span className="text-sm font-bold text-gray-900 block">Amazon Pay Balance</span>
                    <span className="text-[11px] text-gray-400">Fast checkout</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>

              {/* Extra Wallets (Toggle) */}
              {showAllWallets && (
                <>
                  <div
                    onClick={() => openRazorpay('wallet_paytm')}
                    className="p-4 hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center font-black text-[9px] shrink-0 shadow-2xs">
                        Paytm
                      </div>
                      <span className="text-sm font-bold text-gray-900">Paytm Wallet</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>

                  <div
                    onClick={() => openRazorpay('wallet_mobikwik')}
                    className="p-4 hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-[9px] shrink-0 shadow-2xs">
                        M
                      </div>
                      <span className="text-sm font-bold text-gray-900">MobiKwik Wallet</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </>
              )}

              {/* View More Wallets Button */}
              <button
                type="button"
                onClick={() => setShowAllWallets((prev) => !prev)}
                className="w-full p-3.5 text-center text-xs font-black text-[#D81B60] hover:bg-pink-50/50 transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>{showAllWallets ? 'View Less Wallets' : 'View More Wallets'}</span>
                {showAllWallets ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* ═════════ 4. NETBANKING SECTION ═════════ */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-700 px-1 mb-2">
              Netbanking
            </h3>

            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden p-4 space-y-4">
              <div className="grid grid-cols-4 gap-2 text-center">
                {/* HDFC */}
                <button
                  type="button"
                  onClick={() => openRazorpay('netbanking_hdfc')}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-gray-50 transition cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center text-xs font-black shadow-2xs">
                    HDFC
                  </div>
                  <span className="text-[10px] font-bold text-gray-700 leading-tight">HDFC Bank</span>
                </button>

                {/* ICICI */}
                <button
                  type="button"
                  onClick={() => openRazorpay('netbanking_icici')}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-gray-50 transition cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center text-sm font-serif font-black italic shadow-2xs">
                    i
                  </div>
                  <span className="text-[10px] font-bold text-gray-700 leading-tight">ICICI Bank</span>
                </button>

                {/* SBI */}
                <button
                  type="button"
                  onClick={() => openRazorpay('netbanking_sbi')}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-gray-50 transition cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs font-black shadow-2xs">
                    SBI
                  </div>
                  <span className="text-[10px] font-bold text-gray-700 leading-tight">SBI</span>
                </button>

                {/* Axis */}
                <button
                  type="button"
                  onClick={() => openRazorpay('netbanking_axis')}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-gray-50 transition cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-900 text-white flex items-center justify-center text-xs font-black shadow-2xs">
                    Axis
                  </div>
                  <span className="text-[10px] font-bold text-gray-700 leading-tight">Axis Bank</span>
                </button>
              </div>

              {/* View More Banks Button */}
              <button
                type="button"
                onClick={() => openRazorpay('netbanking_all')}
                className="w-full pt-3 border-t border-gray-100 text-center text-xs font-black text-[#D81B60] hover:text-[#AD1457] transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>View More Banks (Kotak, PNB, BOB &amp; 50+ more)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ═════════ 5. CASH ON DELIVERY SECTION ═════════ */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-700 px-1 mb-2">
              Cash on Delivery
            </h3>

            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
              <div
                onClick={() => setSelectedCod((prev) => !prev)}
                className="p-4 hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <span className="text-base font-black">₹</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Pay by Cash / UPI on delivery</h4>
                    <p className="text-[11px] text-gray-500">Pay directly to courier upon arrival</p>
                  </div>
                </div>

                <input
                  type="radio"
                  name="payment_cod_radio"
                  checked={selectedCod}
                  onChange={() => setSelectedCod(true)}
                  className="w-5 h-5 text-emerald-600 border-gray-300 focus:ring-emerald-500 cursor-pointer"
                />
              </div>

              {/* Active COD Confirm Button */}
              {selectedCod && (
                <div className="p-4 bg-emerald-50/40 border-t border-emerald-100 animate-in fade-in duration-150">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleConfirmCod}
                    className="w-full bg-[#10845B] hover:bg-[#0D6D4A] disabled:opacity-50 text-white font-black h-12 rounded-xl uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Placing Order...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" /> Place Cash on Delivery Order • ₹{grandTotal.toLocaleString('en-IN')}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ── SECURITY FOOTER ── */}
        <div className="bg-white px-5 py-3 border-t border-gray-100 flex items-center justify-center gap-2 text-[11px] text-gray-400 font-medium shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>100% Safe &amp; Secure Payments</span>
        </div>

      </div>

      {/* ═════════ MODAL 1: PAY VIA QR CODE VIEW ═════════ */}
      {showQrModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-black uppercase text-gray-900 tracking-wide flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-[#D81B60]" /> Scan &amp; Pay via UPI
              </h3>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="p-1 text-gray-400 hover:text-black rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-56 h-56 mx-auto bg-white p-2 rounded-2xl border-2 border-gray-200 shadow-sm flex items-center justify-center">
              <img
                src={qrFallback ? fallbackQrUrl : primaryQrUrl}
                onError={() => setQrFallback(true)}
                alt="Scan to pay"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="bg-gray-50 rounded-xl p-3 text-left space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Merchant VPA</span>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-gray-900">{merchantUpiId}</span>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="text-xs font-bold text-[#D81B60] hover:text-[#AD1457] flex items-center gap-1 cursor-pointer"
                >
                  {copiedUpi ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedUpi ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowQrModal(false);
                setShowUpiConfirmModal(true);
              }}
              className="w-full bg-[#10845B] hover:bg-[#0D6D4A] text-white font-black h-12 rounded-xl uppercase tracking-wider text-xs flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" /> I Have Paid • Enter Reference
            </button>
          </div>
        </div>
      )}

      {/* ═════════ MODAL 2: DIRECT UPI CONFIRMATION ═════════ */}
      {showUpiConfirmModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-black uppercase text-gray-900 tracking-wide">
                Confirm UPI Payment
              </h3>
              <button
                type="button"
                onClick={() => setShowUpiConfirmModal(false)}
                className="p-1 text-gray-400 hover:text-black rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 text-left leading-relaxed">
              After completing the payment on your UPI app, enter your 12-digit transaction / UTR reference number to confirm your order:
            </p>

            <form onSubmit={handleConfirmDirectUpi} className="space-y-3 text-left">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  12-Digit UPI Ref / UTR Number *
                </label>
                <input
                  type="text"
                  required
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="e.g. 430129847120"
                  className="w-full border border-gray-300 rounded-xl p-3 text-xs font-mono font-bold uppercase tracking-wider focus:outline-none focus:border-black"
                />
              </div>

              {utrError && (
                <p className="text-[11px] text-red-600 font-semibold">{utrError}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#10845B] hover:bg-[#0D6D4A] disabled:opacity-50 text-white font-black h-12 rounded-xl uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" /> Verify &amp; Confirm Order
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}