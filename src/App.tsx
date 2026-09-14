import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import RetailHeader from './components/RetailHeader';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import AccountPage from './pages/AccountPage';

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
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'category/:categoryName', element: <CategoryPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'wishlist', element: <WishlistPage /> },
      { path: 'account', element: <AccountPage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}