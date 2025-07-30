"use client";

import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Select from "../form/components/Select";
import { setSelectedSource } from "@/redux/api/slices/selectedSourceSlice";
import toast from "react-hot-toast";
import { Account } from "../cashbook/tables/companyList";
import { fetchCashbookAccountsThunk } from "@/redux/api/thunks/accounts/fetch";

const IncomeSourceSelectCashbook: React.FC = () => {
  const dispatch = useDispatch();
  const [uniqueId, setUniqueId] = useState<string | null>(null);
  const hasShownError = useRef(false); // prevents multiple toasts
  const [options, setOptions] = useState([{
    label: "All Companies",
    value: null
  }])
  const { error, loading , accounts} = useSelector((state) => state.accounts);

  useEffect(() => {
    const id = localStorage.getItem("unique_id");
    if (id) setUniqueId(id);
  }, []);

  useEffect(() => {
    if (accounts.length) {
      const dynamicOptions = accounts.map((src: Account) => ({
        value: src.$id,
        label: src.name
      }));
      setOptions([
        { label: "All Companies", value: null },
        ...dynamicOptions
      ]);
    }
  }, [accounts]);


  useEffect(() => {
    if (!accounts.length && uniqueId) {
      dispatch(fetchCashbookAccountsThunk(uniqueId));
    }
  }, [dispatch, accounts, uniqueId]);

  useEffect(() => {
    if (error && !hasShownError.current && !accounts.length) {
      hasShownError.current = true;
      toast.error(`Error fetching companies: ${error}. Defaulting to all companies.`);
    }
  }, [error, accounts]);

const handleChange = (optionValue) => {
  if (!optionValue) {
    toast.error('Showing all transactions')
    dispatch(setSelectedSource(null));
    setSelectedSource(null)
    return;
  }

  const matched = accounts.find(
    (src: Account) => src?.$id === optionValue
  );
  if (matched) {
    dispatch(setSelectedSource(matched));
    toast.success(`Selected ${matched.name} as the current filter company.`, {
      duration: 5000
    })
  }
};


  return (
    <div className="min-w-35 grid grid-cols-1 sm:grid-cols-2"> 
      <Select
        options={options}
        placeholder={loading ? "Loading..." : "All Companies"}
        onChange={handleChange}
        className="text-xs"
      />
    </div>
  );
};

export default IncomeSourceSelectCashbook;
