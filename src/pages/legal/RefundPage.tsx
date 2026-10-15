export default function RefundPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900 mb-6">Cancellation & Refund Policy</h1>
      <p className="text-xs text-gray-500 mb-8 font-medium">Last updated: October 2026</p>

      <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-gray-900 uppercase mb-2">1. Order Cancellation</h2>
          <p>
            You may cancel your order anytime before it is dispatched from our warehouse. Once dispatched, cancellation is no longer possible and the order will follow our return process.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 uppercase mb-2">2. Return Eligibility</h2>
          <p>
            We offer a 7-day replacement/return policy for manufacturing defects or wrong items delivered. To be eligible for a return, the item must be unused, in its original packaging, and with all tags intact. Customized items (such as strung rackets or customized cricket bats) are non-returnable.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 uppercase mb-2">3. Refund Process</h2>
          <p>
            Once we receive and inspect your returned gear, approved refunds are initiated within 48 hours. The amount will automatically be credited back to your original payment method (Bank account / UPI / Credit Card) within 5-7 business days.
          </p>
        </section>
      </div>
    </div>
  );
}
