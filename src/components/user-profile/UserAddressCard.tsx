"use client";
import React, { useEffect } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/components/input/InputField";
import Label from "../form/components/Label";
import { confirmUserNameBelongsToUser } from "@/redux/auth/confirmUser";
import { useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";


export default function UserAddressCard() {
  const userObject = useSelector((state: any) => state.auth.user);
  const { isOpen, openModal, closeModal } = useModal();
  const [privateId, setPrivateId] = React.useState("");
  const [checkingUsername, setCheckingUsername] = React.useState(false);
  const [usernameAvailable, setUsernameAvailable] = React.useState<boolean | null>(null);

  const searchParams = useSearchParams()

  const uniqueIdRequired = searchParams.get("required") === "uniqueId" ? true : false

  useEffect(() => {
    if (uniqueIdRequired) {
      openModal()
    }
  }, [uniqueIdRequired, openModal])
  
  const handleSave = () => {
    localStorage.setItem("unique_id", privateId);
    closeModal();
  };

  async function handleUsernameCheck() {
    if (!privateId) {
      setUsernameAvailable(null); // reset to neutral state
      return;
    }
    setCheckingUsername(true);
    try {
      const result = await confirmUserNameBelongsToUser(userObject.email, privateId);
      setUsernameAvailable(result.success);
    } catch (error) {
      console.error("Error checking username:", error);
      setUsernameAvailable(false);
    } finally {
      setCheckingUsername(false);
    }
  }

  const disabled = usernameAvailable ? false : true;

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              Your user_name / unique identifier
            </h4>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
             <span className="text-sm font-medium text-yellow-500 dark:text-yellow-400/90">
             !This identifier is closely tied to all of your data and is used to access your confidential financial data, do not share it with anyone for your personal data security.
             If prompted to change it by our team click on the edit button to update it.
             If you feel this identifier is compromised, please contact support immediately to have it updated.
             </span>
            </div>
          </div>

          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                fill=""
              />
            </svg>
            Edit
          </button>
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Confirm username
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Confirm your system username. <a href="mailto:support@shsoftwares.com?subject=Username%20Recovery" className="underline text-gray-500 dark:text-gray-300">Contact support</a> if {"you've"} forgotten it or need assisance.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <span className="font-semibold text-gray-800 dark:text-white/90">{userObject?.email}</span>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5">
                <div>
                  <Label>Enter your username and click anywhere outside the input to validate</Label>
                  <Input type="text" name="private_id"   onChange={(e) => {
                    setUsernameAvailable(null);  // no validation result yet
                    setPrivateId(e.target.value);
                  }}
                  onBlur={handleUsernameCheck} error={usernameAvailable === false} success={usernameAvailable === true} />
                  {checkingUsername && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Validating...
                    </p>
                  )}
                  {usernameAvailable === false && (
                    <p className="mt-2 text-sm text-red-500 dark:text-red-400">
                      This user_name does not match with the one you signed up with. Click <a className="text-emerald-500 underline text-base" href={"/"} target="__blank" >here</a> if you have forgotten it and need help recovering it... or contact support.
                    </p>
                  )}
                  {usernameAvailable === true && (
                    <p className="mt-2 text-sm text-green-500 dark:text-green-400">
                      click on save to confirm.
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" onClick={handleSave} disabled={disabled}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
