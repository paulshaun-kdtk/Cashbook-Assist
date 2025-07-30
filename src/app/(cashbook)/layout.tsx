"use client";

import { useSidebar } from "@/context/SidebarContext";
import CashbookSidebar from "@/layout/cashbook/sidebar";
import Backdrop from "@/layout/Backdrop";
import React from "react";
import CashbookHeader from "@/layout/cashbook/header";
import ClientProviders from "@/context/reduxProviderContext";
import '../globals.css'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientProviders>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </ClientProviders>
  );
}

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
      <div className="min-h-screen xl:flex">
        {/* Sidebar and Backdrop */}
        <CashbookSidebar />
        <Backdrop />
        {/* Main Content Area */}
        <div
          className={`flex-1 transition-all  duration-300 ease-in-out ${mainContentMargin}`}
          >
          {/* Header */}
          <CashbookHeader />
          {/* Page Content */}
          <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
        </div>
      </div>
  );
}
