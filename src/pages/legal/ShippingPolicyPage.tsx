export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="border-b border-gray-200 pb-6 mb-8">
        <span className="text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1 rounded-full inline-block mb-3">
          Pan-India Logistics
        </span>
        <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900 mb-2">Shipping & Delivery Policy</h1>
        <p className="text-xs text-gray-500 font-medium">Last updated: November 2026 • Express Dispatch from Bengaluru</p>
      </div>

      <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-base font-black text-gray-900 uppercase tracking-wide mb-2">1. Order Dispatch & Preparation Time</h2>
          <p>
            All standard in-stock sports gear is processed, quality-inspected, and packaged within <strong>24 to 48 business hours</strong> from our Bengaluru store. For orders requesting custom badminton racket stringing or cricket bat knocking and edge-tape preparation, an additional 24 hours is taken to ensure precision tensioning and proper curing before parcel handover.
          </p>
        </section>

        <section>
          <h2 className="text-base font-black text-gray-900 uppercase tracking-wide mb-2">2. Shipping Charges & Free Delivery Threshold</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Free Shipping
              </span>
              <p className="text-base font-black text-gray-900 mt-2">Orders Above ₹1,999</p>
              <p className="text-xs text-emerald-800 mt-1">
                Zero shipping charge anywhere in India for all prepaid and eligible COD orders.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-600 bg-gray-200 px-2 py-0.5 rounded">
                Standard Shipping
              </span>
              <p className="text-base font-black text-gray-900 mt-2">Flat ₹99</p>
              <p className="text-xs text-gray-600 mt-1">
                Applicable for orders under ₹1,999 across all serviceable Indian pincodes.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-base font-black text-gray-900 uppercase tracking-wide mb-2">3. Estimated Delivery Timelines</h2>
          <p className="mb-3">
            Our shipments are routed through express air and surface cargo to ensure minimal transit stress on graphite rackets and leather gear:
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-200">
              <span className="font-bold text-gray-900">Bengaluru City & Karnataka State:</span>
              <span className="font-mono font-bold text-red-600">1 to 2 Business Days</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-200">
              <span className="font-bold text-gray-900">Metro Cities (Mumbai, Delhi-NCR, Chennai, Hyderabad, Kolkata):</span>
              <span className="font-mono font-bold text-red-600">2 to 4 Business Days</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-200">
              <span className="font-bold text-gray-900">Rest of India & Tier 2/3 Cities:</span>
              <span className="font-mono font-bold text-red-600">3 to 6 Business Days</span>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-base font-black text-gray-900 uppercase tracking-wide mb-2">4. Packaging Standards for Fragile Gear</h2>
          <p>
            High-tension badminton rackets are packed in heavy-duty triangular corrugated tubes or rigid double-wall boxes with bubble cushioning to prevent warping or frame damage during transit. Cricket bats are shipped in bubble-lined sleeve protection.
          </p>
        </section>

        <section>
          <h2 className="text-base font-black text-gray-900 uppercase tracking-wide mb-2">5. Live Shipment Tracking</h2>
          <p>
            As soon as your shipment is booked, a tracking number and courier tracking link are generated. You can conveniently monitor your package progress in real time anytime using our <a href="/track-order" className="text-red-600 font-bold underline">Track Order</a> page by entering your Order ID.
          </p>
        </section>
      </div>
    </div>
  );
}
