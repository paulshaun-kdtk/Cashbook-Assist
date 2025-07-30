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
import { fetchSalesThunk } from "@/redux/api/thunks/sales/fetch";
import { fetchLastIncomeThunk } from "@/redux/api/thunks/income/fetch";
import { DownloadIcon, EyeIcon } from "@/icons";
import { formatDateWords } from "@/utils/formatters/date_formatter";
import { formatCurrency } from "@/utils/formatters/currency_formatter";
import Pagination from "./components/Pagination";
import { formatTextTruncate } from "@/utils/formatters/text_formatter";
import { Modal } from "../ui/modal";
import Label from "../form/components/Label";
import Input from "../form/components/input/InputField";
import Button from "../ui/button/Button";
import { createIncomeEntry } from "@/redux/api/thunks/income/post";
import { useSearchParams } from "next/navigation";
import { FaPrint } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import { deleteSaleItemThunk } from "@/redux/api/thunks/sales/post";
import toast from "react-hot-toast";
import { generateReceiptHTML, handleDownloadReceipt } from "../ecommerce/downloads/receipt";
import { fetchIncomeSourcesThunk } from "@/redux/api/thunks/income_sources/fetch";

export interface Sale {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  createdAt: string;
  customer_name: string;
  items_sold: string;
  income_source: string;
  total_selling_price: string;
  which_key: string;
  id_on_device: string;
  identifier: string;
}

interface StockItemsTableProps {
  search: string;
  onFilteredChange?: (filteredItems: Sale[]) => void;
}

