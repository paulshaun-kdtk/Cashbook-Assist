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
import { formatDateWords } from "@/utils/formatters/date_formatter";
import Pagination from "./components/Pagination";
import { formatTextTruncate } from "@/utils/formatters/text_formatter";
import { fetchCustomersThunk } from "@/redux/api/thunks/customers/fetch";
import Button from "../ui/button/Button";
import { MdDelete } from "react-icons/md";
import toast from "react-hot-toast";
import { deleteCustomerEntry } from "@/redux/api/thunks/customers/post";

export interface Customer {
    $id: string;
    createdAt: string;
    fullName: string;
    identifier: string;
    which_key: string;
    physicalAddress: string;
    email: string;
    phoneNumber: string;
    income_source: string;
}

interface CustomersTableProps {
  search: string;
}

export default function CustomersTable({search}: CustomersTableProps) {
    const dispatch = useDispatch()
    const {customers, error, loading} = useSelector((state) => state.customers)
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
          dispatch(fetchCustomersThunk(uniqueId));
        }
      }, [dispatch, uniqueId]);


      const filteredItems = customers.filter((item: Customer) =>
        item.fullName.toLowerCase().includes(search.toLowerCase()) 
      );

    const handleDeleteCustomer = async (income: Customer) => {
        const loadingToast = toast.loading("Deleting entry...");
        try {
          const success = await dispatch(deleteCustomerEntry({documentId: income.$id})).unwrap()
          if (!success) {
            console.error(success)
            toast.error("Failed to delete customer entry");
            return
          }

          toast.success("Customer entry deleted successfully.", {duration: 5000});
          await dispatch(fetchCustomersThunk(uniqueId));
        } catch (error) {
          console.error("Error deleting customer entry:", error);
          toast.error("Error deleting customer entry");
        }
        toast.dismiss(loadingToast);
      };

      
      
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const paginatedData:Customer[] = filteredItems.slice(startIndex, endIndex)
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
                      <span>Eror fetching customers - {error}</span>
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
                  Full Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Home Address
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                Email Address
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                Phone Number
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
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {paginatedData.map((customer) => (
                <TableRow key={customer.$id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {formatDateWords(customer?.createdAt)}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="flex -space-x-2">
                        <div className="flex items-center gap-2">
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {customer?.fullName}
                            </span>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {formatTextTruncate(customer?.physicalAddress, 32)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {customer?.email}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {customer?.phoneNumber}
                    </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {customer?.income_source}
                    </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {/* <button
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
                    >
                        <EyeIcon size={18} />
                    Details
                  </button> */}
                        <Button variant="link_error" startIcon={<MdDelete size={18} />} onClick={ () => window.confirm("Confirm entry deletion") && handleDeleteCustomer(customer) } />
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
