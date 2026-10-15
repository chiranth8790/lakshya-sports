import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  message?: string;
  phoneNumber?: string;
  variant?: 'floating' | 'banner' | 'card' | 'inline';
}

export default function WhatsAppWidget({
  message = "Hi Lakshya Sports, I'm looking for sports gear/equipment. Can you help me?",
  phoneNumber = "918050856366", // Chikkalasandra Flagship default
  variant = 'floating'
}: WhatsAppButtonProps) {
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  if (variant === 'floating') {
    return (
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="fixed bottom-6 left-6 z-40 bg-[#25D366] hover:bg-[#20ba5a] text-white p-3.5 rounded-full shadow-2xl flex items-center gap-2.5 transition-all transform hover:scale-105 group"
      >
        <MessageCircle className="w-6 h-6 fill-white stroke-[#25D366]" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out text-xs font-black uppercase tracking-wider pr-1">
          Chat on WhatsApp
        </span>
      </a>
    );
  }

  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-emerald-900/90 via-neutral-900 to-neutral-900 border border-emerald-500/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm my-8">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-full bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center shrink-0">
            <MessageCircle className="w-6 h-6 text-[#25D366]" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black uppercase text-white tracking-tight">
              Looking for other products or custom gear?
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Can&apos;t find your specific racket tension, bat weight, or shoe size? We source 1,000+ items directly from Yonex, Victor & SS!
            </p>
          </div>
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 bg-[#25D366] hover:bg-[#20ba5a] text-white font-black text-xs uppercase tracking-wider px-6 py-3 rounded-xl flex items-center gap-2 transition shadow-lg hover:shadow-emerald-900/40"
        >
          <MessageCircle className="w-4 h-4 fill-white stroke-[#25D366]" />
          <span>DM us on WhatsApp</span>
        </a>
      </div>
    );
  }

  // Inline button (e.g., for ProductPage below Buy Now)
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/40 text-[#128C7E] font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition"
    >
      <MessageCircle className="w-4 h-4 text-[#25D366]" />
      <span>Looking for custom specs? DM on WhatsApp</span>
    </a>
  );
}
