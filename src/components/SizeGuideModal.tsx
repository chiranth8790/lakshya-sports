import { useState } from 'react';
import { X, Ruler, Footprints, Shield } from 'lucide-react';

interface SizeGuideModalProps {
  category?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function SizeGuideModal({ category = '', isOpen, onClose }: SizeGuideModalProps) {
  const isShoe = category.toLowerCase().includes('shoe');
  const isCricket = category.toLowerCase().includes('cricket') || category.toLowerCase().includes('bat');
  const [activeTab, setActiveTab] = useState<'shoes' | 'bats' | 'grips'>(
    isShoe ? 'shoes' : isCricket ? 'bats' : 'grips'
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center">
              <Ruler className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <h3 className="font-black text-gray-900 uppercase tracking-tight text-sm sm:text-base">
                Official Equipment Size Guide
              </h3>
              <p className="text-[11px] text-gray-500">Standard fit guide calibrated for Indian players</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-gray-100 bg-gray-50/50 px-5 pt-3 gap-3">
          <button
            onClick={() => setActiveTab('shoes')}
            className={`pb-3 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'shoes' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-black'
            }`}
          >
            <Footprints className="w-3.5 h-3.5" /> Court Shoes (UK/IND)
          </button>
          <button
            onClick={() => setActiveTab('bats')}
            className={`pb-3 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'bats' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-black'
            }`}
          >
            <Shield className="w-3.5 h-3.5" /> Cricket Bats
          </button>
          <button
            onClick={() => setActiveTab('grips')}
            className={`pb-3 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'grips' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-black'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" /> Racket Grip Sizes
          </button>
        </div>

        {/* Content Table */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'shoes' && (
            <div>
              <p className="text-xs text-gray-600 mb-4">
                Court badminton shoes should fit snug around the heel with approximately <strong>5mm</strong> toe clearance for sudden stops and lunges.
              </p>
              <div className="overflow-x-auto border border-gray-200 rounded-2xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-100 text-gray-900 uppercase font-black">
                    <tr>
                      <th className="p-3">UK / India Size</th>
                      <th className="p-3">US Size</th>
                      <th className="p-3">Euro Size</th>
                      <th className="p-3">Foot Length (cm)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                    <tr className="hover:bg-gray-50"><td className="p-3 font-bold text-gray-900">UK 6</td><td className="p-3">US 6.5</td><td className="p-3">EU 39.5</td><td className="p-3 font-mono">24.5 cm</td></tr>
                    <tr className="hover:bg-gray-50"><td className="p-3 font-bold text-gray-900">UK 7</td><td className="p-3">US 7.5</td><td className="p-3">EU 40.5</td><td className="p-3 font-mono">25.5 cm</td></tr>
                    <tr className="hover:bg-gray-50"><td className="p-3 font-bold text-gray-900">UK 8</td><td className="p-3">US 8.5</td><td className="p-3">EU 42.0</td><td className="p-3 font-mono">26.5 cm</td></tr>
                    <tr className="hover:bg-gray-50"><td className="p-3 font-bold text-gray-900">UK 9</td><td className="p-3">US 9.5</td><td className="p-3">EU 43.0</td><td className="p-3 font-mono">27.5 cm</td></tr>
                    <tr className="hover:bg-gray-50"><td className="p-3 font-bold text-gray-900">UK 10</td><td className="p-3">US 10.5</td><td className="p-3">EU 44.5</td><td className="p-3 font-mono">28.5 cm</td></tr>
                    <tr className="hover:bg-gray-50"><td className="p-3 font-bold text-gray-900">UK 11</td><td className="p-3">US 11.5</td><td className="p-3">EU 46.0</td><td className="p-3 font-mono">29.5 cm</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'bats' && (
            <div>
              <p className="text-xs text-gray-600 mb-4">
                Selecting the right bat length ensures balance, bat speed, and stroke mechanics. Measure player height with shoes on.
              </p>
              <div className="overflow-x-auto border border-gray-200 rounded-2xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-100 text-gray-900 uppercase font-black">
                    <tr>
                      <th className="p-3">Bat Size</th>
                      <th className="p-3">Player Height</th>
                      <th className="p-3">Age Guide</th>
                      <th className="p-3">Bat Length</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                    <tr className="hover:bg-gray-50"><td className="p-3 font-bold text-gray-900">Size 4</td><td className="p-3">4&apos;9&quot; – 4&apos;11&quot;</td><td className="p-3">9 – 11 Years</td><td className="p-3 font-mono">29.75&quot;</td></tr>
                    <tr className="hover:bg-gray-50"><td className="p-3 font-bold text-gray-900">Size 5</td><td className="p-3">4&apos;11&quot; – 5&apos;2&quot;</td><td className="p-3">10 – 12 Years</td><td className="p-3 font-mono">30.75&quot;</td></tr>
                    <tr className="hover:bg-gray-50"><td className="p-3 font-bold text-gray-900">Size 6</td><td className="p-3">5&apos;2&quot; – 5&apos;5&quot;</td><td className="p-3">11 – 13 Years</td><td className="p-3 font-mono">31.75&quot;</td></tr>
                    <tr className="hover:bg-gray-50"><td className="p-3 font-bold text-gray-900">Harrow</td><td className="p-3">5&apos;4&quot; – 5&apos;8&quot;</td><td className="p-3">12 – 14 Years</td><td className="p-3 font-mono">32.75&quot;</td></tr>
                    <tr className="hover:bg-gray-50 bg-red-50/40"><td className="p-3 font-bold text-red-700">SH (Short Handle)</td><td className="p-3 font-bold">5&apos;8&quot; – 6&apos;2&quot;</td><td className="p-3 font-bold">Adult / Standard</td><td className="p-3 font-mono font-bold">33.5&quot;</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'grips' && (
            <div>
              <p className="text-xs text-gray-600 mb-4">
                Badminton racket grip circumference is indicated by the <strong>G number</strong>. Lower G number means a thicker handle.
              </p>
              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                  <h4 className="font-black text-gray-900 uppercase text-xs">G4 (84mm circumference)</h4>
                  <p className="text-xs text-gray-500 mt-1">Standard medium handle. Suitable for players with larger hands or players who prefer thicker cushion overgrips.</p>
                </div>
                <div className="p-4 rounded-xl border border-gray-200 bg-emerald-50/50 border-emerald-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-emerald-900 uppercase text-xs">G5 (81mm circumference)</h4>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Most Popular</span>
                  </div>
                  <p className="text-xs text-emerald-800/80 mt-1">Universal modern standard preferred by 90% of intermediate & pro players. Allows quick finger power generation and smash angles.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer tip */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-500">
            Still unsure about your size? Visit our <strong>Chikkalasandra</strong> or <strong>JP Nagar</strong> stores for a personalized trial!
          </p>
        </div>
      </div>
    </div>
  );
}
