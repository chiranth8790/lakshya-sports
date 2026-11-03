import React, { useState, useEffect } from 'react';
import { Plus, Tag, Trash2, Copy, Check, Power } from 'lucide-react';
import { supabase } from '../../library/supabase';
import { useToast } from '../../context/ToastContext';

interface Coupon {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  minOrderValue?: number;
  usageCount: number;
  expiry: string;
  active: boolean;
}

const DEFAULT_COUPONS: Coupon[] = [
  { id: '1', code: 'WELCOME10', type: 'PERCENTAGE', value: 10, minOrderValue: 1000, usageCount: 0, expiry: '2026-12-31', active: true },
  { id: '2', code: 'SPORT500', type: 'FIXED', value: 500, minOrderValue: 2000, usageCount: 0, expiry: '2026-10-15', active: true },
];

export default function AdminCoupons() {
  const { success: toastSuccess, error: toastError } = useToast();

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const stored = localStorage.getItem('lakshya_coupons');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      localStorage.setItem('lakshya_coupons', JSON.stringify(DEFAULT_COUPONS));
      return DEFAULT_COUPONS;
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
  const [minOrderValue, setMinOrderValue] = useState('');
  const [expiry, setExpiry] = useState('');
  const [active, setActive] = useState(true);

  // Helper to persist to localStorage & broadcast event across website
  const persistCoupons = (newList: Coupon[]) => {
    try {
      localStorage.setItem('lakshya_coupons', JSON.stringify(newList));
      window.dispatchEvent(new Event('lakshya_coupons_updated'));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error('Failed to write coupons to localStorage:', e);
    }
  };

  // Fetch coupons from Supabase and merge with local storage
  useEffect(() => {
    fetchCoupons();
  }, []);

  async function fetchCoupons() {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const remoteMapped: Coupon[] = data.map((c: any) => ({
          id: String(c.id),
          code: String(c.code).toUpperCase().trim(),
          type: c.type,
          value: Number(c.value),
          minOrderValue: c.min_order_value ? Number(c.min_order_value) : undefined,
          usageCount: Number(c.usage_count) || 0,
          expiry: c.expiry || 'No Expiry',
          active: c.active ?? true,
        }));

        setCoupons(prev => {
          const map = new Map<string, Coupon>();
          // Put remote first
          remoteMapped.forEach(c => map.set(c.code, c));
          // Keep local ones that haven't synced yet
          prev.forEach(c => {
            if (!map.has(c.code)) {
              map.set(c.code, c);
            }
          });
          const merged = Array.from(map.values());
          persistCoupons(merged);
          return merged;
        });
      }
    } catch {
      // Remote table might not exist yet; local state remains authoritative
    }
  }

  const handleCopy = (couponCode: string) => {
    navigator.clipboard.writeText(couponCode);
    setCopiedCode(couponCode);
    toastSuccess(`Code "${couponCode}" copied to clipboard`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDelete = async (id: string) => {
    const target = coupons.find(c => c.id === id);
    const updated = coupons.filter((c) => c.id !== id);
    setCoupons(updated);
    persistCoupons(updated);
    toastSuccess(`Coupon ${target?.code || ''} removed`);

    try {
      await supabase.from('coupons').delete().eq('id', id);
    } catch {
      // ignore
    }
  };

  const handleToggleActive = async (id: string) => {
    const updated = coupons.map((c) => (c.id === id ? { ...c, active: !c.active } : c));
    setCoupons(updated);
    persistCoupons(updated);
    
    const target = updated.find(c => c.id === id);
    toastSuccess(`Coupon ${target?.code} is now ${target?.active ? 'Active' : 'Disabled'}`);

    try {
      if (target) {
        await supabase.from('coupons').update({ active: target.active }).eq('id', id);
      }
    } catch {
      // ignore
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.toUpperCase().trim();
    if (!cleanCode || !value) {
      toastError('Please enter a coupon code and discount value');
      return;
    }

    const numValue = Number(value);
    if (isNaN(numValue) || numValue <= 0) {
      toastError('Please enter a valid positive discount value');
      return;
    }

    if (type === 'PERCENTAGE' && numValue > 100) {
      toastError('Percentage discount cannot exceed 100%');
      return;
    }

    const newCoupon: Coupon = {
      id: Date.now().toString(),
      code: cleanCode,
      type,
      value: numValue,
      minOrderValue: minOrderValue ? Number(minOrderValue) : undefined,
      usageCount: 0,
      expiry: expiry || 'No Expiry',
      active,
    };

    // Replace if exists, else prepend
    const existingIndex = coupons.findIndex(c => c.code === cleanCode);
    let updated: Coupon[];
    if (existingIndex >= 0) {
      updated = [...coupons];
      updated[existingIndex] = newCoupon;
    } else {
      updated = [newCoupon, ...coupons];
    }

    setCoupons(updated);
    persistCoupons(updated);

    // Reset inputs
    setCode('');
    setValue('');
    setMinOrderValue('');
    setExpiry('');
    setActiveTab('list');

    toastSuccess(`Coupon "${cleanCode}" created & activated across the store!`);

    // Sync to Supabase in the background
    try {
      await supabase.from('coupons').upsert([{
        id: newCoupon.id,
        code: newCoupon.code,
        type: newCoupon.type,
        value: newCoupon.value,
        min_order_value: newCoupon.minOrderValue || null,
        usage_count: 0,
        expiry: newCoupon.expiry,
        active: newCoupon.active
      }]);
    } catch {
      // Supabase table not created yet; local storage guarantees persistence
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 border-b border-gray-200 mb-6 pb-4">
        <button
          onClick={() => setActiveTab('list')}
          className={`text-sm font-black uppercase tracking-wider transition cursor-pointer ${
            activeTab === 'list' ? 'text-black border-b-2 border-black pb-1' : 'text-gray-400 hover:text-black'
          }`}
        >
          All Coupons ({coupons.length})
        </button>
        <button
          onClick={() => setActiveTab('editor')}
          className={`text-sm font-black uppercase tracking-wider transition flex items-center gap-1 cursor-pointer ${
            activeTab === 'editor' ? 'text-black border-b-2 border-black pb-1' : 'text-gray-400 hover:text-black'
          }`}
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {activeTab === 'list' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
          {coupons.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    <th className="p-4">Code</th>
                    <th className="p-4">Discount</th>
                    <th className="p-4">Min. Order</th>
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
                            className="text-gray-400 hover:text-black p-1 transition cursor-pointer"
                            title="Copy Code"
                          >
                            {copiedCode === coupon.code ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-emerald-600">
                        {coupon.type === 'PERCENTAGE' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                      </td>
                      <td className="p-4 text-gray-600 font-medium">
                        {coupon.minOrderValue ? `₹${coupon.minOrderValue.toLocaleString('en-IN')}` : 'None'}
                      </td>
                      <td className="p-4 text-gray-600">{coupon.usageCount} times</td>
                      <td className="p-4 text-gray-500">{coupon.expiry}</td>
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(coupon.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
                            coupon.active 
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                          title="Click to toggle Active / Disabled"
                        >
                          <Power className="w-3 h-3" />
                          <span>{coupon.active ? 'Active' : 'Disabled'}</span>
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDelete(coupon.id)}
                          className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-600 transition cursor-pointer"
                          title="Delete Coupon"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. BADMINTON20"
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                {type === 'PERCENTAGE' ? 'Discount % *' : 'Discount Amount (₹) *'}
              </label>
              <input
                type="number"
                required
                min="1"
                max={type === 'PERCENTAGE' ? '100' : undefined}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={type === 'PERCENTAGE' ? 'e.g. 15' : 'e.g. 500'}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Min. Order (₹)</label>
              <input
                type="number"
                min="0"
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(e.target.value)}
                placeholder="e.g. 1000"
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
                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black cursor-pointer"
              />
              <span className="text-xs font-bold text-gray-900 uppercase">Active Immediately</span>
            </label>

            <button
              type="submit"
              className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm transition cursor-pointer"
            >
              Create & Activate Coupon
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
