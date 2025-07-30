"use client";
import { useDispatch, useSelector } from "react-redux";
import Alert from "../ui/alert/Alert";
import { confirmHasSubscriptionThunk } from "@/redux/api/thunks/users/subFetch";
import { useEffect, useState } from "react";
import Button from "../ui/button/Button";
import { confirmRemoteUserThunk } from "@/redux/api/thunks/users/userFetch";
import Link from "next/dist/client/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export const FreeTrialBanner = () => {
    const dispatch = useDispatch()
    const router = useRouter()
    const { user } = useSelector((state) => state.auth);
    const { is_on_free_trial, time_remaining, other_subscriptions } = useSelector((state) => state.subscription);
    const [remoteExists, setRemoteExists] = useState(() => !!localStorage.getItem("remote_user"));
    const [showRemote, setShowRemote] = useState(false);
    const [showBanner, setShowBanner] = useState(false);

useEffect(() => {
  const checkRemoteUser = async () => {
    try {
      const result = await dispatch(confirmRemoteUserThunk(user.email)).unwrap();
      return result;
    } catch (error) {
      console.error("Failed to confirm remote user:", error);
      return null;
    }
  };

  const handleRemoteUserUpdate = () => {
    const updatedRemoteUser = localStorage.getItem("remote_user");
    if (updatedRemoteUser) {
      setRemoteExists(true);
    }
  };

  window.addEventListener("remote_user_updated", handleRemoteUserUpdate);

  if (!localStorage.getItem("remote_user")) {
    (async () => {
      const result = await checkRemoteUser();
      if (result && result.success) {
        localStorage.setItem("remote_user", JSON.stringify(result.user));
        window.dispatchEvent(new Event("remote_user_updated"));
      } else {
        setRemoteExists(false);
      }
    })();
  }

  return () => {
    window.removeEventListener("remote_user_updated", handleRemoteUserUpdate);
  };
}, [dispatch, user]);


useEffect(() => {
  if (!other_subscriptions?.length) {
    router.replace("/signup");
    return;
  }

  const hasMain = other_subscriptions.some(item => item.subscription_system === "main");
  const hasCashbook = other_subscriptions.some(item => item.subscription_system === "cashbook");
  const hasInvoice = other_subscriptions.some(item => item.subscription_system === "invoicing");

  if (hasMain) {
    // User has a valid Book Assist account – do nothing
    return;
  }

  if (hasCashbook) {
    toast.error(
      "You don't have a Book Assist account. Please sign up to get started.",
      { duration: 7000 }
    );
    router.replace("/cashbook-assist/dashboard");
    return;
  }

  if (hasInvoice) {
    toast.error(
      "You don't have a Book Assist account. Please sign up to get started.",
      { duration: 7000 }
    );
    router.replace("/invoice-assist/dashboard");
    return;
  }

  // No recognizable subscriptions – default fallback
  router.replace("/signup");
}, [other_subscriptions, router]);

useEffect(() => {
const checkSubscription = async () => {
    if (user) {
        const response = await dispatch(confirmHasSubscriptionThunk({email: user.email,  which_key: "main"})).unwrap() 
        if (!response) {
            toast.error("Something went wrong with your subscription validation, please try again. Contact support if the issue persist", {
              duration: 7000
            });
            router.replace("/")
          }
        }
}
checkSubscription();
}, [dispatch, user, router]);

    return (
    <>
      {!remoteExists && !showRemote && (
        <Link href={"/profile?no-remote=true"} className="w-full">
          <Button
            onClick={() => setShowRemote(true)}
            variant="link_error"
            className="w-full"
            >
            Confirm user details
          </Button>
        </Link>
      )}

    {is_on_free_trial && showBanner ? (
        <Alert
          variant="warning"
          title="Free Trial Mode"
          message={`You are currently on a free trial. ${time_remaining} days remaining.`}
          linkHref="/no-sub?type=free_trial"
          linkText="Upgrade Now"
          dismissable={true}
          dismissText="Dismiss"
          dismissAction={() => setShowBanner(false)}
          showLink
          />
      ) : is_on_free_trial ? (
          <Button
          onClick={() => setShowBanner(true)}
          variant="link_warning"
          className="w-full"
          >
          Free Trial Mode
          </Button>
    ) : (
      <></>
    )}
  </>
    );
}