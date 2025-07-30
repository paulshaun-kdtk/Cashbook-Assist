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
import { fetchIncomeSourcesThunk } from "@/redux/api/thunks/income_sources/fetch";
import { fetchLastStockItemThunk, fetchStockThunk } from "@/redux/api/thunks/stock/fetch";
import { StockItem } from "@/components/tables/stock";
import { createStockItemThunk } from "@/redux/api/thunks/stock/post";
import { setSelectedIncomeSource } from "@/redux/api/slices/income_sourceSlice";

export function StockItemCreateForm() {
  const unique_id = localStorage.getItem('unique_id');
  const { isOpen, openModal, closeModal } = useModal();
  const dispatch =  useDispatch()
  const { loading, stock_items } = useSelector((state: any) => state.stock_items);
  const { selected_source, income_sources } = useSelector((state: any) => state.income_sources);
  const [itemName, setItemName] = React.useState("");
  const [identifier, setIdentifier] = React.useState("");
  const [whichKey, setWhichKey] = React.useState("");
  const [itemCost, setItemCost] = React.useState("0.00")
  const [buyingPrice, setBuyingPrice] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [quantity, setQuantity] = React.useState("1");


  React.useEffect(() => {
    setIdentifier(`${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${unique_id}`)

    setWhichKey(unique_id || "");
    dispatch(fetchIncomeSourcesThunk(unique_id))
    dispatch(fetchStockThunk(unique_id))
  }, [dispatch]);

  const handleSave = async  () => {
    if (!selected_source) {
      toast.error("Please select an income source for this stock item.");
      return;
    }

    const last_stock_item = await dispatch(fetchLastStockItemThunk(unique_id)).unwrap();

    if (!last_stock_item) {
      toast.error("Failed to fetch last stock entry. Please try again.");
      console.error(last_stock_item)
      return;
    }

    if (!itemName) {
      toast.error("Item name is required.");
      return;
    }

    if (itemName === stock_items.find((item: StockItem) => item.item_name === itemName && item.income_source === selected_source.id_on_device)) {
      toast.error("An item with the same name already exists for this branch please choose a different name.", {
        duration: 5000
      });
      return;
    }

    const newItem = {
      item_name: itemName,
      identifier,
      which_key: whichKey,
      item_cost: parseFloat(itemCost),
      buying_price: parseFloat(buyingPrice),
      quantity: Number(quantity),
      id_on_device: last_stock_item && last_stock_item?.id_on_device + 1 || 1,
      income_source: selected_source?.id_on_device,
      createdAt: new Date().toISOString(),
    };


    try {
      const serverStockItem = await dispatch(createStockItemThunk({data: newItem})).unwrap()
      if (serverStockItem) {
        toast.success("Stock Item created successfully!")
        closeModal()
      }
    } catch (error) {
      console.error("Error creating stock item:", error);
      toast.error("Failed to create stock item. Please try again.");
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
        Add New Stock Item
      </Button>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px]">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-10">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Create New Item
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Enter item details accurately before saving.
            </p>
          </div>
<form className="flex flex-col" onSubmit={(e) => e.preventDefault()}>
  <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
    <div>
      <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
        Stock Information
      </h5>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        <div>
          <Label>Item Name</Label>
          <Input
            type="text"
            placeholder="e.g. Tendekai Hove"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
        </div>

        <div>
          <Label>Selling Price</Label>
          <Input
            type="float"
            placeholder="0.00"
            value={itemCost}
            onChange={(e) => setItemCost(e.target.value)}
          />
        </div>

        <div>
          <Label>Buying Price</Label>
          <Input
            type="float"
            placeholder="0.00"
            value={buyingPrice}
            onChange={(e) => setBuyingPrice(e.target.value)}
          />
        </div>

        <div>
          <Label>Current Quantity</Label>
          <Input
            type="number"
            placeholder="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>

        <div>
          <Label>Category</Label>
          <Input
            type="text"
            placeholder="eg Electronics"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
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

      </div>
    </div>
  </div>

  <div className="flex items-center gap-3 px-2 lg:justify-end mt-6">
    <Button size="sm" variant="outline" onClick={closeModal}>
      Cancel
    </Button>
    <Button size="sm" onClick={handleSave} disabled={loading}>
      {loading ? "Saving..." : "Save Item"}
    </Button>
  </div>
</form>

        </div>
      </Modal>
    </div>
  );
}
