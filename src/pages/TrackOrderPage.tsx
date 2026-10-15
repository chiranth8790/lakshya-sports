import { useState } from 'react';
import { supabase } from '../library/supabase';
import { 
  Search, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MapPin, 
  Calendar,
} from 'lucide-react';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const trimmedId = orderId.trim();
      let query = supabase.from('orders').select('*').eq('order_id', trimmedId);

      const { data, error: dbError } = await query.maybeSingle();

      if (dbError) throw dbError;

      if (!data) {
        setError("We couldn't find an order matching that Order ID. Please double check and try again.");
      } else {
        // Optional verification if contact was provided
        if (contact.trim()) {
          const matchEmail = data.customer_email?.toLowerCase() === contact.trim().toLowerCase();
          const matchPhone = data.customer_phone?.replace(/\D/g, '') === contact.trim().replace(/\D/g, '');
          if (!matchEmail && !matchPhone) {
            setError("Order found, but the email or phone number does not match this order's records.");
            setLoading(false);
            return;
          }
        }
        setOrder(data);
      }
    } catch (err: any) {
      console.error('Tracking fetch error:', err);
      setError('An error occurred while tracking your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Status step calculations
  const getStepStatus = (currentStatus: string) => {
    const s = (currentStatus || '').toLowerCase();
    if (s === 'delivered') return 3;
    if (s === 'shipped') return 2;
    if (s === 'processing' || s === 'paid') return 1;
    return 1;
  };

  const currentStep = order ? getStepStatus(order.status) : 1;

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="text-[11px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1 rounded-full inline-block mb-3">
          Live Tracking
        </span>
        <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900 mb-2">Track Your Shipment</h1>
        <p className="text-xs text-gray-500">
          Enter your Order ID received via SMS or receipt to check real-time fulfillment and delivery status.
        </p>
      </div>

      {/* Input Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm max-w-xl mx-auto mb-10">
        <form onSubmit={handleTrack} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
              Order ID *
            </label>
            <input
              type="text"
              required
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. ORD-123456-7890"
              className="w-full border border-gray-200 rounded-xl p-3 text-xs font-mono uppercase focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
              Email or Phone Number (Optional verification)
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="name@example.com or 10-digit mobile"
              className="w-full border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-black"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black hover:bg-neutral-800 text-white font-bold h-12 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? (
              <span>Looking up shipment...</span>
            ) : (
              <>
                <Search className="w-4 h-4" /> Track Order Status
              </>
            )}
          </button>
        </form>
      </div>

      {/* Result Display */}
      {order && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-8 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black uppercase text-gray-900 font-mono">{order.order_id}</h2>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-neutral-900 text-white">
                  {order.status || 'Processing'}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> 
                Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-400 block font-medium">Order Total</span>
              <span className="text-lg font-black text-gray-900">₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-6">Delivery Progress</h3>
            <div className="grid grid-cols-3 gap-2 relative">
              {/* Connector line */}
              <div className="absolute top-4 left-1/6 right-1/6 h-0.5 bg-gray-200 -z-0" />
              
              {/* Step 1 */}
              <div className="text-center z-10 flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 ${
                  currentStep >= 1 ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase text-gray-900 block">Processing</span>
                <span className="text-[10px] text-gray-400">Order Confirmed</span>
              </div>

              {/* Step 2 */}
              <div className="text-center z-10 flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 ${
                  currentStep >= 2 ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  <Truck className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase text-gray-900 block">Shipped</span>
                <span className="text-[10px] text-gray-400">In Transit with Courier</span>
              </div>

              {/* Step 3 */}
              <div className="text-center z-10 flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 ${
                  currentStep >= 3 ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase text-gray-900 block">Delivered</span>
                <span className="text-[10px] text-gray-400">Arrived at destination</span>
              </div>
            </div>
          </div>

          {/* Items & Shipping Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">Items in Shipment</h3>
              <div className="space-y-3">
                {(order.items || []).map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-12 h-12 object-contain bg-white rounded-lg p-1 border border-gray-200 shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-gray-900 truncate">{item.name}</h4>
                      <p className="text-[10px] text-gray-500">Qty: {item.quantity} • ₹{Number(item.price).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">Delivery Destination</h3>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2 text-xs">
                <div className="flex items-start gap-2 text-gray-700">
                  <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-900 block">{order.customer_name}</span>
                    <span>{order.shipping_address?.street}, {order.shipping_address?.city}</span>
                    <span className="block">{order.shipping_address?.state} - {order.shipping_address?.pincode}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
