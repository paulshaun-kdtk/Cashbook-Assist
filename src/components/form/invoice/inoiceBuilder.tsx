"use client"
import "@/utils/css/invoice-builder.css"
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Customer } from '@/components/tables/customers';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { StockItem } from '@/components/tables/stock';
import { fetchIncomeSourcesThunk } from '@/redux/api/thunks/income_sources/fetch';
import { fetchCustomersThunk } from '@/redux/api/thunks/customers/fetch';
import { setSelectedIncomeSource } from '@/redux/api/slices/income_sourceSlice';
import { fetchStockThunk } from '@/redux/api/thunks/stock/fetch';
import Button from "@/components/ui/button/Button";
import { InvoiceHeader } from "../components/invoice-builder/invoice-header";
import { InvoiceItemsBody } from "../components/invoice-builder/invoice-items-body";
import { InvoiceTotalsAndTerms } from "../components/invoice-builder/invoice-totals-and-terms";
import { InvoiceAction } from "../components/invoice-builder/invoiceActions";
import { BulkGenerator } from "../components/invoice-builder/invoice-bulk-generator";
import { FaFileInvoice } from "react-icons/fa6";
import { Account } from "@/components/tables/accounts";
import { fetchAccountsThunk } from "@/redux/api/thunks/accounts/fetch";
import { fetchLastDebt } from "@/redux/api/thunks/debts/fetch";
import { createDebtItemThunk } from "@/redux/api/thunks/debts/post";
import { useRouter } from "next/navigation";

const InvoiceBuilder = ({search="", isInvoice=true}) => {
const dispatch = useDispatch();
const router = useRouter()
const { selected_source, income_sources } = useSelector((state) => state.income_sources);
const { rates } = useSelector((state) => state.rates)
const [invoicePaid, setInvoicePaid] = useState(false);
const [selectedRate, setSelectedRate] = useState(null)
const { customers } = useSelector((state) => state.customers);
const { stock_items } = useSelector((state) => state.stock_items);
const { accounts } = useSelector((state) => state.accounts);
const { error } = useSelector((state) => state.debts);


useEffect(() => {
  if (error) {
    toast.error(error.message || 'An error occurred while fetching data. Please try again later.');
    console.error('Error fetching data:', error);
  }
}, [error]);

const [invoice, setInvoice] = useState({
  logo: selected_source?.logo,
  invoiceNumber: 'INV-2025-001',
  invoiceDate: new Date().toISOString().slice(0, 10),
  dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().slice(0, 10),
  billFrom: { name: selected_source?.name, address: selected_source?.address },
  billTo: { id: '', name: customers[0]?.fullName, address: customers[0]?.address, email: customers[0]?.email, phone: customers[0]?.phone },
  items: [],
  taxRate: "15.00",
  discount: 0,
  notes: 'Thank you for your business!',
  bankingDetails: {
    accountName: '',
    accountNumber: '',
    bankName: '',
    currency: '',
    accountType: '',
  },
  terms: 'Payment is due within specified period from the invoice date to the invoice due date. Late payments may incur penalties.',
});

const [subtotal, setSubtotal] = useState(0);
const [totalTax, setTotalTax] = useState(0);
const [grandTotal, setGrandTotal] = useState(0);
const [selectedCustomerId, setSelectedCustomerId] = useState('new');
const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
const [selectedBulkCustomerIds, setSelectedBulkCustomerIds] = useState([]);
const [generatedInvoices, setGeneratedInvoices] = useState([]);
const invoiceRef = useRef(null);

// Effects
useEffect(() => {
  const unique_id = localStorage.getItem('unique_id');
  dispatch(fetchIncomeSourcesThunk(unique_id));
  dispatch(fetchCustomersThunk(unique_id));
  dispatch(fetchStockThunk(unique_id));
  dispatch(fetchAccountsThunk(unique_id));
}, [dispatch]);

useEffect(() => {
  if (selected_source && accounts.length) {
    const source_account = accounts.find((account: Account) => account.id_on_device === selected_source?.account);
     setInvoice(prev => ({
      ...prev,
      bankingDetails: {
        accountName: source_account?.name || '',
        accountNumber: source_account?.account_number || '',
        bankName: source_account?.account_bank || '',
        currency: source_account?.currency || '',
        accountType: source_account?.account_type || '',
      }
    }));

  }
}, [selected_source, accounts]);

useEffect(() => {
  let newSubtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.item_cost), 0);
  setSubtotal(newSubtotal);

  let newTotalTax = (newSubtotal * invoice.taxRate) / 100;
  setTotalTax(newTotalTax);

  let newGrandTotal = newSubtotal + newTotalTax - invoice.discount;
  setGrandTotal(newGrandTotal);
}, [invoice.items, invoice.taxRate, invoice.discount]);

