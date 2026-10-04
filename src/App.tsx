import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';

// Providers & Components
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import RetailHeader from './components/RetailHeader';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import AccountPage from './pages/AccountPage';
import Login from './pages/Login';
import Admin from './pages/Admin';
import ProductPage from './pages/ProductPage';
import CheckoutPage from './pages/CheckoutPage';

// Main Layout wrapping the persistent Header and child route pages
function RootLayout() {
  return (
    <CartProvider>
      <WishlistProvider>
        <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
          <RetailHeader />
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </WishlistProvider>
    </CartProvider>
  );
}

// Router configuration compatible with React Router v7
const router = createBrowserRouter([
  // 1. Customer Storefront (Includes Header, Cart, Wishlist)
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'category/:categoryName', element: <CategoryPage /> },
      { path: 'product/:id', element: <ProductPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'wishlist', element: <WishlistPage /> },
      { path: 'account', element: <AccountPage /> },
    ],
  },
  
  // 2. Private Admin Portal (Clean, standalone screens with no retail header)
  { 
    path: '/login', 
    element: <Login /> 
  },
  { 
    path: '/admin', 
    element: (
      <ProtectedRoute>
        <Admin />
      </ProtectedRoute>
    ) 
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}