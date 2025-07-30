"use client";
import { formatDateWordsShort } from "@/utils/formatters/date_formatter";
import { formatCurrency } from "@/utils/formatters/currency_formatter";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchIncomeThunkCashbook } from "@/redux/api/thunks/income/fetch";
import { fetchExpensesThunkCashbook } from "@/redux/api/thunks/expenses/fetch";
import toast from "react-hot-toast";
import { createExpenseEntryCashbook, deleteExpenseEntryCashbook } from "@/redux/api/thunks/expenses/post";
import { Table, TableRow, TableBody, TableCell, TableHeader } from "@/components/ui/table";
import DuplicatesWarnBannerCashbook from "@/components/ecommerce/DuplicatesWarnCashbook";
import { createIncomeEntryCashbook, deleteIncomeEntryCashbook } from "@/redux/api/thunks/income/post";
import Button from "@/components/ui/button/Button";
import { MdDelete, MdEdit } from "react-icons/md";
import { Income } from "@/components/tables/income";
import {  updateExpenseItemThunkCashbook } from "@/redux/api/thunks/expenses/update";
import {  updateIncomeItemThunkCashbook } from "@/redux/api/thunks/income/update";
import Input from "@/components/form/components/input/InputField";
import { exportToExcel } from "@/utils/methods/exportUtils";
import { FaFileImport, FaPrint } from "react-icons/fa6";
import { TransactionsBatchImport } from "@/components/cashbook/forms/transactionsBatchImport";
import DatePicker from "@/components/form/components/date-picker";
import { fetchCategoriesThunk } from "@/redux/api/thunks/category/fetch";
import { CategoryQuickEntry } from "@/components/cashbook/forms/addCategoryForm";

export type TransactionItem = {
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  account?: string;
};

