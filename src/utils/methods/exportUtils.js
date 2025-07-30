import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { formatCurrency } from "../formatters/currency_formatter"
dayjs.extend(weekOfYear);


export function formatExportData(data, excludeKeys = []) {
  if (!data.length) return { formattedData: [], totalAmount: 0 };

  let totalAmount = 0;

  const formattedData = data.map((item) => {
    const newItem = {};

    Object.entries(item).forEach(([key, value]) => {
      if (excludeKeys.includes(key)) return;

      if (key.toLowerCase() === "date" && value) {
        newItem[key] = dayjs(value).format("YYYY-MM-DD");
      } else if (key.toLowerCase() === "amount") {
        const numValue = Number(value);
        totalAmount += numValue;
        newItem[key] = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(numValue);
      } else {
        newItem[key] = value;
      }
    });

    return newItem;
  });

  return { formattedData, totalAmount };
}

export function summarizeData(data, dateKey = "Date", period = "weekly") {
  const summary = {};

  data.forEach((item) => {
    const dateValue = item[dateKey];
    if (!dateValue) return;

    const date = dayjs(dateValue);
    if (!date.isValid()) return;

    let periodKey;
    if (period === "weekly") {
      const year = date.year();
      const month = date.format("MM");
      const week = date.week();
      periodKey = `${year}-${month}-W${week}`;
    } else {
      periodKey = date.format("YYYY-MM");
    }

    if (!summary[periodKey]) summary[periodKey] = 0;

    const rawAmount = String(item.Amount || "0").replace(/[^0-9.-]+/g, "");
    console.log(`Raw amount for ${periodKey}: ${rawAmount}`);
    const numericAmount = parseFloat(rawAmount);
    summary[periodKey] += isNaN(numericAmount) ? 0 : numericAmount;
  });

  return Object.entries(summary).map(([period, total]) => ({
    period,
    total: new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(total),
  }));
}

export function addSummaryTotalRow(data, totalKey = "total", label = "Total") {
  const totalAmount = data.reduce((sum, item) => {
    const numericValue = parseFloat(
      String(item[totalKey] || "0").replace(/[^0-9.-]+/g, "")
    );
    return sum + (isNaN(numericValue) ? 0 : numericValue);
  }, 0);

  const totalRow = {};
  Object.keys(data[0] || {}).forEach((key) => {
    totalRow[key] = key === totalKey
      ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalAmount)
      : key === "period" 
        ? label 
        : "";
  });

  return [...data, totalRow];
}


export function exportToExcel(data, fileName, excludeKeys = []) {
  const { formattedData, totalAmount } = formatExportData(data, excludeKeys);

  if (!formattedData.length) return;

  // Add total row if 'Amount' exists
  if (formattedData[0].hasOwnProperty("Amount")) {
    const totalRow = {};
    Object.keys(formattedData[0]).forEach((key) => {
      totalRow[key] = key === "Amount"
        ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalAmount)
        : "";
    });
    formattedData.push(totalRow);
  }

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}


export function exportToCSV(data, fileName, excludeKeys = []) {
  const { formattedData, totalAmount } = formatExportData(data, excludeKeys);

  if (!formattedData.length) return;

  if (formattedData[0].hasOwnProperty("Amount")) {
    const totalRow = {};
    Object.keys(formattedData[0]).forEach((key) => {
      totalRow[key] = key === "Amount"
        ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalAmount)
        : "";
    });
    formattedData.push(totalRow);
  }

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${fileName}.csv`;
  link.click();
}

export function exportToPDF(data, fileName, excludeKeys = []) {
  const { formattedData, totalAmount } = formatExportData(data, excludeKeys);

  if (!formattedData.length) return;

  const doc = new jsPDF();

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(fileName, doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Generated Report", doc.internal.pageSize.getWidth() / 2, 28, { align: "center" });


  const headers = [Object.keys(formattedData[0] || {})];
  const body = formattedData.map((item) => Object.values(item));

  if (formattedData[0].hasOwnProperty("Amount")) {
    const totalRow = Object.keys(formattedData[0]).map((key) =>
      key === "Amount"
        ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalAmount)
        : ""
    );
    body.push(totalRow);
  }

  autoTable(doc, {
    startY: 35,
    head: headers,
    body: body,

    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 2,
      textColor: [30, 30, 30],
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
    },

    headStyles: {
      fillColor: [34, 167, 240], 
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
      fontSize: 10,
    },

    alternateRowStyles: {
      fillColor: [245, 245, 245], 
    },

    columnStyles: {
      Amount: {
        halign: 'right',
        fontStyle: 'bold',
        cellWidth: 'auto', // Optional: or fixed value like 25
      },
    },

    didParseCell: function (data) {
        if (data.row.index === body.length - 1 && data.section === 'body' && formattedData[0].hasOwnProperty("Amount")) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [220, 235, 245]; 
            data.cell.styles.textColor = [0, 0, 0]; 
            if (Object.keys(formattedData[0])[data.column.index] === "Amount") {
                data.cell.styles.textColor = [0, 128, 0]; 
            }
        }
    },
    didDrawPage: function (data) {
      doc.setFontSize(8);
      doc.text(`Page ${doc.internal.getNumberOfPages()}`, doc.internal.pageSize.getWidth() - 30, doc.internal.pageSize.getHeight() - 10, { align: "right" });
    },
  });

  doc.save(`${fileName}.pdf`);
}