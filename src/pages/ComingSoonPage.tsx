import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  MessageCircle, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Activity, 
  Flame, 
  ExternalLink
} from 'lucide-react';
import { supabase } from '../library/supabase';
import SEO from '../components/SEO';

interface ComingSoonProps {
  onEnterStore?: () => void;
}

export default function ComingSoonPage({ onEnterStore }: ComingSoonProps) {
  const [contactInput, setContactInput] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [passcodeError, setPasscodeError] = useState(false);

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactInput.trim()) return;

    setSubmitting(true);
    try {
      const isEmail = contactInput.includes('@');
      await supabase.from('contact_inquiries').insert([
        {
          name: customerName.trim() || 'VIP Launch Subscriber',
          email: isEmail ? contactInput.trim() : `phone_${contactInput.replace(/\D/g, '')}@lakshyashop.in`,
          phone: !isEmail ? contactInput.trim() : null,
          subject: 'VIP Early Access - Online Store Launch',
          message: `Customer requested VIP Early Access & Launch Voucher notification for contact: ${contactInput.trim()}`,
          status: 'New',
          created_at: new Date().toISOString(),
        }
      ]);
      setSubmitted(true);
    } catch {
      // Graceful local fallback
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Allow owner / staff preview with passcode or enter directly
    if (adminPasscode.toLowerCase() === 'lakshya' || adminPasscode === '1234' || adminPasscode === 'admin') {
      localStorage.setItem('lakshya_preview_mode', 'true');
      if (onEnterStore) {
        onEnterStore();
      } else {
        window.location.reload();
      }
    } else {
      setPasscodeError(true);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between font-sans selection:bg-red-600 selection:text-white">
      <SEO
        title="Lakshya Sports Bengaluru | Grand Online Store Launching Soon"
        description="Lakshya Sports online store is launching soon! Bengaluru's pro badminton racquets, electronic stringing, cricket willow bats, and instant 2-hour Bangalore delivery. Physical stores at Chikkalasandra & JP Nagar 7th Phase are OPEN daily."
        keywords="lakshya sports, lakshya sports bangalore, lakshya sports chikkalasandra, lakshya sports jp nagar, lakshya shop, badminton rackets bangalore, racket stringing bangalore"
      />

      {/* BACKGROUND GLOW ACCENTS */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-red-700/10 rounded-full blur-[160px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-neutral-800/20 rounded-full blur-[140px]" />
      </div>

      {/* TOP HEADER */}
      <header className="max-w-6xl w-full mx-auto px-4 py-6 sm:py-8 flex items-center justify-between border-b border-neutral-900">
        <div className="flex items-center gap-3">
          <img 
            src="/website-logo.png" 
            alt="Lakshya Sports Bengaluru" 
            className="h-10 sm:h-12 w-auto object-contain drop-shadow-md"
          />
          <div className="hidden sm:block">
            <span className="text-xs font-black tracking-widest uppercase text-red-600 block">Pro Sports Store</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Bengaluru, Karnataka</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="https://wa.me/918050856366?text=Hi%20Lakshya%20Sports%2C%20I%20am%20inquirying%20about%20equipment%20and%20stringing%20at%20your%20store."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase px-3.5 py-2 rounded-xl transition shadow-sm active:scale-95"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">WhatsApp Us</span>
          </a>
        </div>
      </header>

      {/* MAIN HERO CONTENT */}
      <main className="max-w-5xl w-full mx-auto px-4 py-12 sm:py-16 text-center space-y-10">
        
        {/* LAUNCH BADGE */}
        <div className="inline-flex items-center gap-2 bg-neutral-900/90 border border-neutral-800 px-4 py-1.5 rounded-full shadow-inner animate-pulse">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
          <span className="text-[11px] font-black uppercase tracking-widest text-gray-200">
            Grand Online Store Launching Soon
          </span>
        </div>

        {/* HEADLINE */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-none">
            Bengaluru&apos;s Pro Sports Arena <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-amber-500">
              Is Coming Online
            </span>
          </h1>
          <p className="text-xs sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed font-normal">
            We are putting the final touches on our verified e-commerce catalog, tournament-grade electronic racket stringing configurator, and instant 2-hour delivery across Bengaluru.
          </p>
        </div>

        {/* KEY HIGHLIGHTS STRIP */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
          <div className="bg-neutral-900/70 border border-neutral-800/80 rounded-2xl p-4 space-y-1">
            <ShieldCheck className="w-5 h-5 text-red-500 mb-1" />
            <h2 className="text-xs font-black uppercase text-white">100% Authentic</h2>
            <p className="text-[11px] text-gray-400">Official dealer for Yonex, Li-Ning, Victor &amp; SS.</p>
          </div>
          <div className="bg-neutral-900/70 border border-neutral-800/80 rounded-2xl p-4 space-y-1">
            <Activity className="w-5 h-5 text-amber-500 mb-1" />
            <h2 className="text-xs font-black uppercase text-white">Custom Stringing</h2>
            <p className="text-[11px] text-gray-400">Professional 6-point electronic tension stringing.</p>
          </div>
          <div className="bg-neutral-900/70 border border-neutral-800/80 rounded-2xl p-4 space-y-1">
            <Zap className="w-5 h-5 text-emerald-500 mb-1" />
            <h2 className="text-xs font-black uppercase text-white">2-Hour Delivery</h2>
            <p className="text-[11px] text-gray-400">Instant on-demand bike delivery in Bengaluru.</p>
          </div>
          <div className="bg-neutral-900/70 border border-neutral-800/80 rounded-2xl p-4 space-y-1">
            <Flame className="w-5 h-5 text-red-400 mb-1" />
            <h2 className="text-xs font-black uppercase text-white">Cricket Pro Hub</h2>
            <p className="text-[11px] text-gray-400">English &amp; Kashmir willow bat knocking &amp; oiling.</p>
          </div>
        </div>

        {/* NOTIFY ME VIP ACCESS BOX */}
        <div className="max-w-xl mx-auto bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-red-500 flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> VIP Launch Privilege
            </span>
            <h3 className="text-lg font-black uppercase tracking-tight text-white">
              Get Notified &amp; Unlock 10% Off
            </h3>
            <p className="text-xs text-gray-400">
              Drop your mobile or email to get early access on launch day plus an exclusive opening discount code.
            </p>
          </div>

          {submitted ? (
            <div className="bg-emerald-950/60 border border-emerald-700/80 rounded-2xl p-5 text-center space-y-1 animate-in fade-in">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-1.5" />
              <p className="text-sm font-black uppercase text-emerald-300">You Are On The VIP List!</p>
              <p className="text-xs text-emerald-200/80">
                We will text/email your exclusive 10% launch voucher the moment our online catalog goes live.
              </p>
            </div>
          ) : (
            <form onSubmit={handleNotifySubmit} className="space-y-3 text-left">
              <div>
                <input
                  type="text"
                  placeholder="Your Name (optional)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-neutral-800 bg-black text-white text-xs font-semibold placeholder:text-gray-500 focus:outline-none focus:border-red-600 transition mb-2"
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Mobile number or Email address"
                    value={contactInput}
                    onChange={(e) => setContactInput(e.target.value)}
                    className="flex-1 h-11 px-3.5 rounded-xl border border-neutral-800 bg-black text-white text-xs font-semibold placeholder:text-gray-500 focus:outline-none focus:border-red-600 transition"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-11 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95 shrink-0 disabled:opacity-50"
                  >
                    <span>{submitting ? 'Registering...' : 'Get VIP Access'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* PHYSICAL STORES OPEN ANNOUNCEMENT */}
        <div className="space-y-6 pt-6 border-t border-neutral-900">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-3 py-1 rounded-full inline-block">
              Stores Open 7 Days a Week • 9:30 AM – 9:30 PM
            </span>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mt-2">
              Visit Our Bengaluru Retail Stores
            </h3>
            <p className="text-xs text-gray-400 max-w-lg mx-auto">
              Walk in today for on-the-spot racket gutting, gear testing, cricket bat knocking, or direct purchase.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto text-left">
            {/* Store 1: Chikkalasandra */}
            <div className="bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition rounded-3xl p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-red-500 tracking-wider">Flagship Store</span>
                  <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 9:30 AM - 9:30 PM
                  </span>
                </div>
                <h4 className="text-lg font-black uppercase text-white">Lakshya Sports – Chikkalasandra</h4>
                <p className="text-xs text-gray-300 leading-relaxed flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>No. 72/4, Chikkalasandra Main Road, Sarvabhouma Nagar, Near Shanishwara Temple, Bengaluru - 560061</span>
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-800 flex items-center justify-between gap-2">
                <a
                  href="tel:+918050856366"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-red-400 transition"
                >
                  <Phone className="w-3.5 h-3.5 text-red-500" />
                  <span>+91 80508 56366</span>
                </a>
                <a
                  href="https://maps.google.com/?q=Lakshya+Sports+Chikkalasandra+Bangalore"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-red-400 hover:text-white transition group"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>

            {/* Store 2: JP Nagar */}
            <div className="bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition rounded-3xl p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-red-500 tracking-wider">Pro Store</span>
                  <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 9:30 AM - 9:30 PM
                  </span>
                </div>
                <h4 className="text-lg font-black uppercase text-white">Lakshya Sports – JP Nagar (7th Phase)</h4>
                <p className="text-xs text-gray-300 leading-relaxed flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>12th Main Road, Jagruthi Colony, Puttenahalli, JP Nagar 7th Phase, Bengaluru - 560078</span>
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-800 flex items-center justify-between gap-2">
                <a
                  href="tel:+919740517527"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-red-400 transition"
                >
                  <Phone className="w-3.5 h-3.5 text-red-500" />
                  <span>+91 97405 17527</span>
                </a>
                <a
                  href="https://maps.google.com/?q=Lakshya+Sports+JP+Nagar+7th+Phase+Bangalore"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-red-400 hover:text-white transition group"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* FOOTER & STAFF PREVIEW BYPASS */}
      <footer className="max-w-6xl w-full mx-auto px-4 py-8 border-t border-neutral-900 text-center text-xs text-gray-500 space-y-4">
        <p>
          &copy; {new Date().getFullYear()} Lakshya Sports Bengaluru. All rights reserved. Authorized dealer for Yonex, Li-Ning, Victor, SS &amp; SG.
        </p>

        {/* OWNER / STAFF PREVIEW ACCESS */}
        <div className="pt-2">
          {!showAdminLogin ? (
            <button
              onClick={() => setShowAdminLogin(true)}
              className="text-[10px] text-neutral-600 hover:text-neutral-400 font-bold uppercase tracking-widest transition cursor-pointer"
            >
              🔒 Staff / Owner Preview Access
            </button>
          ) : (
            <form onSubmit={handlePasscodeSubmit} className="inline-flex items-center gap-2 max-w-xs mx-auto animate-in fade-in">
              <input
                type="password"
                placeholder="Enter Staff Passcode (lakshya)"
                value={adminPasscode}
                onChange={(e) => {
                  setAdminPasscode(e.target.value);
                  setPasscodeError(false);
                }}
                className={`h-8 px-2.5 rounded-lg border text-[11px] bg-neutral-900 text-white focus:outline-none ${
                  passcodeError ? 'border-red-500' : 'border-neutral-700'
                }`}
              />
              <button
                type="submit"
                className="h-8 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-wider"
              >
                Enter
              </button>
              <button
                type="button"
                onClick={() => setShowAdminLogin(false)}
                className="text-[10px] text-gray-500 hover:text-white"
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      </footer>
    </div>
  );
}
