import * as XLSX from "xlsx";

export const handleTransactionsUpload = ({
  files,
  which_key,
  which_company
}) => {
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
            createdAt: new Date(row["Date"]).toISOString(),
            description: row["Description"],
            memo: row["Memo"],
            category: row["Category"],
            amount: row["Amount"],
            which_key: which_key,
            type: row["Type"],
            which_company: which_company
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
