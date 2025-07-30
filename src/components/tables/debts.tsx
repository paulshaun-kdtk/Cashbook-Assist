"use client";
import React, { use, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useDispatch, useSelector } from "react-redux";
import Badge from "../ui/badge/Badge";
import { fetchDebtsThunk } from "@/redux/api/thunks/debts/fetch";
import { DownloadIcon, EyeIcon } from "@/icons";
import { formatDateWords } from "@/utils/formatters/date_formatter";
import { formatCurrency } from "@/utils/formatters/currency_formatter";
import { Modal } from "../ui/modal";
import Pagination from "./components/Pagination";
import Label from "../form/components/Label";
import Input from "../form/components/input/InputField";
import Button from "../ui/button/Button";
import { updateDebtEntry } from "@/redux/api/thunks/debts/update";
import { FaPrint } from "react-icons/fa6";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { deleteDebtEntry } from "@/redux/api/thunks/debts/post";
import { generateInvoiceHTML, handleDownloadInvoice } from "../ecommerce/downloads/invoice";
import { fetchIncomeSourcesThunk } from "@/redux/api/thunks/income_sources/fetch";
import { fetchAccountsThunk } from "@/redux/api/thunks/accounts/fetch";
import { fetchCustomersThunk } from "@/redux/api/thunks/customers/fetch";
import { createIncomeEntry } from "@/redux/api/thunks/income/post";
import { fetchLastIncomeThunk } from "@/redux/api/thunks/income/fetch";
import { formatTextTruncateNoDecoration } from "@/utils/formatters/text_formatter";

export interface Debt {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  id_on_device: number;
  createdAt: string;
  income_source: string;
  debtor: string;
  amount: string;
  document_type: string;
  paid: boolean;
  which_key: string;
  identifier: string;
  description: string;
}

interface StockItemsTableProps {
  search: string;
}

export default function DebtsTable({ search }: StockItemsTableProps) {
    const dispatch = useDispatch()
    const { loading:expenseLoading, error:expenseError } = useSelector((state) => state.expenses)
    const {debts, error, loading} = useSelector((state) => state.debts)
    const {income_sources} = useSelector((state) => state.income_sources)
    const {customers } = useSelector((state) => state.customers);
    const { accounts } = useSelector((state) => state.accounts);
    const [uniqueId, setUniqueId] = React.useState<string | null>(null);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [selectedItem, setSelectedItem] = React.useState<Debt | null>(null);
    const itemsPerPage = 10;

    const searchParams = useSearchParams();


  const openModal = (item: Debt) => {
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
          dispatch(fetchDebtsThunk(uniqueId));
          dispatch(fetchIncomeSourcesThunk(uniqueId));
          dispatch(fetchAccountsThunk(uniqueId));
          dispatch(fetchCustomersThunk(uniqueId))
        }
      }, [dispatch, uniqueId]);

