import Select from "../Select"
import Image from "next/image"
import { Customer } from "@/components/tables/customers"
import { ExchangeRate } from "@/components/tables/rates"

export function InvoiceHeader({selected_source, income_sources, customers, invoice, handleInvoiceChange, handleBranchChange, handleCustomerSelect, isInvoice, rates, handleRateChange}) {
    return (
<>
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 border-b pb-6 border-dashed border-gray-200 dark:border-gray-600">
          <div className="mb-6 sm:mb-0">
            {(!selected_source || selected_source.logo != "") ? (
                <a id='no-print' className='rint text-gray-600 dark:text-gray-300' href='/dashboard'>Looks like your specified branch does not have a logo... click here to update it</a>
            ) : (
              <Image src={selected_source.logo} alt="Company Logo" className="h-16 w-auto rounded-lg shadow-md" />
            )}
              <div className="w-full sm:w-auto mt-3">
                <Select
                  className="w-full max-w-sm"
                  placeholder="Set Exchange rate"
                  options={rates.map((item: ExchangeRate) => ({
                    value: item.$id,
                    label: `${item.currency} to ${item.foreign_currency}`,
                  }))}
                  onChange={handleRateChange}
                />
              </div>
          </div>
          <div className="text-right">
            <h1 className="text-5xl font-extrabold text-gray-900 dark:text-gray-50 mb-2 tracking-tight">{isInvoice ? "INVOICE" : "QUOTE"}</h1>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center justify-end mb-1">
                <span className="font-medium mr-2">{isInvoice ? "Invoice" : "Quotation"} #:</span>
                <input
                  type="text"
                  name="invoiceNumber"
                  value={invoice.invoiceNumber}
                  onChange={handleInvoiceChange}
                  className="bg-gray-50 dark:bg-gray-700 rounded-md px-2 py-1 w-40 text-right focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all duration-200"
                />
              </div>
              <div className="flex items-center justify-end mb-1">
                <span className="font-medium mr-2">Date:</span>
                <input
                  type="date"
                  name="invoiceDate"
                  value={invoice.invoiceDate}
                  onChange={handleInvoiceChange}
                  className="bg-gray-50 dark:bg-gray-700 rounded-md px-2 py-1 w-40 text-right focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all duration-200"
                />
              </div>
              <div className="flex items-center justify-end">
                <span className="font-medium mr-2">Due Date:</span>
                <input
                  type="date"
                  name="dueDate"
                  value={invoice.dueDate}
                  onChange={handleInvoiceChange}
                  className="bg-gray-50 dark:bg-gray-700 rounded-md px-2 py-1 w-40 text-right focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all duration-200"
                  />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="p-6 rounded-2xl shadow-sm border transition-colors duration-300 dark:bg-gradient-to-br dark:from-slate-800 dark:to-gray-800 dark:border-blue-500 bg-gradient-to-br from-slate-50 to-gray-50 border-blue-100">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-4">Bill From:</h3>
            <div className="space-y-2 text-gray-700 dark:text-gray-200">
              <div className="mb-4" id="no-print">
                <label htmlFor="customerSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-50 mb-1">Select Customer (for this invoice):</label>
                <Select
                  placeholder='Select Branch'
                  options={income_sources.map(item => ({
                    value: item.$id,
                    label: item.name,
                }))}
                onChange={handleBranchChange}
                 />
              </div>
              <input
                type="text"
                name="billFrom.name"
                id={invoice.billFrom.name ? "" : "no-print"}
                value={invoice.billFrom.name}
                onChange={handleInvoiceChange}
                placeholder="Your Company Name"
                className="w-full rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all duration-200
                  'dark:bg-gray-700 dark:text-gray-50 dark:bg-gray-700 dark:border-gray-600 bg-white border-gray-200 text-gray-600"
              />
              <input
                type="text"
                name="billFrom.address"
                id={invoice.billFrom.address ? "" : "no-print"}
                value={invoice.billFrom.address}
                onChange={handleInvoiceChange}
                placeholder="Address"
                className="w-full rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all duration-200 dark:bg-gray-700 dark:text-gray-50 dark:border-gray-600 bg-white border-gray-200"
              />
              </div>
          </div>

          <div className="p-6 rounded-2xl shadow-sm border transition-colors duration-300
            'dark:bg-gradient-to-br dark:from-slate-800 dark:to-gray-800 dark:border-blue-500 bg-gradient-to-br from-gray-50 to-slate-50 border-blue-100">
            <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-4">Bill To:</h3>
            <div className="space-y-2 text-gray-700 dark:text-gray-200">
              <div className="mb-4" id="no-print">
                <label htmlFor="customerSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-50 mb-1">Select Customer (for this invoice):</label>
                <Select
                  placeholder='Select Customer'
                  options={customers.map((customer: Customer) => ({
                      value: customer.$id,
                      label: customer.fullName || 'New Customer',
                  }))}
                  onChange={handleCustomerSelect}
                  searchable
                  />
              </div>


              <input
                type="text"
                name="billTo.name"
                id={invoice.billTo.name ? "" : "no-print"}
                value={invoice.billTo.name}
                onChange={handleInvoiceChange}
                placeholder="Client Company Name"
                className="w-full rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition-all duration-200
                dark:bg-gray-700 dark:text-gray-50 dark:border-gray-600 bg-white border-gray-200"
                />
              <input
                type="text"
                name="billTo.address"
                id={invoice.billTo.address ? "" : "no-print"}
                value={invoice.billTo.address}
                onChange={handleInvoiceChange}
                placeholder="Address"
                className="w-full rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition-all duration-200
                dark:bg-gray-700 dark:text-gray-50 dark:border-gray-600 bg-white border-gray-200"
                />
              <input
                type="email"
                name="billTo.email"
                id={invoice.billTo.email ? "" : "no-print"}
                value={invoice.billTo.email}
                onChange={handleInvoiceChange}
                placeholder="Email"
                className="w-full rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition-all duration-200
                  dark:bg-gray-700 dark:text-gray-50 dark:border-gray-600 bg-white border-gray-200"
              />
              <input
                type="tel"
                name="billTo.phone"
                id={invoice.billTo.phone ? "" : "no-print"}
                value={invoice.billTo.phone}
                onChange={handleInvoiceChange}
                placeholder="Phone"
                className="w-full rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition-all duration-200
                dark:bg-gray-700 dark:text-gray-50 dark:border-gray-600 bg-white border-gray-200"
              />
            </div>
          </div>
        </div>
        </>
    )
}