export default function SalesTable({ search,  onFilteredChange }: StockItemsTableProps) {
    const dispatch = useDispatch()
    const {sales, error, loading} = useSelector((state) => state.sales)
    const { income_sources } = useSelector((state) => state.income_sources);
    const { last_entry, loading: incomeLoading, error: incomeError } = useSelector((state) => state.income);
    const [selectedSale, setSelectedSale] = React.useState<Sale | null>(null);
    const [uniqueId, setUniqueId] = React.useState<string | null>(null);
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 10;

    const searchParams = useSearchParams();

    const openSaleModal = (sale: Sale) => {
      setSelectedSale(sale);
    };
    
    const closeSaleModal = () => {
      setSelectedSale(null);
    };
    
    useEffect(() => {
      if (typeof window !== "undefined") {
        const id = localStorage.getItem("unique_id");
        setUniqueId(id);
      }
    }, []);

    useEffect(() => {
        if (uniqueId) {
          dispatch(fetchSalesThunk(uniqueId));
          dispatch(fetchLastIncomeThunk(uniqueId));
          dispatch(fetchIncomeSourcesThunk(uniqueId));
        }
      }, [dispatch, uniqueId]);

      const filteredItems = useMemo(() => {
          const dateRange = searchParams.get("dateRange")?.split(',') || ["", ""];
          const selectedSalespersons = searchParams.get("salespersons")?.split(',').filter(Boolean) || [];
          const selectedProductCategories = searchParams.get("productCategories")?.split(',').filter(Boolean) || [];
          const minSales = searchParams.get("minSales") ? Number(searchParams.get("minSales")) : undefined;
          const maxSales = searchParams.get("maxSales") ? Number(searchParams.get("maxSales")) : undefined;

        return sales.filter((item: Sale) => {
          const itemDate = new Date(item.createdAt);
          const matchesDateRange =
            (!dateRange[0] || itemDate >= new Date(dateRange[0])) &&
            (!dateRange[1] || itemDate <= new Date(dateRange[1]));

          const matchesSalesperson =
            selectedSalespersons.length === 0 || selectedSalespersons.includes(item.customer_name);

          const matchesProductCategory =
            selectedProductCategories.length === 0 || selectedProductCategories.includes(item.items_sold);

          const matchesIncomeSource = searchParams.get("incomeSource") ? item.income_source == searchParams.get("incomeSource") : true;

          const totalSales = item.total_selling_price || 0;
          const matchesMinSales = !minSales || Number(totalSales) >= Number(minSales);
          const matchesMaxSales = !maxSales || Number(totalSales) <= Number(maxSales);

          const matchesSearch = item.items_sold.toLowerCase().includes(search.toLowerCase());


          
          return (
            matchesDateRange &&
            matchesSalesperson &&
            matchesProductCategory &&
            matchesIncomeSource &&
            matchesMinSales &&
            matchesMaxSales &&
            matchesSearch
          );
        });
      }, [sales, searchParams, search]);
      
      const handlePrintReceipt = (sale: Sale) => {
        const branch = income_sources.find((source) => source.id_on_device === sale.income_source);
        const receiptHTML = generateReceiptHTML(sale, branch?.name, branch?.logo);
        const printWindow = window.open("", "_blank", "width=600,height=800");
        if (printWindow) {
          printWindow.document.write(receiptHTML);
          printWindow.document.close();
          printWindow.focus();
          printWindow.print();
        }
      };

      const downloadReceipt = (sale: Sale) => {
        const branch = income_sources.find((source) => source.id_on_device === sale.income_source);
        
        return handleDownloadReceipt(sale, branch?.name, branch?.logo);
      }

      const handleRepostIncomeEntry = async (sale: Sale) => {
        closeSaleModal();
        const data = {
          createdAt: new Date(sale.createdAt),
          which_key: sale.which_key,
          description: `sale of ${sale.items_sold} to ${sale.customer_name}`,
          income_source: sale.income_source,
          amount: sale.total_selling_price,
          identifier: sale.identifier,
          id_on_device: last_entry.id_on_device + 1,
        };

        const response = await dispatch(createIncomeEntry({data:data}))      
        if (response) {
          console.log("Income entry reposted successfully");
        } else {
          alert("Error reposting income entry");
        }
      }

      const handleSaleDeletion = async (sale: Sale) => {
        const loadingToast = toast.loading("Deleting sale...");
        try {
          const success = await dispatch(deleteSaleItemThunk({documentId: sale.$id})).unwrap()
          console.log("success", success);
          if (!success) {
            console.error(success)
            toast.error("Failed to delete sale");
            return
          }

          toast.success("Sale deleted successfully. Please rember to delete the income or creditor entry as well.", {duration: 5000});
          await dispatch(fetchSalesThunk(uniqueId));
        } catch (error) {
          console.error("Error deleting sale:", error);
          toast.error("Error deleting sale");
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
    const paginatedData:Sale[] = filteredItems.slice(startIndex, endIndex)
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        {loading || incomeLoading && ( 
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
                      <span>Eror fetching sales - {error}</span>
                     </Badge> 
            </div>
        )}

        {incomeError && (
            <div className="flex justify-center mt-5">
                    <Badge
                      size="sm"
                      color={"error"}
                      > 
                      <span>Eror income entry - {incomeError}</span>
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
                  Sale Date
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
                Customer
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                Items Sold
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Sale Total
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
            {paginatedData.map((sale) => (
                <TableRow key={sale.$id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {formatDateWords(sale?.createdAt)}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="flex -space-x-2">
                        <div className="flex items-center gap-2">
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {sale.income_source}
                            </span>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {sale?.customer_name}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {formatTextTruncate(sale?.items_sold, 32)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {formatCurrency(sale?.total_selling_price)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <Button variant="link_success" startIcon={<DownloadIcon />} onClick={() => downloadReceipt(sale)} />
                    <Button variant="link" startIcon={<FaPrint size={18} />} onClick={() => handlePrintReceipt(sale) }  />
                    <Button variant="link_dark" startIcon={<EyeIcon size={18} />} onClick={() => openSaleModal(sale)} />
                    {(sale.createdAt && new Date().getTime() - new Date(sale.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000) && (
                      <Button variant="link_error" startIcon={<MdDelete size={18} />} onClick={ () => window.confirm("Confirm sale deletion") && handleSaleDeletion(sale) } />
                     )}
                  </TableCell>
                  {selectedSale && (
                <Modal isOpen={true} onClose={closeSaleModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Sale Details
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Sale Date: {formatDateWords(selectedSale?.createdAt)}
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
                    <Label>Customer</Label>
                    <Input
                      type="text"
                      defaultValue={`${selectedSale?.customer_name}`}
                      disabled
                    />
                  </div>

                  <div>
                    <Label>Sale Total</Label>
                    <Input type="text" 
                      defaultValue={`${formatCurrency(selectedSale?.total_selling_price)}`}
                      disabled
                    />
                  </div>


                  <div>
                    <Label>Income Source</Label>
                    <Input
                      type="text"
                      defaultValue={`${selectedSale?.income_source}`}
                    />
                  </div>

                  <div>
                    <Label>Has Income Entry</Label>
                    <Input
                      type="text"
                      defaultValue="Yes"
                      disabled
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Items Sold</Label>
                    <Input
                      type="text"
                      defaultValue={`${selectedSale?.items_sold}`}
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
                      defaultValue={`${selectedSale?.$createdAt}`}
                      disabled
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Last Modified On</Label>
                    <Input 
                      type="text"
                      disabled
                      defaultValue={`${selectedSale?.$updatedAt}`} 
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeSaleModal}>
                Close
              </Button>
              <Button size="sm" onClick={() => handleRepostIncomeEntry(selectedSale)} variant="warning" >
                Repost Income Entry
              </Button>
            </div>
            <span className="text-xs text-warning-500 dark:text-warning-300 text-right">Warning: Reposting income entries can create duplicated records... only perform that action if prompted to do so.</span>
          </form>
        </div>
      </Modal>
                  )}
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
        </div>
      </div>
    </div>
  );
}
