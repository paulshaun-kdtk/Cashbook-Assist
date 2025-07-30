import { Metadata } from "next";
import React from "react";
import CashbookClient from "./dashboardClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cashbook Assisst",
  description:
    "Cashbook Assist web dynamic forecast module",
  // other metadata
};

export default function CashbookDashboard() {
  return (
    <div>
        <CashbookClient />
    </div>
  );
}
