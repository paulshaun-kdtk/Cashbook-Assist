"use client";
import React, { useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useDispatch, useSelector } from "react-redux";
import Badge from "../ui/badge/Badge";
import { EyeIcon } from "@/icons";
import { formatDateWords } from "@/utils/formatters/date_formatter";
import Pagination from "./components/Pagination";
import { formatCurrency } from "@/utils/formatters/currency_formatter";
import { fetchIncomeThunk } from "@/redux/api/thunks/income/fetch";
import { formatTextTruncate } from "@/utils/formatters/text_formatter";
import { Modal } from "../ui/modal";
import Label from "../form/components/Label";
import Input from "../form/components/input/InputField";
import Button from "../ui/button/Button";
import { updateIncomeItemThunk } from "@/redux/api/thunks/income/update";
import { MdDelete } from "react-icons/md";
import { FaRotateLeft, FaRotateRight } from "react-icons/fa6";
import toast from "react-hot-toast";
import { deleteIncomeEntry } from "@/redux/api/thunks/income/post";
import { useSearchParams } from "next/navigation";
import { fetchPurchasesThunk } from "@/redux/api/thunks/purchases/fetch";
import { deletePurchaseItemThunk } from "@/redux/api/thunks/purchases/post";


export interface Purchase {
    $id: string;
    createdAt: string;
    description: string;
    income_source: string;
    id_on_device: string;
    $createdAt: string;
    $updatedAt: string;
    amount: string;
}

interface StockItemsTableProps {
  search: string;
  onFilteredChange?: (filteredItems: Purchase[]) => void;
}

