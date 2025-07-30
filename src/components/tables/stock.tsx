"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useDispatch, useSelector } from "react-redux";
import Badge from "../ui/badge/Badge";
import { fetchStockThunk } from "@/redux/api/thunks/stock/fetch";
import { EyeIcon } from "@/icons";
import { formatCurrency } from "@/utils/formatters/currency_formatter";
import Pagination from "./components/Pagination";
import { formatDateWords } from "@/utils/formatters/date_formatter";
import { useSearchParams } from "next/navigation";
import Button from "../ui/button/Button";
import { MdDelete } from "react-icons/md";
import { Modal } from "../ui/modal";
import Input from "../form/components/input/InputField";
import Label from "../form/components/Label";
import toast from "react-hot-toast";
import { fetchLastPurchase } from "@/redux/api/thunks/purchases/fetch";
import { createPurchaseItemThunk } from "@/redux/api/thunks/purchases/post";
import { updateStockItemThunk } from "@/redux/api/thunks/stock/update";
import { fetchLastExpense } from "@/redux/api/thunks/expenses/fetch";
import { createExpenseEntry } from "@/redux/api/thunks/expenses/post";
import { deleteStockItem } from "@/redux/api/thunks/stock/post";


export interface StockItem {
    $id: string;
  $createdAt: string;
  $updatedAt: string;
  category: string;
  createdAt: string;
  item_name: string;
  buying_price: string;
  income_source: string;
  id_on_device: string;
  item_cost: string;
  quantity: number;
}

interface StockItemsTableProps {
  search: string;
  onFilteredChange?: (filteredItems: StockItem[]) => void;
}

