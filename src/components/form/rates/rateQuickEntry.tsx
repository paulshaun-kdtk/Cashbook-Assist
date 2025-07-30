"use client";
import React from "react";
import { useModal } from "@/hooks/useModal";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Label from "../components/Label";
import Input from "../components/input/InputField";
import { useDispatch, useSelector } from "react-redux";
import Select from "../components/Select";
import toast from "react-hot-toast";
import { fetchLastExchangeRateThunk } from "@/redux/api/thunks/exchangerates/fetch";
import { createExchangeRateThunk } from "@/redux/api/thunks/exchangerates/post";
import { currencyList } from "@/lib/data/currencyList";

export function ExchangeRateQuickEntryForm() {
  const unique_id = localStorage.getItem('unique_id');
  const { isOpen, openModal, closeModal } = useModal();
  const dispatch =  useDispatch()
  const { loading, rate } = useSelector((state: any) => state.rates);
  const [currency, setCurrency] = React.useState("");
  const [foreign_currency, setForeignCurrency] = React.useState("");
  const [whichKey, setWhichKey] = React.useState("");
  const [base_rate, setBaseRate] = React.useState("");
  const [foreign_rate, setForeignRate] = React.useState("");
  const [effective_date, setEffectiveDate] = React.useState(new Date());


  React.useEffect(() => {
    setWhichKey(unique_id || "");
  }, [unique_id]);

  const handleSave = async  () => {
    // if (!selected_source) {
    //   toast.error("Please select an income source for this customer.");
    //   return;
    // }

    const lastRate = await dispatch(fetchLastExchangeRateThunk(unique_id)).unwrap();

    // if (!lastRate) {
    //   toast.error("Failed to fetch last rate model. Please try again.");
    //   console.error(lastRate)
    //   return;
    // }

    if (!currency || !foreign_currency || !base_rate || !foreign_rate || !effective_date) {
      toast.error("Please fill all required information.");
      return;
    }


    const newRate = {
      currency,
      foreign_currency,
      which_key: whichKey,
      rate: parseFloat(base_rate),
      foreign_rate: parseFloat(foreign_rate),
      effective_date: new Date(effective_date).toISOString(),
      id_on_device: lastRate ? lastRate.id_on_device + 1 : 1,
    };


    try {
      const serverRate = await dispatch(createExchangeRateThunk({data: newRate})).unwrap()
      if (serverRate) {
        toast.success("Exchange rate created successfully!")
        closeModal()
      }
    } catch (error) {
      console.error("Error creating exchange rate:", error);
      toast.error("Failed to create exchange rate. Please try again.");
      closeModal();
    }
  };

  return (
    <div>
      <Button onClick={openModal} variant="link_primary">
        Add New Exchange Rate
      </Button>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px]">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-10">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Create New Exchange Rate
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Enter rate details accurately before saving.
            </p>
          </div>
<form className="flex flex-col" onSubmit={(e) => e.preventDefault()}>
  <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
    <div>
      <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
        Exchange Rate Information
      </h5>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        <div>
          <Label>Base Currency</Label>
         <Select
            placeholder="Select Currency"
            searchable
            options={currencyList.map(item => ({
            value: item.code, // could also pass item or JSON.stringify(item) if you want full object
            label: `${item.currency} (${item.symbol})`,
            }))}
            onChange={(selected) => {
            const selectedCurrency = currencyList.find(c => c.code === selected);
            setCurrency(selectedCurrency.code);
            }}
            />
        </div>

        <div>
          <Label>Foreign Currency</Label>
         <Select
            placeholder="Select Currency"
            searchable
            options={currencyList.map(item => ({
            value: item.code, // could also pass item or JSON.stringify(item) if you want full object
            label: `${item.currency} (${item.symbol})`,
            }))}
            onChange={(selected) => {
            const selectedCurrency = currencyList.find(c => c.code === selected);
            setForeignCurrency(selectedCurrency.code);
            }}
            />
        </div>
        <div>
          <Label>Base Rate</Label>
          <Input
            type="text"
            placeholder="0.00"
            value={base_rate}
            onChange={(e) => setBaseRate(e.target.value)}
          />
        </div>

        <div>
          <Label>Foreign Rate</Label>
          <Input
            type="text"
            placeholder="0.00"
            value={foreign_rate}
            onChange={(e) => setForeignRate(e.target.value)}
          />
        </div>
    </div>
  </div>

  <div className="flex items-center gap-3 px-2 lg:justify-end mt-6">
    <Button size="sm" variant="outline" onClick={closeModal}>
      Cancel
    </Button>
    <Button size="sm" onClick={handleSave} disabled={loading}>
      {loading ? "Saving..." : "Save Exchange Rate"}
    </Button>
  </div>
  </div>
</form>

        </div>
      </Modal>
    </div>
  );
}
