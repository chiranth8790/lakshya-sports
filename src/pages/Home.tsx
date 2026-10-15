import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, ArrowRight, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { supabase } from '../library/supabase';
import ProductCarousel from '../components/ProductCarousel';

const DEFAULT_SLIDES = [
  {
    id: '1',
    title: 'PRO BADMINTON ARENA',
    subtitle: 'Astrox 88D Pro, Axforce 80 & Tournament Series Shoes',
    tag: 'Free Gutting Above ₹4,999',
    ctaLink: '/category/rackets',
    ctaText: 'Shop Rackets',
    bg: 'from-black via-zinc-900 to-neutral-900',
  },
  {
    id: '2',
    title: 'WILLOW & CRICKET GEAR',
    subtitle: 'Hand-crafted English Willow & Match Grade Protection',
    tag: 'Official Match Kit',
    ctaLink: '/category/cricket-bats-english',
    ctaText: 'Explore Cricket',
    bg: 'from-red-950 via-zinc-900 to-black',
  },
  {
    id: '3',
    title: 'INDOOR & COURT SPORTS',
    subtitle: 'Official Championship Carrom Boards, Volleyballs & Accessories',
    tag: 'Club Tournament Standard',
    ctaLink: '/category/carrom',
    ctaText: 'Shop Other Sports',
    bg: 'from-blue-950 via-zinc-900 to-black',
  },
];

const getInitialSlides = (): any[] => {
  try {
    const stored = localStorage.getItem('lakshya_hero_banners');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        const active = parsed.filter((b: any) => b.is_active ?? true);
        if (active.length > 0) {
          return active.map((b: any) => ({
            id: String(b.id),
            title: b.title || 'Special Promotion',
            subtitle: b.subtitle || '',
            tag: b.tag || '',
            ctaLink: b.cta_link || b.ctaLink || '/category/rackets',
            ctaText: b.cta_text || b.ctaText || 'Shop Now',
            bg: b.bg || 'from-black via-zinc-900 to-neutral-900',
            imageUrl: b.image_url || b.imageUrl,
          }));
        }
      }
    }
  } catch {
    // ignore
  }
  return [];
};

