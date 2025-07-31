"use client";
import React from "react";
import { useModal } from "@/hooks/useModal";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/components/Label";
import Input from "@/components/form/components/input/InputField";
import Select from "@/components/form/components/Select";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Account } from "@/components/tables/accounts";
import { fetchCashbookAccountsThunk } from "@/redux/api/thunks/accounts/fetch";
import { currencyList } from "@/lib/data/currencyList";
import { useRouter } from "next/navigation";
import { createCashbookThunk } from "@/redux/api/thunks/cashbooks/post";
import { fetchCashbookThunk } from "@/redux/api/thunks/cashbooks/fetch";
import { RootState } from "@/redux/store";

export function CashbookQuickEntryForm() {
  const unique_id = localStorage.getItem('unique_id');
  const router = useRouter()
  const { isOpen, openModal, closeModal } = useModal();
  const dispatch =  useDispatch()
  const { loading, cashbooks } = useSelector((state: RootState) => state.cashbooks);
  const { accounts } = useSelector((state: RootState) => state.accounts);
  const [name, setName] = React.useState("");
  const [description, setAccountDescription] = React.useState("");
  const [currency, setCurrency] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [currencySymbol, setCurrencySymbol] = React.useState("");

  React.useEffect(() => {
    dispatch(fetchCashbookAccountsThunk(unique_id));
  }, [dispatch, unique_id]);

  const handleSave = async  () => {
    if (!name) {
      toast.error("Cashbook name is required.");
      return;
    }

    if (name === cashbooks.find((cashbook: Account) => cashbook.name === name)) {
    closeModal()
      toast.error("A cashbook with a similar name already exists. Please choose a different name");
      return;
    }

    const newCompany = {
      name,
      which_key: unique_id,
      description,
      which_company: company,
      currency,
      currency_symbol: currencySymbol,
    };


    try {
      const serverCompany = await dispatch(createCashbookThunk({data: newCompany})).unwrap()
      if (serverCompany) {
        closeModal()
        toast.success("Cashbook created successfully!", {
          duration: 5000,
        });
        dispatch(fetchCashbookThunk(unique_id));
        router.replace('/cashbook-assist/dashboard')
      }
    } catch (error) {
      console.error("Error creating cashbook:", error);
      toast.error("Failed to create cashbook. Please try again.");
      closeModal();
    }
  };

  return (
    <div>
      <Button onClick={openModal} variant="link_primary">
        Add New Cashbook
      </Button>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[950px]">
        {loading && (<><p className="dark:text-gray-300 text-sm">Loading...</p></>)}
        <div className="no-scrollbar relative w-full max-w-[950px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-10">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Create New Cashbook
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Enter cashbook details accurately before saving.
            </p>
          </div>
            <form className="flex flex-col" onSubmit={(e) => e.preventDefault()}>
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
                <div>
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                    Cashbook Information
                </h5>

                <div className="grid grid-cols-1">
                    <div>
                    <Label>Cashbook Name</Label>
                    <Input
                        type="text"
                        placeholder="provide a name for your cashbook"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    </div>

                <div className="mt-2 grid grid-cols-1"> 
                    <Label>Description (optional)</Label>
                    <Input
                        type="text"
                        placeholder="Description or a tagline(optional)"
                        value={description}
                        onChange={(e) => setAccountDescription(e.target.value)}
                    />
                    </div>

                    <div className="mt-2 grid grid-cols-1">
                        <Label>Select base currency</Label>
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
                            setCurrencySymbol(selectedCurrency.symbol);
                            }}
                        />
                        </div>
                    <div className="mt-2 grid grid-cols-1">
                        <Label>Select Company</Label>
                        <Select
                            placeholder="Select Company"
                            searchable
                            options={accounts.map(item => ({
                            value: item.$id,
                            label: item.name,
                            }))}
                            onChange={(selected) => {
                            const selectedCompany = accounts.find(c => c.$id === selected);
                            setCompany(selectedCompany.$id);
                            }}
                        />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 px-2 lg:justify-end mt-6">
                <Button size="sm" variant="outline" onClick={closeModal}>
                Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={loading || !name}>
                {loading ? "Saving..." : "Save Cashbook"}
                </Button>
            </div>
            </form>
        </div>
      </Modal>
    </div>
  );
}
