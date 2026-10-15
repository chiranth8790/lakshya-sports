import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Clock, Navigation } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white pt-16 pb-8 border-t border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* PHYSICAL STORES SHOWCASE SECTION */}
        <div className="mb-16 bg-neutral-950/80 border border-neutral-800 rounded-3xl p-6 sm:p-8 md:p-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-neutral-800/80 gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-950/50 border border-red-800/40 px-3 py-1 rounded-full inline-block mb-3">
                Experience Centers & Pro Shops
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                Visit Our Retail Stores in Bengaluru
              </h2>
              <p className="text-neutral-400 text-xs sm:text-sm mt-1">
                Walk in for pro badminton racket stringing, cricket bat knocking & preparation, and gear trials.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-400 shrink-0">
              <Clock className="w-4 h-4 text-red-500" />
              <span>Open 7 Days: 9:30 AM – 9:30 PM</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Store 1: Chikkalasandra */}
            <div className="bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition-all rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-red-500 tracking-wider">Flagship Store</span>
                    <h3 className="text-lg font-black uppercase tracking-tight text-white">
                      Lakshya Sports – Chikkalasandra
                    </h3>
                  </div>
                  <span className="text-xs bg-neutral-800 text-neutral-300 px-2.5 py-1 rounded-lg font-medium">
                    South BLR
                  </span>
                </div>

                <div className="space-y-3 my-4 text-xs">
                  <div className="flex items-start gap-3 text-neutral-300">
                    <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>
                      No. 72/4, Chikkalasandra Main Road, Sarvabhouma Nagar, Chikkalasandra, Bengaluru, Karnataka – 560061 <br />
                      <span className="text-neutral-500 text-[11px] font-medium">(Near Shanishwara Temple)</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-neutral-300">
                    <Phone className="w-4 h-4 text-red-500 shrink-0" />
                    <a 
                      href="tel:+918050856366" 
                      className="hover:text-white font-mono font-bold hover:underline"
                    >
                      +91 80508 56366
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[9px] font-bold uppercase bg-neutral-800/80 text-neutral-400 px-2 py-0.5 rounded">Racket Stringing</span>
                  <span className="text-[9px] font-bold uppercase bg-neutral-800/80 text-neutral-400 px-2 py-0.5 rounded">Bat Knocking</span>
                </div>
                <a
                  href="https://maps.google.com/?q=Lakshya+Sports+Chikkalasandra+Bangalore"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-white transition group"
                >
                  <Navigation className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  <span>Directions</span>
                </a>
              </div>
            </div>

            {/* Store 2: JP Nagar */}
            <div className="bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition-all rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-red-500 tracking-wider">Pro Store</span>
                    <h3 className="text-lg font-black uppercase tracking-tight text-white">
                      Lakshya Sports – JP Nagar (7th Phase)
                    </h3>
                  </div>
                  <span className="text-xs bg-neutral-800 text-neutral-300 px-2.5 py-1 rounded-lg font-medium">
                    Puttenahalli
                  </span>
                </div>

                <div className="space-y-3 my-4 text-xs">
                  <div className="flex items-start gap-3 text-neutral-300">
                    <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>
                      12th Main Road, Jagruthi Colony, Puttenahalli, JP Nagar 7th Phase, Bengaluru, Karnataka – 560078
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-neutral-300">
                    <Phone className="w-4 h-4 text-red-500 shrink-0" />
                    <a 
                      href="tel:+919740517527" 
                      className="hover:text-white font-mono font-bold hover:underline"
                    >
                      +91 97405 17527
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[9px] font-bold uppercase bg-neutral-800/80 text-neutral-400 px-2 py-0.5 rounded">Pro Court Shoes</span>
                  <span className="text-[9px] font-bold uppercase bg-neutral-800/80 text-neutral-400 px-2 py-0.5 rounded">Kitbags & Gear</span>
                </div>
                <a
                  href="https://maps.google.com/?q=Lakshya+Sports+JP+Nagar+7th+Phase+Bangalore"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-white transition group"
                >
                  <Navigation className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  <span>Directions</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Info */}
          <div>
            <Link to="/" className="text-2xl font-black tracking-tighter uppercase inline-block mb-6">
              <span className="text-red-600">Lakshya</span> Sports
            </Link>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Bengaluru&apos;s trusted destination for professional badminton racquets, English willow cricket bats, apparel, and expert racket stringing.
            </p>
            <div className="flex gap-4">
              <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center hover:bg-red-600 transition">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center hover:bg-red-600 transition">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" aria-label="Twitter" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center hover:bg-red-600 transition">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/category/rackets" className="text-gray-400 hover:text-white transition text-sm">Badminton Rackets</Link>
              </li>
              <li>
                <Link to="/category/cricket-bats-english" className="text-gray-400 hover:text-white transition text-sm">Cricket Bats</Link>
              </li>
              <li>
                <Link to="/category/shoes" className="text-gray-400 hover:text-white transition text-sm">Sports Shoes</Link>
              </li>
              <li>
                <Link to="/track-order" className="text-gray-400 hover:text-white transition text-sm">Track Order</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition text-sm">Store Contacts</Link>
              </li>
            </ul>
          </div>

          {/* Legal Policies */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest mb-6">Policies</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white transition text-sm">Terms & Conditions</Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white transition text-sm">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/refund" className="text-gray-400 hover:text-white transition text-sm">Cancellation & Refunds</Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-400 hover:text-white transition text-sm">Shipping Policy</Link>
              </li>
            </ul>
          </div>

          {/* Central Support */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest mb-6">Central Support</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-red-600 shrink-0" />
                <div>
                  <a href="tel:+918050856366" className="text-white font-mono font-bold block hover:underline">
                    +91 80508 56366
                  </a>
                  <a href="tel:+919740517527" className="text-white font-mono font-bold block hover:underline mt-0.5">
                    +91 97405 17527
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-red-600 shrink-0" />
                <a href="mailto:support@lakshyasports.com" className="hover:text-white transition">
                  support@lakshyasports.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-red-600 shrink-0" />
                <span>Mon – Sun: 9:30 AM – 9:30 PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT & TRUST BADGES */}
        <div className="border-t border-neutral-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs text-center md:text-left">
            &copy; {currentYear} Lakshya Sports (Bengaluru). All rights reserved. Authorized Dealer for Yonex, Li-Ning, Victor, SS, SG & more.
          </p>
          <div className="flex gap-4">
            <span className="text-gray-500 text-[10px] uppercase font-black tracking-widest bg-neutral-900 px-3 py-1 rounded">SSL SECURE</span>
            <span className="text-gray-500 text-[10px] uppercase font-black tracking-widest bg-neutral-900 px-3 py-1 rounded">100% GENUINE GEAR</span>
            <span className="text-gray-500 text-[10px] uppercase font-black tracking-widest bg-neutral-900 px-3 py-1 rounded">RAZORPAY VERIFIED</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
