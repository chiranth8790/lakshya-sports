import { useState } from 'react';
import { Search, ShoppingBag, ShieldAlert } from 'lucide-react';

interface Order {
  id: string;
  customer: string;
  email: string;
  date: string;
  total: number;
  items: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
}

export default function AdminOrders() {
  const [filter, setFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Real orders array (currently empty until Razorpay integration logs orders)
  const orders: Order[] = [];

  const filteredOrders = orders.filter((o) => {
    const matchesFilter = filter === 'ALL' || o.status === filter;
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div>
      <h1 className="text-2xl font-black text-gray-900 uppercase mb-2">Orders & Fulfillment</h1>
      <p className="text-xs text-gray-500 font-semibold mb-6">Manage customer orders, shipments, and payment status.</p>

      {/* RAZORPAY API NOTICE */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 mb-6">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className="font-bold text-amber-900 uppercase tracking-wide">Razorpay Integration Pending</p>
          <p className="text-amber-700 mt-0.5 font-medium">
            Customer order records and payment receipts will sync automatically here once your Razorpay API keys are activated.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1 w-full sm:w-auto">
          {['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((f) => (
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
        {filteredOrders.length > 0 ? (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Date</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-800">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-black text-gray-900">{order.id}</td>
                  <td className="p-4">
                    <div className="font-bold">{order.customer}</div>
                    <div className="text-[10px] text-gray-400 font-medium">{order.email}</div>
                  </td>
                  <td className="p-4 text-gray-500">{order.date}</td>
                  <td className="p-4 font-bold text-gray-900">
                    ₹{order.total.toLocaleString('en-IN')} <span className="text-[10px] text-gray-400 font-medium ml-1">({order.items} items)</span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border bg-blue-100 text-blue-800 border-blue-200">
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded font-bold text-[10px] uppercase tracking-wider transition">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-16 text-center">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-black text-gray-800 uppercase tracking-wider mb-1">No Orders Found</p>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {searchTerm || filter !== 'ALL'
                ? `No orders match filter "${filter}" or search query.`
                : 'Customer purchases will populate here automatically once Razorpay checkout is configured.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}