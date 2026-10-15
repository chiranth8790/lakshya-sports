import { useState, useEffect } from 'react';
import { Search, ShoppingBag, Loader2 } from 'lucide-react';
import { supabase } from '../../library/supabase';

interface Order {
  id: string;
  order_id: string;
  customer_name: string;
  customer_email: string;
  created_at: string;
  total_amount: number;
  items: any[];
  status: string;
}

export default function AdminOrders() {
  const [filter, setFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status');
    } else {
      // Update local state to reflect change without refetching all
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    }
    setUpdating(null);
  };

  const filteredOrders = orders.filter((o) => {
    const matchesFilter = filter === 'ALL' || o.status.toUpperCase() === filter;
    const matchesSearch =
      o.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
      case 'PROCESSING':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'PAID':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SHIPPED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-black text-gray-900 uppercase mb-2">Orders & Fulfillment</h1>
      <p className="text-xs text-gray-500 font-semibold mb-6">Manage customer orders, shipments, and payment status.</p>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1 w-full sm:w-auto">
          {['ALL', 'PROCESSING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                filter === f 
                  ? 'bg-black text-white' 
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-black hover:text-black'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search Order ID or Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none focus:border-black"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-16 text-center flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-black animate-spin mb-4" />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Loading Orders...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Update Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-800">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-black text-gray-900 whitespace-nowrap">{order.order_id}</td>
                    <td className="p-4">
                      <div className="font-bold whitespace-nowrap">{order.customer_name}</div>
                      <div className="text-[10px] text-gray-400 font-medium">{order.customer_email}</div>
                    </td>
                    <td className="p-4 text-gray-500 whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="p-4 font-bold text-gray-900 whitespace-nowrap">
                      ₹{Number(order.total_amount).toLocaleString('en-IN')} 
                      <span className="text-[10px] text-gray-400 font-medium ml-1">
                        ({order.items?.length || 0} items)
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <select 
                        value={order.status}
                        disabled={updating === order.id}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="px-2 py-1.5 bg-gray-50 border border-gray-300 hover:border-black text-gray-900 rounded font-bold text-[10px] uppercase tracking-wider transition focus:outline-none focus:ring-1 focus:ring-black disabled:opacity-50 cursor-pointer"
                      >
                        <option value="Processing">Processing</option>
                        <option value="Paid">Paid</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-black text-gray-800 uppercase tracking-wider mb-1">No Orders Found</p>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {searchTerm || filter !== 'ALL'
                ? `No orders match filter "${filter}" or search query.`
                : 'Customer purchases will populate here automatically.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}