const handleInvoiceChange = (e) => {
  const { name, value } = e.target;
  if (name.includes('.')) {
    const [parent, child] = name.split('.');
    setInvoice(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
  } else {
    setInvoice(prev => ({ ...prev, [name]: value }));
  }
};

  const handleRateChange = async (rateId) => {
    const source = rates.find((s) => s.$id === rateId);
    if (source) {
      setSelectedRate(source)
    }
  };

// Handlers: Item Selection & Changes
const handleItemChange = (uid, e) => {
  const { name, value } = e.target;
  setInvoice(prev => ({
    ...prev,
    items: prev.items.map(item =>
      item.uid === uid
        ? {
            ...item,
            [name]: name === 'quantity' || name === 'item_cost' ? parseFloat(value) || 0 : value
          }
        : item
    )
  }));
};

const handleAddItem = () => {
  let newItems = [];

  if (!selectedItemIds.length) {
    newItems.push({ uid: Date.now() + Math.random(), item_name: '', quantity: 1, item_cost: 0 });
  } else {
    for (const sale_item_id of selectedItemIds) {
      const itemToAdd = stock_items.find((item: StockItem) => item?.$id === sale_item_id);
      if (itemToAdd) {
        newItems.push({
          uid: Date.now() + Math.random(),
          item_name: itemToAdd.item_name,
          quantity: 1,
          item_cost: itemToAdd.item_cost || 0
        });
      }
    }
  }

  setInvoice(prev => ({ ...prev, items: [...prev.items, ...newItems] }));
  setSelectedItemIds([]);
};


const handleRemoveItem = (uid) => {
  setInvoice(prev => ({ ...prev, items: prev.items.filter(item => item.uid !== uid) }));
};

const handleItemAddToSelection = (selected: string[]) => {
  setSelectedItemIds(selected);
};

// Handlers: Customer and Branch Selection
const handleCustomerSelect = (e: Customer) => {
  setSelectedCustomerId(e);
  if (!e) {
    setInvoice(prev => ({
      ...prev,
      billTo: { name: '', address: '', city: '', country: '', email: '', phone: '' }
    }));
  } else {
    const selectedCustomer = customers.find((customer: Customer) => customer.$id === e);
    if (selectedCustomer) {
      setInvoice(prev => ({
        ...prev,
        billTo: { name: selectedCustomer.fullName, address: selectedCustomer.physicalAddress, email: selectedCustomer.email, phone: selectedCustomer.phoneNumber, id: selectedCustomer.id_on_device }
      }));
    }
  }
};

const handleBranchChange = (e) => {
  setSelectedCustomerId(e);
  if (!e) {
    setInvoice(prev => ({ ...prev, billFrom: { name: '', address: '' } }));
  } else {
    const selectedBranch = income_sources.find(item => item.$id === e);
    if (selectedBranch) {
      setInvoice(prev => ({
        ...prev,
        billFrom: { name: selectedBranch.name, address: selectedBranch.address, id: undefined }
      }));
      dispatch(setSelectedIncomeSource(selectedBranch));
    }
  }
};

// Handlers: Bulk Invoicing
const handleBulkCustomerSelect = (customerId) => {
  setSelectedBulkCustomerIds(prev =>
    prev.includes(customerId) ? prev.filter(id => id !== customerId) : [...prev, customerId]
  );
};

const handleGenerateBulkInvoices = () => {
  if (selectedBulkCustomerIds.length === 0) {
    toast.error('Please select at least one customer for bulk invoice generation.');
    return;
  }

  const newGeneratedInvoices = [];

  selectedBulkCustomerIds.forEach((customerId, index) => {
    const customer = customers.find((cust: Customer) => cust.$id === customerId);
    if (customer && customer.id !== 'new') {
      const currentSubtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.item_cost), 0);
      const currentTotalTax = (currentSubtotal * invoice.taxRate) / 100;
      const currentGrandTotal = currentSubtotal + currentTotalTax - invoice.discount;

      newGeneratedInvoices.push({
        ...invoice,
        invoiceNumber: generateUniqueInvoiceNumber(invoice.invoiceNumber, index),
        billTo: { ...customer },
        subtotal: currentSubtotal,
        totalTax: currentTotalTax,
        grandTotal: currentGrandTotal,
      });
    }
  });

  setGeneratedInvoices(newGeneratedInvoices);
};

