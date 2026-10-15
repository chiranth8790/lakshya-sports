export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900 mb-6">Terms & Conditions</h1>
      <p className="text-xs text-gray-500 mb-8 font-medium">Last updated: October 2026</p>

      <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-gray-900 uppercase mb-2">1. Agreement to Terms</h2>
          <p>
            By accessing or purchasing from Lakshya Sports, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our website.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 uppercase mb-2">2. Products & Pricing</h2>
          <p>
            We strive to display accurate pricing and product descriptions for all sporting gear. Prices and availability are subject to change without prior notice. Lakshya Sports reserves the right to correct any pricing errors.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 uppercase mb-2">3. Orders & Payment</h2>
          <p>
            All payments are processed securely through Razorpay or Cash on Delivery where eligible. We reserve the right to refuse or cancel orders if fraud or an unauthorized transaction is suspected.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 uppercase mb-2">4. Intellectual Property</h2>
          <p>
            All trademarks, logos, and product photographs displayed on this site are the property of Lakshya Sports or their respective brand manufacturers.
          </p>
        </section>
      </div>
    </div>
  );
}
