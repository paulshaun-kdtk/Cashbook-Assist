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
import { setSelectedIncomeSource } from "@/redux/api/slices/income_sourceSlice";
import { fetchIncomeSourcesThunk } from "@/redux/api/thunks/income_sources/fetch";
import { fetchCustomersThunk, fetchLastCustomer } from "@/redux/api/thunks/customers/fetch";
import { createCustomerEntryThunk } from "@/redux/api/thunks/customers/post";

export function CustomerCreateForm() {
  const unique_id = localStorage.getItem('unique_id');
  const { isOpen, openModal, closeModal } = useModal();
  const dispatch =  useDispatch()
  const { loading, customers } = useSelector((state: any) => state.customers);
  const { selected_source, income_sources } = useSelector((state: any) => state.income_sources);
  const [fullName, setFullName] = React.useState("");
  const [identifier, setIdentifier] = React.useState("");
  const [whichKey, setWhichKey] = React.useState("");
  const [physicalAddress, setPhysicalAddress] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");


  React.useEffect(() => {
    setIdentifier(`${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${unique_id}`)

    setWhichKey(unique_id || "");
    dispatch(fetchIncomeSourcesThunk(unique_id))
    dispatch(fetchCustomersThunk(unique_id))
  }, [dispatch]);

  const handleSave = async  () => {
    if (!selected_source) {
      toast.error("Please select an income source for this customer.");
      return;
    }

    const lastCustomer = await dispatch(fetchLastCustomer(unique_id)).unwrap();

    if (!lastCustomer) {
      toast.error("Failed to fetch last customer. Please try again.");
      console.error(lastCustomer)
      return;
    }

    if (!fullName) {
      toast.error("Customer name is required.");
      return;
    }

    if (fullName === customers.find(customer => customer.fullName === fullName) || email === customers.find(customer => customer.email === email)) {
      toast.error("Customer with similar details already exists.");
      return;
    }

    const newCustomer = {
      fullName,
      identifier,
      which_key: whichKey,
      physicalAddress,
      email,
      phoneNumber,
      id_on_device: lastCustomer.id_on_device + 1 || 1,
      income_source: selected_source?.id_on_device,
      createdAt: new Date().toISOString(),
    };


    try {
      const serverCustomer = await dispatch(createCustomerEntryThunk({data: newCustomer})).unwrap()
      if (serverCustomer) {
        toast.success("Customer created successfully!")
        closeModal()
      }
    } catch (error) {
      console.error("Error creating customer:", error);
      toast.error("Failed to create customer. Please try again.");
      closeModal();
    }
  };

  const handleBranchChange = (e) => {
    if (!e) {
      toast.error("Error selecting branch. Please try again.");
    } else {
      const selectedBranch = income_sources.find(item => item.$id === e);
      if (selectedBranch) {
        dispatch(setSelectedIncomeSource(selectedBranch));
      }
    }
  };

  return (
    <div>
      <Button onClick={openModal} variant="link_primary">
        Add New Customer
      </Button>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px]">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-10">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Create New Customer
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Enter customer details accurately before saving.
            </p>
          </div>
<form className="flex flex-col" onSubmit={(e) => e.preventDefault()}>
  <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
    <div>
      <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
        Customer Information
      </h5>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        <div>
          <Label>Full Name</Label>
          <Input
            type="text"
            placeholder="e.g. Tendekai Hove"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div>
          <Label>Phone Number</Label>
          <Input
            type="tel"
            placeholder="+263 77 123 4567"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>

        <div>
          <Label>Email Address</Label>
          <Input
            type="email"
            placeholder="example@mail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="customerSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-50 mb-1">Select Branch</label>
            <Select
              placeholder='Select Branch'
              options={income_sources.map(item => ({
                value: item.$id,
                label: item.name,
            }))}
            onChange={handleBranchChange}
              />
        </div>

        <div className="md:col-span-2">
          <Label>Physical Address</Label>
          <Input
            placeholder="Street, City, Country"
            value={physicalAddress}
            onChange={(e) => setPhysicalAddress(e.target.value)}
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
      {loading ? "Saving..." : "Save Customer"}
    </Button>
  </div>
</form>

        </div>
      </Modal>
    </div>
  );
}
