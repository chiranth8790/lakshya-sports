import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Filter, SlidersHorizontal, ArrowLeft, BookOpen } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import WhatsAppWidget from '../components/WhatsAppWidget';
import SEO from '../components/SEO';
import { getBreadcrumbSchema } from '../utils/seoSchemas';
import { supabase } from '../library/supabase';

const CATEGORY_SEO_DATA: Record<string, { title: string; description: string; keywords: string; guideTitle?: string; guidePoints?: { title: string; desc: string }[] }> = {
  'rackets': {
    title: 'Buy Badminton Rackets Online Bangalore | Original Yonex, Li-Ning | Lakshya Sports',
    description: 'Shop 100% genuine badminton rackets in Bangalore. Official Yonex Astrox, Nanoflare, Arcsaber with custom electronic stringing & express delivery. Visit Chikkalasandra & JP Nagar stores.',
    keywords: 'badminton rackets, buy badminton racket online, badminton goods, badminton racquets bangalore, yonex badminton racket bangalore, astrox 88d pro, nanoflare 800, lakshya sports',
    guideTitle: 'Expert Badminton Racket Buying Guide: Balance, Flex & Tension',
    guidePoints: [
      {
        title: 'Balance Point (Head-Heavy vs Head-Light vs Even)',
        desc: 'Head-Heavy (Yonex Astrox, Li-Ning Axforce) maximizes smash momentum for attacking singles & doubles backcourt players. Head-Light (Yonex Nanoflare) enables rapid racket speed for fast frontcourt intercepting. Even-Balance (Yonex Arcsaber) delivers pinpoint shuttle control and versatility.'
      },
      {
        title: 'Shaft Flex (Stiff vs Medium vs Flexible)',
        desc: 'Stiff shafts suit intermediate to tournament players with strong wrist snap for crisp shuttle control. Medium & flexible shafts suit club players seeking effortless deep-court clears with lower physical strain.'
      },
      {
        title: 'String Tension Guidelines (lbs)',
        desc: 'Beginners: 20–22 lbs (large sweet spot, arm protection). Intermediate Club: 24–26 lbs (optimal balance of power, repulsion & touch). Tournament / Pro: 27–30 lbs (maximum pinpoint shuttle control; strung on electronic computerized machines at Lakshya Sports).'
      }
    ]
  },
  'shoes': {
    title: 'Badminton Shoes Online Bangalore | Non-Marking Court Shoes | Lakshya Sports',
    description: 'Shop tournament-ready non-marking badminton shoes in Bangalore from Yonex and Li-Ning. Cushioning, lateral stability, and court traction with fast shipping across India.',
    keywords: 'badminton shoes, non-marking shoes bangalore, court shoes, yonex power cushion, badminton footwear bangalore, lakshya sports'
  },
  'shuttles': {
    title: 'Badminton Shuttlecocks Online | Feather & Nylon Shuttles | Lakshya Sports',
    description: 'Tournament grade badminton shuttlecocks at best prices. Shop Yonex Aerosensa (AS-2, AS-30), Mavis 350, and durable club shuttles in Bangalore with instant store pickup.',
    keywords: 'badminton shuttlecocks, feather shuttles bangalore, yonex mavis 350 online, aerosensa as 30, tournament shuttles, lakshya sports'
  },
  'cricket-bats-english': {
    title: 'English Willow Cricket Bats Bangalore | Handcrafted Grade 1 Willow | Lakshya Sports',
    description: 'Explore premium hand-crafted English Willow cricket bats in Bangalore from SS, SG, and DSC. Custom machine knocking, oiling, and toe-guard preparation available.',
    keywords: 'english willow cricket bats, buy cricket bat bangalore, grade 1 english willow, cricket bat knocking bangalore, ss cricket bats, sg bats, lakshya sports',
    guideTitle: 'Choosing Your English Willow Cricket Bat',
    guidePoints: [
      {
        title: 'Willow Grade & Grains',
        desc: 'Grade 1 English Willow features 8–12 straight grains with minimal blemishes, delivering supreme ping and balance for match play. Grade 2/3 willows offer excellent club performance and durability.'
      },
      {
        title: 'Sweet Spot Position (Mid vs Low Profile)',
        desc: 'Mid sweet spots favor all-round stroke players across Indian turf wickets, while mid-to-low sweet spots suit boundary-clearing power hitters.'
      },
      {
        title: 'Knocking & Oiling Service',
        desc: 'All English willow bats require extensive preparation. Lakshya Sports Bengaluru provides professional multi-stage machine knocking, raw linseed oiling, and protective scuff sheeting.'
      }
    ]
  },
  'cricket-bats-kashmir': {
    title: 'Kashmir Willow Cricket Bats Online | Leather & Tennis Ball | Lakshya Sports',
    description: 'Durable and powerful Kashmir Willow cricket bats for club matches and leather ball tournaments. Pre-knocked options available at our Bengaluru stores.',
    keywords: 'kashmir willow bats, affordable cricket bats bangalore, club cricket bats, lakshya sports'
  },
  'cricket-balls': {
    title: 'Cricket Leather Balls & Tournament Match Balls | Lakshya Sports Bangalore',
    description: 'Shop two-piece and four-piece leather cricket balls in red, white, and pink for tournament and practice matches across India.',
    keywords: 'cricket leather balls, four piece leather ball, white cricket ball, pink test ball bangalore, lakshya sports'
  },
  'cricket-protection': {
    title: 'Cricket Batting Pads, Gloves & Helmets Bangalore | Lakshya Sports',
    description: 'Full range of professional cricket protective gear: lightweight batting pads, high-density foam gloves, and certified cricket helmets.',
    keywords: 'cricket pads, batting gloves, cricket helmet bangalore, cricket protection, lakshya sports'
  },
  'grips-and-strings': {
    title: 'Badminton Strings & Overgrips Bangalore | Yonex BG 65, Super Grap | Lakshya Sports',
    description: 'Original Yonex BG 65, BG 66 Ultimax, BG 80 strings, and Super Grap (AC102EX) tacky grips in Bangalore. Expert stringing service available.',
    keywords: 'badminton strings bangalore, yonex bg 65, bg 66 ultimax, super grap overgrip, racket stringing bangalore, lakshya sports'
  },
  'kitbags': {
    title: 'Badminton & Cricket Kitbags Online | Multi-Compartment Thermal Bags | Lakshya Sports',
    description: 'Professional 6-racket and 9-racket thermal insulated kitbags and full-size cricket wheelie kitbags from Yonex, SS, and SG in Bangalore.',
    keywords: 'badminton kitbag, 6 racket bag, thermal racket bag, cricket kitbag with wheels, lakshya sports'
  }
};

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
          // Extract image with fallbacks to avoid overriding valid images or colors
          image: item.image || (item.images && item.images.length > 0 ? item.images[0] : '') || (item.colors && item.colors[0] ? item.colors[0].image : '')
        }));
        setAllProducts(formattedData);
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  // 2. Reset filters and scroll to top when changing category
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
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

  const categorySeo = CATEGORY_SEO_DATA[categoryName || ''] || {
    title: `Buy ${formattedTitle} Online Bangalore | Lakshya Sports`,
    description: `Shop authentic ${formattedTitle} online at Lakshya Sports Bengaluru. Fast shipping across India with 100% genuine brand guarantee.`,
    keywords: `${formattedTitle}, buy ${formattedTitle} online, ${formattedTitle} bangalore, sports store bangalore, lakshya sports`
  };

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: 'https://lakshyashop.in/' },
    { name: formattedTitle, url: `https://lakshyashop.in/category/${categoryName}` }
  ]);

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
      <SEO
        title={categorySeo.title}
        description={categorySeo.description}
        keywords={categorySeo.keywords}
        canonical={`https://lakshyashop.in/category/${categoryName}`}
        jsonLd={breadcrumbSchema}
      />
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

            {/* Looking for other products banner */}
            <WhatsAppWidget 
              variant="banner"
              message={`Hi Lakshya Sports, I am browsing the ${categoryName?.replace(/-/g, ' ')} category and looking for other models or custom specifications...`}
            />

            {/* SEO Rich Buying Guide Section for Google Top Placement */}
            {categorySeo.guideTitle && categorySeo.guidePoints && (
              <div className="mt-10 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs">
                <div className="flex items-center gap-2 mb-4 text-red-600">
                  <BookOpen className="w-5 h-5 shrink-0" />
                  <span className="text-[11px] font-black uppercase tracking-wider bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
                    Pro Specialist Guide
                  </span>
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 mb-6">
                  {categorySeo.guideTitle}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {categorySeo.guidePoints.map((pt, i) => (
                    <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-2 font-black text-xs uppercase text-gray-900">
                        <span className="w-5 h-5 bg-black text-white rounded-full flex items-center justify-center text-[10px]">
                          {i + 1}
                        </span>
                        {pt.title}
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {pt.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}