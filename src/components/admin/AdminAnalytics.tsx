import { useState } from 'react';
import { IndianRupee, TrendingUp, TrendingDown, Calendar, ShoppingBag, Percent } from 'lucide-react';

type AnalyticsTab = 'revenue' | 'orders' | 'products';

export default function AdminAnalytics() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('revenue');

  // Simulated chart heights (percentages) for the bar graph
  const chartData = [35, 50, 40, 65, 55, 80, 100, 75, 90, 60, 85, 95];
  const chartLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div>
      <h1 className="text-2xl font-black text-gray-900 uppercase mb-2">Analytics</h1>
      <p className="text-xs text-gray-500 font-semibold mb-8">Detailed historical performance and sales data.</p>

      {/* Date Filter */}
      <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
        <div className="flex gap-2">
          {[
            { id: 'revenue', label: 'Revenue' },
            { id: 'orders', label: 'Orders' },
            { id: 'products', label: 'Products' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AnalyticsTab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab.id 
                  ? 'bg-black text-white' 
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-black hover:text-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold">
          <Calendar className="w-4 h-4 text-gray-400" />
          <select className="bg-transparent uppercase outline-none cursor-pointer">
            <option>Last 30 Days</option>
            <option>Last 3 Months</option>
            <option>Last 6 Months</option>
            <option>This Year (2026)</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Gross Revenue</p>
          <p className="text-2xl font-black text-gray-900 mb-2">₹12,45,000</p>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase">
            <TrendingUp className="w-3 h-3" /> +14.5% vs previous
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Average Order Value (AOV)</p>
          <p className="text-2xl font-black text-gray-900 mb-2">₹8,450</p>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase">
            <TrendingUp className="w-3 h-3" /> +5.2% vs previous
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Total Refunds</p>
          <p className="text-2xl font-black text-gray-900 mb-2">₹42,000</p>
          <div className="flex items-center gap-1 text-[10px] font-bold text-red-500 uppercase">
            <TrendingDown className="w-3 h-3" /> -2.1% vs previous
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Discounts Applied</p>
          <p className="text-2xl font-black text-gray-900 mb-2">₹18,500</p>
          <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
            <Percent className="w-3 h-3" /> 1.5% of total sales
          </div>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
        <h2 className="text-sm font-black uppercase text-gray-900 mb-8">
          {activeTab === 'revenue' ? 'Revenue Timeline (2026)' : activeTab === 'orders' ? 'Order Volume' : 'Product Sales'}
        </h2>
        
        {/* CSS Bar Chart Simulation */}
        <div className="relative h-72">
          {/* Y-Axis Guidelines */}
          <div className="absolute inset-0 flex flex-col justify-between text-[10px] font-bold text-gray-300">
            <div className="border-b border-gray-100 w-full pb-1">100k</div>
            <div className="border-b border-gray-100 w-full pb-1">75k</div>
            <div className="border-b border-gray-100 w-full pb-1">50k</div>
            <div className="border-b border-gray-100 w-full pb-1">25k</div>
            <div className="border-b-0 w-full pb-1">0</div>
          </div>

          {/* Bars */}
          <div className="absolute inset-0 pl-10 flex items-end justify-between gap-2 pb-5 z-10">
            {chartData.map((height, idx) => (
              <div key={idx} className="w-full flex justify-center group relative h-full items-end">
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-black text-white text-[10px] font-bold py-1 px-2 rounded whitespace-nowrap transition pointer-events-none">
                  ₹{(height * 1000).toLocaleString('en-IN')}
                </div>
                {/* The Bar */}
                <div 
                  className="w-full max-w-[2.5rem] bg-black hover:bg-neutral-700 rounded-t-sm transition-all duration-500"
                  style={{ height: `${height}%` }}
                ></div>
              </div>
            ))}
          </div>

          {/* X-Axis Labels */}
          <div className="absolute bottom-0 left-10 right-0 flex justify-between text-[10px] font-bold text-gray-400 uppercase">
            {chartLabels.map((label, idx) => (
              <span key={idx} className="w-full text-center">{label}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}