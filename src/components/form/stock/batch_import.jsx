"use client";
import { useState, useEffect } from "react";
import { handleStockFileUpload } from "@/utils/formatters/modules/stock_data_formatter";
import { createStockItemThunk } from "@/redux/api/thunks/stock/post";
import DropzoneComponent from "../components/form-elements/DropZone";
import { useDispatch, useSelector } from "react-redux";
import Button from "@/components/ui/button/Button";

export const StockbatchImportForm = () => {
    const [userUniqueId, setUniqueId] = useState(null);
    const dispatch = useDispatch();
    const [stockData, setStockData] = useState([]);
    const { loading, error } = useSelector((state) => state.stock_items);
    const [fileError, setFileError] = useState("");

    useEffect(() => {
        if (typeof window !== "undefined") {
        const id = localStorage.getItem("unique_id");
        setUniqueId(id);
        }
    }, []);

    const handleFileUpload = async (files) => {
        try {
          const data = await handleStockFileUpload({
            files,
            which_key: userUniqueId,
          });
          setStockData(data);
        } catch (error) {
          setFileError(error.message);
        }
      };
      
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    let failedData = [];

    const handleImportStock = async () => {
        if (stockData.length) {
        for (const stock of stockData) {
            try {
            await dispatch(
                createStockItemThunk({
                data: stock,
                }),
            );
            await delay(50); 
            } catch (error) {
            console.error(error);
            failedData.push(stock);
            }
        }
        }
        setStockData([]);
    };

    const handleImportFailedStock = async () => {
        if (failedData.length) {
        for (const stock of failedData) {
            try {
            await dispatch(
                createStockItemThunk({
                data: stock,
                }),
            );
            await delay(200);
            } catch (error) {
            console.error(error);
            failedData.push(stock);
            }
        }
        }
    };
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