export default function PurchasesTable({ search, onFilteredChange }: StockItemsTableProps) {
    const dispatch = useDispatch()
    const { purchases, error, loading} = useSelector((state) => state.purchases)
    const [uniqueId, setUniqueId] = React.useState<string | null>(null);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [selectedItem, setSelectemItem] = React.useState<Purchase | null>(null);
    const itemsPerPage = 10;

    const searchParams = useSearchParams()

    const openModal = (item: Purchase) => {
      setSelectemItem(item);
  }

    const closeModal = () => {
        setSelectemItem(null);
    }


    useEffect(() => {
      if (typeof window !== "undefined") {
        const id = localStorage.getItem("unique_id");
        setUniqueId(id);
      }
    }, []);

    useEffect(() => {
        if (uniqueId) {
          dispatch(fetchPurchasesThunk(uniqueId));
        }
      }, [dispatch, uniqueId]);

      const filteredItems = useMemo(() => {
          const dateRange = searchParams.get("dateRange")?.split(',') || ["", ""];
          const minSales = searchParams.get("minSales") ? Number(searchParams.get("minSales")) : undefined;
          const maxSales = searchParams.get("maxSales") ? Number(searchParams.get("maxSales")) : undefined;

        return purchases.filter((item: Purchase) => {
          const itemDate = new Date(item.createdAt);
          const matchesDateRange =
            (!dateRange[0] || itemDate >= new Date(dateRange[0])) &&
            (!dateRange[1] || itemDate <= new Date(dateRange[1]));
            const matchesIncomeSource = searchParams.get("incomeSource") ? item.income_source == searchParams.get("incomeSource") : true;
          
          const totalSales = item.amount || 0;
          const matchesMinSales = !minSales || Number(totalSales) >= Number(minSales);
          const matchesMaxSales = !maxSales || Number(totalSales) <= Number(maxSales);

          const matchesSearch = item?.description && item.description.toLowerCase().includes(search.toLowerCase());

          return (
            matchesDateRange &&
            matchesIncomeSource &&
            matchesMinSales &&
            matchesMaxSales &&
            matchesSearch
          );
        });
      }, [purchases, searchParams, search]);

    const incomeReversable = selectedItem?.createdAt && new Date().getTime() - new Date(selectedItem.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000 ? true : false;
      

      const handleIncomeDelete = async (income: Purchase) => {
        const loadingToast = toast.loading("Deleting entry...");
        try {
          const success = await dispatch(deletePurchaseItemThunk({documentId: income.$id})).unwrap()
          if (!success) {
            console.error(success)
            toast.error("Failed to delete purchase entry");
            return
          }

          toast.success("Purchase entry deleted successfully.", {duration: 5000});
          await dispatch(fetchPurchasesThunk(uniqueId));
        } catch (error) {
          console.error("Error deleting purchase entry:", error);
          toast.error("Error deleting purchase entry");
        }
        toast.dismiss(loadingToast);
      };

      useEffect(() => {
      if (onFilteredChange) {
        onFilteredChange(filteredItems);
      }
    }, [filteredItems, onFilteredChange]);
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData:Purchase[] = filteredItems.slice(startIndex, endIndex)
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

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
                      <span>Erorr fetching purchase entries - {error}</span>
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
                  Description
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Amount
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                    Branch
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                Id on mobile
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
            {paginatedData.map((income) => (
                <TableRow key={income.$id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {formatDateWords(income?.createdAt)}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="flex -space-x-2">
                        <div className="flex items-center gap-2">
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {formatTextTruncate(income?.description, 32)}
                            </span>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {formatCurrency(income?.amount)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {income?.income_source}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {income?.id_on_device || "N/A"}
                  </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <Button variant="link_dark" startIcon={<EyeIcon size={18} />} onClick={() => openModal(income)} />

                    {(income.createdAt && new Date().getTime() - new Date(income.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000) && (
                      <>
                        <Button variant="link_error" startIcon={<MdDelete size={18} />} onClick={ () => window.confirm("Confirm entry deletion") && handleIncomeDelete(income) } />
                      </>
                    )}
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
              Income Details
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Income creation Date: {formatDateWords(selectedItem?.createdAt)}
            </p>
          </div>
          <form className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div>
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Details
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div>
                    <Label>Inome Amount</Label>
                    <Input
                      type="text"
                      disabled
                      defaultValue={`${formatCurrency(selectedItem?.amount)}`}
                      />
                  </div>

                  <div>
                    <Label>Is a recurring entry</Label>
                    <Input type="text" 
                      defaultValue={`${selectedItem?.is_recurring ? "Yes" : "No"}`}
                      disabled
                    />
                  </div>


                  <div>
                    <Label>Income Source</Label>
                    <Input
                      type="text"
                      defaultValue={`${selectedItem?.income_source}`}
                      disabled
                    />
                  </div>

                    <div>
                    <Label>Is Reversible?</Label>
                    <Input
                      type="text"
                      defaultValue={`${selectedItem?.createdAt && new Date().getTime() - new Date(selectedItem.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000
                        ? "Yes"
                        : "No"
                      }`}
                      disabled
                    />
                    </div>

                  <div className="col-span-2">
                    <Label>Expense Description</Label>
                    <Input
                      type="text"
                      defaultValue={`${selectedItem?.description}`}
                      disabled
                    />
                  </div>
                </div>
              </div>
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Entry Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Posted on</Label>
                    <Input 
                      type="text" 
                      defaultValue={`${selectedItem?.$createdAt}`}
                      disabled
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Last Modified On</Label>
                    <Input 
                      type="text" 
                      disabled
                      defaultValue={`${selectedItem?.$updatedAt}`} 
                    />
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Reversed</Label>
                    <Input 
                      type="text" 
                      disabled
                      defaultValue={`${selectedItem?.reversed ? "Yes" : "No"}`} 
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>

              <Button size="sm" variant="warning" disabled={!incomeReversable} onClick={() => handleReverseItem(selectedItem)} >
              {incomeReversable ? `${selectedItem.reversed ? 'Undo Reversal' : 'Reverse Entry'}` : "Entry too old to reverse"}
              </Button>
            </div>
            <span className="text-xs text-warning-500 dark:text-warning-300 text-right">Warning: Reversed entries do not reflect in your income account. Entries older than a month cannot be reversed.</span>
          </form>
        </div>
      </Modal>
        )}
        </div>
      </div>
    </div>
  );
}
