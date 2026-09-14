import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingBag, X, ChevronDown, ChevronLeft, Heart, User, TrendingUp } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { PRODUCTS } from '../data/products';

interface SubCategory {
  name: string;
  path: string;
  image: string;
}

interface SportCategory {
  id: string;
  title: string;
  badge?: string;
  subCategories: SubCategory[];
}

const SPORTS_CATALOG: SportCategory[] = [
  {
    id: 'badminton',
    title: 'Badminton',
    badge: 'Pro Shop',
    subCategories: [
      {
        name: 'Rackets',
        path: '/category/rackets',
        image: 'https://images.unsplash.com/photo-1613918431703-aa6321287c80?w=500&auto=format&fit=crop&q=80',
      },
      {
        name: 'Shoes',
        path: '/category/shoes',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80',
      },
      {
        name: 'Shuttles',
        path: '/category/shuttles',
        image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500&auto=format&fit=crop&q=80',
      },
      {
        name: 'Kitbags',
        path: '/category/kitbags',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80',
      },
      {
        name: 'Grips & Strings',
        path: '/category/grips-and-strings',
        image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=500&auto=format&fit=crop&q=80',
      },
    ],
  },
  {
    id: 'cricket',
    title: 'Cricket',
    badge: 'Willow & Gear',
    subCategories: [
      {
        name: 'English Willow Bats',
        path: '/category/cricket-bats-english',
        image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=500&auto=format&fit=crop&q=80',
      },
      {
        name: 'Kashmir Willow Bats',
        path: '/category/cricket-bats-kashmir',
        image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&auto=format&fit=crop&q=80',
      },
      {
        name: 'Leather & Tennis Balls',
        path: '/category/cricket-balls',
        image: 'https://images.unsplash.com/photo-1589801258579-18e091f4ca26?w=500&auto=format&fit=crop&q=80',
      },
      {
        name: 'Batting Pads & Gloves',
        path: '/category/cricket-protection',
        image: 'https://images.unsplash.com/photo-1624880357913-a8539238245b?w=500&auto=format&fit=crop&q=80',
      },
    ],
  },
  {
    id: 'football',
    title: 'Football',
    subCategories: [
      {
        name: 'Match & Training Balls',
        path: '/category/football-balls',
        image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&auto=format&fit=crop&q=80',
      },
      {
        name: 'Turf & Stud Boots',
        path: '/category/football-boots',
        image: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=500&auto=format&fit=crop&q=80',
      },
      {
        name: 'Shinguards & Goalie Gloves',
        path: '/category/football-accessories',
        image: 'https://images.unsplash.com/photo-1600679472829-3044539ce8ed?w=500&auto=format&fit=crop&q=80',
      },
    ],
  },
  {
    id: 'other-sports',
    title: 'Other Sports',
    badge: 'Indoor & Court',
    subCategories: [
      {
        name: 'Carrom Boards & Coins',
        path: '/category/carrom',
        image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=500&auto=format&fit=crop&q=80',
      },
      {
        name: 'Volleyball & Nets',
        path: '/category/volleyball',
        image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=500&auto=format&fit=crop&q=80',
      },
      {
        name: 'Basketballs',
        path: '/category/basketball',
        image: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=500&auto=format&fit=crop&q=80',
      },
      {
        name: 'Throwball Equipment',
        path: '/category/throwball',
        image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500&auto=format&fit=crop&q=80',
      },
    ],
  },
];

const TRENDING_SEARCHES = ['Astrox 88D', 'Mavis 350', 'English Willow', 'Carrom', 'Power Cushion', 'FIFA Football'];

