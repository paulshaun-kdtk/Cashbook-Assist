  // // Print function for this specific invoice preview
  // const handlePrintPreview = () => {
  //   const printContent = document.getElementById(`invoice-preview-${index}`).innerHTML;
  //   const printWindow = window.open('', '_blank');
  //   printWindow.document.write(`
  //     <html>
  //       <head>
  //         <title>Invoice ${currentInvoice.invoiceNumber}</title>
  //         <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  //         <style>
  //           @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  //           body { font-family: 'Inter', sans-serif; margin: 0; padding: 20px; }
  //           .invoice-print-container {
  //               width: 100%;
  //               max-width: 800px;
  //               margin: 0 auto;
  //               padding: 20px;
  //               background-color: white;
  //               color: black;
  //               box-shadow: none;
  //               border: none;
  //           }
  //           input, textarea, select {
  //               background-color: transparent !important;
  //               border: none !important;
  //               outline: none !important;
  //               box-shadow: none !important;
  //               color: black !important;
  //               padding: 0 !important; /* Remove padding for print inputs */
  //           }
  //           /* Ensure text is black for print */
  //           .text-gray-900, .text-gray-800, .text-gray-700, .text-gray-600, .text-gray-500 {
  //               color: black !important;
  //           }
  //           .border-dashed {
  //               border-style: dashed !important;
  //           }
  //           .border-gray-200 {
  //               border-color: #e5e7eb !important;
  //           }
  //           .border-gray-300 {
  //               border-color: #d1d5db !important;
  //           }
  //         </style>
  //       </head>
  //       <body>
  //         <div class="invoice-print-container">
  //           ${printContent}
  //         </div>
  //       </body>
  //     </html>
  //   `);
  //   printWindow.document.close();
  //   printWindow.focus();
  //   printWindow.print();
  // };


import React, { useState, useEffect } from 'react';

export const GeneratedInvoicePreview = ({ invoiceData, index, onUpdateInvoice, onDeleteInvoice }) => {
  const [currentInvoice, setCurrentInvoice] = useState(invoiceData);

  useEffect(() => {
    const newSubtotal = currentInvoice.items.reduce((sum, item) => sum + (item.quantity * item.item_cost), 0);
    const newTotalTax = (newSubtotal * currentInvoice.taxRate) / 100;
    const newGrandTotal = newSubtotal + newTotalTax - currentInvoice.discount;

    if (newSubtotal !== currentInvoice.subtotal || newTotalTax !== currentInvoice.totalTax || newGrandTotal !== currentInvoice.grandTotal) {
      setCurrentInvoice(prev => ({
        ...prev,
        subtotal: newSubtotal,
        totalTax: newTotalTax,
        grandTotal: newGrandTotal,
      }));
    }
  }, [currentInvoice.items, currentInvoice.taxRate, currentInvoice.discount, currentInvoice.grandTotal, currentInvoice.subtotal, currentInvoice.totalTax]); // Dependencies are only the inputs to the calculation

  // Propagate changes back to the parent component
  // This effect now correctly depends on currentInvoice and onUpdateInvoice (which is memoized below)
  useEffect(() => {
    onUpdateInvoice(index, currentInvoice);
  }, [currentInvoice, index, onUpdateInvoice]);

  // Handle input changes for the generated invoice
  const handleInvoiceChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setCurrentInvoice(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setCurrentInvoice(prev => ({ ...prev, [name]: value }));
    }
  };