export default function Home() {
  // Slideshow State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<any[]>(getInitialSlides);
  const [bannersLoading, setBannersLoading] = useState(() => getInitialSlides().length === 0);

  // Supabase State
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [recommendedGear, setRecommendedGear] = useState<any[]>([]);
  const [onSaleGear, setOnSaleGear] = useState<any[]>([]);

  // Fetch Banners from Supabase (Source of Truth) & Sync Local Cache
  useEffect(() => {
    async function fetchBanners() {
      try {
        const { data, error } = await supabase
          .from('hero_banners')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const formatted = data.map((b: any) => ({
            id: String(b.id),
            title: b.title || 'Special Promotion',
            subtitle: b.subtitle || '',
            tag: b.tag || '',
            ctaLink: b.cta_link || '/category/rackets',
            ctaText: b.cta_text || 'Shop Now',
            bg: b.bg || 'from-black via-zinc-900 to-neutral-900',
            imageUrl: b.image_url,
          }));
          setSlides(formatted);
          try {
            localStorage.setItem('lakshya_hero_banners', JSON.stringify(data));
          } catch {
            // ignore
          }
          setBannersLoading(false);
          return;
        } else if (!error && data && data.length === 0) {
          // If no custom banners are active in DB, fallback to default slides
          setSlides(DEFAULT_SLIDES);
          try {
            localStorage.removeItem('lakshya_hero_banners');
          } catch {
            // ignore
          }
          setBannersLoading(false);
          return;
        }
      } catch {
        // DB error or offline: fallback to cached slides or defaults
      }

      setSlides((prev) => (prev.length > 0 ? prev : DEFAULT_SLIDES));
      setBannersLoading(false);
    }

    fetchBanners();
  }, []);

  // Slideshow Timer
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Keep current slide within bounds if slide count changes
  useEffect(() => {
    if (currentSlide >= slides.length && slides.length > 0) {
      setCurrentSlide(0);
    }
  }, [slides.length, currentSlide]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  // Touch handlers for swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  const formatProduct = (item: any) => ({
    ...item,
    price: item.price || 0,
    originalPrice: item.original_price || 0,
    image: item.images && item.images.length > 0 ? item.images[0] : '',
  });

  // Fetch Recommended Products
  useEffect(() => {
    const fetchRecommended = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .gt('stock', 0)
        .limit(20);

      if (data) setRecommendedGear(data.map(formatProduct));
    };
    fetchRecommended();
  }, []);

  // Fetch New Arrivals
  useEffect(() => {
    const fetchNewArrivals = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .contains('collections', ['new_arrivals'])
        .limit(20);
        
      if (data) setNewArrivals(data.map(formatProduct));
    };
    fetchNewArrivals();
  }, []);

  // Fetch On Sale
  useEffect(() => {
    const fetchOnSale = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .contains('collections', ['sale'])
        .limit(20);
        
      if (data) setOnSaleGear(data.map(formatProduct));
    };
    fetchOnSale();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 pb-16">
      {/* Sliding Hero Window */}
      <section 
        className="relative overflow-hidden bg-black text-white w-full touch-pan-y min-h-[300px] sm:min-h-[420px]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {bannersLoading && slides.length === 0 ? (
          <div className="w-full min-h-[300px] sm:min-h-[420px] bg-zinc-950 flex items-center justify-center animate-pulse">
            <div className="w-8 h-8 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div
              className="flex transition-transform duration-700 ease-out w-full"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide, index) => (
                <div
                  key={slide.id || index}
                  className="w-full shrink-0 relative flex items-center justify-center bg-black overflow-hidden"
                >
                  {slide.imageUrl ? (
                    <Link to={slide.ctaLink} className="w-full block relative group bg-black">
                      <img
                        src={slide.imageUrl}
                        alt={slide.title || 'Promotional Banner'}
                        className="w-full h-auto max-h-[550px] object-contain sm:object-cover sm:max-h-[500px] mx-auto group-hover:scale-[1.005] transition-transform duration-300"
                        loading={index === 0 ? "eager" : "lazy"}
                        fetchPriority={index === 0 ? "high" : "auto"}
                        decoding={index === 0 ? "sync" : "async"}
                      />
                    </Link>
                  ) : (
                    <div className={`w-full py-16 sm:py-24 px-4 flex flex-col items-center justify-center text-center bg-gradient-to-r ${slide.bg || 'from-black to-zinc-900'} min-h-[300px] sm:min-h-[420px]`}>
                      {slide.tag && (
                        <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3 shadow-md">
                          {slide.tag}
                        </span>
                      )}
                      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight max-w-3xl leading-none drop-shadow-sm">
                        {slide.title}
                      </h1>
                      {slide.subtitle && (
                        <p className="mt-4 text-xs sm:text-sm text-gray-200 max-w-xl font-medium">
                          {slide.subtitle}
                        </p>
                      )}
                      <div className="mt-6">
                        <Link
                          to={slide.ctaLink}
                          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition inline-flex items-center gap-1.5 shadow-md active:scale-95"
                        >
                          {slide.ctaText || 'Shop Now'} <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {slides.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/70 rounded-full text-white transition z-20"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/70 rounded-full text-white transition z-20"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        currentSlide === i ? 'w-6 bg-red-600' : 'w-2 bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>

      {/* Trust Strip */}
      <section className="bg-white border-b border-gray-200 py-4 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-800">
            <ShieldCheck className="w-4 h-4 text-red-600" /> 100% Genuine Brand Guarantee
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-800">
            <Truck className="w-4 h-4 text-red-600" /> Fast Express Dispatch Nationwide
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-800">
            <RotateCcw className="w-4 h-4 text-red-600" /> Electronic Stringing & Precision Prep
          </div>
        </div>
      </section>

      {/* On Sale Products */}
      {onSaleGear.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mt-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-red-600 flex items-center gap-2">
                <Tag className="w-6 h-6" /> Flash Sale
              </h2>
              <p className="text-xs text-gray-500">Massive discounts on premium gear</p>
            </div>
          </div>
          <ProductCarousel products={onSaleGear} />
        </section>
      )}

      {/* Recommended Products */}
      <section className="max-w-7xl mx-auto px-4 mt-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-gray-900">
              Recommended Products
            </h2>
            <p className="text-xs text-gray-500">Tournament equipment trusted by coaches and players</p>
          </div>
          <Link
            to="/category/rackets"
            className="flex items-center gap-1 text-xs font-black uppercase text-red-600 hover:text-black transition"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <ProductCarousel products={recommendedGear} />
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mt-14 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-gray-900">
                New Arrivals
              </h2>
              <p className="text-xs text-gray-500">Latest sports gear just stocked</p>
            </div>
          </div>
          <ProductCarousel products={newArrivals} />
        </section>
      )}
    </main>
  );
}