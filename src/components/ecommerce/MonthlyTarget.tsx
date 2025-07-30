"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useDispatch, useSelector } from "react-redux";
import { ApexOptions } from "apexcharts";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { ArrowDownIcon, ArrowUpIcon, MoreDotIcon } from "@/icons";
import { analyzeCashFlow } from "@/redux/google/gemini/forecast/cashflow_analysis";
import { setForecast } from "@/redux/google/gemini/slices/forecastSlice";
import { GroupedWeekMonthAnnualIncomeVsExpenses } from "@/redux/api/selectors/formatted_cashflow";
import { formatCurrency } from "@/utils/formatters/currency_formatter";
import { safeParseJSON } from "@/utils/formatters/object_formatters";

// Dynamically import ApexChart
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function MonthlyTarget() {
  const dispatch = useDispatch();

  // Redux selectors
  const forecast = useSelector((state) => state.financial_forecast.forecast_result);
  const { income, loading: incomeLoading } = useSelector((state) => state.income);
  const data_for_prompt = useSelector(GroupedWeekMonthAnnualIncomeVsExpenses);

  // State
  const [quarterlyForecast, setQuarterlyForecast] = useState(false);
  const [sixMonthForecast, setSixMonthForecast] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Get forecast predictions
  useEffect(() => {
    const getPrediction = async () => {
      const result = await analyzeCashFlow(JSON.stringify(data_for_prompt));
      try {
        const parsedResult = safeParseJSON(result);
        dispatch(setForecast(parsedResult));
      } catch (error) {
        console.error("Error parsing forecast result", error);
      }
    };

    if (!incomeLoading && income && Object.keys(income).length > 0 && data_for_prompt && !forecast) {
      getPrediction();
    }
  }, [income, incomeLoading, data_for_prompt, forecast, dispatch]);

  // Forecast values
  const nextMonth = forecast?.next_month || {};
  const nextQuarter = forecast?.next_quarter || {};
  const next6Months = forecast?.next_6_months || {};

  // Determine current values based on focus
  const currentPercentage = quarterlyForecast
    ? nextQuarter.percentage_change
    : sixMonthForecast
      ? next6Months.percentage_change
      : nextMonth.percentage_change;

  const currentAdvice = quarterlyForecast
    ? nextQuarter.explanation
    : sixMonthForecast
      ? next6Months.explanation
      : nextMonth.explanation;

  const currentLabel = quarterlyForecast
    ? "Quarter"
    : sixMonthForecast
      ? "6 Months"
      : "Month";

  const series = [
    Math.abs(currentPercentage ?? 0)
  ];

  const options: ApexOptions = {
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: { size: "80%" },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5,
        },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: "#1D2939",
            formatter: (val) => `${val}%`,
          },
        },
      },
    },
    fill: { type: "solid", colors: ["#465FFF"] },
    stroke: { lineCap: "round" },
    labels: ["Progress"],
  };

  // Handlers
  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  const handleFocusMonth = () => {
    setQuarterlyForecast(false);
    setSixMonthForecast(false);
    closeDropdown();
  };

  const handleFocusQuarter = () => {
    setQuarterlyForecast(true);
    setSixMonthForecast(false);
    closeDropdown();
  };

  const handleFocus6Months = () => {
    setQuarterlyForecast(false);
    setSixMonthForecast(true);
    closeDropdown();
  };

  // Loading state
  if (incomeLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Calculating Forecast...</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Forecast</h3>
            <p className="mt-1 font-normal text-gray-500 text-theme-sm dark:text-gray-400">
              AI generated forecast based on your previous data.
            </p>
          </div>
          <div className="relative inline-block">
            <button onClick={toggleDropdown} className="dropdown-toggle">
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
            </button>
            <Dropdown isOpen={isOpen} onClose={closeDropdown} className="w-40 p-2 dark:text-gray-300">
              <DropdownItem onItemClick={handleFocusQuarter} className="dark:text-gray-300 dark:hover:bg-gray-700">
                Focus quarterly summary
              </DropdownItem>
              <DropdownItem onItemClick={handleFocus6Months} className="dark:text-gray-300 dark:hover:bg-gray-700">
                Focus six month summary
              </DropdownItem>
              <DropdownItem onItemClick={handleFocusMonth} className="dark:text-gray-300 dark:hover:bg-gray-700"> 
                Forecast Monthly summary
              </DropdownItem>
            </Dropdown>
          </div>
        </div>

        <div className="relative">
          <div className="max-h-[330px]">
            <ReactApexChart options={options} series={series} type="radialBar" height={330} />
          </div>

          {/* Progress Badge */}
          <span
            className={`absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full px-3 py-1 text-xs font-medium ${
              currentPercentage >= 0
                ? 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500'
                : 'bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-500'
            }`}
          >
            {currentPercentage >= 0 ? "+" : ""}
            {currentPercentage}% ({currentLabel})
          </span>
        </div>

        <p className="mx-auto mt-10 w-full max-w-[380px] text-center text-sm text-gray-500 sm:text-base">
          {currentAdvice || "No advice available"}
        </p>
      </div>

      {/* Bottom Forecast Stats */}
      <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
        {[{
          label: "Next Month",
          amount: nextMonth.prediction_amount_estimate,
          percentage: nextMonth.percentage_change
        }, {
          label: "Next Quarter",
          amount: nextQuarter.prediction_amount_estimate,
          percentage: nextQuarter.percentage_change
        }, {
          label: "Next 6 Months",
          amount: next6Months.prediction_amount_estimate,
          percentage: next6Months.percentage_change
        }].map((item, idx) => (
          <React.Fragment key={item.label}>
            {idx > 0 && <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>}
            <div>
              <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
                {item.label}
              </p>
              <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
                {formatCurrency(item.amount)}
                {item.percentage >= 0
                  ? <ArrowUpIcon className="size-3 text-success-500" />
                  : <ArrowDownIcon className="size-3 text-red-500" />}
                <span className="text-xs dark:text-gray-300 font-light rounded-xl bg-gray-300 dark:bg-gray-700">
                  {item.percentage}%
                </span>
              </p>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