const handleUpdateGeneratedInvoice = useCallback((index, updatedInvoice) => {
  setGeneratedInvoices(prev => {
    const newInvoices = [...prev];
    newInvoices[index] = updatedInvoice;
    return newInvoices;
  });
}, []);

const handleDeleteGeneratedInvoice = (indexToDelete) => {
  setGeneratedInvoices(prev => prev.filter((_, index) => index !== indexToDelete));
};

// Utility Functions
const generateUniqueInvoiceNumber = (baseNumber, index) => {
  const parts = baseNumber.split('-');
  const num = parseInt(parts[parts.length - 1], 10);
  const newNum = String(num + index).padStart(3, '0');
  return `${parts.slice(0, parts.length - 1).join('-')}-${newNum}`;
};

// Miscellaneous Actions
const handleClearInvoice = () => {
  setInvoice({
    logo: selected_source?.logo,
    invoiceNumber: 'INV-2025-001',
    invoiceDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().slice(0, 10),
    billFrom: { name: '', address: '' },
    billTo: { name: '', address: '', email: '', phone: '', id: '' },
    bankingDetails: {
      accountName: '',
      accountNumber: '',
      bankName: '',
      currency: '',
      accountType: '',
    },
    items: [],
    taxRate: 0,
    discount: 0,
    notes: '',
    terms: 'Payment is due within 30 days of the invoice date. Late payments may incur a penalty of 5% per month.',
  });
  setSelectedCustomerId('');
  setSelectedItemIds([]);
  setSelectedBulkCustomerIds([]);
  setGeneratedInvoices([]);
};

const handlePrintMainInvoice = () => {
  window.print();
};

