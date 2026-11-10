import { useState } from 'react';
import { 
  CreditCard, 
  Banknote, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Lock, 
  AlertCircle, 
  Loader2,
  Store,
  Zap,
  Copy,
  QrCode
} from 'lucide-react';

export type PaymentMethodType = 'razorpay' | 'cod' | 'upi_direct' | 'store_pickup';

interface CustomPaymentPortalProps {
  grandTotal: number;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  isSubmitting: boolean;
  selectedMethod: PaymentMethodType;
  onMethodChange: (method: PaymentMethodType) => void;
  onPaymentComplete: (details: {
    paymentMethod: 'upi_direct' | 'card' | 'cod' | 'pay_at_store';
    paymentId?: string;
    utrNumber?: string;
    pickupStore?: string;
    status: 'Paid' | 'Processing';
  }) => Promise<void>;
  pickupStore?: string;
  onPickupStoreChange?: (store: string) => void;
}

export default function CustomPaymentPortal({
  grandTotal,
  orderId,
  customerName,
  customerPhone,
  customerEmail,
  isSubmitting,
  selectedMethod,
  onMethodChange,
  onPaymentComplete,
  pickupStore = 'Chikkalasandra Flagship Store (South Bengaluru)',
  onPickupStoreChange
}: CustomPaymentPortalProps) {
  // Merchant details for direct UPI fallback
  const merchantUpiId = import.meta.env.VITE_MERCHANT_UPI_ID || '8050856366@okaxis';
  const merchantName = import.meta.env.VITE_MERCHANT_NAME || 'Lakshya Sports';

  // Direct UPI state
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [utrError, setUtrError] = useState<string | null>(null);

  // Store options
  const STORES = [
    'Chikkalasandra Flagship Store (South Bengaluru)',
    'JP Nagar 7th Phase Store (Brigade Millennium Road)'
  ];

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(merchantUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // Launch official Razorpay standard popup
  const handleRazorpayPayment = () => {
    if (typeof (window as any).Razorpay === 'undefined') {
      alert('Razorpay payment gateway is currently loading or blocked by an adblocker. Please retry or choose Cash on Delivery / Direct UPI.');
      return;
    }

    const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_TuZm0ssvj8dZ6j';

    const options = {
      key: rzpKey,
      amount: Math.round(grandTotal * 100), // amount in paise
      currency: 'INR',
      name: 'Lakshya Sports',
      description: `Order ${orderId}`,
      image: '/website-logo.png',
      prefill: {
        name: customerName,
        email: customerEmail,
        contact: customerPhone
      },
      theme: {
        color: '#dc2626'
      },
      handler: async function (response: any) {
        await onPaymentComplete({
          paymentMethod: 'card',
          paymentId: response.razorpay_payment_id,
          status: 'Paid'
        });
      },
      modal: {
        ondismiss: function () {
          console.log('Payment modal closed by user');
        }
      }
    };

    try {
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        alert(`Payment Failed: ${resp.error?.description || 'Transaction declined'}`);
      });
      rzp.open();
    } catch (err: any) {
      console.error('Razorpay launch error:', err);
      alert('Unable to launch Razorpay. You can also complete your order via Cash on Delivery or Direct UPI.');
    }
  };

  // Handle Cash on Delivery Confirmation
  const handleCodSubmit = async () => {
    await onPaymentComplete({
      paymentMethod: 'cod',
      status: 'Processing'
    });
  };

  // Handle Direct UPI Confirmation
  const handleDirectUpiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUtr = utrNumber.trim();
    if (!cleanUtr || cleanUtr.length < 8) {
      setUtrError('Please enter a valid 12-digit UPI / UTR reference number from your payment app.');
      return;
    }
    setUtrError(null);
    await onPaymentComplete({
      paymentMethod: 'upi_direct',
      utrNumber: cleanUtr,
      status: 'Processing'
    });
  };

  // Handle Store Pickup Confirmation
  const handleStorePickupSubmit = async () => {
    await onPaymentComplete({
      paymentMethod: 'pay_at_store',
      pickupStore: pickupStore,
      status: 'Processing'
    });
  };

  const upiPaymentUri = `upi://pay?pa=${merchantUpiId}&pn=${encodeURIComponent(
    merchantName
  )}&am=${grandTotal}&cu=INR&tn=${encodeURIComponent(`Order ${orderId}`)}`;

  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=6&data=${encodeURIComponent(
    upiPaymentUri
  )}`;

  return (
    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-2xs font-sans">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-900 via-neutral-900 to-black text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                Step 2 of 2
              </span>
              <h2 className="text-base font-black uppercase tracking-tight text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                Select Payment Method
              </h2>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Encrypted 256-bit checkout. Order Ref: <span className="font-mono text-gray-300 font-bold">{orderId}</span>
            </p>
          </div>
          <div className="text-left sm:text-right bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-xs border border-white/10 shrink-0">
            <span className="text-[10px] uppercase font-bold text-gray-300 block">Total Payable</span>
            <span className="text-xl font-black text-white">₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Payment Method Cards */}
      <div className="p-6 space-y-4">

        {/* ── METHOD 1: RAZORPAY INSTANT ONLINE PAYMENT (RECOMMENDED) ── */}
        <div
          onClick={() => onMethodChange('razorpay')}
          className={`border-2 rounded-2xl p-5 cursor-pointer transition-all ${
            selectedMethod === 'razorpay'
              ? 'border-red-600 bg-red-50/20 shadow-sm'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="payment_choice"
                checked={selectedMethod === 'razorpay'}
                onChange={() => onMethodChange('razorpay')}
                className="mt-1 w-4 h-4 text-red-600 border-gray-300 focus:ring-red-600 cursor-pointer"
              />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">
                    Online Payment (UPI, Cards, NetBanking)
                  </h3>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-emerald-600 text-emerald-600" /> Instant & Recommended
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Pay securely with Google Pay, PhonePe, Paytm, BHIM, Credit/Debit Card (Visa, Mastercard, RuPay), or NetBanking.
                </p>

                {/* Trusted Badges */}
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded">GPay</span>
                  <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded">PhonePe</span>
                  <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded">Paytm</span>
                  <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded">UPI QR</span>
                  <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded">Cards</span>
                  <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded">NetBanking</span>
                </div>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-100/60 flex items-center justify-center text-red-600 shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>

          {/* Active Razorpay Button */}
          {selectedMethod === 'razorpay' && (
            <div className="mt-5 pt-4 border-t border-red-200/60 animate-in fade-in duration-200">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRazorpayPayment();
                }}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black h-13 rounded-xl uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition shadow-md hover:shadow-lg cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Finalizing Order...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" /> Pay ₹{grandTotal.toLocaleString('en-IN')} Securely via Razorpay
                  </>
                )}
              </button>
              <p className="text-center text-[10px] text-gray-400 mt-2 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero convenience fee • Protected by 256-bit bank security</span>
              </p>
            </div>
          )}
        </div>

        {/* ── METHOD 2: CASH ON DELIVERY (COD) ── */}
        <div
          onClick={() => onMethodChange('cod')}
          className={`border-2 rounded-2xl p-5 cursor-pointer transition-all ${
            selectedMethod === 'cod'
              ? 'border-neutral-900 bg-neutral-50 shadow-sm'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="payment_choice"
                checked={selectedMethod === 'cod'}
                onChange={() => onMethodChange('cod')}
                className="mt-1 w-4 h-4 text-black border-gray-300 focus:ring-black cursor-pointer"
              />
              <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">
                  Cash on Delivery (COD)
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Pay with cash or scan delivery agent&apos;s UPI QR code directly at your doorstep when your package arrives.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] font-bold text-neutral-700 bg-neutral-200 px-2 py-0.5 rounded">
                    Doorstep Verification
                  </span>
                  <span className="text-[11px] font-bold text-gray-900">
                    Payable: ₹{grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <Banknote className="w-5 h-5" />
            </div>
          </div>

          {/* Active COD Button */}
          {selectedMethod === 'cod' && (
            <div className="mt-5 pt-4 border-t border-neutral-200 animate-in fade-in duration-200">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCodSubmit();
                }}
                className="w-full bg-black hover:bg-neutral-800 disabled:opacity-50 text-white font-black h-13 rounded-xl uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition shadow-md hover:shadow-lg cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Confirming Order...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" /> Confirm Cash on Delivery Order (₹{grandTotal.toLocaleString('en-IN')})
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* ── METHOD 3: DIRECT STORE UPI QR (0% FEE) ── */}
        <div
          onClick={() => onMethodChange('upi_direct')}
          className={`border-2 rounded-2xl p-5 cursor-pointer transition-all ${
            selectedMethod === 'upi_direct'
              ? 'border-indigo-600 bg-indigo-50/20 shadow-sm'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="payment_choice"
                checked={selectedMethod === 'upi_direct'}
                onChange={() => onMethodChange('upi_direct')}
                className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-600 cursor-pointer"
              />
              <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">
                  Direct Store UPI QR (0% Commission)
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Scan Lakshya Sports flagship merchant QR code directly from your banking app.
                </p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
          </div>

          {/* Active Direct UPI Flow */}
          {selectedMethod === 'upi_direct' && (
            <div className="mt-5 pt-4 border-t border-indigo-200/60 animate-in fade-in duration-200 space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-6 bg-white p-4 rounded-2xl border border-gray-200">
                <div className="w-40 h-40 bg-white p-2 rounded-xl border border-gray-200 shadow-xs flex items-center justify-center shrink-0">
                  <img
                    src={qrCodeImageUrl}
                    alt="Scan UPI QR"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="flex-1 space-y-3 text-left w-full">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Merchant VPA</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono font-black text-gray-900 text-xs bg-gray-100 px-2.5 py-1 rounded-lg">
                        {merchantUpiId}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyUpi();
                        }}
                        className="text-xs text-indigo-600 font-bold hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedUpi ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedUpi ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <a
                    href={upiPaymentUri}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl shadow-xs"
                  >
                    <span>Tap to Pay with UPI App</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* UTR Input Form */}
              <form onSubmit={handleDirectUpiSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-700 mb-1">
                    Enter 12-Digit UPI Transaction / Ref (UTR) Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder="e.g. 430129847120"
                    className="w-full border border-gray-300 rounded-xl p-3 text-xs font-mono font-bold uppercase tracking-wider focus:outline-none focus:border-indigo-600 bg-white"
                  />
                </div>

                {utrError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{utrError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black h-12 rounded-xl uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Verifying Order...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" /> I Have Paid • Confirm Direct UPI Order
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* ── METHOD 4: PAY & PICK UP AT STORE ── */}
        <div
          onClick={() => onMethodChange('store_pickup')}
          className={`border-2 rounded-2xl p-5 cursor-pointer transition-all ${
            selectedMethod === 'store_pickup'
              ? 'border-blue-600 bg-blue-50/20 shadow-sm'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="payment_choice"
                checked={selectedMethod === 'store_pickup'}
                onChange={() => onMethodChange('store_pickup')}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-600 cursor-pointer"
              />
              <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">
                  Pay & Pick Up at Bengaluru Store
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Reserve your equipment online and collect directly from our Bengaluru pro shops with ready stringing & bat preparation.
                </p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
              <Store className="w-5 h-5" />
            </div>
          </div>

          {/* Active Store Pickup View */}
          {selectedMethod === 'store_pickup' && (
            <div className="mt-5 pt-4 border-t border-blue-200/60 animate-in fade-in duration-200 space-y-3">
              <label className="block text-[11px] font-bold text-gray-700 uppercase">Select Pickup Branch:</label>
              <div className="space-y-2">
                {STORES.map((st) => (
                  <label
                    key={st}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition ${
                      pickupStore === st
                        ? 'border-blue-600 bg-blue-50/50 font-bold text-blue-900'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="pickup_branch"
                      checked={pickupStore === st}
                      onChange={() => onPickupStoreChange && onPickupStoreChange(st)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>{st}</span>
                  </label>
                ))}
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStorePickupSubmit();
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black h-12 rounded-xl uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition shadow-sm cursor-pointer mt-3"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Reserving Order...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" /> Reserve for Store Pickup (₹{grandTotal.toLocaleString('en-IN')})
                  </>
                )}
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Security Footer */}
      <div className="bg-gray-50 p-4 border-t border-gray-100 flex items-center justify-center gap-4 text-[11px] text-gray-500 font-medium">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Genuine Pro Gear
        </span>
        <span>•</span>
        <span className="flex items-center gap-1.5">
          <Lock className="w-4 h-4 text-neutral-700" /> PCI-DSS Compliant & RBI 2FA
        </span>
      </div>
    </div>
  );
}
