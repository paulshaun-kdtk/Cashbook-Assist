import { CashbookCompanyQuickEntryForm } from "@/components/cashbook/forms/companyQuickEntryForm";
import AccountsTableCashbook from "@/components/cashbook/tables/companyList";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Company Management | Cashbook Assist",
  description:
    "Cashbook Assist web company overview & management module",
  // other metadata
};

export default function Companies() {
  const actions = (
    <CashbookCompanyQuickEntryForm />
  )
  return (
    <div>
      <PageBreadcrumb pageTitle="Companies" />
      <div className="space-y-6">
        <ComponentCard title="Companies Table" actions={actions}>
          <AccountsTableCashbook />
        </ComponentCard>
      </div>
    </div>
  );
}
