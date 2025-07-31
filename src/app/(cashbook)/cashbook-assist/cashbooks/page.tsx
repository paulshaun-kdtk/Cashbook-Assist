import { CashbookQuickEntryForm } from "@/components/cashbook/forms/addCashbookForm";
import CashbooksTable from "@/components/cashbook/tables/cashbooksList";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cashbook Management | Cashbook Assist",
  description:
    "Cashbook Assist web cashbook overview & management module",
  // other metadata
};

export default function Companies() {
  const actions = (
    <CashbookQuickEntryForm />
  )
  return (
    <div>
      <PageBreadcrumb pageTitle="Your cashbooks" />
      <div className="space-y-6">
        <ComponentCard title="Cashbooks" desc="manage your cashbook entries efficiently" actions={actions}>
          <CashbooksTable />
        </ComponentCard>
      </div>
    </div>
  );
}
