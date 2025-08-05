"use client";
import React, { useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { useDispatch, useSelector } from "react-redux";
import Badge from "../../ui/badge/Badge";
import {  formatDateWordsShort } from "@/utils/formatters/date_formatter";
import Pagination from "@/components/tables/components/Pagination";
import { fetchCashbookAccountsThunk } from "@/redux/api/thunks/accounts/fetch";
import { formatCurrency } from "@/utils/formatters/currency_formatter";
import Button from "@/components/ui/button/Button";
import { MdDelete } from "react-icons/md";
import toast from "react-hot-toast";
import { deleteAccountEntryCashbook } from "@/redux/api/thunks/accounts/post";

export interface Account {
    $id: string;
    $createdAt: string;
    name: string;
    address: string;
    account_number: string;
    account_bank: string;
    currency: string;
    account_type: string;
    total_income: string;
    total_expenses: string;
    id_on_device: string;
}

export default function AccountsTableCashbook() {
    const dispatch = useDispatch()
    const {accounts, error, loading} = useSelector((state) => state.accounts)
    const [uniqueId, setUniqueId] = React.useState<string | null>(null);
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
      if (typeof window !== "undefined") {
        const id = localStorage.getItem("unique_id");
        setUniqueId(id);
      }
    }, []);

    useEffect(() => {
        if (uniqueId) {
          dispatch(fetchCashbookAccountsThunk(uniqueId));
        }
      }, [dispatch, uniqueId]);

          const handleDeleteAccount = async (account: Account) => {
              const loadingToast = toast.loading("Deleting entry...");
              try {
                const success = await dispatch(deleteAccountEntryCashbook({documentId: account.$id})).unwrap()
                if (!success) {
                  console.error(success)
                  toast.error("Failed to delete company entry");
                  return
                }
                toast.success("Company entry deleted successfully.", {duration: 5000});
                await dispatch(fetchCashbookAccountsThunk(uniqueId));
              } catch (error) {
                console.error("Error deleting company entry:", error);
                toast.error("Error deleting company entry");
              }
              toast.dismiss(loadingToast);
            };
      
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const paginatedData:Account[] = accounts.slice(startIndex, endIndex)
const totalPages = Math.ceil(accounts.length / itemsPerPage);

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
                      <span>Eror fetching companies - {error}</span>
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
                  Company Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Address
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
            {paginatedData.map((account) => (
                <TableRow key={account.$id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {formatDateWordsShort(account?.$createdAt)}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="flex -space-x-2">
                        <div className="flex items-center gap-2">
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {account?.name}
                            </span>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {account?.address}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <Button variant="link_error" startIcon={<MdDelete size={18} />} onClick={ () => window.confirm("Confirm entry deletion") && handleDeleteAccount(account) } />
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
        </div>
      </div>
    </div>
  );
}
