import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  CreditCard, 
  Banknote, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Lock, 
  Clock, 
  AlertCircle, 
  Loader2
} from 'lucide-react';

interface CustomPaymentPortalProps {
  grandTotal: number;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  isSubmitting: boolean;
  onPaymentComplete: (details: {
    paymentMethod: 'upi_direct' | 'card' | 'cod';
    paymentId?: string;
    utrNumber?: string;
    pickupStore?: string;
    status: 'Paid' | 'Processing';
  }) => Promise<void>;
}

export default function CustomPaymentPortal({
  grandTotal,
  orderId,
  customerName,
  customerPhone,
  customerEmail,
  isSubmitting,
  onPaymentComplete
}: CustomPaymentPortalProps) {
  // Configurable merchant UPI ID (fallback to store phone or configurable via env)
  const merchantUpiId = import.meta.env.VITE_MERCHANT_UPI_ID || '8050856366@okaxis';
  const merchantName = import.meta.env.VITE_MERCHANT_NAME || 'Lakshya Sports';

  // Active Tab: 'upi' | 'card' | 'cod'
  const [activeTab, setActiveTab] = useState<'upi' | 'card' | 'cod'>('upi');

  // UPI State
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [utrError, setUtrError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(600); // 10 minutes timer

  // Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState(customerName || '');
  const [cardError, setCardError] = useState<string | null>(null);

  // Format 10:00 timer countdown
  useEffect(() => {
    if (activeTab !== 'upi' || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeTab, countdown]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate standard NPCI UPI payment string
  const upiPaymentUri = `upi://pay?pa=${merchantUpiId}&pn=${encodeURIComponent(
    merchantName
  )}&am=${grandTotal}&cu=INR&tn=${encodeURIComponent(`Order ${orderId}`)}`;

  // Generate dynamic QR code image URL
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=8&data=${encodeURIComponent(
    upiPaymentUri
  )}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(merchantUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // Card Number Formatting
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Card Expiry Formatting
  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2, 4)}`;
    }
    setCardExpiry(raw);
  };

  // Detect Card Brand
  const getCardBrand = (num: string) => {
    const clean = num.replace(/\s/g, '');
    if (/^4/.test(clean)) return 'Visa';
    if (/^5[1-5]/.test(clean)) return 'MasterCard';
    if (/^6(011|5)/.test(clean) || /^64[4-9]/.test(clean)) return 'Discover';
    if (/^3[47]/.test(clean)) return 'Amex';
    if (/^(508[5-9]|652[1-2]|60)/.test(clean)) return 'RuPay';
    return null;
  };

  // 1. Submit UPI Direct Order
  const handleUpiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUtrError(null);

    const cleanUtr = utrNumber.trim().replace(/\s/g, '');
    if (cleanUtr.length < 6) {
      setUtrError('Please enter a valid 12-digit UPI Reference Number / UTR from your UPI payment app.');
      return;
    }

    await onPaymentComplete({
      paymentMethod: 'upi_direct',
      utrNumber: cleanUtr,
      status: 'Paid'
    });
  };

  // 2. Submit Card Order (via Razorpay custom headless processing)
  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCardError(null);

    const cleanCard = cardNumber.replace(/\s/g, '');
    if (cleanCard.length < 15) {
      setCardError('Please enter a valid card number.');
      return;
    }

    if (!cardExpiry || cardExpiry.length < 5) {
      setCardError('Please enter card expiry as MM/YY.');
      return;
    }

    if (!cardCvv || cardCvv.length < 3) {
      setCardError('Please enter a valid CVV.');
      return;
    }

    // Process through Razorpay headless/direct integration
    try {
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKey || !(window as any).Razorpay) {
        throw new Error('Payment gateway initializing. Please try again or use direct UPI.');
      }

      const [expMonth, expYear] = cardExpiry.split('/');
      const fullYear = expYear.length === 2 ? `20${expYear}` : expYear;

      const options = {
        key: razorpayKey,
        amount: Math.round(grandTotal * 100),
        currency: 'INR',
        name: 'Lakshya Sports',
        description: `Order ${orderId}`,
        prefill: {
          name: cardHolder || customerName,
          email: customerEmail,
          contact: customerPhone,
          method: 'card'
        },
        card: {
          number: cleanCard,
          expiry_month: expMonth,
          expiry_year: fullYear,
          cvv: cardCvv,
          name: cardHolder || customerName
        },
        theme: {
          color: '#000000'
        },
        // Direct card prefill without showing standard generic catalog modal
        handler: async function (response: any) {
          await onPaymentComplete({
            paymentMethod: 'card',
            paymentId: response.razorpay_payment_id,
            status: 'Paid'
          });
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        setCardError(resp.error?.description || 'Card payment declined by issuing bank.');
      });
      rzp.open();
    } catch (err: any) {
      console.error('Card process error:', err);
      setCardError(err.message || 'Payment initiation failed. Please try UPI for instant checkout.');
    }
  };

  // 3. Submit COD Order
  const handleCodSubmit = async () => {
    await onPaymentComplete({
      paymentMethod: 'cod',
      status: 'Processing'
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
      
      {/* Header */}
      <div className="bg-neutral-950 text-white p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-950/60 border border-red-900/40 px-3 py-1 rounded-full inline-block mb-2">
            Secure In-Page Checkout
          </span>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
            Complete Your Payment
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Order Ref: <span className="font-mono font-bold text-white">{orderId}</span>
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl px-5 py-3 text-right w-full sm:w-auto">
          <span className="text-[10px] text-neutral-400 uppercase font-bold block">Payable Amount</span>
          <span className="text-2xl font-black font-mono text-white">
            ₹{grandTotal.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Payment Tabs Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-gray-200 bg-gray-50/70 p-2 gap-2 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('upi')}
          className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'upi'
              ? 'bg-black text-white shadow-xs'
              : 'text-gray-600 hover:text-black hover:bg-white'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span className="uppercase text-[11px] tracking-wide">Instant UPI / QR</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('card')}
          className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'card'
              ? 'bg-black text-white shadow-xs'
              : 'text-gray-600 hover:text-black hover:bg-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span className="uppercase text-[11px] tracking-wide">Debit / Credit Card</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cod')}
          className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'cod'
              ? 'bg-black text-white shadow-xs'
              : 'text-gray-600 hover:text-black hover:bg-white'
          }`}
        >
          <Banknote className="w-4 h-4" />
          <span className="uppercase text-[11px] tracking-wide">Cash on Delivery</span>
        </button>
      </div>

      {/* TAB CONTENT AREA */}
      <div className="p-6 sm:p-8">

        {/* ── TAB 1: INSTANT DIRECT UPI QR & APPS ── */}
        {activeTab === 'upi' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Left: Dynamic QR Code Box */}
            <div className="md:col-span-5 flex flex-col items-center bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-3">
                <Clock className="w-4 h-4 text-red-600" />
                <span>Session Expires In: <strong className="font-mono text-red-600">{formatTimer(countdown)}</strong></span>
              </div>

              {/* QR Code Container */}
              <div className="p-3 bg-white border border-gray-200 rounded-2xl shadow-sm mb-4">
                <img
                  src={qrCodeImageUrl}
                  alt={`UPI QR Code for ${orderId}`}
                  className="w-56 h-56 object-contain rounded-lg"
                  loading="eager"
                />
              </div>

              <span className="text-[11px] font-black uppercase text-gray-900 tracking-wider mb-1">
                Scan with Any UPI App
              </span>
              <p className="text-[11px] text-gray-500 max-w-xs">
                Google Pay • PhonePe • Paytm • BHIM • CRED
              </p>

              {/* Copyable UPI VPA Box */}
              <div className="mt-4 pt-4 border-t border-gray-200 w-full flex items-center justify-between bg-white px-3 py-2 rounded-xl border">
                <div className="text-left text-[11px]">
                  <span className="text-gray-400 block text-[9px] uppercase font-bold">Store UPI ID</span>
                  <span className="font-mono font-bold text-gray-900">{merchantUpiId}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="text-xs flex items-center gap-1 font-bold text-red-600 hover:text-black cursor-pointer"
                >
                  {copiedUpi ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right: Mobile 1-Tap Buttons & UTR Verification */}
            <div className="md:col-span-7 space-y-6">
              
              {/* Mobile 1-Tap App Deep-links */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 mb-3 flex items-center gap-1.5">
                  <span>Fast Pay on Mobile</span>
                  <span className="text-[10px] font-normal text-gray-500 normal-case">(Tap to open your app)</span>
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={upiPaymentUri}
                    className="p-3 bg-white border border-gray-200 hover:border-black rounded-xl text-xs font-bold text-gray-900 flex items-center justify-between transition group shadow-2xs"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      Google Pay
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-black transition" />
                  </a>

                  <a
                    href={upiPaymentUri}
                    className="p-3 bg-white border border-gray-200 hover:border-black rounded-xl text-xs font-bold text-gray-900 flex items-center justify-between transition group shadow-2xs"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                      PhonePe
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-black transition" />
                  </a>

                  <a
                    href={upiPaymentUri}
                    className="p-3 bg-white border border-gray-200 hover:border-black rounded-xl text-xs font-bold text-gray-900 flex items-center justify-between transition group shadow-2xs"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                      Paytm
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-black transition" />
                  </a>

                  <a
                    href={upiPaymentUri}
                    className="p-3 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center justify-between transition shadow-2xs"
                  >
                    <span>Any UPI App</span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-300" />
                  </a>
                </div>
              </div>

              {/* UTR Verification Form */}
              <form onSubmit={handleUpiSubmit} className="pt-6 border-t border-gray-200 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Enter UPI Reference / UTR Number (12 Digits) *
                  </label>
                  <p className="text-[11px] text-gray-400 mb-2">
                    After completing the payment on your app, copy the 12-digit UTR/Ref number and paste it below to instantly confirm your order.
                  </p>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder="e.g. 430129847120"
                    className="w-full border border-gray-300 rounded-xl p-3 text-xs font-mono font-bold uppercase tracking-wider focus:outline-none focus:border-black bg-gray-50/50"
                  />
                </div>

                {utrError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{utrError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black h-12 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Verifying Payment...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" /> I Have Paid • Confirm Order
                    </>
                  )}
                </button>
              </form>

              <div className="flex items-center gap-2 text-[11px] text-gray-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero transaction fees. Direct merchant-verified bank settlement.</span>
              </div>
            </div>

          </div>
        )}

        {/* ── TAB 2: SEAMLESS IN-PAGE CARD FORM ── */}
        {activeTab === 'card' && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-black uppercase text-gray-900 tracking-wide">
                  Debit or Credit Card
                </h3>
                <p className="text-xs text-gray-500">
                  256-bit encrypted bank checkout with automated 3D-Secure OTP
                </p>
              </div>
              <div className="flex gap-1.5">
                <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded">VISA</span>
                <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded">MasterCard</span>
                <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded">RuPay</span>
              </div>
            </div>

            <form onSubmit={handleCardSubmit} className="space-y-4">
              {/* Card Number */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold uppercase text-gray-700">Card Number *</label>
                  {getCardBrand(cardNumber) && (
                    <span className="text-[10px] font-black text-red-600 uppercase">
                      {getCardBrand(cardNumber)} Detected
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="4000 1234 5678 9010"
                    className="w-full border border-gray-300 rounded-xl p-3 text-xs font-mono font-bold tracking-wider focus:outline-none focus:border-black pr-10"
                  />
                  <CreditCard className="w-4 h-4 text-gray-400 absolute right-3 top-3.5" />
                </div>
              </div>

              {/* Cardholder Name */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Cardholder Name *
                </label>
                <input
                  type="text"
                  required
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="e.g. Virat Kohli"
                  className="w-full border border-gray-300 rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-black"
                />
              </div>

              {/* Expiry & CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Expiry Date (MM/YY) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={cardExpiry}
                    onChange={handleCardExpiryChange}
                    placeholder="MM/YY"
                    className="w-full border border-gray-300 rounded-xl p-3 text-xs font-mono font-bold focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    CVV / CVC (3-4 Digits) *
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                      placeholder="•••"
                      className="w-full border border-gray-300 rounded-xl p-3 text-xs font-mono font-bold focus:outline-none focus:border-black pr-10"
                    />
                    <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-3.5" />
                  </div>
                </div>
              </div>

              {cardError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{cardError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black hover:bg-neutral-800 disabled:opacity-50 text-white font-black h-12 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-sm mt-4"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Verifying With Bank...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" /> Pay ₹{grandTotal.toLocaleString('en-IN')} Securely
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 pt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Protected by 256-bit SSL & RBI Mandated 2-Factor Authentication</span>
              </div>
            </form>
          </div>
        )}

        {/* ── TAB 3: CASH ON DELIVERY ── */}
        {activeTab === 'cod' && (
          <div className="max-w-xl mx-auto space-y-6 text-center">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <Banknote className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-black uppercase text-gray-900 tracking-wide mb-1">
                Cash on Delivery (COD)
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed max-w-md mx-auto">
                Pay with cash or UPI directly to the courier agent when your package is delivered to your doorstep.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between text-gray-600">
                <span>Payable at Doorstep:</span>
                <span className="font-mono font-bold text-gray-900">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Accepted at Delivery:</span>
                <span className="font-bold text-gray-900">Cash or UPI QR</span>
              </div>
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleCodSubmit}
              className="w-full max-w-md mx-auto bg-black hover:bg-neutral-800 disabled:opacity-50 text-white font-black h-12 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Confirming Order...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" /> Confirm Cash on Delivery Order
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
