"use client";

import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Select from "../form/components/Select";
import { setSelectedSource } from "@/redux/api/slices/selectedSourceSlice";
import Button from "../ui/button/Button";
import toast from "react-hot-toast";
import { Account } from "../cashbook/tables/companyList";
import { fetchCashbookAccountsThunk } from "@/redux/api/thunks/accounts/fetch";
import { RootState } from "@/redux/store";
import { fetchCashbookThunk } from "@/redux/api/thunks/cashbooks/fetch";
import { formatTextTruncate, formatTextTruncateNoDecoration } from "@/utils/formatters/text_formatter";


const IncomeSourceSelectCashbook: React.FC = () => {
  const dispatch = useDispatch();
  const [uniqueId, setUniqueId] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Account | null>(null);
  const hasShownError = useRef(false); // prevents multiple toasts
  const [options, setOptions] = useState<Array<{ label: string; value: string }>>([{
    label: "All Companies",
    value: ""
  }])
  
  const { error, loading , cashbooks} = useSelector((state: RootState) => state.cashbooks);
  const { accounts } = useSelector((state: RootState) => state.accounts);
  const { selected_source } = useSelector((state: RootState) => state.selectedSource);

  useEffect(() => {
    const id = localStorage.getItem("unique_id");
    if (id) setUniqueId(id);
  }, []);

  // Sync selectedCompany state with Redux selected_source 
  // This ensures the local state always reflects the global selection
  useEffect(() => {
    if (selected_source) {
      // Try to find the parent company/account for the selected cashbook
      const matchingAccount = accounts.find(
        (account: Account) => account.$id === (selected_source as Account & { which_company?: string }).which_company
      );
      // Use the parent account if found, otherwise use the cashbook itself
      setSelectedCompany(matchingAccount || selected_source);
    } else {
      // Clear selection when no source is selected
      setSelectedCompany(null);
    }
  }, [selected_source, accounts]);

  useEffect(() => {
    if (cashbooks.length) {
      const dynamicOptions = cashbooks.map((src: Account) => ({
        value: src.$id,
        label: src.name
      }));
      setOptions([
        { label: "All Cashbooks", value: "" }, 
        ...dynamicOptions
      ]);
    }
  }, [cashbooks]);


  useEffect(() => {
    if (!cashbooks.length && uniqueId) {
      dispatch(fetchCashbookAccountsThunk(uniqueId));
      dispatch(fetchCashbookThunk(uniqueId));
    }
  }, [dispatch, cashbooks, uniqueId]);

  useEffect(() => {
    if (error && !hasShownError.current && !cashbooks.length) {
      hasShownError.current = true;
      toast.error(`Error fetching cashbooks: ${error}. Defaulting to all cashbooks.`);
    }
  }, [error, cashbooks]);

const handleChange = (optionValue: string) => {
  if (!optionValue || optionValue === "") {
    toast.success('Showing all transactions');
    dispatch(setSelectedSource(null));
    setSelectedCompany(null);
    return;
  }

  const matched = cashbooks.find(
    (src: Account) => src?.$id === optionValue
  );

  if (matched) {
    dispatch(setSelectedSource(matched));
    
    // Find the associated company/account if available
    const matchingAccount = accounts.find(
      (account: Account) => account.$id === (matched as Account & { which_company?: string }).which_company
    );
    
    setSelectedCompany(matchingAccount || matched);
    
    toast.success(`Selected ${(matched as Account).name} as the current filter cashbook.`, {
      duration: 5000
    });
  } else {
    toast.error('Selected cashbook not found');
  }
};

  return (
    <div className="min-w-35 grid grid-cols-1 sm:grid-cols-2"> 

    <div className="flex flex-row gap-2">
      <Button disabled variant={"link_primary"} className="text-xs">
        {selectedCompany ? `Selected: ${formatTextTruncate(selectedCompany.name, 12)}` : "Select a Cashbook"}
      </Button>

      <Select
        options={options}
        placeholder={loading ? "Loading..." : "All Cashbooks"}
        onChange={handleChange}
        className="text-xs"
        />
      </div>
    </div>
  );
};

export default IncomeSourceSelectCashbook;
