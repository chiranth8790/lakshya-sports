import { useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../library/supabase';
import { 
  LayoutDashboard, 
  Package, 
  Star, 
  ShoppingCart, 
  Tag, 
  Users, 
  BarChart3,
  Mail,
  LogOut,
  RefreshCw
} from 'lucide-react';

// Lazy-load admin tabs for lightning-fast initial load
const AdminDashboard = lazy(() => import('../components/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('../components/admin/AdminProducts'));
const AdminMerchandising = lazy(() => import('../components/admin/AdminMerchandising'));
const AdminOrders = lazy(() => import('../components/admin/AdminOrders'));
const AdminCoupons = lazy(() => import('../components/admin/AdminCoupons'));
const AdminCustomers = lazy(() => import('../components/admin/AdminCustomers'));
const AdminAnalytics = lazy(() => import('../components/admin/AdminAnalytics'));
const AdminInquiries = lazy(() => import('../components/admin/AdminInquiries'));

type AdminTab = 'dashboard' | 'products' | 'merchandising' | 'orders' | 'coupons' | 'customers' | 'analytics' | 'inquiries';

function TabLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex items-center gap-2.5 text-xs font-bold text-gray-500 uppercase tracking-widest bg-white border border-gray-200 px-5 py-3 rounded-xl shadow-xs">
        <RefreshCw className="w-4 h-4 text-red-600 animate-spin" />
        <span>Loading Tab...</span>
      </div>
    </div>
  );
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'merchandising', label: 'Merchandising', icon: Star },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'coupons', label: 'Coupons', icon: Tag },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'inquiries', label: 'Inquiries', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR */}
      <aside className="w-64 bg-black text-white flex flex-col shrink-0 sticky top-0 h-screen">
        <div className="p-6">
          <div className="font-black text-xl tracking-wider uppercase flex items-center gap-2 mb-8">
            <span className="text-red-600">Admin</span> Portal
          </div>
          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as AdminTab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === item.id 
                    ? 'bg-neutral-800 text-white' 
                    : 'text-gray-400 hover:bg-neutral-900 hover:text-white'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-neutral-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-bold uppercase text-gray-500 hover:text-white transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Suspense fallback={<TabLoadingFallback />}>
          {activeTab === 'dashboard' && <AdminDashboard />}
          {activeTab === 'products' && <AdminProducts />}
          {activeTab === 'merchandising' && <AdminMerchandising />}
          {activeTab === 'orders' && <AdminOrders />}
          {activeTab === 'coupons' && <AdminCoupons />}
          {activeTab === 'customers' && <AdminCustomers />}
          {activeTab === 'analytics' && <AdminAnalytics />}
          {activeTab === 'inquiries' && <AdminInquiries />}
        </Suspense>
      </main>
    </div>
  );
}
