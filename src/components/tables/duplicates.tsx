"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useSelector } from "react-redux";
import { EyeIcon } from "@/icons";
import { formatCurrency } from "@/utils/formatters/currency_formatter";
import { formatDateWords } from "@/utils/formatters/date_formatter";
import Pagination from "./components/Pagination";
import { selectDuplicates } from "@/redux/api/selectors/identify_duplicates";
import { cleanDuplicatesFromAppwrite } from "@/redux/api/thunks/cleanup/remove_duplicates";
import Alert from "../ui/alert/Alert";
import { useRouter } from "next/navigation";
import Badge from "../ui/badge/Badge";
import { Modal } from "../ui/modal";
import Label from "../form/components/Label";
import Input from "../form/components/input/InputField";
import { useModal } from "@/hooks/useModal";
import Button from "../ui/button/Button";
import LoadingBar, { LoadingBarRef } from 'react-top-loading-bar'


interface Duplicate {
    $id: string;
    createdAt: string;
    duplication_count: string;
    which_module: string;
    items: [];
}

interface DuplicateTableProps {
  search: string;
}

export default function DuplicateTable({ search }: DuplicateTableProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
   const { isOpen, openModal, closeModal } = useModal();
  const [loading, setLoading] = React.useState(false);
  const loadingBarRef = React.useRef<LoadingBarRef>(null);
  const itemsPerPage = 10;

  const router = useRouter()
  const duplicates = useSelector(selectDuplicates);

  const handleDelete = async () => {
    setLoading(true);
    loadingBarRef.current?.continuousStart();
    if (duplicates.length === 0) {
      alert("No duplicates found.");
      return;
    }

    const confirmed = confirm(`Are you sure you want to delete ${duplicates.length} duplicates?`);
    
    if (!confirmed) {
      setLoading(false);
      loadingBarRef.current?.complete();
      return
    };

    await cleanDuplicatesFromAppwrite(duplicates);
    setLoading(false);
    loadingBarRef.current?.complete();
    alert("Duplicates deleted.");
    router.replace("/dashboard")
  };

  const filteredItems = duplicates.filter((item: Duplicate) =>
    item.createdAt.toLowerCase().includes(search.toLowerCase())
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredItems.slice(startIndex, endIndex)
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  return (
    <>
     <LoadingBar
        color="#0D6BD6"
        ref={loadingBarRef}
        height={3}
        style={{ bottom: 0, top: 'auto', zIndex: 9999 }}
      />
      
    {loading ? (
      <div className="flex items-center justify-center">
        <Badge variant="solid" color="warning" size="md" >Deleting duplicates please wait.</Badge>
      </div>
    ) : (
      <Alert variant="warning" title="Remove duplicates" message="click link below to remove all duplicates." showLink={true} onClickLink={handleDelete} linkText="Remove all duplicates" />
    )}
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
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
                  Duplicate Module
                </TableCell>
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
                  Duplication Count
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
              <>
                <TableRow key={item.$id}>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="flex -space-x-2">
                        <div className="flex items-center gap-2">
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                              {item?.which_module}
                            </span>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {formatDateWords(item?.createdAt)}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {item?.duplication_count}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <button
                      onClick={openModal}
                      className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
                      >
                  <EyeIcon size={18} />
                    Inspect
                  </button>

                    {/* <button
                      className="flex w-full items-center justify-center ml-2 gap-2 rounded-full border border-gray-300 bg-red-400 dark:bg-red-500 px-4 py-3 text-sm font-medium text-red-100 shadow-theme-xs hover:bg-red-50 hover:text-red-400 dark:border-gray-700  dark:text-red-100 dark:hover:bg-white/[0.03] dark:hover:text-red-400 lg:inline-flex lg:w-auto"
                      >
                      <TrashBinIcon size={16} />
                      Remove duplicate
                      </button> */}
                  </TableCell>
                </TableRow>
                <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Sale Details
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Item Creation Date: {formatDateWords(item?.createdAt)}
            </p>
          </div>
            {item.items.map((item) => (
              <form className="flex flex-col" key={item.$id}>
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
                      defaultValue={`${item?.customer_name}`}
                      disabled
                    />
                  </div>

                  <div>
                    <Label>Sale Total</Label>
                    <Input type="text" 
                      defaultValue={`${formatCurrency(item?.total_selling_price)}`}
                      disabled
                    />
                  </div>


                  <div>
                    <Label>Income Source</Label>
                    <Input
                      type="text"
                      defaultValue={`${item?.income_source}`}
                      />
                  </div>

                  <div>
                    <Label>Has Income Entry</Label>
                    <Input
                      type="text"
                      defaultValue="Yes"
                      />
                  </div>

                  <div className="col-span-2">
                    <Label>Items Sold</Label>
                    <Input
                      type="text"
                      defaultValue={`${item?.items_sold}`}
                      />
                  </div>
                </div>
              </div>
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Income / Expense
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Posted on</Label>
                    <Input type="text" 
                      defaultValue={`${item?.createdAt}`}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Total Amount</Label>
                    <Input type="text" 
                      defaultValue={`${item.amount}`} 
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Description</Label>
                    <Input type="text" 
                      defaultValue={`${item?.description}`}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Is recurring</Label>
                    <Input type="text" 
                      defaultValue={`${item?.is_recurring}`}  
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" variant="danger" >
                Delete Entry
              </Button>
            </div>
          </form>
            ))}
        </div>
      </Modal>    
                      </>
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
  </>
  );
}
