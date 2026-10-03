import { useState } from 'react';
import { Search, Mail, ExternalLink, User } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  orders: number;
  spent: number;
  lastActive: string;
}

const mockCustomers: Customer[] = [
  { id: 'CUST-001', name: 'Rahul Sharma', email: 'rahul.s@example.com', orders: 12, spent: 45000, lastActive: '2026-09-25' },
  { id: 'CUST-002', name: 'Arjun Reddy', email: 'arjun.r@example.com', orders: 4, spent: 12500, lastActive: '2026-09-20' },
  { id: 'CUST-003', name: 'Kiran Kumar', email: 'kiran.k@example.com', orders: 1, spent: 8499, lastActive: '2026-09-15' },
  { id: 'CUST-004', name: 'Priya Singh', email: 'priya.s@example.com', orders: 6, spent: 32000, lastActive: '2026-09-10' },
  { id: 'CUST-005', name: 'Amit Patel', email: 'amit.p@example.com', orders: 2, spent: 7800, lastActive: '2026-09-01' },
];

export default function AdminCustomers() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = mockCustomers.filter(
    (c) => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-black text-gray-900 uppercase mb-2">Customers</h1>
      <p className="text-xs text-gray-500 font-semibold mb-8">View customer details, purchase history, and lifetime value.</p>

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
                    <User className="w-4 h-4" />
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
        
        {filteredCustomers.length === 0 && (
          <div className="p-12 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
            No customers found matching &quot;{searchTerm}&quot;
          </div>
        )}
      </div>
    </div>
  );
}