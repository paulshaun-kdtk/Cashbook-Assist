"use client";
import { useState, useEffect } from "react";
import { handleTransactionsUpload } from "@/utils/formatters/modules/cashbook_data_formatter"
import DropzoneComponent from "@/components/form/components/form-elements/DropZone";
import { useDispatch, useSelector } from "react-redux";
import Button from "@/components/ui/button/Button";
import { createIncomeEntryCashbook } from "@/redux/api/thunks/income/post";
import { createExpenseEntryCashbook } from "@/redux/api/thunks/expenses/post";
import toast from "react-hot-toast";
import { fetchExpensesThunkCashbook } from "@/redux/api/thunks/expenses/fetch";
import { fetchIncomeThunkCashbook } from "@/redux/api/thunks/income/fetch";

export const TransactionsBatchImport = (whichCompany: string) => {
    const [userUniqueId, setUniqueId] = useState(null);
    const dispatch = useDispatch();
    const [stockData, setStockData] = useState([]);
    const { loading: incomeLoading, error } = useSelector((state) => state.income);
    const { loading: expenditureLoading } = useSelector((state) => state.expenses);
    const [fileError, setFileError] = useState("");
    
    const loading = incomeLoading || expenditureLoading;

    useEffect(() => {
        if (typeof window !== "undefined") {
        const id = localStorage.getItem("unique_id");
        setUniqueId(id);
        }
    }, []);

    const handleFileUpload = async (files) => {
        try {
          const data = await handleTransactionsUpload({
            files,
            which_key: userUniqueId,
            which_company: whichCompany?.whichCompany
          });
          setStockData(data);
        } catch (error) {
          setFileError(error.message);
        }
      };
      
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    let failedData = [];

    const handleImportStock = async () => {
        const loadingToast = toast.loading("bulk import in progress...");
        if (stockData.length) {
            for (const stock of stockData) {
                try {
                    const data = {
                        ...stock,
                    };
                    delete data.type;
                    const success = stock.type === "debit" ? await dispatch(createIncomeEntryCashbook({ data })).unwrap() : await dispatch(createExpenseEntryCashbook({ data })).unwrap();
                    if (!success) {
                        throw new Error("Failed to import stock entry.");
                    }
                    await delay(50);
                } catch (error) {
                    console.error("Error importing stock:", error);
                    toast.error("Error during import.");
                    failedData.push(stock);
                }
            }
        }
        toast.dismiss(loadingToast);
        setStockData([]);
        toast.success("Bulk data import complete.");
        dispatch(fetchIncomeThunkCashbook(userUniqueId))
        dispatch(fetchExpensesThunkCashbook(userUniqueId))
    };

    if (failedData.length) {
        toast.error("Some items failed to import please try again.");
    }

    return (
        <div className="flex flex-col gap-4">
            {fileError && (
                <div className="text-red-500 text-sm">{fileError}</div>
            )}

        <DropzoneComponent onFileDrop={handleFileUpload} />

        {error && (
            <div className="text-red-500 text-sm">
            {error}
            </div>
        )}

        {loading && (
            <div className="text-green-500 text-sm">
            Uploading data...
            </div>
        )}

        {stockData.length > 0 &&  (
            <>
            <span className="text-center dark:text-gray-300 my-5">importing {stockData.length} items</span>
                <Button disabled={loading} className="mx-auto" onClick={handleImportStock}>Upload Data</Button>
            </>
        )}
        </div>
    )
}