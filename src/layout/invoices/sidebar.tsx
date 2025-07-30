"use client";
import React, { useCallback, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../../context/SidebarContext";
import { HorizontaLDots, ListIcon } from "../../icons";
import { FaFileInvoiceDollar, FaUsers, FaUsersRectangle } from "react-icons/fa6";
import { BsFileEarmarkPlus } from "react-icons/bs";
import { MdOutlineHistory, MdOutlineRequestQuote } from "react-icons/md";
import { IoIosArrowDown } from "react-icons/io";
import PrivateRoute from "@/redux/auth/privateRoute";
import SideBarLogoutWidget from "../SideBarLogoutWidget";

const invoicingItems = [
  {
    name: "Dashboard",
    icon: <FaFileInvoiceDollar />,
    path: "/invoice-assist/dashboard",
  },
  {
    name: "Invoices",
    icon: <ListIcon />,
    subItems: [
      {
        name: "All Invoices",
        icon: <FaFileInvoiceDollar />,
        path: "/invoice-assist/invoices?invoices=true",
      },
      {
        name: "All Quotations",
        icon: <MdOutlineRequestQuote />,
        path: "/invoice-assist/invoices?quotations=true",
      },
      {
        name: "Create Invoice",
        icon: <BsFileEarmarkPlus />,
        path: "/invoice-assist/invoice-quote-builder?new=true&as-invoice=true",
      },
      {
        name: "Create Quotation",
        icon: <BsFileEarmarkPlus />,
        path: "/invoice-assist/invoice-quote-builder?new=true&as-quote=true",
      },
    ],
  },
  {
    name: "Debtors",
    icon: <FaUsers />,
    path: "/invoice-assist/debtors?isPaid=false",
  },
  {
    name: "Customers",
    icon: <FaUsersRectangle />,
    path: "/invoice-assist/customers",
  },
  {
    name: "Financial Forecast",
    icon: <FaFileInvoiceDollar />,
    path: "/invoice-assist/forecast",
  },
  {
    name: "History",
    icon: <MdOutlineHistory />,
    path: "/invoice-assist/history",
  },
];

const InvoicingSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const isActive = useCallback(
    (path: string) => pathname?.startsWith(path.split("?")[0]),
    [pathname]
  );

  const toggleDropdown = (itemName: string) => {
    setOpenDropdown(openDropdown === itemName ? null : itemName);
  };

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
          className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}
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
              {isExpanded || isHovered || isMobileOpen ? "Invoice Assist" : <HorizontaLDots />}
            </h2>
            <ul className="flex flex-col gap-4">
              {invoicingItems.map((item) => (
                <li key={item.name}>
                  {item.subItems ? (
                    <>
                      <button
                        onClick={() => toggleDropdown(item.name)}
                        className={`menu-item group w-full text-left ${
                          openDropdown === item.name ? "menu-item-active" : "menu-item-inactive"
                        }`}
                      >
                        <span
                          className={`${
                            openDropdown === item.name
                              ? "menu-item-icon-active"
                              : "menu-item-icon-inactive"
                          }`}
                        >
                          {item.icon}
                        </span>
                        {(isExpanded || isHovered || isMobileOpen) && (
                          <>
                            <span className="menu-item-text flex-1">{item.name}</span>
                            <IoIosArrowDown
                              className={`transition-transform duration-300 ${
                                openDropdown === item.name ? "rotate-180" : ""
                              }`}
                            />
                          </>
                        )}
                      </button>
                      {openDropdown === item.name && (
                        <ul className="ml-6 mt-2 flex flex-col gap-2">
                          {item.subItems.map((sub) => (
                            <li key={sub.name}>
                              <Link
                                href={sub.path}
                                className={`menu-item group ${
                                  isActive(sub.path)
                                    ? "menu-item-active"
                                    : "menu-item-inactive"
                                }`}
                              >
                                <span
                                  className={`${
                                    isActive(sub.path)
                                      ? "menu-item-icon-active"
                                      : "menu-item-icon-inactive"
                                  }`}
                                >
                                  {sub.icon}
                                </span>
                                {(isExpanded || isHovered || isMobileOpen) && (
                                  <span className="menu-item-text">{sub.name}</span>
                                )}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
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
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
                {isExpanded || isHovered || isMobileOpen ? <SideBarLogoutWidget /> : null} 
      </aside>
    </PrivateRoute>
  );
};

export default InvoicingSidebar;
