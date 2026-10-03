import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingBag, X, ChevronDown, ChevronLeft, Heart, User, TrendingUp, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { supabase } from '../library/supabase';

interface SubCategory {
  name: string;
  path: string;
  icon: string;        // emoji icon
  gradient: string;   // tailwind gradient classes
  glow: string;       // glow color for hover
}

interface SportCategory {
  id: string;
  title: string;
  emoji: string;
  badge?: string;
  accent: string;     // active accent color class
  subCategories: SubCategory[];
}

const SPORTS_CATALOG: SportCategory[] = [
  {
    id: 'badminton',
    title: 'Badminton',
    emoji: '🏸',
    badge: 'Pro Shop',
    accent: 'from-violet-600 to-purple-700',
    subCategories: [
      {
        name: 'Rackets',
        path: '/category/rackets',
        icon: '🏸',
        gradient: 'from-violet-500 via-purple-600 to-indigo-700',
        glow: 'hover:shadow-purple-300',
      },
      {
        name: 'Shoes',
        path: '/category/shoes',
        icon: '👟',
        gradient: 'from-indigo-500 via-blue-600 to-cyan-600',
        glow: 'hover:shadow-blue-300',
      },
      {
        name: 'Shuttlecocks',
        path: '/category/shuttles',
        icon: '🪶',
        gradient: 'from-fuchsia-500 via-pink-600 to-rose-600',
        glow: 'hover:shadow-pink-300',
      },
      {
        name: 'Kitbags',
        path: '/category/kitbags',
        icon: '🎒',
        gradient: 'from-purple-600 via-violet-700 to-indigo-800',
        glow: 'hover:shadow-violet-300',
      },
      {
        name: 'Grips & Strings',
        path: '/category/grips-and-strings',
        icon: '🎯',
        gradient: 'from-cyan-500 via-teal-600 to-emerald-700',
        glow: 'hover:shadow-teal-300',
      },
    ],
  },
  {
    id: 'cricket',
    title: 'Cricket',
    emoji: '🏏',
    badge: 'Willow & Gear',
    accent: 'from-amber-500 to-orange-600',
    subCategories: [
      {
        name: 'English Willow Bats',
        path: '/category/cricket-bats-english',
        icon: '🏏',
        gradient: 'from-amber-500 via-orange-600 to-red-700',
        glow: 'hover:shadow-orange-300',
      },
      {
        name: 'Kashmir Willow Bats',
        path: '/category/cricket-bats-kashmir',
        icon: '🪵',
        gradient: 'from-yellow-500 via-amber-600 to-orange-700',
        glow: 'hover:shadow-amber-300',
      },
      {
        name: 'Leather Balls',
        path: '/category/cricket-balls',
        icon: '🔴',
        gradient: 'from-red-500 via-rose-600 to-pink-700',
        glow: 'hover:shadow-red-300',
      },
      {
        name: 'Pads & Gloves',
        path: '/category/cricket-protection',
        icon: '🧤',
        gradient: 'from-orange-500 via-amber-600 to-yellow-600',
        glow: 'hover:shadow-yellow-300',
      },
    ],
  },
  {
    id: 'football',
    title: 'Football',
    emoji: '⚽',
    accent: 'from-emerald-500 to-green-700',
    subCategories: [
      {
        name: 'Match Balls',
        path: '/category/football-balls',
        icon: '⚽',
        gradient: 'from-emerald-500 via-green-600 to-teal-700',
        glow: 'hover:shadow-green-300',
      },
      {
        name: 'Turf Boots',
        path: '/category/football-boots',
        icon: '🦶',
        gradient: 'from-green-500 via-emerald-600 to-cyan-700',
        glow: 'hover:shadow-emerald-300',
      },
      {
        name: 'Goalie Gloves',
        path: '/category/football-accessories',
        icon: '🥅',
        gradient: 'from-teal-500 via-green-600 to-lime-700',
        glow: 'hover:shadow-teal-300',
      },
    ],
  },
  {
    id: 'other-sports',
    title: 'Other Sports',
    emoji: '🎱',
    badge: 'Indoor & Court',
    accent: 'from-sky-500 to-blue-700',
    subCategories: [
      {
        name: 'Carrom Boards',
        path: '/category/carrom',
        icon: '🎱',
        gradient: 'from-sky-500 via-blue-600 to-indigo-700',
        glow: 'hover:shadow-sky-300',
      },
      {
        name: 'Volleyball & Nets',
        path: '/category/volleyball',
        icon: '🏐',
        gradient: 'from-blue-500 via-indigo-600 to-violet-700',
        glow: 'hover:shadow-blue-300',
      },
      {
        name: 'Basketballs',
        path: '/category/basketball',
        icon: '🏀',
        gradient: 'from-orange-500 via-red-500 to-rose-600',
        glow: 'hover:shadow-orange-300',
      },
      {
        name: 'Throwball',
        path: '/category/throwball',
        icon: '🎾',
        gradient: 'from-lime-500 via-green-600 to-emerald-700',
        glow: 'hover:shadow-lime-300',
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
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

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
      setSearchResults([]);
    }
  }, [searchOpen]);

  // Live Supabase search with debounce
  useEffect(() => {
    const trimmed = searchQuery.trim();
    setSearchLoading(true);

    const timer = setTimeout(async () => {
      if (trimmed) {
        // Search by name, brand, or category using ilike
        const { data } = await supabase
          .from('products')
          .select('*')
          .or(
            `name.ilike.%${trimmed}%,brand.ilike.%${trimmed}%,category.ilike.%${trimmed}%`
          )
          .gt('stock', 0)
          .limit(4);

        setSearchResults(
          (data || []).map((item) => ({
            ...item,
            price: item.price || 0,
            originalPrice: item.original_price || 0,
            image: item.images && item.images.length > 0 ? item.images[0] : '',
          }))
        );
      } else {
        // No query: show top 3 in-stock suggestions
        const { data } = await supabase
          .from('products')
          .select('*')
          .gt('stock', 0)
          .limit(3);

        setSearchResults(
          (data || []).map((item) => ({
            ...item,
            price: item.price || 0,
            originalPrice: item.original_price || 0,
            image: item.images && item.images.length > 0 ? item.images[0] : '',
          }))
        );
      }
      setSearchLoading(false);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, searchOpen]);

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
                className={`rounded-xl overflow-hidden transition-all duration-200 ${
                  isOpen
                    ? 'ring-2 ring-offset-1 ring-opacity-60 shadow-md'
                    : 'border border-gray-200'
                }`}
                style={isOpen ? { boxShadow: '0 0 0 2px rgba(0,0,0,0.3)' } : undefined}
              >
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => toggleAccordion(sport.id)}
                  className={`w-full flex items-center justify-between p-3.5 text-left transition-all duration-200 ${
                    isOpen
                      ? `bg-gradient-to-r ${sport.accent} text-white shadow-sm`
                      : 'bg-white hover:bg-gray-50 text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`text-xl leading-none transition-transform duration-300 ${
                      isOpen ? 'scale-110' : ''
                    }`}>
                      {sport.emoji}
                    </span>
                    <span className="font-black text-xs uppercase tracking-wider">
                      {sport.title}
                    </span>
                    {sport.badge && (
                      <span
                        className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                          isOpen ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {sport.badge}
                      </span>
                    )}
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 flex-shrink-0 ${
                      isOpen ? 'rotate-180 text-white' : 'text-gray-400'
                    }`}
                  />
                </button>

                {/* Subcategory Grid */}
                {isOpen && (
                  <div className="p-3 bg-gray-50 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-2">
                      {sport.subCategories.map((sub) => (
                        <Link
                          key={sub.name}
                          to={sub.path}
                          onClick={() => setMenuOpen(false)}
                          className={`group relative flex flex-col items-center justify-center gap-2 h-[90px] rounded-xl overflow-hidden shadow-sm transition-all duration-250 hover:scale-[1.04] hover:shadow-lg active:scale-95 ${sub.glow} cursor-pointer`}
                        >
                          {/* Gradient background */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${sub.gradient} transition-all duration-300`} />
                          {/* Subtle pattern overlay */}
                          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                          {/* Shine effect on hover */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                          {/* Icon */}
                          <span className="relative z-10 text-3xl leading-none drop-shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5">
                            {sub.icon}
                          </span>

                          {/* Label */}
                          <span className="relative z-10 text-white text-[10px] font-black uppercase tracking-wide text-center leading-tight px-1.5">
                            {sub.name}
                          </span>

                          {/* Arrow on hover */}
                          <ChevronRight className="absolute bottom-2 right-2 w-3 h-3 text-white/60 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5" />
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

              {searchLoading ? (
                <p className="text-xs text-gray-400 font-medium animate-pulse">Searching...</p>
              ) : searchResults.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
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
                            ₹{Number(product.price).toLocaleString('en-IN')}
                          </span>
                          {product.originalPrice > product.price && (
                            <span className="text-[10px] text-gray-400 line-through">
                              ₹{Number(product.originalPrice).toLocaleString('en-IN')}
                            </span>
                          )}
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