function CashbookClient() {
  const dispatch = useDispatch()

  const {expenses, loading:ExpenseLoading, error:ExpenseError} = useSelector((state) => state.expenses)
  const {income, loading:incomeLoading, error:incomeError} = useSelector((state) => state.income)
  const unique_id = localStorage.getItem("unique_id")
  const incomeSource = useSelector((state: any) => state.selectedSource?.selected_source)
  const { accounts } = useSelector((state: any) => state.accounts);
  const { categories } = useSelector((state: any) => state.categories);

  const [showAddForm, setShowAddForm] = React.useState(false);
  const [showImportForm, setShowImportForm] = React.useState(false);
  const [showExportForm, setShowExportForm] = React.useState(false);
  const [editingIndex, setEditingIndex] = React.useState(null);
  const [editingItem, setEditingItem] = React.useState({ createdAt: "", description: "", memo: "", category: "", amount: "" });
  const loadingToastRef = React.useRef(null);

  useEffect(() => {
    if (unique_id) {
      dispatch(fetchIncomeThunkCashbook(unique_id));
      dispatch(fetchExpensesThunkCashbook(unique_id));
      dispatch(fetchCategoriesThunk(unique_id));
    }
  }, [dispatch, unique_id]);

 useEffect(() => {
  if (ExpenseLoading || incomeLoading) {
    if (!loadingToastRef.current) {
      loadingToastRef.current = toast.loading("Preparing your cashbook data");
    }
  } else {
    if (loadingToastRef.current) {
      toast.dismiss(loadingToastRef.current);
      loadingToastRef.current = null;
    }
  }
}, [ExpenseLoading, incomeLoading]);


  useEffect(() => {
    if (ExpenseError) {
      console.error(ExpenseError)
      toast.error('Error posting cashbook entry')
    }
    if (incomeError) {
      console.error(incomeError)
      toast.error('Error posting cashbook entry')
    }
    setTimeout(() => {
      toast.dismiss()
    }, 5000)
  }, [ExpenseError, incomeError])

const rawTransactions = [
  ...income
    .filter((item) => !incomeSource || item.which_company === incomeSource.$id)
    .map((item) => ({
      $id: item.$id,
      $sequence: item.$sequence,
      which_company: item.which_company,
      date: item.createdAt,
      description: item.description || "Income",
      memo: item.memo || "",
      amount: item.amount,
      type: "income",
      category: item.category || "Income",
    })),
  ...expenses
    .filter((item) => {
      const category = (item.category || "").toLowerCase().replace(/_/g, " ");
      return (
        (!incomeSource || item.which_company === incomeSource.$id) &&
        !category.includes("cost of sales") &&
        !category.includes("cost of goods sold")
      );
    })
    .map((item) => ({
      $id: item.$id,
      $sequence: item.$sequence,
      which_company: item.which_company,
      date: item.createdAt,
      description: item.description || "Expense",
      memo: item.memo || "",
      amount: -Math.abs(item.amount),
      type: "expense",
      category: item.category || "Other",
    }))].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // ✅ Calculate running balance and add memo field
  let runningBalance = 0;
  const transactions = rawTransactions.map((item, index) => {
    runningBalance += item.amount;
    return {
      ...item,
      balance: runningBalance,
      id: item.$sequence, 
    };
  });

  const startEditingItem = (index, item) => {
    setEditingIndex(index);
    setEditingItem({ description: item.description, memo: item.memo, category: item.category, amount: item.type === "expense" ? Math.abs(item.amount) : item.amount });
  };

  const [newTransaction, setNewTransaction] = React.useState({
    createdAt: "",
    description: "",
    memo: "",
    amount: "",
    type: "debit",
    category: "Other",
  });

  const [exportFilters, setExportFilters] = React.useState({
    startDate: "",
    endDate: "",
    category: "all",
    type: "all",
  });

  const filteredCategories = React.useMemo(() => {

    const defaultCategories = [
      "Food",
      "Transportation",
      "Income",
      "Utilities",
      "Entertainment",
      "Healthcare",
      "Shopping",
      "Initial",
      "Other",
    ];

    const names = Array.isArray(categories)
      ? categories.map((cat) => typeof cat === "string" ? cat : cat.name)
      : [];
    // Merge and deduplicate
    return Array.from(new Set([...defaultCategories, ...names]));
  }, [categories]);

  const addTransaction = async () => {
    if (!newTransaction.description || !newTransaction.amount) return;
    if (!incomeSource?.$id) {
      toast.error("Please specify a Company in your header")
      return
    }
    
    const loadingToast = toast.loading("Posting cashbook entry")

    try {
    const amount = Math.abs(parseFloat(newTransaction.amount));

    const transaction = {
      description: newTransaction.description,
      memo: newTransaction.memo,
      createdAt: new Date(newTransaction.createdAt).toISOString(),
      amount: amount,
      category: newTransaction.category,
      which_company: incomeSource.$id,
      which_key: unique_id,
    };

    if (newTransaction.type === "debit") {
      const response = await dispatch(createExpenseEntryCashbook({data: transaction})).unwrap()
      if (response) {
        toast.success("Expense entry posted successfully", {
          duration: 5000
        })
      }
      else {
        toast.error("Error posting expense entry", {
          duration: 5000
        })
        console.error(response)
      }
    }

    if (newTransaction.type === "credit") {
      const response = await dispatch(createIncomeEntryCashbook({data: transaction})).unwrap()
       if (response) {
        toast.success("Income entry posted successfully", {
          duration: 5000
        })
      }
      else {
        toast.error("Error posting income entry", {
          duration: 5000
        })
        console.error(response)
      }

    }
  } catch(error) {
      console.error(error)
      toast.dismiss(loadingToast)
      toast.error('unexpected error posting entry')
  }

    setNewTransaction({
      description: "",
      memo: "",
      amount: "",
      type: "debit",
      category: "Other",
    });

    setShowAddForm(false);
    toast.dismiss(loadingToast)
    dispatch(fetchIncomeThunkCashbook(unique_id))
    dispatch(fetchExpensesThunkCashbook(unique_id))

};

  const getFilteredTransactions = () => {
    return transactions
      .filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        const startDate = exportFilters.startDate
          ? new Date(exportFilters.startDate)
          : null;
        const endDate = exportFilters.endDate
          ? new Date(exportFilters.endDate)
          : null;

        if (startDate && transactionDate < startDate) return false;
        if (endDate && transactionDate > endDate) return false;

        if (
          exportFilters.category !== "all" &&
          transaction.category !== exportFilters.category
        )
          return false;

        if (
          exportFilters.type !== "all" &&
          transaction.type !== exportFilters.type
        )
          return false;

        return true;
      })
      .map((transaction) => {
        // Remove balance key if filtering by income only or expense only
        if (exportFilters.type === "income" || exportFilters.type === "expense") {
          const { balance, ...rest } = transaction;
          return rest;
        }
        return transaction;
      });
  };

  const saveToExcel = () => {
    const loadingToast = toast.loading("Generating report...");
    try {
      const filteredTransactions = getFilteredTransactions();

      if (filteredTransactions.length === 0) {
      toast.error("No transactions match your filter criteria.", {duration: 5000});
      toast.dismiss(loadingToast);
      return;
    }
    exportToExcel(filteredTransactions, `${incomeSource?.name} Cashbook Report ${formatDateWordsShort(new Date().toLocaleDateString())}`, ['id', '$id', '$sequence', 'which_company']);
  } catch (error) {
    console.error("Error generating report:", error);
    toast.error("Error generating report");
  }
    toast.dismiss(loadingToast);
  }

  const generatePDFReport = () => {
    const filteredTransactions = getFilteredTransactions();

    if (filteredTransactions.length === 0) {
      toast.error("No transactions match your filter criteria.");
      return;
    }

    const totalIncome = filteredTransactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = filteredTransactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const netAmount = totalIncome - totalExpenses;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cash Book Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 15px; }
          .summary { background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .summary-item { display: inline-block; margin-right: 30px; }
          .summary-label { font-weight: bold; color: #6b7280; }
          .summary-value { font-size: 18px; font-weight: bold; }
          .income { color: #059669; }
          .expense { color: #dc2626; }
          .net-positive { color: #059669; }
          .net-negative { color: #dc2626; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
          th { background-color: #f8fafc; font-weight: bold; color: #374151; }
          .amount-cell { text-align: right; width: 20% }
          .date-cell { color: #6b7280; }
          .category-tag { background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
          .filters { margin-bottom: 20px; padding: 15px; background: #f1f5f9; border-radius: 8px; }
          .filter-item { margin-right: 20px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Cash Book Report</h1>
          <p>Generated on ${new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}</p>
        </div>

        <div class="filters">
          <h3>Report Filters:</h3>
          <div class="filter-item"><strong>Date Range:</strong> ${
            exportFilters.startDate || "All"
          } to ${exportFilters.endDate || "All"}</div>
          <div class="filter-item"><strong>Category:</strong> ${
            exportFilters.category === "all"
              ? "All Categories"
              : exportFilters.category
          }</div>
          <div class="filter-item"><strong>Type:</strong> ${
            exportFilters.type === "all"
              ? "All Types"
              : exportFilters.type === "credit"
              ? "Income Only"
              : "Expenses Only"
          }</div>
        </div>

        <div class="summary">
          <div class="summary-item">
            <div class="summary-label">Total Income:</div>
            <div class="summary-value income">$${totalIncome.toFixed(2)}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Total Expenses:</div>
            <div class="summary-value expense">$${totalExpenses.toFixed(
              2
            )}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Net Amount:</div>
            <div class="summary-value ${
              netAmount >= 0 ? "net-positive" : "net-negative"
            }">$${netAmount.toFixed(2)}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Memo</th>
              <th>Amount</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            ${filteredTransactions
              .map(
                (transaction) => `
              <tr>
                <td class="date-cell">${formatDateWordsShort(transaction.date)}</td>
                <td>${transaction.description}</td>
                <td><span class="category-tag">${
                  transaction.category
                }</span></td>
                <td>${transaction.memo || ""}</td>
                <td class="amount-cell ${transaction.amount >= 0 ? "income" : "expense"}">
                  ${transaction.amount >= 0 ? "+" : "-"}${formatCurrency(Math.abs(transaction.amount))}
                </td>
                <td class="amount-cell">${transaction.balance !== undefined && transaction.balance !== null ? `${formatCurrency(transaction.balance)}` : ""}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.print();
    };

    setShowExportForm(false);
  };

  const currentBalance =
    transactions.length > 0 ? transactions[transactions.length - 1].balance : 0;

  const handleDeleteItem = async (item: Income) => {
      const loadingToast = toast.loading("Deleting entry...");
      try {
        const success = item.type === "expense" ? await dispatch(deleteExpenseEntryCashbook({documentId: item.$id})).unwrap() : await dispatch(deleteIncomeEntryCashbook({documentId: item.$id})).unwrap()
        if (!success) {
          console.error(success)
          toast.error("Failed to delete company entry");
          return
        }

        toast.success("Cashbook entry deleted successfully.", {duration: 5000});
        await dispatch(fetchExpensesThunkCashbook(unique_id));
        await dispatch(fetchIncomeThunkCashbook(unique_id));
      } catch (error) {
        console.error("Error deleting entry:", error);
        toast.error("Error deleting entry");
      }
      toast.dismiss(loadingToast);
    };

  const saveEditedTransaction = async (item) => {
    const loadingToast = toast.loading("Updating entry...");
    try {
      const success = item.type === "expense" ? await dispatch(updateExpenseItemThunkCashbook({documentId: item.$id ,data: editingItem})).unwrap() : await dispatch(updateIncomeItemThunkCashbook({documentId: item.$id, data: editingItem})).unwrap()
      if (!success) {
        console.error(success)
        toast.error("Failed to update company entry");
        toast.dismiss(loadingToast);
        return
      }
      toast.success("Cashbook entry updated successfully.", {duration: 5000});
    } catch (error) {
      console.error("Error updating entry:", error);
      toast.error("Error updating entry");
    }
    toast.dismiss(loadingToast);
    setEditingIndex(null);
    dispatch(fetchExpensesThunkCashbook(unique_id));
    dispatch(fetchIncomeThunkCashbook(unique_id));
    setEditingItem({ description: "", memo: "", category: "", amount: "" });
  }
 
const companyNameMap = React.useMemo(() => {
  const map = new Map();
  for (const account of accounts) {
    map.set(account.$id, account.name);
  }
  return map;
}, [accounts]);

  return (
<div className="min-h-screen bg-slate-50 dark:bg-slate-800 font-sans">
  <div className="col-span-12 my-5">
      <DuplicatesWarnBannerCashbook />
    </div>
  <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-5 py-6 shadow-sm">
    <div className="w-full">
      <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-2">Cash Book</h1>
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className={`px-4 py-2 rounded-full text-lg font-semibold ${
          currentBalance >= 0
            ? "bg-green-100 text-green-800 dark:bg-green-200 dark:text-green-900"
            : "bg-red-100 text-red-800 dark:bg-red-200 dark:text-red-900"
        }`}>
          Balance: {formatCurrency(currentBalance)}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button startIcon={<FaFileImport />} onClick={() => setShowImportForm(!showImportForm)}>
               Bulk Import 
          </Button>

          <Button
            onClick={() => setShowExportForm(!showExportForm)}
            startIcon={<FaPrint />}
          >
            Print 
          </Button>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
          >
            + Add Transaction
          </Button>
        </div>
      </div>
    </div>
  </div>

  <div className="mx-auto px-5 py-6">
    {showExportForm && (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 mb-6 shadow">
        <h3 className="text-slate-800 dark:text-slate-100 mb-4 font-semibold">Export PDF Report</h3>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[150px]">
              <label className="block mb-1 text-slate-700 dark:text-slate-300 font-medium">Start Date</label>
              <input
                type="date"
                value={exportFilters.startDate}
                onChange={(e) =>
                  setExportFilters({ ...exportFilters, startDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block mb-1 text-slate-700 dark:text-slate-300 font-medium">End Date</label>
              <input
                type="date"
                value={exportFilters.endDate}
                onChange={(e) =>
                  setExportFilters({ ...exportFilters, endDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[150px]">
              <label className="block mb-1 text-slate-700 dark:text-slate-300 font-medium">Category</label>
              <select
                value={exportFilters.category}
                onChange={(e) =>
                  setExportFilters({ ...exportFilters, category: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="all">All Categories</option>
                {filteredCategories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block mb-1 text-slate-700 dark:text-slate-300 font-medium">Transaction Type</label>
              <select
                value={exportFilters.type}
                onChange={(e) =>
                  setExportFilters({ ...exportFilters, type: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="all">All Types</option>
                <option value="income">Income Only</option>
                <option value="expense">Expenses Only</option>
              </select>
            </div>
          </div>
          <div className="bg-sky-100 text-sky-800 dark:bg-sky-200 dark:text-sky-900 p-3 rounded-md text-sm">
            Preview: {getFilteredTransactions().length} transactions will be included in the report
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowExportForm(false)}
              className="bg-slate-100 dark:bg-slate-700 dark:text-slate-200 px-4 py-2 rounded-md text-sm"
            >
              Cancel
            </button>
            <Button
              onClick={saveToExcel}
              variant="success"
            >
              Export to excel
            </Button>
            <Button
              onClick={generatePDFReport}
              variant="info"
            >
              Generate PDF
            </Button>
          </div>
        </div>
      </div>
    )}


    {showImportForm && (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 mb-6 shadow">
        <h3 className="text-slate-800 dark:text-slate-100 mb-4 font-semibold">Bulk import transactions</h3>
        <div className="flex flex-col gap-4">
          {/* import form */}
          {incomeSource?.$id ? <TransactionsBatchImport whichCompany={incomeSource.$id} /> : <span className="text-red-500">Please specify a branch in your header</span>}
        </div>
      </div>
    )}

{showAddForm && (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 mb-6 shadow">
    <h3 className="text-slate-800 dark:text-slate-100 mb-4 font-semibold">Add New Transaction</h3>
    <div className="flex flex-col gap-4">
      <div>
        <label className="block mb-1 font-medium text-slate-700 dark:text-slate-300">Description</label>
        <input
          type="text"
          name="description"
          value={newTransaction.description}
          onChange={(e) =>
            setNewTransaction({ ...newTransaction, description: e.target.value })
          }
          placeholder="Enter transaction description"
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
        />
      </div>
      <div>
        <label className="block mb-1 font-medium text-slate-700 dark:text-slate-300">Memo</label>
        <input
          type="text"
          name="memo"
          value={newTransaction.memo}
          onChange={(e) =>
            setNewTransaction({ ...newTransaction, memo: e.target.value })
          }
          placeholder="Enter memo (optional)"
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
        />
      </div>
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[150px]">
          <label className="block mb-1 font-medium text-slate-700 dark:text-slate-300">Amount</label>
          <input
            type="number"
            name="amount"
            step="0.01"
            value={newTransaction.amount}
            onChange={(e) =>
              setNewTransaction({ ...newTransaction, amount: e.target.value })
            }
            placeholder="0.00"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block mb-1 font-medium text-slate-700 dark:text-slate-300">Type</label>
          <select
            name="type"
            value={newTransaction.type}
            onChange={(e) =>
              setNewTransaction({ ...newTransaction, type: e.target.value })
            }
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          >
            <option value="debit">Expense (Debit)</option>
            <option value="credit">Income (Credit)</option>
          </select>
        </div>
      <div className="flex-1 min-w-[150px]">
        <label className="block mb-1 text-slate-700 dark:text-slate-300 font-medium">Transaction Date</label>
         <DatePicker
              id="new-date"
              maxDate="today"
              defaultDate={new Date()}
              placeholder="Posting Date"
              onChange={(date) =>
                setNewTransaction({ ...newTransaction, createdAt: new Date(date) })
              }
            />
      </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block mb-1 font-medium text-slate-700 dark:text-slate-300">Category</label>
          <select
            name="category"
            value={newTransaction.category}
            onChange={(e) =>
              setNewTransaction({ ...newTransaction, category: e.target.value })
            }
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          >
            {filteredCategories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <CategoryQuickEntry />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setShowAddForm(false)}
          className="bg-slate-100 dark:bg-slate-700 dark:text-slate-200 px-4 py-2 rounded-md text-sm"
        >
          Cancel
        </button>
        <button
          onClick={addTransaction}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-md text-sm"
        >
          Add Transaction
        </button>
      </div>
    </div>
  </div>
)}


<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow overflow-hidden">
  <div className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-5 py-4">
    <h2 className="text-slate-800 dark:text-slate-100 text-base font-semibold m-0">Transaction History</h2>
  </div>

  {transactions.length === 0 ? (
    <div className="p-10 text-center text-slate-500 dark:text-slate-400 text-sm">
      No transactions yet. Add your first transaction to get started!
    </div>
  ) : (
    <Table>
        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
        <TableRow>
        <TableCell isHeader
          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
        >Date</TableCell>
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
                  Memo
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Category
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
                  Balance
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Company
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Actions
                </TableCell>
        </TableRow>
      </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
      {transactions.map((item, index) => (
           <TableRow key={index}>
            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
              {editingIndex === index ? (
            <Input
              type="date"
              defaultValue={editingItem.date}
              onChange={(e) => setEditingItem({ ...editingItem, date: e.target.value })}
              />
              ) : (
                <span className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {formatDateWordsShort(item?.date)}
                </span>
              )}
            </TableCell>
            <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-gray-200">
              {editingIndex === index ? (
                <Input
                  type="text"
                  defaultValue={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="px-2 py-1 rounded text-sm w-full"
                />
              ) : (
                item.description
              )}
            </TableCell>

            <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-gray-200">
              {editingIndex === index ? (
                <Input
                  type="text"
                  defaultValue={editingItem.memo}
                  onChange={(e) => setEditingItem({ ...editingItem, memo: e.target.value })}
                  className="px-2 py-1 rounded text-sm w-full"
                />
              ) : (
                item.memo
              )}
            </TableCell>
          <TableCell className="px-5 py-4 sm:px-6 text-start">
            {editingIndex === index ? (
              <Input 
              type="text"
              defaultValue={editingItem.category}
              onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
              className="px-2 py-1 rounded text-sm w-full"
              />
            ) : (
            <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-200 dark:text-indigo-900">
              {item.category}
            </span>
            )}
          </TableCell>
        <TableCell className="px-5 py-4 sm:px-6">
          {editingIndex === index ? (
            <Input
            type="text"
            defaultValue={editingItem.amount}
            onChange={(e) => setEditingItem({ ...editingItem, amount: parseFloat(e.target.value) })}
            className="px-2 py-1 rounded text-sm w-full" 
            />
          ) : (
            <div
            className={`text-start font-semibold ${
              item.amount >= 0
                ? "text-emerald-600"
                : "text-red-600"
              }`}
          >
            {item.amount >= 0 ? "+" : ""}
            {formatCurrency(item.amount)}
            </div>
          )} 
          </TableCell>
        <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-gray-200">
            {formatCurrency(item.balance)}
          </TableCell>

          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
            {companyNameMap.get(item.which_company) || ""}
          </TableCell>

              <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                {editingIndex === index ? (
                    <>
                      <Button variant="link_primary" onClick={() => saveEditedTransaction(item)}>Save</Button>
                      <Button variant="link_error" onClick={() => setEditingIndex(null)}>Cancel</Button>
                    </>
                  ) : (
                    <>
                      <Button variant="link_primary" startIcon={<MdEdit size={18} />} onClick={() => startEditingItem(index, item)} />
                      <Button variant="link_error" startIcon={<MdDelete size={18} />} onClick={() => window.confirm("Confirm entry deletion") && handleDeleteItem(item)} />
                    </>
                  )}
            </TableCell>
        </TableRow>
      ))}
</TableBody>
    </Table>
  )}
</div>
      </div>
    </div>
  );
}

export default CashbookClient;