export default function StockItemsTable({ search, onFilteredChange }: StockItemsTableProps) {
    const dispatch = useDispatch()
    const {stock_items, error, loading} = useSelector((state) => state.stock_items)
    const [uniqueId, setUniqueId] = React.useState<string | null>(null);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [selectedItem, setSelectedItem] = React.useState<StockItem | null>(null);
    const [showEntryForm, setShowEntryForm] = useState(false);
    const [showDeductionForm, setShowDeductionForm] = useState(false);
    const [showTransferForm, setShowTransferForm] = useState(false);

    const [formData, setFormData] = useState({  
      item_name: "",
      buying_price: "",
      item_cost: "",
      category: "",
      amount: "",
    })
    
    const itemsPerPage = 10;
    const searchParams = useSearchParams()



    const openModal = (item: StockItem) => {
      setSelectedItem(item);
    }

      const closeModal = () => {
          setSelectedItem(null);
      }

    useEffect(() => {
      if (typeof window !== "undefined") {
        const id = localStorage.getItem("unique_id");
        setUniqueId(id);
      }
    }, []);

    useEffect(() => {
        if (uniqueId) {
          dispatch(fetchStockThunk(uniqueId));
        }
      }, [dispatch, uniqueId]);
      
      const filteredItems = useMemo(() => {
          const dateRange = searchParams.get("dateRange")?.split(',') || ["", ""];
          const minSales = searchParams.get("minTotal") ? Number(searchParams.get("minTotal")) : undefined;
          const maxSales = searchParams.get("maxTotal") ? Number(searchParams.get("maxTotal")) : undefined;
          const minBuyingPrice = searchParams.get("minBuyingPrice") ? Number(searchParams.get("minBuyingPrice")) : undefined;
          const maxBuyingPrice = searchParams.get("maxBuyingPrice") ? Number(searchParams.get("maxBuyingPrice")) : undefined;
          const minQuantity = searchParams.get("minQuantity") ? Number(searchParams.get("minQuantity")) : undefined;
          const maxQuantity = searchParams.get("maxQuantity") ? Number(searchParams.get("maxQuantity")) : undefined;

        return stock_items.filter((item: StockItem) => {
          const itemDate = new Date(item.createdAt);
          const matchesDateRange =
            (!dateRange[0] || itemDate >= new Date(dateRange[0])) &&
            (!dateRange[1] || itemDate <= new Date(dateRange[1]));


          const totalSales = item.item_cost|| 0;
          const matchesMinSales = !minSales || Number(totalSales) >= Number(minSales);
          const matchesMaxSales = !maxSales || Number(totalSales) <= Number(maxSales);

          const totalBuyingPrice = item.buying_price || 0;
          const matchesMinBuyingPrice = !minBuyingPrice || Number(totalBuyingPrice) >= Number(minBuyingPrice);
          const matchesMaxBuyingPrice = !maxBuyingPrice || Number(totalBuyingPrice) <= Number(maxBuyingPrice);
          const matchesIncomeSource = searchParams.get("incomeSource") ? item.income_source == searchParams.get("incomeSource") : true;

          const totalQuantity = item.quantity || 0;

          const matchesMinQuantity = !minQuantity || Number(totalQuantity) >= Number(minQuantity);
          const matchesMaxQuantity = !maxQuantity || Number(totalQuantity) <= Number(maxQuantity);
          

          const matchesSearch = item.item_name.toLowerCase().includes(search.toLowerCase());

          return (
            matchesDateRange &&
            matchesMinSales &&
            matchesMaxSales &&
            matchesMinBuyingPrice &&
            matchesIncomeSource &&
            matchesMaxBuyingPrice &&
            matchesMinQuantity &&
            matchesMaxQuantity &&
            matchesSearch
          );
        });
      }, [stock_items, searchParams, search]);

      useEffect(() => {
      if (onFilteredChange) {
        onFilteredChange(filteredItems);
      }
    }, [filteredItems, onFilteredChange]);
    
    
  const handleUpdateItem = async () => {
    if (!selectedItem) return;
    closeModal();
    const loadingUpdate = toast.loading("Updating stock item...");
    console.log(formData)
    try {
      const updatedItem = {
        item_name: formData.item_name || selectedItem.item_name,
        buying_price: formData.buying_price !== "" ? parseFloat(formData.buying_price) : parseFloat(selectedItem.buying_price),
        item_cost: formData.item_cost !== "" ? parseFloat(formData.item_cost) : parseFloat(selectedItem.item_cost),
        category: formData.category || selectedItem.category,
         };

    const res = await dispatch(updateStockItemThunk({documentId: selectedItem.$id, data: updatedItem})).unwrap()
    if (!res.error){
      toast.success("Stock item updated successfully");
      closeModal();
    }
  } catch (error) {
    closeModal()
    console.error("Error updating stock item:", error);
    toast.error("Failed to update stock item");
  }
  toast.dismiss(loadingUpdate);
  dispatch(fetchStockThunk(uniqueId)); // Refresh stock items after update
}

  const handleStockEntry = async (item: StockItem, isEntry: boolean) => {
    if (!item) return;

    if (!Number(formData.amount) || Number(formData.amount) <= 0) {
      return toast.error("stock quantity must be a valid number greater than 0")
    }

    const loadingEntry = toast.loading(isEntry ? "Recording stock entry..." : "Recording stock deduction...");
    closeModal()
    try {
      if (isEntry) {
        const last_purchase = await dispatch(fetchLastPurchase(uniqueId)).unwrap();
        const purchaseData = {
        description: `Stock entry of ${item.item_name}`,
        amount: item.buying_price,
        id_on_device: last_purchase ? last_purchase.id_on_device + 1 : 1,
        which_key: uniqueId,
        income_source: item.income_source,
        stock_item: item.id_on_device,
        identifier: `${item.id_on_device}-${new Date().getTime()}`,
      }

      const res = await dispatch(createPurchaseItemThunk({data: purchaseData})).unwrap();
      if (!res.error) {
        const updated = await dispatch(updateStockItemThunk({documentId: item.$id, data: {quantity: Number(item.quantity ? item.quantity : 0) + Number(formData.amount)}})).unwrap();
        if (!updated.error){
            toast.success("Stock entry recorded successfully");
           }
          else {
            console.error("Error updating stock item after entry:", updated);
            toast.error("Failed to update stock item after entry");
          }
        } else {
          console.error("Error creating stock entry:", res.error);
          toast.error("Failed to record stock entry");
        } 
    }

    if (!isEntry) {
      const last_expense = await dispatch(fetchLastExpense(uniqueId)).unwrap();
      const expenseData = {
        description: `Stock deduction of ${item.item_name}`,  
        amount: item.buying_price * formData.amount,
        id_on_device: last_expense ? last_expense.id_on_device + 1 : 1,
        income_source: item.income_source,
        identifier: `${item.id_on_device}-${new Date().getTime()}`,
        which_key: uniqueId,
        category: "STOCK DEDUCTION",
        createdAt: new Date().toISOString(),
    }

    const res = await dispatch(createExpenseEntry({data: expenseData})).unwrap();
    if (!res.error) {
        const updated = await dispatch(updateStockItemThunk({documentId: item.$id, data: {quantity: item.quantity - formData.amount}})).unwrap()
        console.log("Updated stock item after deduction:", updated);
        if (!updated.error) {
          toast.success("Stock deduction recorded successfully");
         } else {
          console.error("Error updating stock item after deduction:", updated);
          toast.error("Failed to update stock item after deduction");
        }
      } else {
        console.error("Error creating stock deduction:", res.error);
        toast.error("Failed to record stock deduction");
      }
  }
}
  catch (error) {
    console.error("Error handling stock entry/deduction:", error);
    toast.error("Failed to record stock entry/deduction");
  }
  finally {
    dispatch(fetchStockThunk(uniqueId)); // Refresh stock items after entry/deduction
    setFormData({ item_name: "", buying_price: "", item_cost: "", category: "", amount: "" }); // Reset form data
  }
  toast.dismiss(loadingEntry);
}


      const handleDelete = async (income: StockItem) => {
        const loadingToast = toast.loading("Deleting entry...");
        try {
          const success = await dispatch(deleteStockItem({documentId: income.$id})).unwrap()
          if (!success) {
            console.error(success)
            toast.error("Failed to delete stock item");
            return
          }

          toast.success("Stock Item entry deleted successfully.", {duration: 5000});
          await dispatch(fetchStockThunk(uniqueId));
        } catch (error) {
          console.error("Error deleting stock entry:", error);
          toast.error("Error deleting stock item entry");
        }
        toast.dismiss(loadingToast);
      };


  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData:StockItem[] = filteredItems.slice(startIndex, endIndex)
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);


  const ActionForms = ({ selectedItem, loading }) => {

  return (
    <div className="flex flex-col gap-4">
      {/* --- Action Toggle Buttons --- */}
      <div className="flex flex-wrap gap-3">
        <Button
          size="sm"
          variant="success"
          disabled={loading}
          onClick={() => setShowEntryForm((prev) => !prev)}
        >
          {showEntryForm ? "Hide Stock Entry Form" : "Perform Stock Entry"}
        </Button>

        <Button
          size="sm"
          variant="warning"
          disabled={loading}
          onClick={() => setShowDeductionForm((prev) => !prev)}
        >
          {showDeductionForm ? "Hide Deduction Form" : "Perform Stock Deduction"}
        </Button>

        <Button
          size="sm"
          variant="danger"
          onClick={() => setShowTransferForm((prev) => !prev)}
        >
          {showTransferForm ? "Hide Transfer Form" : "Transfer to Another Branch"}
        </Button>
      </div>

      {/* --- Stock Entry Form --- */}
      {(showEntryForm && !showDeductionForm && !showTransferForm) && (
        <div className="mt-4 rounded-xl border border-success-400 bg-success-50 p-4 dark:bg-success-900">
          <h6 className="mb-2 font-semibold text-success-700 dark:text-success-300">Stock Entry</h6>
          <Input type="number" min="0" 
          defaultValue={formData.amount}
          onChange={
            (e) => setFormData({...formData, amount: e.target.value})
          } placeholder="Quantity to Add" className="mb-2" />
          <Button size="sm" variant="success" onClick={() => handleStockEntry(selectedItem, true)}>
            Confirm Entry
          </Button>
        </div>
      )}

      {/* --- Stock Deduction Form --- */}
      {(showDeductionForm && !showEntryForm && !showTransferForm) && (
        <div className="mt-4 rounded-xl border border-warning-400 bg-yellow-50 p-4 dark:bg-yellow-900">
          <h6 className="mb-2 font-semibold text-yellow-800 dark:text-yellow-200">Stock Deduction</h6>
          <Input type="number"
          defaultValue={formData.amount}
          onChange={(e) => setFormData({...formData, amount: e.target.value})}
          placeholder="Quantity to Deduct" className="mb-2" />
          <Button
            size="sm"
            variant="warning"
            onClick={() => handleStockEntry(selectedItem, false)}
          >
            Confirm Deduction
          </Button>
        </div>
      )}

      {/* --- Transfer Form --- */}
      {(showTransferForm && !showEntryForm && !showDeductionForm) && (
        <div className="mt-4 rounded-xl border border-danger-400 bg-red-50 p-4 dark:bg-red-900">
          <h6 className="mb-2 font-semibold text-red-800 dark:text-red-200">Transfer Item</h6>
          <Input type="text" placeholder="Destination Branch Name" className="mb-2" />
          <Input type="number" placeholder="Quantity to Transfer" className="mb-2" />
          <Button size="sm" variant="danger">
            Confirm Transfer
          </Button>
        </div>
      )}

      <span className="text-xs mt-2 text-warning-500 dark:text-warning-300 text-right">
        Warning: deleted debt entries cannot be recovered. Marking an entry as paid will increase
        the income account by the entry amount.
      </span>
    </div>
  );
};

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        {loading && ( 
          <div className="flex justify-center mt-5">
                <Badge
                      size="sm"
                      color={"warning"}
                      > 
                      <span>... processing ...</span>
                     </Badge> 
          </div>
          )}
        {error && (
            <div className="flex justify-center mt-5">
                    <Badge
                      size="sm"
                      color={"error"}
                      > 
                      <span>Eror fetching stock items - {error}</span>
                     </Badge> 
            </div>
        )}

      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Creation Date
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Item Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Income Source
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                Buying Price
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Selling Price
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Current Quantity
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {paginatedData.map((item) => (
                <TableRow key={item.$id}>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {formatDateWords(item?.createdAt)}
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {item.item_name}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {item?.income_source}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {item?.buying_price}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="flex -space-x-2">
                        <div className="flex items-center gap-2">
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                {formatCurrency(item?.item_cost)}
                            </span>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {item.quantity}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <Button variant="link_dark" startIcon={<EyeIcon size={18} />} onClick={() => openModal(item)} />
                      <Button variant="link_error" startIcon={<MdDelete size={18} />} onClick={() => window.confirm("Delete this debt?") && handleDelete(item)} />

                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {totalPages > 1 && (
          <div className="flex justify-center my-4 px-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}

{selectedItem && (
  <Modal isOpen={true} onClose={closeModal} className="max-w-[700px] m-4">
    <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
      <div className="px-2 pr-14">
        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
          {selectedItem?.item_name} Details
        </h4>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
          Debt entry creation date: {formatDateWords(selectedItem?.createdAt)}
        </p>
      </div>

      <form className="flex flex-col" onSubmit={(e) => e.preventDefault()}>
        <div className="custom-scrollbar max-h-[65vh] overflow-y-auto px-2 pb-3">
          {/* --- Details Section --- */}
          <div>
            <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
              Details
            </h5>

            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div>
                <Label>Item name</Label>
                <Input type="text" 
                onChange={(e) => setFormData({...formData, item_name: e.target.value})}
                defaultValue={selectedItem?.item_name} />
              </div>
              <div>
                <Label>Buying Price</Label>
                <Input
                  type="text"
                  onChange={(e) => setFormData({...formData, buying_price: e.target.value})}
                  defaultValue={selectedItem?.buying_price}
                />
              </div>
              <div>
                <Label>Selling Price</Label>
                <Input
                  type="text"
                  onChange={(e) => setFormData({...formData, item_cost: e.target.value})}
                  defaultValue={selectedItem?.item_cost}
                />
              </div>
              <div>
                <Label>Branch</Label>
                <Input type="text" disabled defaultValue={selectedItem?.income_source} />
              </div>
              <div>
                <Label>Stock Category</Label>
                <Input type="text" 
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  defaultValue={selectedItem?.category} />
              </div>
              <div>
                <Label>Is Deletable?</Label>
                <Input
                  type="text"
                  disabled
                  defaultValue={
                    selectedItem?.createdAt &&
                    new Date().getTime() - new Date(selectedItem.createdAt).getTime() <
                      30 * 24 * 60 * 60 * 1000
                      ? 'Yes'
                      : 'No'
                  }
                />
              </div>
            </div>
          </div>

          {/* --- Entry Info Section --- */}
          <div className="mt-10">
            <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
              Entry Information
            </h5>
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div>
                <Label>Posted on</Label>
                <Input type="text" disabled defaultValue={selectedItem?.$createdAt} />
              </div>
              <div>
                <Label>Last Modified On</Label>
                <Input type="text" disabled defaultValue={selectedItem?.$updatedAt} />
              </div>
            </div>
          </div>
        </div>

        {/* --- Action Area --- */}
      <div className="mt-10 border-t pt-6 px-2">
          <h5 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
            Action Area
          </h5>

          {/* --- React State Setup --- */}
          <ActionForms selectedItem={selectedItem} loading={loading} />

          <div className="flex justify-end mt-6">
            <Button size="sm" variant="outline" onClick={closeModal}>
              Close
            </Button>
            <Button variant="primary" className="ml-3" onClick={handleUpdateItem}>
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  </Modal>
)}

        </div>
      </div>
    </div>
  );
}
