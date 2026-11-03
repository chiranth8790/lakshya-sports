export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="border-b border-gray-200 pb-6 mb-8">
        <span className="text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1 rounded-full inline-block mb-3">
          Statutory Policy
        </span>
        <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900 mb-2">Terms & Conditions of Sale</h1>
        <p className="text-xs text-gray-500 font-medium">Last updated: November 2026 • Governed by Indian E-Commerce Rules (2020)</p>
      </div>

      <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-base font-black text-gray-900 uppercase tracking-wide mb-2">1. Identity of the Business</h2>
          <p>
            This website (<a href="https://lakshyashop.in" className="text-red-600 underline">lakshyashop.in</a>) is owned and operated by <strong>Lakshya Sports</strong>, an authorized sports retail business registered in Bengaluru, Karnataka, India.
          </p>
          <div className="mt-2 bg-gray-50 p-4 rounded-xl text-xs space-y-1 text-gray-600 border border-gray-200">
            <p><strong>Flagship Store:</strong> No. 72/4, Chikkalasandra Main Road, Sarvabhouma Nagar, Chikkalasandra, Bengaluru – 560061</p>
            <p><strong>Pro Shop:</strong> 12th Main Road, Jagruthi Colony, Puttenahalli, JP Nagar 7th Phase, Bengaluru – 560078</p>
            <p><strong>Support Hotline:</strong> +91 80508 56366 | +91 97405 17527</p>
          </div>
        </section>

        <section>
          <h2 className="text-base font-black text-gray-900 uppercase tracking-wide mb-2">2. Product Authenticity & Pricing</h2>
          <p>
            All badminton rackets, shuttlecocks, cricket bats, shoes, and sports gear sold on Lakshya Sports are 100% genuine and sourced directly from brand-authorized distributors (including Yonex, Li-Ning, Victor, SS, SG, and others). All product prices displayed on the storefront are Maximum Retail Price (MRP) or promotional discounted prices inclusive of Goods and Services Tax (GST).
          </p>
        </section>

        <section>
          <h2 className="text-base font-black text-gray-900 uppercase tracking-wide mb-2">3. Custom Stringing & Bat Preparation Clause</h2>
          <p>
            When you order a badminton racket and choose custom stringing (specific string model or tension) or order cricket bat knocking, oiling, and toe-guard application, this constitutes a personalized, customized contract of sale. Once customized per your requested specifications, the order cannot be cancelled, returned, or exchanged except for verified manufacturing defects.
          </p>
        </section>

        <section>
          <h2 className="text-base font-black text-gray-900 uppercase tracking-wide mb-2">4. Payment & Order Confirmation</h2>
          <p>
            Orders can be completed via online payment (UPI, Credit/Debit cards, Net Banking via PCI-DSS compliant Razorpay Gateway) or Cash on Delivery (COD) where available. An order confirmation with unique Order ID and Tax Invoice is issued immediately upon successful placement. Lakshya Sports reserves the right to decline or cancel orders in cases of suspected fraudulent activity or inadvertent pricing errors.
          </p>
        </section>

        <section>
          <h2 className="text-base font-black text-gray-900 uppercase tracking-wide mb-2">5. Statutory Grievance Redressal Mechanism</h2>
          <p className="mb-2">
            In compliance with the Consumer Protection (E-Commerce) Rules, 2020, Lakshya Sports has designated a Grievance Officer to address customer inquiries, issues, or disputes:
          </p>
          <div className="bg-neutral-900 text-white p-5 rounded-2xl text-xs space-y-1.5">
            <p><strong>Designation:</strong> Grievance Officer & Operations Lead</p>
            <p><strong>Address:</strong> Lakshya Sports, No. 72/4, Chikkalasandra Main Road, Bengaluru, Karnataka – 560061</p>
            <p><strong>Email:</strong> <span className="text-red-400">grievance@lakshyashop.in</span> / <span className="text-red-400">support@lakshyashop.in</span></p>
            <p><strong>Response SLA:</strong> Acknowledgment within 48 hours; resolution within 30 days of receipt.</p>
          </div>
        </section>

        <section>
          <h2 className="text-base font-black text-gray-900 uppercase tracking-wide mb-2">6. Governing Law & Jurisdiction</h2>
          <p>
            These Terms & Conditions and any disputes arising out of purchases from Lakshya Sports shall be governed by and construed in accordance with the laws of India, under the exclusive jurisdiction of the competent courts of <strong>Bengaluru, Karnataka</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
