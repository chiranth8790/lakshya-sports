export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900 mb-6">Shipping & Delivery Policy</h1>
      <p className="text-xs text-gray-500 mb-8 font-medium">Last updated: October 2026</p>

      <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-gray-900 uppercase mb-2">1. Processing Time</h2>
          <p>
            All standard orders are processed and packed within 24 to 48 hours (excluding Sundays and national holidays). Orders placed on weekends will be dispatched the following Monday.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 uppercase mb-2">2. Delivery Timelines</h2>
          <p>
            Standard delivery across metro cities typically takes 2 to 4 business days. For regional and remote areas, delivery can take up to 5 to 7 business days depending on courier connectivity.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 uppercase mb-2">3. Shipping Rates</h2>
          <p>
            We offer <strong>Free Shipping</strong> on all prepaid and COD orders above ₹1,999. For orders under ₹1,999, a flat shipping charge of ₹99 is applicable across India.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 uppercase mb-2">4. Tracking Your Order</h2>
          <p>
            Once your order is handed over to our courier partner, you will receive an SMS and email notification with your tracking ID. You can also track your shipment live using our <strong>Track Order</strong> portal.
          </p>
        </section>
      </div>
    </div>
  );
}
