import { useEffect, useState } from 'react';
import { IndianRupee, Package, AlertTriangle, Layers, ArrowRight, ShieldAlert, ShoppingCart, RefreshCw } from 'lucide-react';
import { supabase } from '../../library/supabase';

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  image?: string;
  images?: string[];
  colors?: Array<{ name: string; image?: string; sizes?: Array<{ size: string; stock: number }> }>;
  variants?: Array<{ name: string; stock: number }>;
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*');

      if (!error && data) {
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to compute accurate total stock for any product
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

  const lowStockProducts = products.filter((p) => getProductTotalStock(p) <= 5);

  const totalInventoryValue = products.reduce((acc, p) => {
    return acc + Number(p.price || 0) * getProductTotalStock(p);
  }, 0);

  const uniqueCategories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));

  // Category distribution
  const categoryCounts: Record<string, number> = {};
  products.forEach((p) => {
    const cat = p.category || 'Uncategorized';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-gray-500 font-bold text-sm uppercase">
          <RefreshCw className="w-5 h-5 animate-spin" /> Loading Dashboard Data...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-wider">Dashboard</h1>
          <p className="text-xs text-gray-500 font-medium">Real-time product inventory and catalog overview.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:border-black rounded-lg text-xs font-bold uppercase tracking-wider transition text-gray-700 hover:text-black shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
        </button>
      </div>

      {/* RAZORPAY API PENDING NOTICE */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className="font-bold text-amber-900 uppercase tracking-wide">Razorpay Payment Integration Pending</p>
          <p className="text-amber-700 mt-0.5 font-medium">
            Live order transactions and revenue statistics will automatically connect here once your Razorpay API keys are configured. Catalog stock and inventory numbers below are live from Supabase.
          </p>
        </div>
      </div>

      {/* LIVE KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Total Products</p>
            <p className="text-2xl font-black text-gray-900">{totalProducts}</p>
            <p className="text-[10px] text-emerald-600 font-bold uppercase mt-1">Live from Database</p>
          </div>
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-purple-50">
            <Package className="w-6 h-6 text-purple-600" />
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Low Stock Alerts</p>
            <p className="text-2xl font-black text-red-600">{lowStockProducts.length}</p>
            <p className="text-[10px] text-red-500 font-bold uppercase mt-1">
              {lowStockProducts.length > 0 ? 'Action Required' : 'All Items Stocked'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-red-50">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
        </div>

        {/* Inventory Value */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Inventory Valuation</p>
            <p className="text-2xl font-black text-gray-900">₹{totalInventoryValue.toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Total Stock Asset Value</p>
          </div>
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-emerald-50">
            <IndianRupee className="w-6 h-6 text-emerald-600" />
          </div>
        </div>

        {/* Active Categories */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Active Categories</p>
            <p className="text-2xl font-black text-gray-900">{uniqueCategories.length}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Across Catalog</p>
          </div>
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-50">
            <Layers className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* LIVE CATEGORY DISTRIBUTION */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
          <h2 className="text-sm font-black uppercase text-gray-900 mb-4">Category Breakdown</h2>
          <div className="space-y-4">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = totalProducts > 0 ? Math.round((count / totalProducts) * 100) : 0;
              return (
                <div key={cat}>
                  <div className="flex justify-between items-center text-xs font-bold mb-1">
                    <span className="text-gray-900 uppercase">{cat}</span>
                    <span className="text-gray-500">{count} products ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-black h-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* REAL LOW STOCK ALERTS */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black uppercase text-gray-900">Low Stock Products</h2>
              <span className="text-[10px] font-black bg-red-100 text-red-700 px-2 py-0.5 rounded-full uppercase">
                Stock &le; 5
              </span>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="text-center py-8 text-xs font-bold text-gray-400 uppercase tracking-wider">
                All catalog products are sufficiently stocked.
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {lowStockProducts.map((p) => {
                  const currentStock = getProductTotalStock(p);
                  const thumb = p.image || (p.images && p.images[0]) || (p.colors && p.colors[0]?.image) || '';
                  return (
                    <div key={p.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3 min-w-0">
                        {thumb ? (
                          <img src={thumb} alt={p.name} className="w-10 h-10 object-contain rounded-md bg-gray-50 border border-gray-100 p-1 shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-gray-400 shrink-0 font-bold text-xs">
                            {p.brand?.[0] || 'P'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">{p.name}</p>
                          <p className="text-[10px] font-bold text-red-500 uppercase">{currentStock} left in stock</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 text-[10px] text-gray-400 font-semibold uppercase">
            Edit stock levels anytime in the Products manager tab.
          </div>
        </div>
      </div>

      {/* RECENT ORDERS TABLE (PLACEHOLDER FOR RAZORPAY) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden mt-6">
        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-black uppercase text-gray-900">Recent Customer Orders</h2>
            <p className="text-[10px] text-gray-400 font-medium">Awaiting Razorpay Payment Gateway Integration</p>
          </div>
          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full uppercase">
            Gateway Pending
          </span>
        </div>
        <div className="p-12 text-center">
          <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-black text-gray-800 uppercase tracking-wider mb-1">No Orders Logged Yet</p>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Once customer orders are completed via Razorpay checkout, live transaction records, customer names, and fulfillment status will appear here automatically.
          </p>
        </div>
      </div>
    </div>
  );
}