const filteredItems = useMemo(() => {
  const dateRange = searchParams.get("dateRange")?.split(",") || ["", ""];
  const selectedSalespersons = searchParams.get("salespersons")?.split(",").filter(Boolean) || [];
  const selectedProductCategories = searchParams.get("productCategories")?.split(",").filter(Boolean) || [];
  const minSales = searchParams.get("minSales") ? Number(searchParams.get("minSales")) : undefined;
  const maxSales = searchParams.get("maxSales") ? Number(searchParams.get("maxSales")) : undefined;
  const documentType = searchParams.get("documentType");
  const isPaidParam = searchParams.get("isPaid"); // might be null or "true"/"false"

  const isPaid = isPaidParam === "true" ? true : isPaidParam === "false" ? false : undefined;

  return debts.filter((item: Debt) => {
    const itemDate = new Date(item.createdAt);
    const matchesDateRange =
      (!dateRange[0] || itemDate >= new Date(dateRange[0])) &&
      (!dateRange[1] || itemDate <= new Date(dateRange[1]));

    const matchesSalesperson =
      selectedSalespersons.length === 0 || selectedSalespersons.includes(item.debtor);

    const matchesProductCategory =
      selectedProductCategories.length === 0 || selectedProductCategories.includes(item.description);

    const totalSales = item.amount || 0;
    const matchesMinSales = minSales === undefined || Number(totalSales) >= minSales;
    const matchesMaxSales = maxSales === undefined || Number(totalSales) <= maxSales;

    const matchesSearch = item.description.toLowerCase().includes(search.toLowerCase());

    const matchesIncomeSource = searchParams.get("incomeSource") ? item.income_source == searchParams.get("incomeSource") : true;

    const matchesDocumentType =
      !documentType || item.document_type === documentType;

    const matchesIsPaid =
      isPaid === undefined || item.paid === isPaid;

    return (
      matchesDateRange &&
      matchesSalesperson &&
      matchesProductCategory &&
      matchesMinSales &&
      matchesIncomeSource &&
      matchesMaxSales &&
      matchesDocumentType &&
      matchesIsPaid &&
      matchesSearch
    );
  });
}, [debts, searchParams, search]);

      const handleSetPaid = async (item:Debt) => { 
              const lastIncome = await dispatch(fetchLastIncomeThunk(uniqueId)).unwrap();

              console.log("lastIncome", lastIncome);
                const incomeData = {
                  createdAt: new Date(),
                  which_key: item.which_key,
                  description: `invoice payment of ${item.amount} from ${item.debtor}`,
                  income_source: item.income_source,
                  amount: item.amount,
                  category: "SALES",
                  identifier: formatTextTruncateNoDecoration(`${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${uniqueId}`, 30),
                  id_on_device: lastIncome ? lastIncome.id_on_device + 1 : 1,
              };

                const res = await dispatch(updateDebtEntry({documentId: item.$id, data: { paid: true }}));
                if (!res.error) {
                  const incomeResponse = await dispatch(createIncomeEntry({ data: incomeData }));
                  console.log("incomeResponse", incomeResponse);
                  if (incomeResponse.error) {
                    await dispatch(updateDebtEntry({documentId: item.$id, data: { paid: false }}));
                    toast.error("Failed to create income entry for this document.");
                    }
                    else {
                      toast.success("Document marked as paid and income entry created successfully.");
                    }
                }
            closeModal()
        }
      


      const itemReversible = selectedItem?.createdAt && new Date().getTime() - new Date(selectedItem.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000 ? true : false;
    

      const handlePrintInvoice = (sale: Debt) => {
        const branch = income_sources.find((source) => source.id_on_device === sale.income_source);
        if (!branch) {
          toast.error("Branch not found for this document.");
          return;
        }
        const account = accounts.find((acc) => acc.id_on_device === branch.account);

        if (!account) {
          toast.error("failed to fetch banking details for this docunent.");
          return;
        }

        const customer = customers.find((cust) => cust.id_on_device === sale.debtor_id);
        if (!customer) {
          toast.error("Customer not found for this document.");
          return;
        }

        const invoiceHTML = generateInvoiceHTML(sale, account, branch, customer);
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(invoiceHTML);
          printWindow.document.close();
          printWindow.focus();
          printWindow.print();
        }
      };


      const downloadInvoie = (sale: Debt) => {
        const branch = income_sources.find((source) => source.id_on_device === sale.income_source);
        if (!branch) {
          toast.error("Branch not found for this document.");
          return;
        }
        const account = accounts.find((acc) => acc.id_on_device === branch.account);

        if (!account) {
          toast.error("failed to fetch banking details for this docunent.");
          return;
        }

        const customer = customers.find((cust) => cust.id_on_device === sale.debtor_id);
        if (!customer) {
          toast.error("Customer not found for this document.");
          return;
        }

        handleDownloadInvoice(sale, account, branch, customer)
      }

      const handleDebtDeletion = async (item: Debt) => {
        closeModal()
        const loadingToast = toast.loading("Deleting document...");
        try {
          const success = await dispatch(deleteDebtEntry({documentId: item.$id})).unwrap()
          console.log("success", success);
          if (!success) {
            console.error(success)
            toast.error("Failed to delete sale");
            return
          }
          toast.success("Document deleted successfully. Please rember to delete the income or creditor entry as well.", {duration: 5000});
          await dispatch(fetchDebtsThunk(uniqueId));
        } catch (error) {
          console.error("Error deleting document:", error);
          toast.error("Error deleting document. Please try again.");
        }
        toast.dismiss(loadingToast);
      };

      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedData:Debt[] = filteredItems.slice(startIndex, endIndex)
      const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        {loading || expenseLoading && ( 
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
                      <span>Eror fetching debts - {error}</span>
                     </Badge> 
            </div>
        )}
      
      {expenseError && (
            <div className="flex justify-center mt-5">
                    <Badge
                      size="sm"
                      color={"error"}
                      > 
                      <span>expense fetch err - {expenseError}</span>
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
                  Date
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
                Document Type
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
                  Amount
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Is paid
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
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {formatDateWords(item.createdAt)}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {item.income_source}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {item.document_type}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="flex -space-x-2">
                        <div className="flex items-center gap-2">
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {item.debtor}
                            </span>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="flex -space-x-2">
                        <div className="flex items-center gap-2">
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {formatCurrency(item?.amount)}
                            </span>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={
                        item.paid
                          ? "success": "error"
                      }
                    > {item.paid ? "Yes" : "No"} </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                 
                  <Button variant="link_success" startIcon={<DownloadIcon />} onClick={() => downloadInvoie(item)} />
                  <Button variant="link" startIcon={<FaPrint size={18} />} onClick={() => handlePrintInvoice(item)} />
                  <Button variant="link_dark" startIcon={<EyeIcon size={18} />} onClick={() => openModal(item)} />

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
                      {selectedItem?.document_type} Details
                    </h4>
                    <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                      {selectedItem?.document_type} creation date: {formatDateWords(selectedItem?.createdAt)}
                    </p>
                  </div>
                  <form className="flex flex-col"
                    onSubmit={(e) => e.preventDefault()}
                  >
                    <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
                      <div>
                        <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                          Details
                        </h5>
        
                        <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                          <div>
                            <Label>Creditor</Label>
                            <Input
                              type="text"
                              disabled
                              defaultValue={`${selectedItem?.debtor}`}
                              />
                          </div>
        
                          <div>
                            <Label>Credit Amount</Label>
                            <Input
                              type="text"
                              disabled
                              defaultValue={`${formatCurrency(selectedItem?.amount)}`}
                              />
                          </div>
        
                          <div>
                            <Label>Credit is Paid</Label>
                            <Input type="text" 
                              defaultValue={`${selectedItem?.paid ? "Yes" : "No"}`}
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
                            <Label>Is Deletable?</Label>
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
                            <Label>Credit Description</Label>
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
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                      <Button size="sm" variant="outline" onClick={closeModal}>
                        Close
                      </Button>
                      
                      {/* {!selectedItem?.paid && ( */}
                        <Button size="sm" variant="danger" disabled={!itemReversible} onClick={() => window.confirm("confirm document deletion?") && handleDebtDeletion(selectedItem)} >
                        Delete {selectedItem?.document_type}
                      </Button>
                      {/* )} */}
        
                      {(!selectedItem?.paid && selectedItem?.document_type === "INVOICE") && (
                        <Button size="sm" variant="success" disabled={loading || expenseLoading} onClick={() => handleSetPaid(selectedItem)}>
                            Mark as paid
                        </Button>
                      )}
                      
                    </div>
                    {selectedItem?.document_type ===  "QUOTATION" && (
                      <span className="text-xs mt-2 text-gray-600 dark:text-gray-300 text-right">Download our mobile to convert quotations to invoices</span>
                    )}
                    <span className="text-xs mt-2 text-warning-500 dark:text-warning-300 text-right">Warning: deleted credit entries cannot be recovered. Marking an entry as paid will increase the income account by the entry amount</span>
                  </form>
                </div>
              </Modal>
            )}
        </div>
      </div>
    </div>
  );
}
