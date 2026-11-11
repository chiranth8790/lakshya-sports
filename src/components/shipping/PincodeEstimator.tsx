import { useState, useEffect } from 'react';
import { Truck, Zap, MapPin, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { getDeliveryEstimate, getSavedPincode, saveUserPincode } from '../../utils/shippingService';
import type { ShippingEstimate } from '../../utils/shippingService';

export default function PincodeEstimator() {
  const [pincode, setPincode] = useState('');
  const [estimate, setEstimate] = useState<ShippingEstimate | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const saved = getSavedPincode();
    if (saved && saved.length === 6) {
      setPincode(saved);
      const est = getDeliveryEstimate(saved);
      if (est) {
        setEstimate(est);
        setHasChecked(true);
      }
    }
  }, []);

  const handlePincodeChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 6);
    setPincode(clean);
    if (clean.length === 6) {
      saveUserPincode(clean);
      setEstimate(getDeliveryEstimate(clean));
      setHasChecked(true);
    } else {
      setEstimate(null);
      setHasChecked(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length === 6) {
      saveUserPincode(pincode);
      setEstimate(getDeliveryEstimate(pincode));
      setHasChecked(true);
    }
  };

  return (
    <div className="bg-linear-to-br from-gray-50 to-white rounded-2xl p-4 sm:p-4.5 border border-gray-200/90 shadow-2xs space-y-3 my-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-red-600" />
          <span className="text-xs font-black uppercase tracking-wider text-gray-900">
            Delivery &amp; Instant Dispatch
          </span>
        </div>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Pan-India
        </span>
      </div>

      {/* Input row */}
      <form onSubmit={handleFormSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter 6-digit PIN code (e.g. 560061)"
            value={pincode}
            onChange={(e) => handlePincodeChange(e.target.value)}
            className="w-full h-10 px-3 text-xs font-bold tracking-wider placeholder:font-normal placeholder:tracking-normal rounded-xl border border-gray-300 bg-white focus:outline-hidden focus:border-black transition"
          />
          {pincode.length === 6 && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </span>
          )}
        </div>
        <button
          type="submit"
          className="px-4 h-10 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-black uppercase tracking-wider transition cursor-pointer shrink-0"
        >
          Check
        </button>
      </form>

      {/* Dynamic Result Display */}
      {hasChecked && estimate && (
        <div className="pt-2 border-t border-gray-100 animate-in fade-in space-y-2">
          {estimate.isInstantEligible ? (
            /* Bangalore <20km Hyperlocal Active */
            <div className="bg-amber-500/10 border border-amber-300/80 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="inline-flex items-center gap-1 bg-amber-500 text-black text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider shadow-2xs">
                  <Zap className="w-3 h-3 fill-black text-black" /> Instant 2-Hour Delivery
                </span>
                <span className="text-[11px] font-bold text-amber-900">
                  Bengaluru Local (&lt; 20 km)
                </span>
              </div>
              <p className="text-xs font-black text-gray-900 flex items-center gap-1.5 mt-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Get it in <strong>60–120 Minutes</strong> via <strong>Shiprocket Quick</strong></span>
              </p>
              <p className="text-[11px] text-gray-600 mt-1">
                On-demand rider dispatched directly from our Chikkalasandra / JP Nagar stores.
              </p>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 mt-2 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200/60">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Free delivery on orders above ₹1,999 • Standard 24h delivery also available</span>
              </div>
            </div>
          ) : (
            /* Outside Bangalore - Standard Courier */
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="inline-flex items-center gap-1 bg-blue-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                  <Truck className="w-3 h-3" /> Express Shipping
                </span>
                <span className="text-[11px] font-bold text-gray-700">
                  {estimate.city}
                </span>
              </div>
              <p className="text-xs font-bold text-gray-900 flex items-center gap-1.5 mt-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Estimated Delivery: <span className="text-red-600 font-black">{estimate.standardETA}</span></span>
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                Fulfilled via <strong>{estimate.standardCourier}</strong> with real-time tracking link shared via WhatsApp &amp; SMS.
              </p>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 mt-2 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200/60">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Free Shipping above ₹1,999 • 100% Insured Transit</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