export default function RetailHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>('badminton');

  const { totalCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => searchInputRef.current?.focus(), 60);
    } else {
      document.body.style.overflow = 'auto';
      setSearchQuery('');
    }
  }, [searchOpen]);

  const searchResults = searchQuery.trim()
    ? PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 4)
    : PRODUCTS.slice(0, 3);

  const toggleAccordion = (categoryId: string) => {
    setActiveCategory((prev) => (prev === categoryId ? null : categoryId));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchOpen(false);
    navigate(`/category/rackets`);
  };

  return (
    <>
      <header className="w-full bg-white font-sans sticky top-0 z-40 shadow-xs">
        {/* Micro Announcement Bar */}
        <div className="bg-black text-white text-[10px] sm:text-[11px] font-bold tracking-widest uppercase py-1.5 px-4 text-center">
          Free Pro Stringing on All Rackets Above ₹4,999
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 h-16 sm:h-20 grid grid-cols-3 items-center relative z-40 bg-white">
          {/* Left: Hamburger & Search */}
          <div className="flex items-center justify-start gap-2 sm:gap-3">
            <button
              type="button"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-black p-1.5 -ml-1 active:scale-95 transition-transform"
            >
              {menuOpen ? <X className="w-6 h-6 stroke-[2.2]" /> : <Menu className="w-6 h-6 stroke-[2.2]" />}
            </button>

            <button
              type="button"
              aria-label="Open search"
              onClick={() => setSearchOpen(true)}
              className="text-black p-1.5 hover:text-red-600 active:scale-95 transition-all"
            >
              <Search className="w-5 h-5 stroke-[2.2]" />
            </button>
          </div>

{/* Center: Brand Image Logo */}
<div className="flex items-center justify-center">
  <Link to="/" className="flex items-center justify-center py-1">
    <img
      src="/website-logo.png"
      alt="Lakshya Sports"
      className="h-12 sm:h-16 w-auto object-contain transition-transform hover:scale-105 drop-shadow-xs"
    />
  </Link>
</div>

          {/* Right: Wishlist, Account, Cart */}
          <div className="flex items-center justify-end gap-2.5 sm:gap-4">
            <Link
              to="/wishlist"
              aria-label="View Wishlist"
              className="relative text-black p-1 hover:text-red-600 active:scale-95 transition-transform"
            >
              <Heart className="w-5 h-5 stroke-[2.2]" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to="/account"
              aria-label="My Account"
              className="text-black p-1 hover:text-red-600 active:scale-95 transition-transform"
            >
              <User className="w-5 h-5 stroke-[2.2]" />
            </Link>

            <Link
              to="/cart"
              aria-label="View Shopping Cart"
              className="relative text-black p-1 active:scale-95 transition-transform"
            >
              <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {totalCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Dimmed Screen Overlay */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 top-[calc(1.5rem+4rem)] sm:top-[calc(1.625rem+5rem)] bg-black/50 backdrop-blur-2xs z-30 transition-opacity"
        />
      )}

      {/* Accordion Drawer */}
      <aside
        className={`fixed top-[calc(1.5rem+4rem)] sm:top-[calc(1.625rem+5rem)] left-0 bottom-0 w-[310px] sm:w-[350px] bg-white z-40 shadow-2xl flex flex-col border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {SPORTS_CATALOG.map((sport) => {
            const isOpen = activeCategory === sport.id;

            return (
              <div
                key={sport.id}
                className="border border-gray-200 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(sport.id)}
                  className={`w-full flex items-center justify-between p-3.5 text-left transition-colors ${
                    isOpen ? 'bg-black text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs uppercase tracking-wider">
                      {sport.title}
                    </span>
                    {sport.badge && (
                      <span
                        className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                          isOpen ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {sport.badge}
                      </span>
                    )}
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-white' : 'text-gray-500'
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="p-3 bg-white border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-2.5">
                      {sport.subCategories.map((sub) => (
                        <Link
                          key={sub.name}
                          to={sub.path}
                          onClick={() => setMenuOpen(false)}
                          className="group relative h-24 rounded-lg overflow-hidden border border-gray-200 shadow-2xs hover:shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-95 bg-gray-100 flex items-end p-2"
                        >
                          <img
                            src={sub.image}
                            alt={sub.name}
                            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:from-black/95 transition-all duration-300" />
                          <p className="relative z-10 text-white text-[10px] sm:text-[11px] font-black uppercase tracking-tight leading-tight group-hover:text-yellow-300 transition-colors drop-shadow-sm">
                            {sub.name}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-3 border-t border-gray-100 bg-gray-50">
          <p className="text-[11px] text-gray-500 font-medium text-center">
            Lakshya Sports • Multi-Sport Store
          </p>
        </div>
      </aside>

      {/* Puma Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          <div className="border-b border-gray-200 px-4 py-3 bg-gray-50 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="p-1 text-gray-700 hover:text-black transition"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH EQUIPMENT, SHOES, STRINGS..."
                className="w-full bg-white border border-gray-300 rounded-lg pl-3 pr-10 py-2.5 text-xs sm:text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black uppercase tracking-wider"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
              >
                <Search className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-6 max-w-2xl mx-auto w-full space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-red-600" />
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">
                  Trending Searches
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {TRENDING_SEARCHES.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSearchQuery(tag)}
                    className="text-xs font-bold text-gray-700 bg-gray-100 hover:bg-black hover:text-white px-3 py-1.5 rounded-full transition"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-4">
                {searchQuery.trim() ? 'Matched Results' : 'Suggested Gear'}
              </h3>

              {searchResults.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      to={`/category/${product.category.toLowerCase()}`}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-4 p-2 rounded-xl hover:bg-gray-50 border border-gray-100 transition group"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-lg p-2 flex items-center justify-center shrink-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                          {product.brand}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                          {product.name}
                        </h4>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-xs font-black text-red-600">
                            ₹{product.price.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-gray-400 line-through">
                            ₹{product.originalPrice.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 font-medium">
                  No products matched &quot;{searchQuery}&quot;.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}