import { IndianRupee, ShoppingCart, Package, Users } from 'lucide-react';

export default function AdminDashboard() {
  // Static mock data for MVP setup
  const kpis = [
    { label: 'Total Revenue', value: '₹2,45,000', icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Orders', value: '128', icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Products', value: '86', icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Customers', value: '342', icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const recentOrders = [
    { id: '#1024', name: 'Rahul', product: 'Yonex Astrox 100ZZ', amount: '₹15,999', status: 'PAID', statusColor: 'bg-green-100 text-green-800' },
    { id: '#1023', name: 'Arjun', product: 'Yonex Shoe', amount: '₹4,999', status: 'SHIPPED', statusColor: 'bg-blue-100 text-blue-800' },
    { id: '#1022', name: 'Kiran', product: 'Badminton Kit', amount: '₹8,499', status: 'PENDING', statusColor: 'bg-amber-100 text-amber-800' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900 uppercase">Dashboard</h1>
        <select className="bg-white border border-gray-200 text-xs font-bold uppercase rounded-lg px-3 py-2 outline-none">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>Last 3 Months</option>
          <option>Last 1 Year</option>
        </select>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-gray-200 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">{kpi.label}</p>
              <p className="text-2xl font-black text-gray-900">{kpi.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${kpi.bg}`}>
              <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* REVENUE OVERVIEW (Placeholder Graph) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
          <h2 className="text-sm font-black uppercase text-gray-900 mb-6">Revenue Overview</h2>
          <div className="h-64 flex items-end justify-between gap-2">
            {[40, 70, 45, 90, 65, 100, 80].map((height, idx) => (
              <div key={idx} className="w-full bg-gray-100 rounded-t-sm relative group">
                <div 
                  className="absolute bottom-0 w-full bg-black rounded-t-sm transition-all duration-500"
                  style={{ height: `${height}%` }}
                ></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] font-bold text-gray-400 uppercase">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>

        {/* ALERTS / LOW STOCK */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
          <h2 className="text-sm font-black uppercase text-gray-900 mb-4">Low Stock Alerts</h2>
          <div className="space-y-3">
            {[1, 2].map((_, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-xs font-bold text-gray-900">Mavis 350 Nylon</p>
                  <p className="text-[10px] font-bold text-red-500 uppercase">2 Left in stock</p>
                </div>
                <button className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded text-gray-600 hover:bg-gray-200">Restock</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RECENT ORDERS TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden mt-6">
        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-sm font-black uppercase text-gray-900">Recent Orders</h2>
          <button className="text-xs font-bold text-gray-500 hover:text-black uppercase">View All</button>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-wider">
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Product</th>
              <th className="p-4">Amount</th>
              <th className="p-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-800">
            {recentOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition">
                <td className="p-4 font-black">{order.id}</td>
                <td className="p-4">{order.name}</td>
                <td className="p-4 text-gray-500">{order.product}</td>
                <td className="p-4 font-bold">{order.amount}</td>
                <td className="p-4 text-right">
                  <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider ${order.statusColor}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}