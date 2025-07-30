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
import { EyeIcon } from "@/icons";
import { formatDateWords } from "@/utils/formatters/date_formatter";
import Pagination from "./components/Pagination";
import { formatCurrency } from "@/utils/formatters/currency_formatter";
import { fetchIncomeSourcesThunk } from "@/redux/api/thunks/income_sources/fetch";
import { selectBranches } from "@/redux/api/selectors/branches";
import { fetchIncomeThunk } from "@/redux/api/thunks/income/fetch";
import { fetchExpensesThunk } from "@/redux/api/thunks/expenses/fetch";
import { fetchAccountsThunk } from "@/redux/api/thunks/accounts/fetch";
import Button from "../ui/button/Button";
import { MdDelete } from "react-icons/md";
import toast from "react-hot-toast";
import { deleteIncomeSourceEntry } from "@/redux/api/thunks/income_sources/post";

export interface Branch {
    $id: string;
    $createdAt: string;
    name: string;
    account: string;
    total_income: string;
    total_expenses: string;
    logo?: string;
    id_on_device: string;
}

export interface BranchWithTotals {
  branch: Branch;
  totals: {
    income_count: number;
    expense_count: number;
    income_amount: string;
    expense_amount: string;
    which_company: string;
    sales_count: number;
  };
}

export default function BranchesTable() {
    const dispatch = useDispatch()
    const { error, loading} = useSelector((state) => state.income_sources)
    const branches = useSelector(selectBranches)
    const [uniqueId, setUniqueId] = React.useState<string | null>(null);
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
      if (typeof window !== "undefined") {
        const id = localStorage.getItem("unique_id");
        setUniqueId(id);
      }
    }, []);

    console.log("Branches:", branches);
    useEffect(() => {
        if (uniqueId) {
          dispatch(fetchIncomeSourcesThunk(uniqueId));
          dispatch(fetchIncomeThunk(uniqueId));
          dispatch(fetchExpensesThunk(uniqueId));
          dispatch(fetchAccountsThunk(uniqueId))
        }
      }, [dispatch, uniqueId]);

          const handleDeleteBranch = async (branch: Branch, totals: BranchWithTotals) => {
              if (totals.totals.income_count || totals.totals.expense_count) {
                toast.error("This branch has associated income or expenses. Please delete them first before deleting the branch.");
                return;
              }
              
              const loadingToast = toast.loading("Deleting entry...");
              try {
                const success = await dispatch(deleteIncomeSourceEntry({documentId: branch.$id})).unwrap()
                if (!success) {
                  console.error(success)
                  toast.error("Failed to delete branch entry");
                  return
                }

                toast.success("Branch entry deleted successfully.", {duration: 5000});
                await dispatch(fetchIncomeSourcesThunk(uniqueId));
              } catch (error) {
                console.error("Error deleting branch entry:", error);
                toast.error("Error deleting branch entry");
              }
              toast.dismiss(loadingToast);
            };
      
      
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const paginatedData:BranchWithTotals[] = branches.slice(startIndex, endIndex)
const totalPages = Math.ceil(branches.length / itemsPerPage);

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
                      <span>Eror fetching account(s) - {error}</span>
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
                  Branch Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Which Company
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                Accrued Revenue / Income
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Accrued Expenses
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
                <TableRow key={account.branch.$id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {formatDateWords(account?.branch.$createdAt)}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="flex -space-x-2">
                        <div className="flex items-center gap-2">
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {account?.branch.name}
                            </span>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {account?.totals.which_company}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {formatCurrency(account.totals.income_amount)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {formatCurrency(account.totals.expense_amount)}
                    </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <Button variant="link" startIcon={<EyeIcon size={18} />} onClick={() => console.log('')} />
                       <Button variant="link_error" startIcon={<MdDelete size={18} />} onClick={ () => window.confirm("Delete branch and all related data") && handleDeleteBranch(account.branch, account) } />
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
