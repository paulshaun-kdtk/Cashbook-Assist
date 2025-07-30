"use client";
import React from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, DollarLineIcon } from "@/icons";
import { fetchIncomeThunk } from "@/redux/api/thunks/income/fetch";
import { useDispatch, useSelector } from "react-redux";
import { formatCurrency } from "@/utils/formatters/currency_formatter";
import { formatAmountRound } from "@/utils/formatters/format_amount";
import { fetchExpensesThunk } from "@/redux/api/thunks/expenses/fetch";
import Link from "next/link";
import { selectIncomeStats } from "@/redux/api/selectors/incomeTotals";
import { selectExpenditureStats } from "@/redux/api/selectors/expenseTotals";

export const EcommerceMetrics = ({showBalance=false}) => {
  const [uniqueId, setUniqueId] = React.useState<string | null>(null);
  const {loading:incomeLoading} = useSelector((state) => state.income);
  const {
    totalAnnualIncome,
    quarterlyIncome,
    previousQuarterIncome,
    incomeGrowth,
  } = useSelector(selectIncomeStats);

  const { loading:expenditureLoading } = useSelector((state) => state.expenses);
  const {
    totalAnnualExpenditure,
    quarterlyExpenditure,
    previousQuarterExpenditure,
    expenditureGrowth,
  } = useSelector(selectExpenditureStats);
  
  const dispatch = useDispatch()

  const currentBalance = totalAnnualIncome - totalAnnualExpenditure;
  const previousBalance = previousQuarterIncome - previousQuarterExpenditure;
  const currentQuarterBalance = quarterlyIncome - quarterlyExpenditure;

  const balanceGrowthPercentage = ((currentBalance - previousBalance) / Math.abs(previousBalance)) * 100;

      React.useEffect(() => {
        if (typeof window !== "undefined") {
          const id = localStorage.getItem("unique_id");
          setUniqueId(id);
        }
      }, []);
  
      React.useEffect(() => {
          if (uniqueId) {
            dispatch(fetchIncomeThunk(uniqueId));
            dispatch(fetchExpensesThunk(uniqueId));
          }
        }, [dispatch, uniqueId]);

  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${showBalance ? 'md:grid-cols-3' : ''} md:gap-6`}>
      {/* <!-- Metric Item Start --> */}
      <Link href={'/income'} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <DollarLineIcon className="text-cyan-400/80 size-6 dark:text-cyan-500/90" />
        </div>
      <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
          {formatCurrency(totalAnnualIncome)}
        </h4>
      </div>
      {!incomeLoading ? (
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total revenue this quarter
            </span>
          <h2 className="text-gray-700 font-bold dark:text-gray-200">
              {formatCurrency(quarterlyIncome)}
            </h2>
            <span className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              previous quarter : {formatCurrency(previousQuarterIncome)}
            </span>
          </div>
          {(quarterlyIncome > previousQuarterIncome) ? ( 
            <Badge color="success">
            <ArrowUpIcon />
            {formatAmountRound(incomeGrowth)}%
          </Badge>
          ) : (
            <Badge color="error">
            <ArrowDownIcon />
            {formatAmountRound(incomeGrowth)}%
          </Badge>
          )}
        </div>
        ) : (
          <span className="text-center dark:text-white/80">calculating...</span>
        )}
      </Link>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <Link href={'/expenses'} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
       <div className="flex items-center justify-between">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <DollarLineIcon className="text-red-700 dark:text-red-500/90" />
        </div>
       <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
          {formatCurrency(totalAnnualExpenditure)}
        </h4>
       </div>
        {!expenditureLoading ? (
          <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total expenditure this quarter
            </span>
            <h2 className="text-gray-700 dark:text-gray-200 font-bold">
              {formatCurrency(quarterlyExpenditure)}
            </h2>
            <span className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              previous quarter : {formatCurrency(previousQuarterExpenditure)}
            </span>
          </div>

          {(previousQuarterExpenditure < quarterlyExpenditure) ? ( 
            <Badge color="error">
            <ArrowUpIcon />
            {formatAmountRound(expenditureGrowth)}%
          </Badge>
          ) : (
            <Badge color="success">
            <ArrowDownIcon />
            {formatAmountRound(expenditureGrowth)}%
          </Badge>
          )}
        </div>
        ) : (
          <span className="text-center dark:text-white/80">calculating...</span>
        )}
      </Link>
      {/* <!-- Metric Item End --> */}

      {showBalance && (
        <Link href={'/income'} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                  <DollarLineIcon className="text-emerald-500/80 size-6 dark:text-emerald-500/90" />
                </div>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                  {formatCurrency(currentBalance.toFixed(2))}
                </h4>
              </div>
              {!incomeLoading ? (
                <div className="flex items-end justify-between mt-5">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Current Balance this quarter
                    </span>
                  <h2 className="text-gray-700 font-bold dark:text-gray-200">
                      {formatCurrency(currentQuarterBalance.toFixed(2))}
                    </h2>
                    <span className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      previous quarter : {formatCurrency(previousBalance.toFixed(2))}
                    </span>
                  </div>
                  {(currentQuarterBalance > previousBalance) ? (
                    <Badge color="success">
                    <ArrowUpIcon />
                    {formatAmountRound(balanceGrowthPercentage)}%
                  </Badge>
                  ) : (
                    <Badge color="error">
                    <ArrowDownIcon />
                    {formatAmountRound(balanceGrowthPercentage)}%
                  </Badge>
                  )}
                </div>
                ) : (
                  <span className="text-center dark:text-white/80">calculating...</span>
                )}
              </Link>
      )}
    </div>
  );
};
