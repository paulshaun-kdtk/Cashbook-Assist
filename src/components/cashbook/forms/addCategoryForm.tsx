"use client";
import React from "react";
import { useModal } from "@/hooks/useModal";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/components/input/InputField";
import Label from "@/components/form/components/Label";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { HexColorPicker } from "react-colorful";
import { fetchCategoriesThunk } from "@/redux/api/thunks/category/fetch";
import { createCategoryThunk } from "@/redux/api/thunks/category/post";

export function CategoryQuickEntry() {
  const unique_id = localStorage.getItem('unique_id');
  const { isOpen, openModal, closeModal } = useModal();
  const dispatch =  useDispatch()
  const { loading } = useSelector((state: any) => state.categories);
  const [name, setName] = React.useState("");
  const [color, setColor] = React.useState("#38bdf8");

  React.useEffect(() => {
    dispatch(fetchCategoriesThunk(unique_id));
  }, [dispatch, unique_id]);

  const handleSave = async  () => {
  
    if (!name) {
      toast.error("Category name is required.");
      return;
    }

    const newBranch = {
      name,
      which_key: unique_id,
      color,
    };

    try {
      const category = await dispatch(createCategoryThunk({data: newBranch})).unwrap()
      if (category) {
        closeModal()
        toast.success("Category created successfully!", {
          duration: 5000,
        });
        dispatch(fetchCategoriesThunk(unique_id));
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Failed to create category. Please try again.");
      closeModal();
    }
  };

  return (
    <div>
      <Button onClick={openModal} variant="link_primary">
        Add new category
      </Button>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[950px]">
        <div className="no-scrollbar relative w-full max-w-[950px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-10">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Create New Category
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Enter category details carefully before saving.
            </p>
          </div>
            <form className="flex flex-col" onSubmit={(e) => e.preventDefault()}>
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
                <div className="grid grid-cols-1 gap-x-6 gap-y-2">
                    <div className="grid-cols-12">
                    <Label>Category Name</Label>
                    <Input
                        type="text"
                        placeholder="provide a name for your category"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="grid-cols-12 mt-3">
                    <Label>CategoryColor(optional)</Label>
                      <HexColorPicker color={color} onChange={setColor} className="min-w-full" />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 px-2 lg:justify-end">
                <Button size="sm" variant="outline" onClick={closeModal}>
                Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : "Add Category"}
                </Button>
            </div>
            </form>
        </div>
      </Modal>
    </div>
  );
}
