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
import {createAccountEntry} from "@/redux/api/thunks/accounts/post";
import { Account } from "@/components/tables/accounts";
import { fetchAccountsThunk, fetchLastAccountEntry } from "@/redux/api/thunks/accounts/fetch";
import { currencyList } from "@/lib/data/currencyList";
import { formatTextTruncateNoDecoration } from "@/utils/formatters/text_formatter";
import { useRouter } from "next/navigation";

export function CompanyQuickEntryForm() {
  const unique_id = localStorage.getItem('unique_id');
  const router = useRouter()
  const { isOpen, openModal, closeModal } = useModal();
  const dispatch =  useDispatch()
  const { loading, accounts } = useSelector((state: any) => state.accounts);
  const [name, setName] = React.useState("");
  const [identifier, setIdentifier] = React.useState("");
  const [account_number, setAccountNumber] = React.useState("");
  const [account_type, setAccountType] = React.useState("");
  const [account_bank, setAccountBank] = React.useState("");
  const [currency, setCurrency] = React.useState("");
  const [currencySymbol, setCurrencySymbol] = React.useState("");

  React.useEffect(() => {
    setIdentifier(`${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${unique_id}`);
    dispatch(fetchAccountsThunk(unique_id));
  }, [dispatch, unique_id]);

  const handleSave = async  () => {
    const lastAccount = await dispatch(fetchLastAccountEntry(unique_id)).unwrap();

    if (!name) {
      toast.error("Customer name is required.");
      return;
    }

    if (name === accounts.find((account: Account) => account.name === name) || account_number === accounts.find((account: Account) => account.account_number === account_number)) {
      toast.error("An company with similar already exists.");
      return;
    }

    const newCompany = {
      name,
      identifier: formatTextTruncateNoDecoration(identifier, 35),
      which_key: unique_id,
      account_bank,
      account_number,
      account_type,
      id_on_device: lastAccount ? lastAccount.id_on_device + 1 : 1,
      currency,
      currency_symbol: currencySymbol,
    };


    try {
      const serverCompany = await dispatch(createAccountEntry({data: newCompany})).unwrap()
      if (serverCompany) {
        closeModal()
        toast.success("Company created successfully!", {
          duration: 5000,
        });
        dispatch(fetchAccountsThunk(unique_id));
        router.replace('/dashboard')
      }
    } catch (error) {
      console.error("Error creating company:", error);
      toast.error("Failed to create company. Please try again.");
      closeModal();
    }
  };

  return (
    <div>
      <Button onClick={openModal} variant="link_primary">
        Add New Company
      </Button>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[950px]">
        <div className="no-scrollbar relative w-full max-w-[950px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-10">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Create New Company
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Enter company details accurately before saving.
            </p>
          </div>
            <form className="flex flex-col" onSubmit={(e) => e.preventDefault()}>
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
                <div>
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                    Company Information
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <div>
                    <Label>Company Name</Label>
                    <Input
                        type="text"
                        placeholder="provide a name for your business"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    </div>

                    <div>
                    <Label>Account Number</Label>
                    <Input
                        type="text"
                        placeholder="a unique account number for your company"
                        value={account_number}
                        onChange={(e) => setAccountNumber(e.target.value)}
                    />
                    </div>

                    <div>
                    <Label>Account Bank</Label>
                    <Input
                        type="text"
                        placeholder="Your bank name (optional)"
                        value={account_bank}
                        onChange={(e) => setAccountBank(e.target.value)}
                    />
                    </div>

                    <div>
                    <Label>Bank Type</Label>
                    <Input
                        type="text"
                        placeholder="Your bank type (e.g. Savings or Cash)"
                        value={account_type}
                        onChange={(e) => setAccountType(e.target.value)}
                    />
                    </div>

                    <div>
                        <Label>Select Currency</Label>
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
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 px-2 lg:justify-end mt-6">
                <Button size="sm" variant="outline" onClick={closeModal}>
                Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : "Save Company"}
                </Button>
            </div>
            </form>
        </div>
      </Modal>
    </div>
  );
}
