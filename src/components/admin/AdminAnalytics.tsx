import { useEffect, useState } from 'react';
import { ShieldAlert, BarChart2, RefreshCw } from 'lucide-react';
import { supabase } from '../../library/supabase';

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  colors?: Array<{ name: string; sizes?: Array<{ stock: number }> }>;
  variants?: Array<{ stock: number }>;
}

export default function AdminAnalytics() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inventory' | 'sales'>('inventory');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (!error && data) {
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getProductTotalStock = (product: Product): number => {
    if (Array.isArray(product.colors) && product.colors.length > 0) {
      let sum = 0;
      let hasColorStock = false;
      for (const col of product.colors) {
        if (Array.isArray(col.sizes) && col.sizes.length > 0) {
          hasColorStock = true;
          for (const sz of col.sizes) {
            sum += Number(sz.stock || 0);
          }
        }
      }
      if (hasColorStock) return sum;
    }
    if (Array.isArray(product.variants) && product.variants.length > 0) {
      let sum = 0;
      for (const v of product.variants) {
        sum += Number(v.stock || 0);
      }
      return sum;
    }
    return Number(product.stock || 0);
  };

  const totalProducts = products.length;
  const totalValuation = products.reduce((acc, p) => acc + Number(p.price || 0) * getProductTotalStock(p), 0);
  const avgPrice = totalProducts > 0 ? Math.round(products.reduce((acc, p) => acc + Number(p.price || 0), 0) / totalProducts) : 0;
  const lowStockCount = products.filter((p) => getProductTotalStock(p) <= 5).length;

  // Price tier breakdown
  const budgetTier = products.filter((p) => Number(p.price) <= 3000).length;
  const midTier = products.filter((p) => Number(p.price) > 3000 && Number(p.price) <= 10000).length;
  const premiumTier = products.filter((p) => Number(p.price) > 10000).length;

  // Category stock volume breakdown
  const categoryStockVolume: Record<string, number> = {};
  products.forEach((p) => {
    const cat = p.category || 'Uncategorized';
    categoryStockVolume[cat] = (categoryStockVolume[cat] || 0) + getProductTotalStock(p);
  });
  const maxCategoryVolume = Math.max(...Object.values(categoryStockVolume), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-gray-500 font-bold text-sm uppercase">
          <RefreshCw className="w-5 h-5 animate-spin" /> Loading Analytics Data...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase">Analytics & Inventory Metrics</h1>
          <p className="text-xs text-gray-500 font-semibold">Live catalog stats, valuation, and category stock volume.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'inventory' ? 'bg-black text-white' : 'bg-white text-gray-500 border border-gray-200'
            }`}
          >
            Inventory Analytics
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'sales' ? 'bg-black text-white' : 'bg-white text-gray-500 border border-gray-200'
            }`}
          >
            Sales Timeline
          </button>
        </div>
      </div>

      {/* RAZORPAY NOTICE */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 mb-6">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className="font-bold text-amber-900 uppercase tracking-wide">Razorpay Integration Notice</p>
          <p className="text-amber-700 mt-0.5 font-medium">
            Historical sales timeline analytics will populate live when Razorpay payment API credentials are added. All metrics below are live calculations from your Supabase catalog database.
          </p>
        </div>
      </div>

      {activeTab === 'inventory' ? (
        <>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Catalog Stock Value</p>
              <p className="text-2xl font-black text-gray-900 mb-1">₹{totalValuation.toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-emerald-600 font-bold uppercase">Total Inventory Asset</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Average Unit Price</p>
              <p className="text-2xl font-black text-gray-900 mb-1">₹{avgPrice.toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Across {totalProducts} Products</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Low Stock Alerts</p>
              <p className="text-2xl font-black text-red-600 mb-1">{lowStockCount}</p>
              <p className="text-[10px] text-red-500 font-bold uppercase">Stock &le; 5 units</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Total Active SKUs</p>
              <p className="text-2xl font-black text-gray-900 mb-1">{totalProducts}</p>
              <p className="text-[10px] text-purple-600 font-bold uppercase">Live Products</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* CATEGORY STOCK VOLUME CHART */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
              <h2 className="text-sm font-black uppercase text-gray-900 mb-6">Stock Volume by Category</h2>
              <div className="space-y-4">
                {Object.entries(categoryStockVolume).map(([cat, vol]) => {
                  const pct = Math.round((vol / maxCategoryVolume) * 100);
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-gray-900 uppercase">{cat}</span>
                        <span className="text-gray-600">{vol} Units</span>
                      </div>
                      <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                        <div className="bg-black h-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PRICE TIER DISTRIBUTION */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
              <h2 className="text-sm font-black uppercase text-gray-900 mb-6">Price Tier Distribution</h2>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-gray-800 uppercase">Budget Tier (&le; ₹3,000)</span>
                    <span className="font-black text-gray-900">{budgetTier} items</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full transition-all duration-500"
                      style={{ width: `${totalProducts ? (budgetTier / totalProducts) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-gray-800 uppercase">Mid-Range Tier (₹3,001 - ₹10,000)</span>
                    <span className="font-black text-gray-900">{midTier} items</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-600 h-full transition-all duration-500"
                      style={{ width: `${totalProducts ? (midTier / totalProducts) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-gray-800 uppercase">Premium Tier (&gt; ₹10,000)</span>
                    <span className="font-black text-gray-900">{premiumTier} items</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-600 h-full transition-all duration-500"
                      style={{ width: `${totalProducts ? (premiumTier / totalProducts) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white p-12 rounded-xl border border-gray-200 text-center shadow-xs">
          <BarChart2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-base font-black text-gray-900 uppercase tracking-wide mb-2">Sales Analytics Awaiting Razorpay API Keys</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Once you connect Razorpay API keys, complete sales timelines, Gross Revenue, Average Order Value (AOV), and refund tracking will render automatically here.
          </p>
        </div>
      )}
    </div>
  );
}