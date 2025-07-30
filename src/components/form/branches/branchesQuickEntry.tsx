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
import { fetchAccountsThunk } from "@/redux/api/thunks/accounts/fetch";
import { formatTextTruncateNoDecoration } from "@/utils/formatters/text_formatter";
import {  useSearchParams } from "next/navigation";
import { fetchIncomeSourcesThunk, fetchLastIncomeSourceThunk } from "@/redux/api/thunks/income_sources/fetch";
import { createIncomeSource } from "@/redux/api/thunks/income_sources/post";
import { Branch } from "@/components/tables/branches";
import TextArea from "../components/input/TextArea";
import { HexColorPicker } from "react-colorful";
import FileInput from "../components/input/FileInput";

export function BranchesQuickEntry() {
  const unique_id = localStorage.getItem('unique_id');
  const params = useSearchParams()
  const { isOpen, openModal, closeModal } = useModal();
  const dispatch =  useDispatch()
  const { loading: accountsLoading, accounts } = useSelector((state: any) => state.accounts);
  const { loading, income_sources} = useSelector((state: any) => state.income_sources);
  const [name, setName] = React.useState("");
  const [identifier, setIdentifier] = React.useState("");
  const [account, setAccount] = React.useState("");
  const [color, setColor] = React.useState("#38bdf8");
  const [logo, setLogo] = React.useState("");
  const [description, setDescription] = React.useState("");

  React.useEffect(() => {
    if (params.get('new') === 'true') {
      openModal();
    }
  }, [params, openModal]);

  React.useEffect(() => {
    setIdentifier(`${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${unique_id}`);
    dispatch(fetchAccountsThunk(unique_id));
    dispatch(fetchIncomeSourcesThunk(unique_id));
  }, [dispatch, unique_id]);

  const handleSave = async  () => {
    const lastIncomeSource = await dispatch(fetchLastIncomeSourceThunk(unique_id)).unwrap();

    if (!name) {
      toast.error("Branch name is required.");
      return;
    }

    if (name === income_sources.find((item: Branch) => item.name === name)) {
      toast.error("An branch with the same name already exists.");
      return;
    }

    const newBranch = {
      name,
      identifier: formatTextTruncateNoDecoration(identifier, 35),
      which_key: unique_id,
      description,
      account,
      color,
      id_on_device: lastIncomeSource ? lastIncomeSource.id_on_device + 1 : 1,
      createdAt: new Date().toISOString(),
    };


    try {
      const serverBranch = await dispatch(createIncomeSource({data: newBranch})).unwrap()
      if (serverBranch) {
        closeModal()
        toast.success("Branch created successfully!", {
          duration: 5000,
        });
        dispatch(fetchIncomeSourcesThunk(unique_id));
      }
    } catch (error) {
      console.error("Error creating branch:", error);
      toast.error("Failed to create branch. Please try again.");
      closeModal();
    }
  };

  return (
    <div>
      <Button onClick={openModal} variant="link_primary">
        Add New Branch
      </Button>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[950px]">
        <div className="no-scrollbar relative w-full max-w-[950px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-10">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Create New Branch
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Enter branch details accurately before saving.
            </p>
          </div>
            <form className="flex flex-col" onSubmit={(e) => e.preventDefault()}>
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
                <div>
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                    Branch Information
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">

                    <div>
                    <Label>Branch Name</Label>
                    <Input
                        type="text"
                        placeholder="provide a name for your branch"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                  <div>
                    <Label>Which Company</Label>
                    <Select 
                    className="max-w-sm"
                    placeholder="Which Account is this branch associated with?"
                    options={
                      accounts.map((item) => ({
                        value: item.id_on_device,
                        label: item.name,
                      }))
                    }
                    onChange={(selected) => {
                      setAccount(selected);
                    }}
                    />
                    </div>

                  </div>

                  <div className="grid-cols-12 mt-3">
                    <Label>Description</Label>
                    <TextArea
                        placeholder="describe your business (optional)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                    <div className="grid-cols-12 mt-3">
                    <Label>Categoize By color</Label>
                      <HexColorPicker color={color} onChange={setColor} className="min-w-full" />
                    </div>

                    <div className="grid-cols-12 mt-3">
                      <Label>Branch Logo (optional)</Label>
                      <FileInput />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 px-2 lg:justify-end mt-6">
                <Button size="sm" variant="outline" onClick={closeModal}>
                Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : "Save Branch"}
                </Button>
            </div>
            </form>
        </div>
      </Modal>
    </div>
  );
}
