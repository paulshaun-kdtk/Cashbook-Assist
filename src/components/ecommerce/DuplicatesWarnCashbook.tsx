"use client";
import React from "react";
import { selectDuplicates } from "@/redux/api/selectors/identify_duplicates";
import { useDispatch, useSelector } from "react-redux";
import Alert from "../ui/alert/Alert";
import { useRouter } from "next/navigation";
import { checkSessionThunk } from "@/redux/auth/authThunks";
import toast from "react-hot-toast";
import { account, teams } from "@/redux/appwrite/config";
import { fetchAccountsThunk, fetchCashbookAccountsThunk } from "@/redux/api/thunks/accounts/fetch";
import { fetchIncomeSourcesThunk } from "@/redux/api/thunks/income_sources/fetch";

export default function DuplicatesWarnBannerCashbook() {
  const duplicates = useSelector(selectDuplicates);
  const dispatch = useDispatch()
  const { loading } = useSelector((state: any) => state.income);
  const { accounts } = useSelector((state: any) => state.accounts)
  const [uniqueId, setUniqueId] = React.useState<string | null>(null);
  const [showTeamInviteBanner, setShowTeamInviteBanner] = React.useState(false);

  const router = useRouter();

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const id = localStorage.getItem("unique_id");
      setUniqueId(id);
    }

    const verifyUserSessionAndTeam = async () => {
      try {
        const userActive = await dispatch(checkSessionThunk()).unwrap();
        if (!userActive) {
          localStorage.removeItem("user");
          toast.error("Looks like your session has expired, please sign in again.", {
            duration: 5000
          });
          router.replace("/signin");
        } else {
          const memberships = await teams.list();
          if (!memberships.teams.length) {
            setShowTeamInviteBanner(true);
          }
        }
      } catch (error) {
        console.error("Session check or team membership lookup failed", error);
      }
    };

    verifyUserSessionAndTeam();
  }, [dispatch, router]);

    React.useEffect(() => {
      if (uniqueId) {
        dispatch(fetchCashbookAccountsThunk(uniqueId))
      }
    }, [uniqueId, dispatch])

  const handleSendTeamInvite = async () => {
    try {
      const user = await account.get();
      const res = await fetch("/api/users/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: user.email,
          name: user.name
        })
      });
      if (res.ok) {
        toast.success("You have been verified. An email will be sent to you in the next five working days, for now you can continue using the system.", 
          {
            duration: 5000
          }
        );
        setShowTeamInviteBanner(false);
      }
      else {
        const errorData = await res.json();
        toast.error(`Failed to send invite: ${errorData.error || "Unknown error"}`);
        console.error("Error sending team invite:", errorData);
      }
    } catch (error) {
      console.error("Failed to send team invite", error);
      toast.error("Failed to send team invite.");
    }
  };

  return (
    <>
      {!loading && duplicates.length > 0 && (
        <Alert
          variant="error"
          title="Action required!"
          message="Some of your data is duplicating, this may show false financial totals."
          showLink={true}
          linkText="View and Action Duplicates"
          linkHref="/cashbook-assist/sys/anormalies/duplicates"
        />
      )}

      {!uniqueId && !showTeamInviteBanner && (
        <Alert
          variant="warning"
          title="Action required!"
          message="Please visit the settings module and set your user_name. You will not be able to access or post any financial data unless you do so."
          showLink={true}
          linkText="Profile settings"
          linkHref={`/profile?required=uniqueId`}
        />
      )}

      {showTeamInviteBanner  && (
        <Alert
          variant="error"
          title="Action required!"
          message="Looks like your email is not verified. Click here for our system to automatically verify you, you won't be able to interact with the system without continuing."
          showLink={true}
          linkText="Verify email"
          onClickLink={handleSendTeamInvite}
        />
      )}

      {(uniqueId && !showTeamInviteBanner && !accounts.length) && (
        <Alert
          variant="info"
          title="No company found"
          message="It seems you haven't added any companies yet. Please add a company to get started."
          showLink={true}
          linkText="Add company"
          linkHref="/cashbook-assist/companies?new=true"
        />
      )}
      
    </>
  );
}
