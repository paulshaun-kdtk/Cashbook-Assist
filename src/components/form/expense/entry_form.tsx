"use client";
import React from "react";
// import { useSelector } from "react-redux";
import { useModal } from "@/hooks/useModal";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Input from "../components/input/InputField";
import Label from "../components/Label";
import TextArea from "../components/input/TextArea";
import Switch from "../components/switch/Switch";
import { useSelector } from "react-redux";

export function ExpenseQuickEntry() {
    const { isOpen, openModal, closeModal } = useModal();
    const { loading } = useSelector((state: any) => state.income);
    const [isRecurring, setIsRecurring] = React.useState(false);
    const [description, setDescription] = React.useState("");
    const [amount, setAmount] = React.useState(0);


  const handleSave = () => {
    console.log("Saving changes...");

    closeModal();
  };

  return (
    <div className="">
        <Button
          onClick={openModal}
          variant="link_error"
            >
          Quick Entry
        </Button>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px]">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Expenditure Quick Entry
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Please review all of your information before submission.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div>
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Entry Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-1">
                  <div>
                    <Label>Entry Description</Label>
                    <TextArea
                    onChange={(e) => setDescription(e)}    
                    placeholder="Enter a description for the entry"
                    />
                  </div>

                  <div>
                    <Label>Entry Amount</Label>
                    <Input
                      type="number"
                      onChange={(e) => setAmount(parseFloat(e.target.value))}
                      defaultValue="0"
                    />
                  </div>

                  <div>
                    <Switch label="Expense is recurring?" onChange={() => setIsRecurring(!isRecurring)} />
                  </div>
                  {isRecurring && (
                    <span className="text-slate-700 dark:text-slate-400">Recurring entries are automatically created after 30 days, download our mobile app to receive notifications for recurring entry creations</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" onClick={handleSave} disabled={loading}>
                {loading ? (
                    "Processing..."
                ) : (
                    "Save Changes"
                )}
                    </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
