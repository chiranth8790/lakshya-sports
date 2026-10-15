import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Package, Heart, LogOut, ArrowLeft, Loader2, RefreshCw, ChevronRight, X, MapPin, Receipt, CheckCircle2, Printer } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../library/supabase';
import OrderReceiptModal from '../components/OrderReceiptModal';

interface Order {
  id: string;
  order_id: string;
  created_at: string;
  total_amount: number;
  subtotal: number;
  shipping_fee: number;
  items: any[];
  status: string;
  shipping_address: any;
  customer_name: string;
  customer_phone: string;
}

export default function AccountPage() {
  const { wishlistCount } = useWishlist();
  const { totalCount } = useCart();
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<any | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth', { replace: true, state: { from: { pathname: '/account' } } });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data);
    }
    setOrdersLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-black animate-spin mx-auto mb-3" />
          <p className="text-xs font-black uppercase tracking-widest text-gray-500">Loading Account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 relative">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-[11px] font-black text-gray-400 hover:text-black uppercase tracking-widest transition"
          >
            <ArrowLeft className="w-4 h-4" /> Storefront
          </Link>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 text-[11px] font-black text-red-600 hover:bg-red-600 hover:text-white uppercase tracking-widest border border-red-200 px-4 py-2 rounded-xl transition"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-50 pointer-events-none" />
          
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-20 h-20 rounded-2xl bg-black text-white flex items-center justify-center font-black text-3xl shadow-md shrink-0">
              {profile?.full_name?.charAt(0).toUpperCase() || <User className="w-8 h-8 stroke-[2]" />}
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Welcome Back</p>
              <h1 className="text-2xl sm:text-3xl font-black uppercase text-gray-900 leading-tight">
                {profile?.full_name || 'Lakshya Member'}
              </h1>
              <p className="text-xs font-bold text-gray-500 mt-1">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Quick Links Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Quick Access</h2>
            
            <Link
              to="/cart"
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs hover:border-black transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors duration-300">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900 uppercase">Active Bag</h3>
                  <p className="text-[11px] text-gray-500 font-semibold mt-0.5">{totalCount} items ready</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-black transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              to="/wishlist"
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs hover:border-red-200 transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900 uppercase">Wishlist</h3>
                  <p className="text-[11px] text-gray-500 font-semibold mt-0.5">{wishlistCount} saved gear</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-red-600 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Order History */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-8 min-h-[400px]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-lg font-black text-gray-900 uppercase tracking-wider">Order History</h2>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">Your recent purchases</p>
                </div>
                <button 
                  onClick={fetchOrders} 
                  className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-100 transition"
                >
                  <RefreshCw className={`w-4 h-4 ${ordersLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {ordersLoading ? (
                <div className="py-20 text-center">
                  <Loader2 className="w-8 h-8 text-black animate-spin mx-auto mb-3" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading Orders...</p>
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div 
                      key={order.id} 
                      onClick={() => setSelectedOrder(order)}
                      className="group border border-gray-100 rounded-2xl p-5 hover:border-black cursor-pointer transition-all duration-300 bg-white hover:shadow-md"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                            <Package className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900">{order.order_id}</p>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                              {new Date(order.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric'
                              })} • {order.items.length} Items
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-sm font-black text-gray-900">
                              ₹{order.total_amount.toLocaleString('en-IN')}
                            </p>
                            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-gray-100 text-gray-600 group-hover:bg-black group-hover:text-white transition-colors">
                              {order.status}
                            </span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-black transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Package className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-sm font-black text-gray-900 uppercase tracking-widest mb-2">No Orders Yet</p>
                  <p className="text-xs text-gray-500 font-medium max-w-xs mx-auto">When you buy tournament gear, your order history will appear here.</p>
                  <Link to="/" className="inline-block mt-6 bg-black text-white text-[11px] font-black uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-neutral-800 transition shadow-md">
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div 
            className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-lg font-black text-gray-900 uppercase">Order Details</h3>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{selectedOrder.order_id}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black hover:border-black transition active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Status & Dates */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${selectedOrder.status === 'Delivered' ? 'text-green-600' : 'text-blue-600'}`} />
                    <span className="text-sm font-black text-gray-900 uppercase tracking-wide">{selectedOrder.status}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order Date</p>
                  <p className="text-sm font-bold text-gray-900">
                    {new Date(selectedOrder.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Payment Method</p>
                  <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                    {selectedOrder.status === 'Processing' && selectedOrder.total_amount > 0 ? 'Cash on Delivery' : 'Prepaid (Razorpay)'}
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Purchased Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item: any, idx: number) => {
                    const originalPrice = item.originalPrice || item.price;
                    const hasDiscount = originalPrice > item.price;
                    
                    return (
                      <div key={idx} className="flex gap-4 p-3 border border-gray-100 rounded-2xl bg-white">
                        <div className="w-20 h-20 bg-gray-50 rounded-xl p-2 shrink-0 border border-gray-100 flex items-center justify-center">
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                        </div>
                        <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{item.brand || 'LAKSHYA'}</p>
                            <p className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 leading-snug">{item.name}</p>
                          </div>
                          <div className="flex items-end justify-between mt-2">
                            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                              Qty: {item.quantity}
                            </p>
                            <div className="text-right">
                              {hasDiscount && (
                                <p className="text-[10px] text-gray-400 line-through mb-0.5">₹{Number(originalPrice).toLocaleString('en-IN')}</p>
                              )}
                              <p className="text-sm font-black text-gray-900">₹{Number(item.price).toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Shipping Details */}
                <div>
                  <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Delivery Details
                  </h4>
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 h-full">
                    <p className="text-xs font-black text-gray-900 uppercase tracking-wide mb-1">{selectedOrder.customer_name}</p>
                    <p className="text-xs font-bold text-gray-600 mb-3">{selectedOrder.customer_phone}</p>
                    <p className="text-xs font-medium text-gray-600 leading-relaxed">
                      {selectedOrder.shipping_address?.street}<br />
                      {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state}<br />
                      {selectedOrder.shipping_address?.pincode}
                    </p>
                  </div>
                </div>

                {/* Order Summary / Bill */}
                <div>
                  <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1 flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5" /> Bill Summary
                  </h4>
                  <div className="bg-gray-900 rounded-2xl p-5 text-white h-full flex flex-col">
                    <div className="space-y-3 flex-1">
                      <div className="flex justify-between text-xs font-bold text-gray-400">
                        <span>Subtotal</span>
                        <span className="text-white">₹{Number(selectedOrder.subtotal).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-gray-400">
                        <span>Shipping</span>
                        <span className="text-white">
                          {selectedOrder.shipping_fee === 0 ? 'FREE' : `₹${selectedOrder.shipping_fee}`}
                        </span>
                      </div>
                    </div>
                    
                    <div className="pt-4 mt-4 border-t border-gray-700">
                      <div className="flex justify-between items-end mb-4">
                        <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">Total Paid</span>
                        <span className="text-2xl font-black text-white">₹{Number(selectedOrder.total_amount).toLocaleString('en-IN')}</span>
                      </div>
                      <button
                        onClick={() => setReceiptOrder(selectedOrder)}
                        className="w-full bg-white hover:bg-gray-100 text-gray-900 font-black py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition"
                      >
                        <Printer className="w-3.5 h-3.5" /> Print Tax Invoice
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Official Tax Invoice / Receipt Modal */}
      <OrderReceiptModal
        order={receiptOrder}
        isOpen={Boolean(receiptOrder)}
        onClose={() => setReceiptOrder(null)}
      />
    </div>
  );
}