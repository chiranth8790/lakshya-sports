import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { supabase } from '../library/supabase';

const SLIDES = [
  {
    title: 'PRO BADMINTON ARENA',
    subtitle: 'Astrox 88D Pro, Axforce 80 & Tournament Series Shoes',
    tag: 'Free Gutting Above ₹4,999',
    ctaLink: '/category/rackets',
    ctaText: 'Shop Rackets',
    bg: 'from-black via-zinc-900 to-neutral-900',
  },
  {
    title: 'WILLOW & CRICKET GEAR',
    subtitle: 'Hand-crafted English Willow & Match Grade Protection',
    tag: 'Official Match Kit',
    ctaLink: '/category/cricket-bats-english',
    ctaText: 'Explore Cricket',
    bg: 'from-red-950 via-zinc-900 to-black',
  },
  {
    title: 'INDOOR & COURT SPORTS',
    subtitle: 'Official Championship Carrom Boards, Volleyballs & Accessories',
    tag: 'Club Tournament Standard',
    ctaLink: '/category/carrom',
    ctaText: 'Shop Other Sports',
    bg: 'from-blue-950 via-zinc-900 to-black',
  },
];

export default function Home() {
  // Slideshow State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Supabase State
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [recommendedGear, setRecommendedGear] = useState<any[]>([]);

  // Slideshow Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

  // Fetch Recommended Products from Supabase (any in-stock product, limit 4)
  useEffect(() => {
    const fetchRecommended = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .gt('stock', 0)
        .limit(4);

      if (data) {
        const formatted = data.map((item) => ({
          ...item,
          price: item.price || 0,
          originalPrice: item.original_price || 0,
          image: item.images && item.images.length > 0 ? item.images[0] : '',
        }));
        setRecommendedGear(formatted);
      }
    };
    fetchRecommended();
  }, []);

  // Fetch New Arrivals from Supabase
  useEffect(() => {
    const fetchNewArrivals = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .contains('collections', ['new_arrivals'])
        .limit(4); // Shows 4 products
        
      if (data) setNewArrivals(data);
    };
    
    fetchNewArrivals();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 pb-16">
      {/* Sliding Hero Window */}
      <section className="relative overflow-hidden bg-black text-white">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {SLIDES.map((slide, index) => (
            <div
              key={index}
              className={`w-full shrink-0 py-16 sm:py-24 px-4 flex flex-col items-center justify-center text-center bg-gradient-to-r ${slide.bg}`}
            >
              <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3 shadow-md">
                {slide.tag}
              </span>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight max-w-3xl leading-none">
                {slide.title}
              </h1>
              <p className="mt-4 text-xs sm:text-sm text-gray-300 max-w-xl">
                {slide.subtitle}
              </p>
              <div className="mt-6">
                <Link
                  to={slide.ctaLink}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-lg transition inline-flex items-center gap-1.5"
                >
                  {slide.ctaText} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/70 rounded-full text-white transition"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/70 rounded-full text-white transition"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 rounded-full transition-all ${
                currentSlide === i ? 'w-6 bg-red-600' : 'w-2 bg-white/50'
              }`}
            />
          ))}
        </div>
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

      {/* Recommended Products */}
      <section className="max-w-7xl mx-auto px-4 mt-10">
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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {recommendedGear.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 mt-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-gray-900">
              New Arrivals
            </h2>
            <p className="text-xs text-gray-500">Latest sports gear just stocked</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}