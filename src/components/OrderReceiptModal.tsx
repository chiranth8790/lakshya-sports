import { Printer, X, Download } from 'lucide-react';

interface OrderReceiptModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderReceiptModal({ order, isOpen, onClose }: OrderReceiptModalProps) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceDate = order.created_at 
    ? new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' })
    : new Date().toLocaleDateString('en-IN', { dateStyle: 'long' });

  // GST Calculation (18% GST included in retail price: CGST 9% + SGST 9%)
  const subtotalValue = Number(order.subtotal || order.total_amount || 0);
  const discountValue = Number(order.discount_amount || 0);
  const taxableNet = Math.max(0, subtotalValue - discountValue);
  const baseTaxableAmount = Math.round(taxableNet / 1.18);
  const totalGstAmount = taxableNet - baseTaxableAmount;
  const cgstAmount = Math.round(totalGstAmount / 2);
  const sgstAmount = totalGstAmount - cgstAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      {/* Modal Container */}
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Action Bar (Hidden in Print) */}
        <div className="p-4 bg-gray-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-red-500" />
            <span className="text-xs font-black uppercase tracking-wider">Official Retail Tax Invoice</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Paper Area */}
        <div id="printable-receipt" className="p-8 overflow-y-auto font-sans text-gray-900 bg-white">
          {/* Company & Invoice Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b border-gray-200 pb-6 gap-6">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900">
                <span className="text-red-600">Lakshya</span> Sports
              </h1>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                Authorized Dealer • Badminton & Cricket Specialist
              </p>
              <div className="text-[11px] text-gray-600 mt-2 space-y-0.5">
                <p><strong>Flagship:</strong> No. 72/4, Chikkalasandra Main Rd, BLR – 560061</p>
                <p><strong>Pro Shop:</strong> 12th Main Rd, Jagruthi Colony, JP Nagar 7th Phase, BLR – 560078</p>
                <p><strong>State:</strong> Karnataka (State Code: 29) • <strong>GSTIN:</strong> 29AAXCS8050M1Z3</p>
                <p><strong>Support:</strong> +91 80508 56366 | support@lakshyashop.in</p>
              </div>
            </div>

            <div className="sm:text-right bg-gray-50 sm:bg-transparent p-4 sm:p-0 rounded-2xl w-full sm:w-auto">
              <span className="text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 sm:bg-transparent px-2 py-0.5 rounded border border-red-200 sm:border-0">
                TAX INVOICE
              </span>
              <p className="font-mono text-sm font-black text-gray-900 mt-1">{order.order_id}</p>
              <p className="text-xs text-gray-500 mt-0.5">Invoice Date: {invoiceDate}</p>
              <p className="text-xs text-gray-500">
                Place of Supply: <strong>Karnataka (29)</strong>
              </p>
              <p className="text-xs text-gray-500">
                Payment Mode: <strong className="uppercase">{
                  order.payment_method === 'upi_direct' ? 'Direct UPI (QR / App)' :
                  order.payment_method === 'card' ? 'Credit / Debit Card' :
                  order.payment_method === 'pay_at_store' ? 'Pay at Store' :
                  order.payment_method === 'cod' ? 'Cash on Delivery' :
                  order.payment_method || 'Online'
                }</strong>
              </p>
              {order.utr_number && (
                <p className="text-[10px] font-mono text-gray-600">UPI Ref (UTR): <strong className="text-emerald-700">{order.utr_number}</strong></p>
              )}
              {order.payment_id && (
                <p className="text-[10px] font-mono text-gray-400">Gateway Ref: {order.payment_id}</p>
              )}
              {order.pickup_store && (
                <p className="text-[10px] text-gray-600">Store Pickup: <strong>{order.pickup_store}</strong></p>
              )}
            </div>
          </div>

          {/* Billed To */}
          <div className="py-4 border-b border-gray-200 text-xs">
            <span className="font-bold uppercase tracking-wider text-gray-400 block mb-1">Customer & Delivery:</span>
            <p className="font-bold text-gray-900 text-sm">{order.customer_name}</p>
            <p className="text-gray-600">{order.customer_phone} {order.customer_email ? `• ${order.customer_email}` : ''}</p>
            <p className="text-gray-600 mt-0.5">
              {order.shipping_address?.street}, {order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.pincode}
            </p>
          </div>

          {/* Items Table with HSN */}
          <div className="py-5">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 font-black uppercase tracking-wider text-left">
                  <th className="pb-3">Description</th>
                  <th className="pb-3 text-center">HSN</th>
                  <th className="pb-3 text-center">Qty</th>
                  <th className="pb-3 text-right">Unit MRP</th>
                  <th className="pb-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(order.items || []).map((item: any, i: number) => (
                  <tr key={i} className="py-3">
                    <td className="py-3 pr-2">
                      <p className="font-bold text-gray-900">{item.name}</p>
                      <div className="text-[10px] text-gray-500 flex flex-wrap gap-2 mt-0.5">
                        {item.selectedVariant && <span>Size: {item.selectedVariant}</span>}
                        {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                        {item.selectedString && <span className="text-red-600 font-semibold">{item.selectedString}</span>}
                      </div>
                    </td>
                    <td className="py-3 text-center font-mono text-gray-500">950699</td>
                    <td className="py-3 text-center font-bold text-gray-700">{item.quantity}</td>
                    <td className="py-3 text-right font-mono">₹{Number(item.price).toLocaleString('en-IN')}</td>
                    <td className="py-3 text-right font-mono font-bold text-gray-900">
                      ₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial & GST Breakdown */}
          <div className="border-t border-gray-200 pt-4 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="text-[11px] text-gray-500 space-y-1 bg-gray-50 p-3 rounded-xl border border-gray-100 sm:w-64">
              <span className="font-bold text-gray-700 block uppercase text-[10px] tracking-wider mb-1">Tax Summary (18% GST):</span>
              <div className="flex justify-between">
                <span>Taxable Value:</span>
                <span className="font-mono">₹{baseTaxableAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>CGST (9%):</span>
                <span className="font-mono">₹{cgstAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>SGST (9%):</span>
                <span className="font-mono">₹{sgstAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Items Subtotal:</span>
                <span className="font-mono font-medium">
                  ₹{Number(order.subtotal || order.total_amount).toLocaleString('en-IN')}
                </span>
              </div>
              {order.discount_amount && Number(order.discount_amount) > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount:</span>
                  <span className="font-mono">−₹{Number(order.discount_amount).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping Fee:</span>
                <span className="font-bold text-emerald-600">
                  {order.shipping_fee && Number(order.shipping_fee) > 0 ? `₹${order.shipping_fee}` : 'FREE'}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-black text-gray-900">
                <span>Total Amount:</span>
                <span className="font-mono text-base text-red-600">₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
              </div>
              <p className="text-[10px] text-gray-400 text-right italic">(Inclusive of all applicable taxes)</p>
            </div>
          </div>

          {/* Footer Terms & Signatory */}
          <div className="border-t border-gray-200 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-end gap-6 text-[10px] text-gray-500">
            <div className="space-y-1">
              <p className="font-bold text-gray-700 uppercase">Terms & Conditions:</p>
              <p>1. Computer-generated tax invoice. No signature required under Indian IT Act.</p>
              <p>2. 7-day replacement for manufacturing defects with original tags & packaging.</p>
              <p>3. Customized stringing & oiled cricket bats are non-refundable once prepared.</p>
            </div>
            <div className="text-center sm:text-right">
              <div className="h-10 flex items-center justify-center sm:justify-end">
                <span className="font-serif italic text-gray-400 tracking-wider">Lakshya Sports Bengaluru</span>
              </div>
              <div className="border-t border-gray-300 pt-1 text-[10px] font-bold uppercase tracking-wider text-gray-700">
                Authorized Signatory
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
