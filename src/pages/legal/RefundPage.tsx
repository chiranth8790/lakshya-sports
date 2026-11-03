export default function RefundPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="border-b border-gray-200 pb-6 mb-8">
        <span className="text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1 rounded-full inline-block mb-3">
          Customer Protection
        </span>
        <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900 mb-2">Cancellation & Refund Policy</h1>
        <p className="text-xs text-gray-500 font-medium">Last updated: November 2026 • 7-Day Replacement Guarantee</p>
      </div>

      <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-base font-black text-gray-900 uppercase tracking-wide mb-2">1. Order Cancellation Policy</h2>
          <p>
            You may cancel an order free of charge at any time <strong>prior to shipment dispatch</strong> from our Bengaluru store. To request a cancellation, please call us directly at <strong>+91 80508 56366</strong> or email <strong className="text-red-600">support@lakshyashop.in</strong> with your Order ID. Once a package has been handed over to the courier partner, it cannot be cancelled in transit and must follow our return procedure upon delivery.
          </p>
        </section>

        <section>
          <h2 className="text-base font-black text-gray-900 uppercase tracking-wide mb-2">2. 7-Day Replacement & Return Eligibility</h2>
          <p className="mb-3">
            We provide a <strong>7-Day Replacement Guarantee</strong> from the date of package delivery in the event of:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600 mb-3">
            <li>A verifiable manufacturing defect or structural flaw in the equipment.</li>
            <li>Receipt of a wrong product, size, or variant compared to your order confirmation.</li>
            <li>Damage sustained during courier transit (see transit damage protocol below).</li>
          </ul>
          <p>
            To qualify for replacement, products must be <strong>unused, unplayed, in original brand packaging</strong>, with all labels, barcode tags, plastic handle wraps, and warranty cards completely intact.
          </p>
        </section>

        <section className="bg-amber-50 border border-amber-200 p-5 rounded-2xl">
          <h2 className="text-base font-black text-amber-900 uppercase tracking-wide mb-2">3. Non-Returnable & Non-Refundable Items</h2>
          <p className="text-xs text-amber-800 leading-relaxed">
            In accordance with industry standards, the following categories are strictly non-returnable and non-refundable unless defective at time of arrival:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-amber-900 mt-2">
            <li><strong>Custom Strung Rackets:</strong> Rackets strung at custom tensions or with custom string sets requested during checkout.</li>
            <li><strong>Prepared Cricket Bats:</strong> Bats that have undergone knocking, oiling, scuff-sheet application, or custom handle grips.</li>
            <li><strong>Opened Consumables:</strong> Opened shuttlecock tubes, replacement grips, wristbands, and athletic socks due to hygiene considerations.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-black text-gray-900 uppercase tracking-wide mb-2">4. Transit Damage Protocol (Unboxing Video)</h2>
          <p>
            High-grade carbon graphite badminton rackets and English willow cricket bats require careful handling during transport. If you receive a visibly damaged outer parcel, please take clear photos and <strong>record a continuous unboxing video</strong>. Notify our team within <strong>48 hours of delivery</strong> at <strong className="text-red-600">support@lakshyashop.in</strong>. We will arrange an expedited free replacement.
          </p>
        </section>

        <section>
          <h2 className="text-base font-black text-gray-900 uppercase tracking-wide mb-2">5. Refund Processing Timelines</h2>
          <p>
            Once returned gear is received and inspected by our Bengaluru pro shop technicians:
          </p>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
              <strong className="block text-gray-900 font-bold mb-1">Prepaid Orders (UPI / Cards / Net Banking)</strong>
              <span>Refund is processed back to original payment method within <strong>48 hours</strong>; banks credit within 5–7 working days.</span>
            </div>
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
              <strong className="block text-gray-900 font-bold mb-1">Cash on Delivery (COD) Orders</strong>
              <span>Refund is issued via instant UPI transfer or NEFT bank transfer upon receiving your verified bank details.</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
