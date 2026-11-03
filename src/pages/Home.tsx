import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, ArrowRight, ChevronLeft, ChevronRight, Tag, ChevronDown, ChevronUp, MapPin, Award } from 'lucide-react';
import { supabase } from '../library/supabase';
import ProductCarousel from '../components/ProductCarousel';
import SEO from '../components/SEO';
import { getStoreLocalBusinessSchema, getWebSiteSearchSchema, getFAQPageSchema } from '../utils/seoSchemas';
import { fetchWithCache } from '../utils/productCache';

const HOME_FAQS = [
  {
    question: "Where can I buy 100% original Yonex and Li-Ning badminton rackets in Bangalore?",
    answer: "You can purchase 100% authentic Yonex, Li-Ning, and Victor badminton rackets online at Lakshya Sports (lakshyashop.in) or walk in directly to our Bengaluru pro shops located at Chikkalasandra (South BLR) and JP Nagar 7th Phase. All rackets feature official brand holograms, genuine scratch codes, and full manufacturer warranty."
  },
  {
    question: "Do you provide custom electronic badminton racket stringing in Bangalore?",
    answer: "Yes! Lakshya Sports operates professional 6-point electronic stringing machines at our Bengaluru stores. You can choose premium Yonex strings (BG 65, BG 65 Titanium, BG 66 Ultimax, BG 80 Power, Nanogy 95, Aerobite) and select exact tension from 22 lbs up to 30 lbs for tournament play."
  },
  {
    question: "How do I choose between Head-Heavy, Head-Light, and Even-Balance badminton rackets?",
    answer: "Head-Heavy rackets (e.g. Yonex Astrox series) provide maximum smash power for aggressive offensive players. Head-Light rackets (e.g. Yonex Nanoflare series) offer lightning-fast swing speeds for rapid defense and doubles net play. Even-Balance rackets (e.g. Yonex Arcsaber series) give complete control and versatility across all court positions."
  },
  {
    question: "What is your shipping and delivery timeline across Bangalore and India?",
    answer: "For Bengaluru addresses, orders typically arrive in 24 to 48 hours. Express pan-India courier delivery takes 2 to 4 business days for metro cities. We offer Free Shipping on all orders above ₹1,999."
  },
  {
    question: "Do you provide cricket bat knocking, oiling, and preparation in Bangalore?",
    answer: "Yes, our certified pro gear technicians provide machine knocking, linseed oil treatment, and protective scuff sheet application for English Willow and Kashmir Willow cricket bats at our Bengaluru centers."
  }
];

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
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Schema.org Structured Data for Google SERP Domination
  const homeJsonLd = [
    ...getStoreLocalBusinessSchema(),
    getWebSiteSearchSchema(),
    getFAQPageSchema(HOME_FAQS)
  ];

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

  // Fetch all home catalog products in ONE compact query with 0ms client-side cache
  useEffect(() => {
    async function loadHomeProducts() {
      try {
        const cachedData = await fetchWithCache('home_catalog_v2', async () => {
          const { data, error } = await supabase
            .from('products')
            .select('id, name, brand, category, price, original_price, images, image, stock, collections')
            .order('id', { ascending: false })
            .limit(60);

          if (error || !data) return { recommended: [], arrivals: [], sale: [] };

          const formatted = data.map(formatProduct);
          const recommended = formatted.filter((p: any) => Number(p.stock) > 0).slice(0, 16);
          const arrivals = formatted.filter((p: any) => Array.isArray(p.collections) && p.collections.includes('new_arrivals')).slice(0, 16);
          const sale = formatted.filter((p: any) => Array.isArray(p.collections) && p.collections.includes('sale')).slice(0, 16);

          return {
            recommended: recommended.length > 0 ? recommended : formatted.slice(0, 12),
            arrivals: arrivals.length > 0 ? arrivals : formatted.slice(0, 12),
            sale: sale.length > 0 ? sale : formatted.slice(0, 12),
          };
        }, 3 * 60 * 1000); // 3-minute SWR cache

        setRecommendedGear(cachedData.recommended);
        setNewArrivals(cachedData.arrivals);
        setOnSaleGear(cachedData.sale);
      } catch (err) {
        console.error('Home products load error:', err);
      }
    }

    loadHomeProducts();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 pb-16">
      <SEO
        title="Lakshya Sports | #1 Badminton & Cricket Store in Bangalore | Pro Stringing"
        description="Shop 100% authentic Yonex, Li-Ning badminton rackets, tournament shuttles, English willow cricket bats, and precision electronic stringing in Bangalore. Stores at Chikkalasandra & JP Nagar 7th Phase."
        keywords="badminton goods, badminton racquets, badminton rackets bangalore, buy badminton racket online, yonex badminton shop bangalore, badminton stringing near me, cricket bats bangalore, lakshya sports"
        canonical="https://lakshyashop.in/"
        jsonLd={homeJsonLd}
      />
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

      {/* ── GOOGLE SEARCH AUTHORITY & LOCAL SEO SECTION ── */}
      <section className="max-w-7xl mx-auto px-4 mt-16">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 shadow-xs">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-[11px] font-black uppercase tracking-widest text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full inline-block mb-3">
              Bengaluru's Premier Sports Destination
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-gray-900 mb-3">
              Why Bengaluru Badminton & Cricket Champions Choose Lakshya Sports
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              From competitive academy trainees to weekend club warriors, Lakshya Sports is Bengaluru's premier specialist for 100% genuine tournament gear, 6-point electronic badminton racket gutting, and custom cricket bat preparation.
            </p>
          </div>

          {/* 3 Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
              <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black uppercase text-gray-900 mb-2">100% Authentic Guarantee</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Every Yonex, Li-Ning, Victor, SS, and SG product is backed by official brand holograms and tamper-proof verification codes. Zero counterfeits.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black uppercase text-gray-900 mb-2">Electronic Racket Stringing</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Precision tensioning on computerized stringing machines. Choose your exact tension (22 lbs to 30 lbs) with Yonex BG 65, BG 66 Ultimax, or Nanogy 95.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black uppercase text-gray-900 mb-2">2 Walk-In Stores in Bangalore</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Experience equipment in-person at our Chikkalasandra Flagship Store or JP Nagar 7th Phase Pro Shop. Open 7 days a week: 9:30 AM – 9:30 PM.
              </p>
            </div>
          </div>

          {/* Google High-Intent FAQ Accordion */}
          <div className="border-t border-gray-200 pt-10">
            <div className="text-center mb-8">
              <h3 className="text-xl font-black uppercase tracking-tight text-gray-900">
                Frequently Asked Questions About Badminton & Cricket Gear
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Everything you need to know about choosing rackets, custom stringing, and authenticity
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-3">
              {HOME_FAQS.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div 
                    key={index} 
                    className="border border-gray-200 rounded-2xl overflow-hidden transition-all bg-gray-50/50 hover:bg-gray-50"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-gray-900 cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-red-600 font-black">Q{index + 1}.</span> {faq.question}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}