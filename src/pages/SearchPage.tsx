import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../library/supabase';
import ProductCard from '../components/ProductCard';
import WhatsAppWidget from '../components/WhatsAppWidget';
import { Search, Loader2, ArrowLeft } from 'lucide-react';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'featured' | 'low-high' | 'high-low'>('featured');

  useEffect(() => {
    async function fetchSearchResults() {
      setLoading(true);
      try {
        if (!query.trim()) {
          setProducts([]);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
          .limit(40);

        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error('Search query failed:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSearchResults();
  }, [query]);

  // Sort logic
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'low-high') return Number(a.price) - Number(b.price);
    if (sortBy === 'high-low') return Number(b.price) - Number(a.price);
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider mb-1">
            <Link to="/" className="hover:text-black">Home</Link>
            <span>/</span>
            <span className="text-gray-900 font-bold">Search</span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900 flex items-center gap-2">
            <Search className="w-6 h-6 text-red-600" />
            Search Results for &quot;{query}&quot;
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Found {products.length} {products.length === 1 ? 'item' : 'items'} matching your query
          </p>
        </div>

        {/* Sort Controls */}
        {products.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-gray-200 text-xs font-bold rounded-lg px-3 py-2 focus:outline-none focus:border-black"
            >
              <option value="featured">Relevance</option>
              <option value="low-high">Price: Low to High</option>
              <option value="high-low">Price: High to Low</option>
            </select>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-red-600 mb-3" />
          <p className="text-xs font-bold uppercase tracking-wider">Searching gear catalog...</p>
        </div>
      ) : sortedProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <Search className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-black uppercase text-gray-900 mb-2">No matching products found</h2>
          <p className="text-xs text-gray-500 mb-6">
            We couldn&apos;t find any equipment matching &quot;{query}&quot;. Try checking for typos or searching with broader keywords like &quot;racket&quot; or &quot;shoes&quot;.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-black hover:bg-neutral-800 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition"
          >
            <ArrowLeft className="w-4 h-4" /> Browse Categories
          </Link>
        </div>
      )}

      {/* WhatsApp Help Banner */}
      <WhatsAppWidget 
        variant="banner" 
        message={`Hi Lakshya Sports, I was searching for "${query}" on your store and was looking for more options...`}
      />
    </div>
  );
}
