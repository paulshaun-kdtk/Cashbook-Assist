export function InvoiceBankingDetails({ invoice, handleInvoiceChange }) {
    return (
        <div className="mb-10">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Banking Details:</h3>
            <div className="grid grid-cols-1 gap-1">
                <div className="flex items-center">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 min-w-32">Account Name</label>
                    <input
                        type="text"
                        name="bankingDetails.accountName"
                        value={invoice.bankingDetails.accountName}
                        onChange={handleInvoiceChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex items-center">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 min-w-32">Account Number</label>
                    <input
                        type="text"
                        name="bankingDetails.accountNumber"
                        value={invoice.bankingDetails.accountNumber}
                        onChange={handleInvoiceChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex items-center">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 min-w-32">Bank Name</label>
                    <input
                        type="text"
                        name="bankingDetails.bankName"
                        value={invoice.bankingDetails.bankName}
                        onChange={handleInvoiceChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex items-center">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 min-w-32">Currency</label>
                    <input
                        type="text"
                        name="bankingDetails.currency"
                        value={invoice.bankingDetails.currency}
                        onChange={handleInvoiceChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
        </div>
    );
}