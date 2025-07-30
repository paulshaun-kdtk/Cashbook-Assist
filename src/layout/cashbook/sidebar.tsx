"use client";
import React, { useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { HorizontaLDots, TableIcon } from "../../icons"
import { TbFileAnalytics, TbReportMoney } from "react-icons/tb";
import { FaMoneyCheckAlt } from "react-icons/fa";
import { MdSummarize } from "react-icons/md";
import PrivateRoute from "@/redux/auth/privateRoute";

const cashbookItems = [
  {
    name: "Transactions",
    icon: <FaMoneyCheckAlt />,
    path: "/cashbook-assist/dashboard?tab=transactions",
  },
  {
    name: "Cash Summary",
    icon: <MdSummarize />,
    path: "/cashbook-assist/summary",
  },
  {
    name: "Financial Forecast",
    icon: <TableIcon />,
    path: "/cashbook-assist/forecast",
  },
    {
    name: "Cashbooks",
    icon: <TbFileAnalytics />,
    path: "/cashbook-assist/cashbooks",
  },
    {
    name: "Companies",
    icon: <TbReportMoney />,
    path: "/cashbook-assist/companies",
  },
];

const CashbookSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const isActive = useCallback(
    (path: string) => pathname?.startsWith(path.split("?")[0]),
    [pathname]
  );

  return (
    <PrivateRoute>
      <aside
        className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
          ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0`}
        onMouseEnter={() => !isExpanded && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Logo */}
        <div
          className={`py-8 flex ${
            !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
        >
          <Link href="/dashboard">
            {isExpanded || isHovered || isMobileOpen ? (
              <>
                <Image
                  className="dark:hidden rounded-xl"
                  src="/favicon.svg"
                  alt="Logo"
                  width={50}
                  height={32}
                />
                <Image
                  className="hidden dark:block rounded-xl"
                  src="/favicon.svg"
                  alt="Logo"
                  width={50}
                  height={32}
                />
              </>
            ) : (
              <Image src="/favicon.svg" alt="Logo" width={32} height={32} />
            )}
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex flex-col overflow-y-auto no-scrollbar">
          <nav>
            <h2
              className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
              }`}
            >
              {isExpanded || isHovered || isMobileOpen ? "Cashbook Assist" : <HorizontaLDots />}
            </h2>
            <ul className="flex flex-col gap-4">
              {cashbookItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    className={`menu-item group ${
                      isActive(item.path)
                        ? "menu-item-active"
                        : "menu-item-inactive"
                    }`}
                  >
                    <span
                      className={`${
                        isActive(item.path)
                          ? "menu-item-icon-active"
                          : "menu-item-icon-inactive"
                      }`}
                    >
                      {item.icon}
                    </span>
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <span className="menu-item-text">{item.name}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </PrivateRoute>
  );
};

export default CashbookSidebar;
