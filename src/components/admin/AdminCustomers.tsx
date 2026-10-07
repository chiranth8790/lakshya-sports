import { useState } from 'react';
import { Search, Mail, ExternalLink, Users, ShieldAlert } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  orders: number;
  spent: number;
  lastActive: string;
}

export default function AdminCustomers() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Real customers array (empty until checkout syncs registered users / orders)
  const customers: Customer[] = [];

  const filteredCustomers = customers.filter(
    (c) => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-black text-gray-900 uppercase mb-2">Customers</h1>
      <p className="text-xs text-gray-500 font-semibold mb-6">View customer profiles, lifetime value, and order history.</p>

      {/* RAZORPAY API NOTICE */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 mb-6">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className="font-bold text-amber-900 uppercase tracking-wide">Razorpay Integration Pending</p>
          <p className="text-amber-700 mt-0.5 font-medium">
            Customer profiles will be created and tracked automatically as users complete purchases using Razorpay.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-black"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
        {filteredCustomers.length > 0 ? (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                <th className="p-4">Customer</th>
                <th className="p-4">Total Orders</th>
                <th className="p-4">Total Spent</th>
                <th className="p-4">Last Active</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-800">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200 shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{customer.name}</div>
                      <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" /> {customer.email}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-md text-[10px] font-black text-gray-700">
                      {customer.orders} Orders
                    </span>
                  </td>
                  <td className="p-4 font-bold text-gray-900">₹{customer.spent.toLocaleString('en-IN')}</td>
                  <td className="p-4 text-gray-500">{customer.lastActive}</td>
                  <td className="p-4 text-right">
                    <button className="px-3 py-1.5 bg-white border border-gray-200 hover:border-black text-gray-700 hover:text-black rounded-lg font-bold text-[10px] uppercase tracking-wider transition flex items-center justify-center gap-1 ml-auto">
                      View Profile <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-16 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-black text-gray-800 uppercase tracking-wider mb-1">No Customers Registered Yet</p>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Customer activity and checkout statistics will build up dynamically as orders are processed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}