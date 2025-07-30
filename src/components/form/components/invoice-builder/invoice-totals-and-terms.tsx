import { InvoiceBankingDetails } from "./invoice-banking-details"


export function InvoiceTotalsAndTerms({ invoice, subtotal, totalTax, grandTotal, handleInvoiceChange }) {
    return (
        <>
        <div className="flex justify-end mb-10 mr-15">
          <div className="w-full sm:w-1/2 lg:w-2/5 space-y-3 text-gray-700 dark:text-gray-200">
            <div className="flex justify-between items-center text-lg">
              <span>Subtotal:</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-lg">
              <span>Tax ({invoice.taxRate}%):</span>
              <input
                type="number"
                name="taxRate"
                value={invoice.taxRate}
                onChange={handleInvoiceChange}
                className="bg-gray-50 dark:bg-gray-700 rounded-md px-2 py-1 w-20 text-right focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all duration-200 mr-2"
                min="0"
                step="0.1"
              />
              <span className="font-semibold">${totalTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-2xl font-bold text-gray-900 dark:text-gray-50 pt-4 border-t-2 border-dashed border-gray-300 dark:border-gray-500">
              <span>GRAND TOTAL:</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <InvoiceBankingDetails invoice={invoice}  handleInvoiceChange={handleInvoiceChange} />

        {/* Notes & Terms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Terms & Conditions:</h3>
            <textarea
              name="terms"
              value={invoice.terms}
              onChange={handleInvoiceChange}
              rows={4}
              placeholder="Payment terms and conditions."
              className="w-full py-4 rounded-xl border focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all duration-200 resize-y
                dark:bg-gray-700 dark:border-gray-600 dark:text-gray-50 bg-gray-50 border-gray-200 text-gray-700"
            ></textarea>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Notes:</h3>
            <textarea
              name="notes"
              value={invoice.notes}
              onChange={handleInvoiceChange}
              rows={4}
              placeholder="Any additional notes or instructions for the client."
              className="w-full py-4 rounded-xl border focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all duration-200 resize-y
                dark:bg-gray-700 dark:border-gray-600 dark:text-gray-50 bg-gray-50 border-gray-200 text-gray-700"
            ></textarea>
          </div>
        </div>

        {/* Footer Signature Area */}
        <div className="text-center pt-8 border-t border-dashed border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm">
          <p>{invoice.billFrom.name}</p>
        </div>
        </>
    )
}