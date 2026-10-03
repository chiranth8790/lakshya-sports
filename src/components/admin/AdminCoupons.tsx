import { useState, useEffect } from 'react';
import { Plus, Tag, Trash2, Copy, Check } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  usageCount: number;
  expiry: string;
  active: boolean;
}

const DEFAULT_COUPONS: Coupon[] = [
  { id: '1', code: 'WELCOME10', type: 'PERCENTAGE', value: 10, usageCount: 0, expiry: '2026-12-31', active: true },
  { id: '2', code: 'SPORT500', type: 'FIXED', value: 500, usageCount: 0, expiry: '2026-10-15', active: true },
];

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const stored = localStorage.getItem('lakshya_coupons');
      return stored ? JSON.parse(stored) : DEFAULT_COUPONS;
    } catch {
      return DEFAULT_COUPONS;
    }
  });

  const [activeTab, setActiveTab] = useState<'list' | 'editor'>('list');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // New Coupon form fields
  const [code, setCode] = useState('');
  const [type, setType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [value, setValue] = useState('');
  const [expiry, setExpiry] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    try {
      localStorage.setItem('lakshya_coupons', JSON.stringify(coupons));
    } catch {
      // ignore
    }
  }, [coupons]);

  const handleCopy = (couponCode: string) => {
    navigator.clipboard.writeText(couponCode);
    setCopiedCode(couponCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDelete = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !value) return;

    const newCoupon: Coupon = {
      id: Date.now().toString(),
      code: code.toUpperCase().trim(),
      type,
      value: Number(value),
      usageCount: 0,
      expiry: expiry || 'No Expiry',
      active,
    };

    setCoupons((prev) => [newCoupon, ...prev]);
    setCode('');
    setValue('');
    setExpiry('');
    setActiveTab('list');
  };

  return (
    <div>
      <div className="flex items-center gap-4 border-b border-gray-200 mb-6 pb-4">
        <button
          onClick={() => setActiveTab('list')}
          className={`text-sm font-black uppercase tracking-wider transition ${
            activeTab === 'list' ? 'text-black border-b-2 border-black pb-1' : 'text-gray-400 hover:text-black'
          }`}
        >
          All Coupons ({coupons.length})
        </button>
        <button
          onClick={() => setActiveTab('editor')}
          className={`text-sm font-black uppercase tracking-wider transition flex items-center gap-1 ${
            activeTab === 'editor' ? 'text-black border-b-2 border-black pb-1' : 'text-gray-400 hover:text-black'
          }`}
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {activeTab === 'list' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
          {coupons.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  <th className="p-4">Code</th>
                  <th className="p-4">Discount</th>
                  <th className="p-4">Usage</th>
                  <th className="p-4">Expiry</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-800">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-gray-900 border border-gray-200 bg-gray-50 px-2.5 py-1 rounded text-xs font-mono">
                          {coupon.code}
                        </span>
                        <button
                          onClick={() => handleCopy(coupon.code)}
                          className="text-gray-400 hover:text-black p-1 transition"
                          title="Copy Code"
                        >
                          {copiedCode === coupon.code ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-emerald-600">
                      {coupon.type === 'PERCENTAGE' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                    </td>
                    <td className="p-4 text-gray-600">{coupon.usageCount} times</td>
                    <td className="p-4 text-gray-500">{coupon.expiry}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider ${
                          coupon.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {coupon.active ? 'Active' : 'Expired'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-600 transition"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
              No coupons created yet. Click &quot;Create Coupon&quot; to add one.
            </div>
          )}
        </div>
      )}

      {activeTab === 'editor' && (
        <form onSubmit={handleCreateCoupon} className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-6 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-black uppercase text-gray-900">New Promo Code</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Coupon Code *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. LAKSHYA20"
                className="w-full border border-gray-300 rounded-lg p-2.5 text-xs font-black uppercase focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Discount Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'PERCENTAGE' | 'FIXED')}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-xs font-bold bg-white focus:outline-none focus:border-black cursor-pointer"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (₹)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Discount Value *</label>
              <input
                type="number"
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={type === 'PERCENTAGE' ? 'e.g. 15' : 'e.g. 500'}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Expiry Date</label>
              <input
                type="date"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
              />
              <span className="text-xs font-bold text-gray-900 uppercase">Active Coupon</span>
            </label>

            <button
              type="submit"
              className="px-6 py-2.5 bg-black text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm transition hover:bg-neutral-800"
            >
              Create Coupon
            </button>
          </div>
        </form>
      )}
    </div>
  );
}