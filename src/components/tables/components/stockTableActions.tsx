"use client"
import React, { useState } from "react";
import DatePicker from "@/components/form/components/date-picker";
import Label from "@/components/form/components/Label";
import Input from "@/components/form/components/input/InputField";
import { Modal } from "@/components/ui/modal";
import { AngleUpIcon } from "@/icons";
import Button from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";


export const StockItemsFilters = () => {
  const router = useRouter()
  const [dateRange, setDateRange] = useState([]); // [startDate, endDate]
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [minSales, setMinSales] = useState("");
  const [maxSales, setMaxSales] = useState("");
  const [minBuyingPrice, setMinBuyingPrice] = useState("");
  const [maxBuyingPrice, setMaxBuyingPrice] = useState("");
  const [minQuantity, setMinQuantity] = useState("");
const [maxQuantity, setMaxQuantity] = useState("");

  const handleSetFilterUrl = () => {
        const queryParams = new URLSearchParams();
        queryParams.set("dateRange", dateRange.map(d => d ? d.toISOString().split('T')[0] : "").join(","));
        queryParams.set("minTotal", minSales);
        queryParams.set("maxTotal", maxSales);
        queryParams.set("minBuyingPrice", minBuyingPrice);
        queryParams.set("maxBuyingPrice", maxBuyingPrice);
        queryParams.set("minQuantity", minQuantity);
        queryParams.set("maxQuantity", maxQuantity);

        router.replace(`?${queryParams.toString()}`);
        setIsModalOpen(false);
    };
    


  const handleDateChange = (selectedDates: Date) => {
    setDateRange(selectedDates);
    console.log("Selected Date Range:", selectedDates.map(d => d ? d.toISOString().split('T')[0] : null));
  };

  const handleMinSalesChange = (e) => {
    setMinSales(e.target.value);
  };

  const handleMaxSalesChange = (e) => {
    setMaxSales(e.target.value);
  };

    const handleMinBuyingPriceChange = (e) => {
        setMinBuyingPrice(e.target.value);
    };

    const handleMaxBuyingPriceChange = (e) => {
        setMaxBuyingPrice(e.target.value);
    };

    const handleMinQuantityChange = (e) => {
        setMinQuantity(e.target.value);
    }

    const handleMaxQuantityChange = (e) => {
        setMaxQuantity(e.target.value);
    }

  const clearFilters = () => {
    setDateRange([]);
    setMinSales("");
    setMaxSales("");
    setMinBuyingPrice("");
    setMaxBuyingPrice("");
    setIsModalOpen(false)
    router.push("/stock-items"); 
  };

  return (
    <>
    <Button startIcon={<AngleUpIcon />} onClick={() => setIsModalOpen(!isModalOpen)} variant="link_dark" >Filters</Button>

    <Modal
      isOpen={isModalOpen}
      isFullscreen={false}
      showCloseButton
      onClose={() => setIsModalOpen(false)}
      className="max-w-[700px] m-4"
      >
    <div className="p-6 rounded-xl shadow-lg dark:bg-gray-800 max-w-3xl mx-auto">
      <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">Stock Filter</h2>
      <div className="flex flex-wrap items-end gap-4 md:gap-6">

        {/* Min Sales Input */}
        <div className="w-full sm:w-auto flex-grow min-w-[150px]">
          <Label htmlFor="min-sales">Min Selling Price</Label>
          <Input
            id="min-sales"
            type="number"
            placeholder="e.g., 100"
            onChange={handleMinSalesChange}
            defaultValue={minSales}
            min="0"
          />
        </div>

        {/* Max Sales Input */}
        <div className="w-full sm:w-auto flex-grow min-w-[150px]">
          <Label htmlFor="max-sales">Max Selling Price</Label>
          <Input
            id="max-sales"
            type="number"
            placeholder="e.g., 1000"
            onChange={handleMaxSalesChange}
            defaultValue={maxSales}
            min="0"
          />
        </div>

        {/* Min Sales Input */}
        <div className="w-full sm:w-auto flex-grow min-w-[150px]">
          <Label htmlFor="min-sales">Min Buying Price</Label>
          <Input
            id="min-sales"
            type="number"
            placeholder="e.g., 100"
            onChange={handleMinBuyingPriceChange}
            defaultValue={minBuyingPrice}
            min="0"
          />
        </div>

        {/* Max Sales Input */}
        <div className="w-full sm:w-auto flex-grow min-w-[150px]">
          <Label htmlFor="max-sales">Max Buying Price</Label>
          <Input
            id="max-sales"
            type="number"
            placeholder="e.g., 1000"
            onChange={handleMaxBuyingPriceChange}
            defaultValue={maxBuyingPrice}
            min="0"
          />
        </div>
        <div className="w-full sm:w-auto flex-grow min-w-[150px]">
          <Label htmlFor="min-sales">Min Remaing Quantity</Label>
          <Input
            id="min-sales"
            type="number"
            placeholder="e.g., 100"
            onChange={handleMinQuantityChange}
            defaultValue={minQuantity}
            min="0"
          />
        </div>

        {/* Max Sales Input */}
        <div className="w-full sm:w-auto flex-grow min-w-[150px]">
          <Label htmlFor="max-sales">Max Quantity</Label>
          <Input
            id="max-sales"
            type="number"
            placeholder="e.g., 1000"
            onChange={handleMaxQuantityChange}
            defaultValue={maxQuantity}
            min="0"
          />
        </div>


        {/* Date Range Filter */}
        <div className="w-full sm:w-auto flex-grow">
          <DatePicker
            id="sales-date-range"
            label="Creation Date Range"
            mode="range"
            onChange={handleDateChange}
            placeholder="Select date range"
            defaultDate={dateRange}
          />
        </div>

        {/* Action Buttons */}
        <div className="w-full flex justify-end gap-3 mt-4 md:mt-0">
          <button
            onClick={clearFilters}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
            Clear Filters
          </button>
          <button
            onClick={handleSetFilterUrl}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
    </Modal>
    </>
  );
};
