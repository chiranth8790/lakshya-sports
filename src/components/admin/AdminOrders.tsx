import { useState } from 'react';
import { Search, Filter, Eye, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';

type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

interface Order {
  id: string;
  customer: string;
  email: string;
  date: string;
  total: number;
  items: number;
  status: OrderStatus;
}

const mockOrders: Order[] = [
  { id: '#1024', customer: 'Rahul Sharma', email: 'rahul.s@example.com', date: '2026-09-25', total: 15999, items: 2, status: 'PAID' as any }, // Simulating 'PROCESSING'
  { id: '#1023', customer: 'Arjun Reddy', email: 'arjun.r@example.com', date: '2026-09-24', total: 4999, items: 1, status: 'SHIPPED' },
  { id: '#1022', customer: 'Kiran Kumar', email: 'kiran.k@example.com', date: '2026-09-23', total: 8499, items: 3, status: 'PENDING' },
  { id: '#1021', customer: 'Priya Singh', email: 'priya.s@example.com', date: '2026-09-22', total: 21500, items: 4, status: 'DELIVERED' },
  { id: '#1020', customer: 'Amit Patel', email: 'amit.p@example.com', date: '2026-09-21', total: 3200, items: 1, status: 'CANCELLED' },
];

const statusStyles: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  PROCESSING: 'bg-blue-100 text-blue-800 border-blue-200',
  PAID: 'bg-blue-100 text-blue-800 border-blue-200', // Alias for Processing in this view
  SHIPPED: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  DELIVERED: 'bg-green-100 text-green-800 border-green-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
};

export default function AdminOrders() {
  const [filter, setFilter] = useState<string>('ALL');

  const filteredOrders = filter === 'ALL' 
    ? mockOrders 
    : mockOrders.filter(o => o.status === filter || (filter === 'PROCESSING' && o.status === 'PAID' as any));

  return (
    <div>
      <h1 className="text-2xl font-black text-gray-900 uppercase mb-2">Orders</h1>
      <p className="text-xs text-gray-500 font-semibold mb-8">Manage fulfillment, shipping, and customer order history.</p>

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
            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none focus:border-black"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
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
                  <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border ${statusStyles[order.status]}`}>
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
        
        {filteredOrders.length === 0 && (
          <div className="p-12 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
            No orders found for this filter.
          </div>
        )}
      </div>
    </div>
  );
}