import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { EcommerceMetricsCashbook } from "@/components/ecommerce/cashbook/metrics";
import StatisticsChartCashbook from "@/components/ecommerce/cashbook/statCharts";
import { Metadata } from "next";
import React from "react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Financial Forecast",
  description:
    "Cashbook Assist web dynamic forecast module",
  // other metadata
};

export default function CashbookSummary() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Cashbook Summary" />
      <div className="space-y-6">
        <ComponentCard title="Summarry" desc="Your cashbook transaction summary visualisation">
        <EcommerceMetricsCashbook showBalance />
          <StatisticsChartCashbook  />
        </ComponentCard>
      </div>
    </div>
  );
}
