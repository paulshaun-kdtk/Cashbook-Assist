import { Customer } from "@/components/tables/customers"
import { GeneratedInvoicePreview } from "./invoice-preiew"
import Button from "@/components/ui/button/Button"

export function BulkGenerator({selectedBulkCustomerIds, handleGenerateBulkInvoices, handleUpdateGeneratedInvoice, handleDeleteGeneratedInvoice, customers, generatedInvoices, handleBulkCustomerSelect, isInvoice}) {
    return (
        <>
      <div className={`no-print mt-12 p-6 sm:p-8 rounded-3xl shadow-2xl w-full border dark:bg-gray-800 dark:border-gray-700 bg-white border-gray-100`}>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-6 border-b pb-4 border-dashed border-gray-200 dark:border-gray-600">Bulk {isInvoice ? "Invoice": "Quote"} Generation</h2>

        <p className="text-gray-700 dark:text-gray-200 mb-4">
          The {isInvoice ? "Invoice" : "Quotation"} above serves as a template. Select customers below to generate multiple {isInvoice ? "invoices" : "quotations"} based on this template.
        </p>

        <div className="mb-6">
          <label className="block text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Select Customers for Bulk {isInvoice ? "Invoices" : "Quotations"}:</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {customers.filter((cust: Customer) => cust?.$id !== 'new').map((customer : Customer) => (
              <div key={customer?.$id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`bulk-customer-${customer?.$id}`}
                  checked={selectedBulkCustomerIds.includes(customer?.$id)}
                  onChange={() => handleBulkCustomerSelect(customer?.$id)}
                  className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:checked:bg-blue-500 dark:focus:ring-blue-600"
                />
                <label htmlFor={`bulk-customer-${customer?.$id}`} className="ml-3 text-gray-700 dark:text-gray-200 font-medium">
                  {customer?.fullName}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Button
          variant="info"
          onClick={handleGenerateBulkInvoices}
          className="shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-400 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Generate Bulk {isInvoice ? "Invoices" : "Quotations"} ({selectedBulkCustomerIds.length})
        </Button>

        {generatedInvoices.length > 0 && (
          <div className="mt-10 pt-6 border-t border-dashed border-gray-200 dark:border-gray-600">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-6">Generated Invoices:</h3>
            <div className={`grid grid-cols-1 ${generatedInvoices.length > 1 ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-8`}>
              {generatedInvoices.map((genInvoice, idx) => (
                <GeneratedInvoicePreview
                  key={idx}
                  invoiceData={genInvoice}
                  index={idx}
                  onUpdateInvoice={handleUpdateGeneratedInvoice}
                  onDeleteInvoice={handleDeleteGeneratedInvoice}
                />
              ))}
            </div>
          </div>
        )}
      </div>
</>
    )
}