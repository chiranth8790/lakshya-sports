import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Filter, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { supabase } from '../library/supabase';

export default function CategoryPage() {
  const { categoryName } = useParams<{ categoryName: string }>();

  // New Supabase State
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Existing Filter State
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high'>('featured');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(25000);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

// 1. Fetch live data from Supabase on mount
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const { data, error } = await supabase.from('products').select('*');
      
      if (!error && data) {
        // Map the Postgres string array and sanitize price data
        const formattedData = data.map((item) => ({
          ...item,
          // Fallback to 0 if price is missing to prevent .toLocaleString() crashes
          price: item.price || 0,
          originalPrice: item.original_price || 0,
          original_price: item.original_price || 0,
          // Extract first image from the array
          image: item.images && item.images.length > 0 ? item.images[0] : ''
        }));
        setAllProducts(formattedData);
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  // 2. Reset filters when changing category categories
  useEffect(() => {
    setSortBy('featured');
    setSelectedBrands([]);
    setMaxPrice(25000);
    setMobileFilterOpen(false);
  }, [categoryName]);

  // 3. Use the fetched `allProducts` instead of the hardcoded `PRODUCTS`
  const baseCategoryProducts = allProducts.filter(
    (p) => p.category.toLowerCase() === (categoryName || '').toLowerCase()
  );

  const availableBrands = Array.from(new Set(baseCategoryProducts.map((p) => p.brand)));

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

 const filteredProducts = baseCategoryProducts
    .filter((product) => {
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
      const matchesPrice = product.price <= maxPrice;
      const isInStock = product.stock > 0; // NEW: Check inventory
      
      return matchesBrand && matchesPrice && isInStock;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });

  const formattedTitle = (categoryName || 'Equipment').replace(/-/g, ' ');

  // Show a simple loading state while data fetches
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-sm font-bold uppercase text-gray-500 tracking-widest animate-pulse">
          Loading {formattedTitle}...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-black uppercase tracking-wide"
          >
            <ArrowLeft className="w-4 h-4" /> Home / Store
          </Link>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6 flex flex-wrap items-center justify-between gap-4 shadow-xs">
          <div>
            <h1 className="text-2xl font-black uppercase text-gray-900 tracking-tight">
              {formattedTitle}
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Showing {filteredProducts.length} items
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="sm:hidden flex-1 py-2 px-3 border border-gray-300 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5" /> Filters
            </button>

            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
              <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full sm:w-auto bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="featured">Featured First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 items-start">
          <aside
            className={`sm:block ${
              mobileFilterOpen ? 'block' : 'hidden'
            } bg-white rounded-xl border border-gray-200 p-5 space-y-6 shadow-xs`}
          >
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-900">
                  Max Price
                </h3>
                <span className="text-xs font-bold text-red-600">
                  ₹{maxPrice.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="500"
                max="25000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-black cursor-pointer"
              />
            </div>

            {availableBrands.length > 0 && (
              <div className="border-t border-gray-100 pt-5">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 mb-3">
                  Brand
                </h3>
                <div className="space-y-2">
                  {availableBrands.map((brand) => (
                    <label
                      key={brand}
                      className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => toggleBrand(brand)}
                        className="rounded border-gray-300 text-black focus:ring-black"
                      />
                      <span>{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </aside>

          <div className="sm:col-span-3">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-sm font-black uppercase text-gray-800">
                  No items match the selected filters
                </p>
                <p className="text-xs text-gray-500 mt-1 mb-4">
                  Adjust price limit or remove brand restrictions.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBrands([]);
                    setMaxPrice(25000);
                  }}
                  className="px-4 py-2 bg-black text-white text-xs font-bold rounded-lg uppercase tracking-wider"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}