import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center max-w-xl mx-auto mb-12">
        <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900 mb-3">Contact Support</h1>
        <p className="text-sm text-gray-500">
          Have questions about badminton gear, custom cricket bat preparation, or bulk team orders? Reach out to our specialist team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Store Locations & Contacts */}
        <div className="space-y-6">
          {/* Branch 1 */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-red-600 bg-red-100/60 px-2.5 py-0.5 rounded-full">
                Branch 1 • Flagship
              </span>
              <span className="text-[11px] text-gray-500 font-medium">Chikkalasandra</span>
            </div>
            <h3 className="text-base font-black uppercase text-gray-900 mb-2">
              Lakshya Sports – Chikkalasandra
            </h3>
            <div className="flex items-start gap-2.5 mb-3 text-xs text-gray-600 leading-relaxed">
              <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>
                No. 72/4, Chikkalasandra Main Road, Sarvabhouma Nagar, Chikkalasandra, Bengaluru – 560061 (Near Shanishwara Temple)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-red-600" />
              <a href="tel:+918050856366" className="text-xs font-mono font-bold text-gray-900 hover:text-red-600 hover:underline">
                +91 80508 56366
              </a>
            </div>
          </div>

          {/* Branch 2 */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-red-600 bg-red-100/60 px-2.5 py-0.5 rounded-full">
                Branch 2 • Pro Shop
              </span>
              <span className="text-[11px] text-gray-500 font-medium">JP Nagar 7th Phase</span>
            </div>
            <h3 className="text-base font-black uppercase text-gray-900 mb-2">
              Lakshya Sports – JP Nagar
            </h3>
            <div className="flex items-start gap-2.5 mb-3 text-xs text-gray-600 leading-relaxed">
              <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>
                12th Main Road, Jagruthi Colony, Puttenahalli, JP Nagar 7th Phase, Bengaluru – 560078
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-red-600" />
              <a href="tel:+919740517527" className="text-xs font-mono font-bold text-gray-900 hover:text-red-600 hover:underline">
                +91 97405 17527
              </a>
            </div>
          </div>

          <div className="bg-neutral-900 text-white rounded-2xl p-5 text-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-red-500 shrink-0" />
              <div>
                <span className="text-gray-400 block text-[10px] uppercase">Central Email</span>
                <span className="font-bold">support@lakshyasports.com</span>
              </div>
            </div>
            <span className="text-gray-400 text-[11px]">9:30 AM – 9:30 PM (Daily)</span>
          </div>
        </div>

        {/* Message Form */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black uppercase text-gray-900 mb-2">Message Sent!</h3>
              <p className="text-xs text-gray-500 mb-6">
                Thank you for contacting Lakshya Sports. Our team will review your inquiry and get back to you shortly.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setForm({ name: '', email: '', message: '' });
                }}
                className="text-xs font-bold text-red-600 uppercase tracking-wider underline hover:text-black"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-lg font-black uppercase tracking-wider text-gray-900 mb-4">Drop Us A Message</h2>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Virat Kumar"
                  className="w-full border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="How can we assist you with your equipment?"
                  className="w-full border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-black"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-black hover:bg-neutral-800 text-white font-bold h-12 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition"
              >
                <Send className="w-4 h-4" /> Send Inquiry
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
