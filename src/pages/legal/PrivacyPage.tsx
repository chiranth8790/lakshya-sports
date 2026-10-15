export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900 mb-6">Privacy Policy</h1>
      <p className="text-xs text-gray-500 mb-8 font-medium">Last updated: October 2026</p>

      <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-gray-900 uppercase mb-2">1. Information We Collect</h2>
          <p>
            When you purchase from Lakshya Sports, we collect essential information including your name, shipping address, contact phone number, and email address to fulfill your orders and keep you updated on delivery status.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 uppercase mb-2">2. Payment Security</h2>
          <p>
            We do not store your credit card, debit card, or UPI credentials on our servers. All transactions are securely encrypted and processed directly via Razorpay Payment Gateway conforming to PCI-DSS standards.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 uppercase mb-2">3. Data Sharing</h2>
          <p>
            Your information is never sold to third parties. We share delivery information solely with our logistics partners (e.g., Delhivery, BlueDart, DTDC) to facilitate package delivery.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 uppercase mb-2">4. Your Rights</h2>
          <p>
            You have the right to request access to the personal data we hold or request its deletion at any time by contacting our support team.
          </p>
        </section>
      </div>
    </div>
  );
}
