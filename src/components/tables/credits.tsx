"use client";
import React, { useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useDispatch, useSelector } from "react-redux";
import Badge from "../ui/badge/Badge";
import { fetchCreditsThunk } from "@/redux/api/thunks/credits/fetch";
import { CheckCircleIcon, EyeIcon } from "@/icons";
import { formatDateWords } from "@/utils/formatters/date_formatter";
import { formatCurrency } from "@/utils/formatters/currency_formatter";
import Pagination from "./components/Pagination";
import { Modal } from "../ui/modal";
import Label from "../form/components/Label";
import Input from "../form/components/input/InputField";
import Button from "../ui/button/Button";
import { updateCreditItemThunk } from "@/redux/api/thunks/credits/update";
import { createIncomeEntry } from "@/redux/api/thunks/income/post";
import { clearSuccess } from "@/redux/api/slices/creditsSlice";
import { fetchLastIncomeThunk } from "@/redux/api/thunks/income/fetch";
import { deleteCreditEntry } from "@/redux/api/thunks/credits/post";
import toast from "react-hot-toast";
import { MdDelete } from "react-icons/md";
import { Debt } from "./debts";
import { fetchDebtsThunk } from "@/redux/api/thunks/debts/fetch";
import { useRouter } from "next/navigation";


interface Credit {
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    createdAt: string;
    income_source: string;
    creditor: string;
    amount: string;
    which_key: string;
    identifier: string;
    paid: boolean;
    description: string;
}

interface StockItemsTableProps {
  search: string;
}

export default function CreditsTable({ search }: StockItemsTableProps) {
    const dispatch = useDispatch()
    const router = useRouter()
    const { loading: incomeLoading, error: incomeError } = useSelector((state) => state.income);
    const { debts, loading: DebtorsLoading, error: debtorsError } = useSelector((state) => state.debts);
    const {credits, error, loading, success:CreditSuccess } = useSelector((state) => state.credits)
    const [uniqueId, setUniqueId] = React.useState<string | null>(null);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [selectedItem, setSelectedItem] = React.useState<Credit | null>(null);
    const itemsPerPage = 10;


    const openModal = (item: Credit) => {
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
      if (CreditSuccess) {
        const timer = setTimeout(() => {
          dispatch(clearSuccess());
        }, 5000);
    
        return () => clearTimeout(timer);
      }
    }, [CreditSuccess, dispatch]);

    useEffect(() => {
        if (uniqueId) {
          dispatch(fetchCreditsThunk(uniqueId));
          dispatch(fetchDebtsThunk(uniqueId));
        }
      }, [dispatch, uniqueId]);
      
      const filteredItems = credits.filter((item: Credit) =>
        item.creditor.toLowerCase().includes(search.toLowerCase())
      ) && debts.filter((item: Debt) => item.paid === false );

    const handleSetPaid = async (item:Credit) => { 
          if (!item.creditor && item.debtor) {
            router.replace(`/debts?isPaid=false`);
            return;
          }
          const last_entry = await dispatch(fetchLastIncomeThunk(uniqueId)).unwrap();
        
            const incomeData = {
              createdAt: new Date(),
              which_key: item.which_key,
              description: `payment of ${item.amount} from ${item.creditor}`,
              category: "PAYMENTS",
              income_source: item.income_source,
              amount: item.amount,
              identifier: item.identifier,
              id_on_device:  last_entry ? last_entry.id_on_device + 1 : 1,
            };

            const res =  await dispatch(createIncomeEntry({ data: incomeData }));
            console.error("res", res);
            if (!res.error) {
              const res = await dispatch(updateCreditItemThunk({documentId: item.$id, data: { paid: true }}));
              if (!res.error) {
                dispatch(fetchCreditsThunk(uniqueId));
                toast.success("Debt entry marked as paid and income entry created", {
                  duration: 3000,
                });
              } else {
                toast.error("Failed to mark debt as paid", {
                  duration: 3000,
                });
              }
            } 
            closeModal()
          }

          const handleDelete = async (item: Credit) => {
            const deleteRes = await dispatch(deleteCreditEntry({ documentId: item.$id }));
            if (deleteRes) {
              dispatch(fetchCreditsThunk(uniqueId));
              closeModal();
              toast.success("Debt entry deleted successfully", {
                duration: 3000,
              });
            }
            
          }
      
    const itemReversible = selectedItem?.createdAt && new Date().getTime() - new Date(selectedItem.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000 ? true : false;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData:Credit[] = filteredItems.slice(startIndex, endIndex)
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
                      <span>Error fetching debtors - {error}</span>
                     </Badge> 
            </div>
        )}

        {incomeError && (
            <div className="flex justify-center mt-5">
                    <Badge
                      size="sm"
                      color={"error"}
                      > 
                      <span>Error income entry - {incomeError}</span>
                     </Badge> 
            </div>
        )}

        {CreditSuccess && (
            <div className="flex justify-center mt-5">
                    <Badge
                      size="sm"
                      color={"success"}
                      > 
                      <span>{CreditSuccess}</span>
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
                  Posting Date
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
                  Debtor Name
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
                  Debt is paid
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
                    <div className="flex -space-x-2">
                        <div className="flex items-center gap-2">
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {item.creditor || item.debtor}
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
                    <Button variant="link_dark" startIcon={<EyeIcon size={18} />} onClick={() => openModal(item)} />
                    {!item.paid && (
                      <Button variant="link_success" startIcon={<CheckCircleIcon  />} onClick={() => window.confirm("mark this debt as paid?") && handleSetPaid(item)} />
                    )}
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
              {selectedItem?.creditor} Details
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Debt entry creation date: {formatDateWords(selectedItem?.createdAt)}
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
                    <Label>Debtor</Label>
                    <Input
                      type="text"
                      disabled
                      defaultValue={`${selectedItem?.creditor}`}
                      />
                  </div>

                  <div>
                    <Label>Amount</Label>
                    <Input
                      type="text"
                      disabled
                      defaultValue={`${formatCurrency(selectedItem?.amount)}`}
                      />
                  </div>

                  <div>
                    <Label>Paid</Label>
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
                    <Label>Description</Label>
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

              
              {!selectedItem?.paid && (
                <Button size="sm" variant="danger" disabled={!itemReversible} onClick={() => window.confirm("Confirm entry deletion?") && handleDelete(selectedItem)} >
                  {itemReversible ? "Delete Debt Entry" : "Cannot delete entry after 30 days"}
              </Button>
              )}

              {!selectedItem?.paid && (
                <Button size="sm" variant="success" disabled={loading || incomeLoading} onClick={() => handleSetPaid(selectedItem)}>
                    Mark as paid
                </Button>
              )}
            </div>
            <span className="text-xs mt-2 text-warning-500 dark:text-warning-300 text-right">Warning: deleted debt entries cannot be recovered. Marking an entry as paid will increase the income account by the entry amount</span>
          </form>
        </div>
      </Modal>
        )}
        </div>
      </div>
    </div>
  );
}