const handleItemChange = (uid, e) => {
  const { name, value } = e.target;
  setCurrentInvoice(prev => ({
    ...prev,
    items: prev.items.map(item =>
      item.uid === uid
        ? {
            ...item,
            [name]: name === 'quantity' || name === 'item_cost' ? parseFloat(value) || 0 : value
          }
        : item
    )
  }));
};

  // Add a new blank item to this specific generated invoice
  const handleAddItem = () => {
    setCurrentInvoice(prev => ({
      ...prev,
      items: [...prev.items, { uid: Date.now(), item_name: '', quantity: 1, item_cost: 0 }]
    }));
  };

  // Remove an item from this specific generated invoice
  const handleRemoveItem = (itemId) => {
    setCurrentInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.uid !== itemId)
    }));
  };

  return (
    <div className={`p-6 rounded-2xl shadow-lg border mb-8 transition-colors duration-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 bg-white border-gray-200 text-gray-900`}>
      <div id={`invoice-preview-${index}`} className="invoice-content-for-print">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 border-b pb-4 border-dashed border-gray-200 dark:border-gray-500">
          {/* <Image src={currentInvoice.logo} alt="Company Logo" className="h-12 w-auto rounded-md" /> */}
          <div className="text-right text-sm">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50">INVOICE</h2>
            <p className="flex items-center justify-end"><span className="font-medium mr-1">Invoice #:</span>
              <input
                type="text"
                name="invoiceNumber"
                value={currentInvoice.invoiceNumber}
                onChange={handleInvoiceChange}
                className="bg-transparent rounded-md px-1 py-0.5 w-32 text-right focus:ring-1 focus:ring-blue-300 focus:border-blue-300"
              />
            </p>
            <p className="flex items-center justify-end"><span className="font-medium mr-1">Date:</span>
              <input
                type="date"
                name="invoiceDate"
                value={currentInvoice.invoiceDate}
                onChange={handleInvoiceChange}
                className="bg-transparent rounded-md px-1 py-0.5 w-32 text-right focus:ring-1 focus:ring-blue-300 focus:border-blue-300"
              />
            </p>
            <p className="flex items-center justify-end"><span className="font-medium mr-1">Due Date:</span>
              <input
                type="date"
                name="dueDate"
                value={currentInvoice.dueDate}
                onChange={handleInvoiceChange}
                className="bg-transparent rounded-md px-1 py-0.5 w-32 text-right focus:ring-1 focus:ring-blue-300 focus:border-blue-300"
              />
            </p>
          </div>
        </div>

        {/* Bill From & Bill To */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Bill From:</h4>
            <input
              type="text" name="billFrom.name" value={currentInvoice.billFrom.name} onChange={handleInvoiceChange}
              className="w-full bg-transparent border-b border-gray-200 dark:border-gray-600 focus:border-blue-400 outline-none mb-1"
            />
            <input
              type="text" name="billFrom.address" value={currentInvoice.billFrom.address} onChange={handleInvoiceChange}
              className="w-full bg-transparent border-b border-gray-200 dark:border-gray-600 focus:border-blue-400 outline-none mb-1"
            />
            <input
              type="email" name="billFrom.email" value={currentInvoice.billFrom.email} onChange={handleInvoiceChange}
              className="w-full bg-transparent border-b border-gray-200 dark:border-gray-600 focus:border-blue-400 outline-none mb-1"
            />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Bill To:</h4>
            <input
              type="text" name="billTo.name" value={currentInvoice.billTo.fullName} onChange={handleInvoiceChange}
              className="w-full bg-transparent border-b border-gray-200 dark:border-gray-600 focus:border-purple-400 outline-none mb-1"
            />
            <input
              type="text" name="billTo.address" value={currentInvoice.billTo.physicalAddress} onChange={handleInvoiceChange}
              className="w-full bg-transparent border-b border-gray-200 dark:border-gray-600 focus:border-purple-400 outline-none mb-1"
            />
          <input
              type="email" name="billTo.email" value={currentInvoice.billTo.email} onChange={handleInvoiceChange}
              className="w-full bg-transparent border-b border-gray-200 dark:border-gray-600 focus:border-purple-400 outline-none mb-1"
            />
            <input
              type="tel" name="billTo.phone" value={currentInvoice.billTo.phoneNumber} onChange={handleInvoiceChange}
              className="w-full bg-transparent border-b border-gray-200 dark:border-gray-600 focus:border-purple-400 outline-none"
            />
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <div className="grid grid-cols-12 gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b border-gray-200 dark:border-gray-500">
            <div className="col-span-5">DESCRIPTION</div>
            <div className="col-span-2 text-center">QTY</div>
            <div className="col-span-2 text-right">PRICE</div>
            <div className="col-span-3 text-right">TOTAL</div>
          </div>
          {currentInvoice.items.map(item => (
            <div key={item.uid} className="grid grid-cols-12 gap-2 py-1 text-sm text-gray-800 dark:text-gray-200 items-center group">
              <div className="col-span-5">
                <input
                  type="text"
                  name="item_name"
                  value={item.item_name}
                  onChange={(e) => handleItemChange(item.uid, e)}
                  placeholder="Item Description"
                  className="w-full bg-transparent border-b border-gray-200 dark:border-gray-600 focus:border-blue-400 outline-none"
                />
              </div>
              <div className="col-span-2 text-center">
                <input
                  type="number"
                  name="quantity"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(item.uid, e)}
                  className="w-full bg-transparent border-b border-gray-200 dark:border-gray-600 focus:border-blue-400 outline-none text-center"
                  min="0"
                />
              </div>
              <div className="col-span-2 text-right">
                <input
                  type="number"
                  name="item_cost"
                  value={item.item_cost.toFixed(2)}
                  onChange={(e) => handleItemChange(item.uid, e)}
                  className="w-full bg-transparent border-b border-gray-200 dark:border-gray-600 focus:border-blue-400 outline-none text-right"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="col-span-2 text-right font-medium">
                  ${(item.quantity * item.item_cost).toFixed(2)}
              </div>
              <div className="col-span-1 flex justify-center">
                <button
                  onClick={() => handleRemoveItem(item.uid)}
                  className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:outline-none"
                  title="Remove Item"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 11-2 0v6a1 1 0 112 0V8z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={handleAddItem}
            className="mt-4 px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-300 text-sm"
          >
            + Add Item
          </button>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-6">
          <div className="w-full sm:w-2/3 lg:w-1/2 space-y-1 text-gray-700 dark:text-gray-200">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold">${currentInvoice.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Tax (<input
                type="number"
                name="taxRate"
                value={currentInvoice.taxRate}
                onChange={handleInvoiceChange}
                className="bg-transparent rounded-md px-1 py-0.5 w-12 text-right focus:ring-1 focus:ring-blue-300 focus:border-blue-300 inline"
                min="0"
                step="0.1"
              />%):</span>
              <span className="font-semibold">${currentInvoice.totalTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Discount:</span>
              <input
                type="number"
                name="discount"
                value={currentInvoice.discount.toFixed(2)}
                onChange={handleInvoiceChange}
                className="bg-transparent rounded-md px-1 py-0.5 w-20 text-right focus:ring-1 focus:ring-blue-300 focus:border-blue-300 inline"
                min="0"
                step="0.01"
              />
              <span className="font-semibold"></span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-gray-50 pt-2 border-t border-dashed border-gray-300 dark:border-gray-500">
              <span>GRAND TOTAL:</span>
              <span>${currentInvoice.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        <div className="mb-6 text-sm text-gray-700 dark:text-gray-200">
          <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Notes:</h4>
          <textarea
            name="notes"
            value={currentInvoice.notes}
            onChange={handleInvoiceChange}
            rows="3"
            placeholder="Any additional notes or instructions for the client."
            className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-600 focus:ring-1 focus:ring-blue-300 focus:border-blue-300 resize-y bg-transparent"
          ></textarea>
          <h4 className="font-semibold text-gray-800 dark:text-gray-100 mt-3 mb-1">Terms & Conditions:</h4>
          <textarea
            name="terms"
            value={currentInvoice.terms}
            onChange={handleInvoiceChange}
            rows="3"
            placeholder="Payment terms and conditions."
            className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-600 focus:ring-1 focus:ring-blue-300 focus:border-blue-300 resize-y bg-transparent"
          ></textarea>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-dashed border-gray-200 dark:border-gray-600">
          <p>Thank you for your business!</p>
        </div>
      </div>
      <div className="flex justify-between items-center mt-4">
        {/* <button
          onClick={handlePrintPreview}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 flex items-center justify-center text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print This Invoice
        </button> */}
        <button
          onClick={() => onDeleteInvoice(index)}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 flex items-center justify-center text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Remove from Bulk
        </button>
      </div>
    </div>
  );
};