const handleSaveInvoice = async () => {
  const unique_id = localStorage.getItem('unique_id');
  const toastLoader = toast.loading('Saving invoice...');

  if (!invoice.billTo.id) {
    toast.error('Please select a customer for the invoice.');
    toast.dismiss(toastLoader);
    return;
  }

  if (!selectedCustomerId || selectedCustomerId === 'new') {
    toast.error('Please select a customer for the invoice.');
    toast.dismiss(toastLoader);
    return;
  }

  if (!invoice.items.length) {
    toast.error('Please add at least one item to the invoice.');
    toast.dismiss(toastLoader);
    return;
  }

  try {
    let lastInvoice = await dispatch(fetchLastDebt(unique_id)).unwrap();
    let nextIdOnDevice = lastInvoice ? lastInvoice.id_on_device + 1 : 1;

    // Save generated invoices if any
    for (const genInvoice of generatedInvoices) {
      const formattedItems = genInvoice.items.map((item: StockItem) =>
        `${item.item_name}(qty:${item.quantity})(price:${item.item_cost})`
      );

      const genInvoiceData = {
        debtor: genInvoice.billTo.fullName,
        description: formattedItems.join(', '),
        amount: genInvoice.grandTotal,
        paid: invoicePaid,
        income_source: selected_source?.id_on_device,
        id_on_device: nextIdOnDevice++,
        identifier: genInvoice.invoiceNumber,
        createdAt: new Date().toISOString(),
        which_key: unique_id,
        document_type: isInvoice ? 'INVOICE' : 'QUOTATION',
        exchange_rate_id: selectedRate ? selectedRate.id_on_device : null,
        convertable: !isInvoice,
        due_date: genInvoice.dueDate,
        debtor_id: genInvoice.billTo.id,
        payment_terms: genInvoice.terms,
        notes: genInvoice.notes,
        tax_percentage: parseFloat(genInvoice.taxRate),
      };

      await dispatch(createDebtItemThunk({data: genInvoiceData})).unwrap();
    }

    // Now save the main invoice
    const formattedItems = invoice.items.map((item: StockItem) =>
      `${item.item_name}(qty:${item.quantity})(price:${item.item_cost})`
    );

    const invoiceData = {
      debtor: invoice.billTo.name,
      description: formattedItems.join(', '),
      amount: grandTotal,
      paid: invoicePaid,
      income_source: selected_source?.id_on_device,
      id_on_device: nextIdOnDevice,
      identifier: invoice.invoiceNumber,
      createdAt: new Date().toISOString(),
      which_key: unique_id,
      document_type: isInvoice ? 'INVOICE' : 'QUOTATION',
      exchange_rate_id: selectedRate ? selectedRate.id_on_device : null,
      convertable: !isInvoice,
      due_date: invoice.dueDate,
      debtor_id: invoice.billTo.id,
      payment_terms: invoice.terms,
      notes: invoice.notes,
      tax_percentage: parseFloat(invoice.taxRate),
    };

    await dispatch(createDebtItemThunk({data: invoiceData})).unwrap();
    toast.success('Invoice saved successfully!');
    router.replace('/debts')
  } catch (error) {
    console.error(error);
    toast.error('Failed to save invoice. Please try again.');
  } finally {
    toast.dismiss(toastLoader);
  }
};


  return (
<div className="min-h-screen p-4 sm:p-6 flex flex-col items-center transition-colors duration-300 dark:bg-gray-900 bg-gray-100 text-gray-900 dark:text-gray-50">

  <div
    id="invoice-content"
    ref={invoiceRef}
    className="w-full max-w-7xl transition-all duration-300 ease-in-out border dark:border-gray-700 dark:bg-gray-800 bg-white shadow-2xl rounded-2xl p-4 sm:p-6 md:p-10 lg:p-14"
  >
    <InvoiceHeader
      customers={customers}
      income_sources={income_sources}
      selected_source={selected_source}
      handleBranchChange={handleBranchChange}
      handleCustomerSelect={handleCustomerSelect}
      handleInvoiceChange={handleInvoiceChange}
      rates={rates}
      handleRateChange={handleRateChange}
      isInvoice={isInvoice}
      invoice={invoice}
    />

    <div className="mt-6">
      <InvoiceItemsBody
        invoice={invoice}
        selectedItemIds={selectedItemIds}
        stock_items={stock_items}
        handleAddItem={handleAddItem}
        handleItemAddToSelection={handleItemAddToSelection}
        handleItemChange={handleItemChange}
        handleRemoveItem={handleRemoveItem}
      />
    </div>


    <div className="mt-8">
      <InvoiceTotalsAndTerms
        grandTotal={grandTotal}
        subtotal={subtotal}
        invoice={invoice}
        totalTax={totalTax}
        handleInvoiceChange={handleInvoiceChange}
      />
    </div>
  </div>

  <div className="w-full max-w-7xl mt-8 flex flex-col gap-6">
    <BulkGenerator
      generatedInvoices={generatedInvoices}
      handleBulkCustomerSelect={handleBulkCustomerSelect}
      handleDeleteGeneratedInvoice={handleDeleteGeneratedInvoice}
      handleGenerateBulkInvoices={handleGenerateBulkInvoices}
      customers={customers}
      isInvoice={isInvoice}
      handleUpdateGeneratedInvoice={handleUpdateGeneratedInvoice}
      selectedBulkCustomerIds={selectedBulkCustomerIds}
    />
  </div>

  <InvoiceAction
    handleClearInvoice={handleClearInvoice}
    handlePrintMainInvoice={handlePrintMainInvoice}
    isInvoice={isInvoice}
  />

  <div className="fixed bottom-6 z-50 hidden sm:block">
    <Button onClick={handleSaveInvoice} startIcon={<FaFileInvoice size={18} />} variant="link_primary">Save {isInvoice ? 'Invoice' : 'Quotation'}(s)</Button>
  </div>
  
  <div className="fixed bottom-6 z-50 block sm:hidden">
    <Button onClick={handleSaveInvoice} startIcon={<FaFileInvoice size={18} />} variant="info">Save {isInvoice ? 'Invoice' : 'Quotation'}(s)</Button>
  </div>

</div>

  );
};

export default InvoiceBuilder;
