import { formatDate } from "@/utils/formatters/date_formatter";
import { formatCurrency } from "@/utils/formatters/currency_formatter";
import { Sale } from "@/components/tables/sales";
import html2pdf from "html2pdf.js";

export const parseItemsSold = (itemsSoldString: string) => {
  if (!itemsSoldString) return [];

  return itemsSoldString.split(",").map((itemStr) => {
    const nameMatch = itemStr.match(/^(.+?)\(/);
    const qtyMatch = itemStr.match(/\(qty:(\d+)\)/);
    const priceMatch = itemStr.match(/\(price:(\d+(\.\d+)?)\)/);

    return {
      name: nameMatch ? nameMatch[1].trim() : "",
      qty: qtyMatch ? Number(qtyMatch[1]) : 0,
      price: priceMatch ? Number(priceMatch[1]) : 0,
      total:
        qtyMatch && priceMatch
          ? Number(qtyMatch[1]) * Number(priceMatch[1])
          : 0,
    };
  });
};


export const generateReceiptHTML = (sale: Sale, branchName: string, logoUrl: string) => {
  const items = parseItemsSold(sale.items_sold);

  const itemsTable = `
    <table style="width:100%; border-collapse: collapse; margin-top: 20px; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
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
      <title>Sale Receipt</title>
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Roboto', sans-serif;
          padding: 30px;
          background-color: #f8f8f8;
          color: #333;
          line-height: 1.6;
        }
        .receipt-container {
          max-width: 500px;
          margin: 0 auto;
          background-color: #fff;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        .logo-container {
          text-align: center;
          margin-bottom: 20px;
        }
        .logo-container img {
          max-width: 120px;
          height: auto;
          border-radius: 5px;
        }
        h2 {
          text-align: center;
          color: #222;
          margin-bottom: 5px; /* Reduced margin to make space for branch name */
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .branch-name {
          text-align: center;
          color: #666;
          font-size: 14px;
          margin-bottom: 20px;
        }
        .details {
          margin-top: 20px;
          font-size: 15px;
        }
        .details div {
          margin-bottom: 10px;
          display: flex;
          justify-content: space-between;
          padding-bottom: 5px;
          border-bottom: 1px dashed #eee;
        }
        .details div:last-of-type {
          border-bottom: none;
        }
        .details strong {
          color: #555;
          min-width: 120px; /* Align labels */
        }
        .total-section {
          margin-top: 25px;
          text-align: right;
          font-size: 18px;
          font-weight: 700;
          padding-top: 15px;
          border-top: 2px solid #eee;
          color: #000;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 13px;
          color: #888;
          padding-top: 15px;
          border-top: 1px solid #f0f0f0;
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        ${logoUrl ? `
        <div class="logo-container">
          <img src="${logoUrl}" alt="Company Logo" onerror="this.onerror=null;this.src='https://placehold.co/120x60/cccccc/333333?text=Logo';" />
        </div>
        ` : ''}
        <h2>Sales Receipt</h2>
        <div class="branch-name">${branchName}</div>
        <div class="details">
          <div><strong>Date:</strong> <span>${formatDate(sale.createdAt)}</span></div>
          <div><strong>Customer:</strong> <span>${sale.customer_name}</span></div>
        </div>
        ${itemsTable}
        <div class="total-section">
          Total: ${formatCurrency(sale.total_selling_price)}
        </div>
        
        <div class="footer">
          Thank you for your purchase!
        </div>
      </div>
    </body>
  </html>
  `;
};



export const handleDownloadReceipt = (sale: Sale, branchName: string, logo: string) => {
  const receiptHTML = generateReceiptHTML(sale, branchName, logo);
  const element = document.createElement("div");
  element.innerHTML = receiptHTML;

  html2pdf()
    .from(element)
    .set({
      margin: 10,
      filename: `SaleReceipt_${sale.identifier}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a5", orientation: "portrait" },
    })
    .save();
};
