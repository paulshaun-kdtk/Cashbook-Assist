import * as XLSX from "xlsx";
import { formatTextTruncate } from "../text_formatter";

export const handleSaleDataUpload = ({
  files,
  income_source_id = 1,
  which_key,
}) => {
  const user = JSON.parse(localStorage.getItem("user"))?.email;
  console.log(user);

  return new Promise((resolve, reject) => {
    const file = files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);

          const extractedItems = json.map((row) => ({
            items_sold: row["Items Sold"],
            total_selling_price: row["Sale Total"],
            createdAt: new Date(row["Sale Date"]),
            income_source: income_source_id,
            identifier: formatTextTruncate(
              `${user}import no:${Math.floor(Math.random() * 10000) + 400}`,
              46
            ),
            id_on_device: Math.floor(Math.random() * 10000) + 400,
            which_key: which_key,
            createdAt: new Date(),
          }));

          resolve(extractedItems);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      reject(new Error("No file selected"));
    }
  });
};
