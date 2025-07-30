import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import { Metadata } from "next";
import React from "react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Financial Forecast",
  description:
    "Cashbook Assist web dynamic forecast module",
  // other metadata
};

export default function CashbookForecast() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Financial Forecast" />
      <div className="space-y-6">
        <ComponentCard title="Forecast" desc="Ai generated financial forecast based on your historical data">
          <MonthlyTarget />
        </ComponentCard>
      </div>
    </div>
  );
}
