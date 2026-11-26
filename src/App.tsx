import { Suspense, lazy, useState } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, ScrollRestoration } from 'react-router-dom';

// Providers & Global Components
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';
import RetailHeader from './components/RetailHeader';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import RouteErrorBoundary from './components/RouteErrorBoundary';
import AIAssistant from './components/ai-assistant/AIAssistant';
import ComingSoonPage from './pages/ComingSoonPage';

// Code-Splitting: Lazy load pages to maximize page load speed and scalability
const Home = lazy(() => import('./pages/Home'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const CustomerLogin = lazy(() => import('./pages/CustomerLogin'));
const Login = lazy(() => import('./pages/Login'));
const Admin = lazy(() => import('./pages/Admin'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage'));
const TermsPage = lazy(() => import('./pages/legal/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/legal/PrivacyPage'));
const RefundPage = lazy(() => import('./pages/legal/RefundPage'));
const ShippingPolicyPage = lazy(() => import('./pages/legal/ShippingPolicyPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Sleek Loading Fallback for route transitions
function PageLoadingFallback() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
      <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin mb-3" />
      <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">Loading Lakshya Sports...</span>
    </div>
  );
}

// Global toggle: Set to false when ready to launch the full online store to the public
const IS_COMING_SOON_MODE = true;

// Main Layout wrapping Header, Main Outlet, and Footer
function RootLayout() {
  const [isPreview, setIsPreview] = useState(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    if (params.get('preview') === 'true' || params.get('preview') === 'lakshya') {
      localStorage.setItem('lakshya_preview_mode', 'true');
      return true;
    }
    return localStorage.getItem('lakshya_preview_mode') === 'true';
  });

  if (IS_COMING_SOON_MODE && !isPreview) {
    return <ComingSoonPage onEnterStore={() => setIsPreview(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <ScrollRestoration />
      {IS_COMING_SOON_MODE && isPreview && (
        <div className="bg-red-600 text-white text-[11px] font-black uppercase tracking-wider py-1.5 px-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
          <span>⚡ Staff Preview Active (Visitors currently see the Coming Soon launch page)</span>
          <button
            onClick={() => {
              localStorage.removeItem('lakshya_preview_mode');
              setIsPreview(false);
            }}
            className="bg-black text-white px-2.5 py-0.5 rounded text-[10px] hover:bg-neutral-800 transition font-bold uppercase cursor-pointer"
          >
            Show Coming Soon
          </button>
        </div>
      )}
      <RetailHeader />
      <main className="flex-1">
        <Suspense fallback={<PageLoadingFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <AIAssistant />
    </div>
  );
}

// Router configuration compatible with React Router v7
const router = createBrowserRouter([
  // 1. Customer Storefront
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <Home /> },
      { path: 'category/:categoryName', element: <CategoryPage /> },
      { path: 'product/:id', element: <ProductPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'track-order', element: <TrackOrderPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'terms', element: <TermsPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
      { path: 'refund', element: <RefundPage /> },
      { path: 'shipping', element: <ShippingPolicyPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'wishlist', element: <WishlistPage /> },
      { path: 'account', element: <AccountPage /> },
      { path: 'auth', element: <CustomerLogin /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  
  // 2. Private Admin Portal
  { 
    path: '/login', 
    element: (
      <Suspense fallback={<PageLoadingFallback />}>
        <Login />
      </Suspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  { 
    path: '/admin', 
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoadingFallback />}>
          <Admin />
        </Suspense>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
]);

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <RouterProvider router={router} />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}