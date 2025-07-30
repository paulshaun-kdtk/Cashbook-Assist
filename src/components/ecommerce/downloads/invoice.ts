import { parseItemsSold } from "./receipt";
import { formatCurrency } from "@/utils/formatters/currency_formatter";
import { formatDate } from "@/utils/formatters/date_formatter";
import { Debt } from "@/components/tables/debts";
import { Account } from "@/components/tables/accounts";
import html2pdf from "html2pdf.js";
import { Branch } from "@/components/tables/branches";
import { Customer } from "@/components/tables/customers";

export const generateInvoiceHTML = (sale: Debt, bankDetails: Account, branch: Branch, customer: Customer) => {
  const items = parseItemsSold(sale.description);

  const itemsTable = `
    <table style="width:100%; border-collapse: collapse; margin-top: 20px; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.05); page-break-inside: avoid;">
      <thead style="background-color: #f2f2f2;">
        <tr>
          <th style="padding: 12px 15px; text-align: left; color: #333; font-weight: 600;">Item</th>
          <th style="padding: 12px 15px; text-align: center; color: #333; font-weight: 600;">Qty</th>
          <th style="padding: 12px 15px; text-align: right; color: #333; font-weight: 600;">Price</th>
          <th style="padding: 12px 15px; text-align: right; color: #333; font-weight: 600;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map(
            (item) => `
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 15px;">${item.name}</td>
            <td style="padding: 10px 15px; text-align: center;">${item.qty}</td>
            <td style="padding: 10px 15px; text-align: right;">${formatCurrency(item.price)}</td>
            <td style="padding: 10px 15px; text-align: right;">${formatCurrency(item.total)}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;

  return `
  <html>
    <head>
      <title>${sale.document_type}</title>
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Roboto', sans-serif;
          padding: 30px;
          background-color: #f8f8f8;
          color: #333;
          line-height: 1.6;
        }
        .invoice-container {
          max-width: 700px; /* Adjusted width for side-by-side layout */
          margin: 0 auto;
          background-color: #fff;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        .top-info-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-start; /* Align items to the top */
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
          flex-wrap: wrap; /* Allow wrapping on smaller screens */
        }
        .branch-info-left, .customer-details-right {
          flex: 1; /* Distribute space evenly */
          min-width: 280px; /* Minimum width before wrapping */
          padding: 10px;
        }
        .branch-info-left {
            text-align: left;
            margin-right: 20px; /* Space between sections */
        }
        .customer-details-right {
            text-align: right;
            margin-left: 20px; /* Space between sections */
        }
        .logo-container {
          margin-bottom: 10px;
        }
        .logo-container img {
          max-width: 120px; /* Slightly smaller logo for better fit */
          height: auto;
          border-radius: 5px;
        }
        h2 {
          color: #222;
          margin-bottom: 5px;
          font-weight: 700;
          letter-spacing: 0.5px;
          font-size: 24px; /* Adjusted title size */
        }
        .branch-name {
          color: #666;
          font-size: 15px;
          margin-bottom: 10px;
        }
        .details-section {
          margin-top: 20px;
          font-size: 15px;
          border-bottom: 1px solid #eee;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        .details-section h3, .customer-details-right h3 {
            color: #222;
            margin-bottom: 15px;
            font-weight: 600;
            font-size: 18px;
            border-bottom: 1px solid #f0f0f0;
            padding-bottom: 8px;
        }
        .details-section div, .customer-details-right div {
          margin-bottom: 8px;
          display: flex;
          justify-content: space-between;
        }
        .customer-details-right div {
            justify-content: flex-end; /* Align customer details to the right */
        }
        .customer-details-right strong {
            margin-right: 10px; /* Space between label and value */
        }
        .details-section strong, .customer-details-right strong {
          color: #555;
          min-width: 120px; /* Align labels */
        }
        .total-section {
          margin-top: 25px;
          text-align: right;
          font-size: 20px;
          font-weight: 700;
          padding-top: 15px;
          border-top: 2px solid #eee;
          color: #000;
        }
        .bank-details {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px dashed #eee;
          font-size: 14px;
          color: #444;
          page-break-before: auto; /* Allow a page break before if the block doesn't fit */
          page-break-inside: avoid; 
        }
        .bank-details h3 {
          color: #222;
          margin-bottom: 15px;
          font-weight: 600;
          font-size: 18px;
          border-bottom: 1px solid #f0f0f0;
          padding-bottom: 8px;
        }
        .bank-details div {
          margin-bottom: 8px;
          display: flex;
          justify-content: space-between;
        }
        .bank-details strong {
            min-width: 150px;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 13px;
          color: #888;
          padding-top: 15px;
          border-top: 1px solid #f0f0f0;
           page-break-before: auto; /* Allow a page break before if the block doesn't fit */
            page-break-inside: avoid; /* */
        }

        /* Responsive adjustments for smaller screens */
        @media (max-width: 600px) {
            .top-info-section {
                flex-direction: column;
                align-items: center;
            }
            .branch-info-left, .customer-details-right {
                text-align: center;
                margin-right: 0;
                margin-left: 0;
                width: 100%;
                min-width: unset;
            }
            .customer-details-right div {
                justify-content: center; /* Center customer details when stacked */
            }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="top-info-section">
          <div class="branch-info-left">
            ${branch?.logo ? `
            <div class="logo-container">
              <img src="${branch.logo}" alt="Company Logo" onerror="this.onerror=null;this.src='https://placehold.co/120x60/cccccc/333333?text=Logo';" />
            </div>
            ` : ''}
            <h2>${sale.document_type}</h2>
            <div class="branch-name">${branch.name}</div>
          </div>

          <div class="customer-details-right">
              <h3>Customer Details</h3>
              <div><strong>Customer Name:</strong> <span>${customer.fullName}</span></div>
              <div><strong>Customer Address:</strong> <span>${customer.physicalAddress || 'N/A'}</span></div> 
              <div><strong>Customer Phone:</strong> <span>${customer.phoneNumber || 'N/A'}</span></div> 
          </div>
        </div>

        <div class="details-section">
          <h3>Invoice Details</h3>
          <div><strong>Date:</strong> <span>${formatDate(sale.createdAt)}</span></div>
          <div><strong>${sale.document_type} No:</strong> <span>${sale.document_type.slice(0, 3)}-${sale.id_on_device}</span></div>
          <div><strong>Income Source:</strong> <span>${sale.income_source}</span></div>
        </div>

        ${itemsTable}

        <div class="total-section">
          Total: ${formatCurrency(sale.amount)}
        </div>

        <div class="bank-details">
            <h3>Bank Details</h3>
            <div><strong>Account Name:</strong> <span>${bankDetails.name}</span></div>
            <div><strong>Bank Name:</strong> <span>${bankDetails.account_bank}</span></div>
            <div><strong>Account Number:</strong> <span>${bankDetails.account_number}</span></div>
            <div><strong>Currency:</strong> <span>${bankDetails.currency}</span></div>
        </div>

        <div class="footer">
          Thank you for your business! Please make payment to the above bank details.
        </div>
      </div>
    </body>
  </html>
  `;
};

export const handleDownloadInvoice = (sale: Debt, bankDetails: Account, branch: Branch, customer: Customer) => {
  const invoiceHTML = generateInvoiceHTML(sale, bankDetails, branch, customer);
  const element = document.createElement("div");
  element.innerHTML = invoiceHTML;

    html2pdf()
    .from(element)
    .set({
        margin: 10,
        filename: `Invoice_${sale.identifier}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .save();
};
