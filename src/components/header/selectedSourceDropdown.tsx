"use client";

import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchIncomeSourcesThunk } from "@/redux/api/thunks/income_sources/fetch";
import Select from "../form/components/Select";
import { setSelectedSource } from "@/redux/api/slices/selectedSourceSlice";
import { selectBranches } from "@/redux/api/selectors/branches";
import { BranchWithTotals } from "../tables/branches";
import toast from "react-hot-toast";
import Button from "../ui/button/Button";

const IncomeSourceSelect: React.FC = () => {
  const dispatch = useDispatch();
  const [uniqueId, setUniqueId] = useState<string | null>(null);
  const [sourceMatched, setSourceMatched] = useState(null)
  const hasShownError = useRef(false); // prevents multiple toasts
  const [options, setOptions] = useState([{
    label: "All Branches",
    value: null
  }])
  const { error, loading } = useSelector((state) => state.income_sources);
  const branches = useSelector(selectBranches);

  useEffect(() => {
    const id = localStorage.getItem("unique_id");
    if (id) setUniqueId(id);
  }, []);

  useEffect(() => {
    if (branches.length) {
      const dynamicOptions = branches.map((src: BranchWithTotals) => ({
        value: src.branch.id_on_device,
        label: src.branch.name
      }));
      setOptions([
        { label: "All Branches", value: null },
        ...dynamicOptions
      ]);
    }
  }, [branches]);


  useEffect(() => {
    if (!branches.length && uniqueId) {
      dispatch(fetchIncomeSourcesThunk(uniqueId));
    }
  }, [dispatch, branches, uniqueId]);

  useEffect(() => {
    if (error && !hasShownError.current && !branches.length) {
      hasShownError.current = true;
      toast.error(`Error fetching branches: ${error}. Defaulting to all branches.`);
    }
  }, [error, branches]);

const handleChange = (optionValue) => {
  if (!optionValue) {
    toast.error('Showing all transactions')
    dispatch(setSelectedSource(null));
    setSelectedSource(null)
    return;
  }

  const matched = branches.find(
    (src: BranchWithTotals) => src?.branch?.id_on_device === optionValue
  );
  if (matched) {
    dispatch(setSelectedSource(matched?.branch));
    toast.success(`Selected ${matched.totals.which_company} - ${matched.branch.name} as the current branch.`, {
      duration: 5000
    })
    setSourceMatched(matched)
  }
};


  return (
    <div className="min-w-35 grid grid-cols-1 sm:grid-cols-2">
      {sourceMatched && (
        <Button variant="link_primary" disabled>{sourceMatched?.totals.which_company}</Button>
      )}
       
      <Select
        options={options}
        placeholder={loading ? "Loading..." : "All Branches"}
        onChange={handleChange}
        className="text-xs"
      />
    </div>
  );
};

export default IncomeSourceSelect;
