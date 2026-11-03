export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="border-b border-gray-200 pb-6 mb-8">
        <span className="text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1 rounded-full inline-block mb-3">
          Data Protection
        </span>
        <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900 mb-2">Privacy & Data Security Policy</h1>
        <p className="text-xs text-gray-500 font-medium">Last updated: November 2026 • Compliant with Indian DPDP Guidelines</p>
      </div>

      <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-base font-black text-gray-900 uppercase tracking-wide mb-2">1. Information We Collect</h2>
          <p>
            When you visit, browse, register an account, or complete a purchase with Lakshya Sports, we collect necessary personal details to process your orders and deliver sports gear accurately:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600 mt-2">
            <li><strong>Identity & Contact:</strong> Full name, email address, and mobile phone number for order SMS/WhatsApp dispatch updates.</li>
            <li><strong>Delivery Address:</strong> Shipping street address, landmark, city, state, and postal pincode.</li>
            <li><strong>Account Credentials:</strong> Securely encrypted authentication credentials managed via Supabase Auth.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-black text-gray-900 uppercase tracking-wide mb-2">2. Payment Security & Encryption (PCI-DSS)</h2>
          <p>
            We take your financial security with utmost seriousness. <strong>Lakshya Sports does NOT store or process your credit/debit card numbers, UPI PINs, or banking passwords</strong> on our servers. All transactions are encrypted with 256-bit SSL encryption and routed directly through our PCI-DSS Level 1 certified gateway partner (Razorpay).
          </p>
        </section>

        <section>
          <h2 className="text-base font-black text-gray-900 uppercase tracking-wide mb-2">3. How Your Information is Used</h2>
          <p>
            Your information is utilized strictly for legitimate business and fulfillment functions:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600 mt-2">
            <li>Packaging, dispatching, and tracking your physical sports equipment.</li>
            <li>Generating GST Tax Invoices and maintaining statutory commercial accounts.</li>
            <li>Providing live customer support, racket gutting consultations, and returns handling.</li>
            <li>Notifying you regarding order status changes and essential security alerts.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-black text-gray-900 uppercase tracking-wide mb-2">4. Third-Party Sharing Restrictions</h2>
          <p>
            We <strong>never sell, rent, or trade your personal information</strong> to third-party advertisers or data brokers. Your delivery address and phone number are shared solely with authorized national logistics providers (e.g. Bluedart, Delhivery, DTDC) to complete physical package delivery.
          </p>
        </section>

        <section>
          <h2 className="text-base font-black text-gray-900 uppercase tracking-wide mb-2">5. Data Deletion & Privacy Inquiries</h2>
          <p>
            You possess the right to inspect, correct, or request complete deletion of your account and personal records stored with Lakshya Sports at any time. For privacy inquiries, please contact our privacy compliance desk at <strong className="text-red-600">privacy@lakshyashop.in</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
