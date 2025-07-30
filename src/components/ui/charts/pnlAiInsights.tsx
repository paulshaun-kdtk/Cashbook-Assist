"use client"

import * as React from "react"
import { FaLightbulb } from "react-icons/fa6"
import { FaHandSparkles } from "react-icons/fa6"
import type { DateRange } from "react-day-picker"

import  Button  from "@/components/ui/button/Button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card/card"
import { Skeleton } from "@/components/ui/skeleton/skeleton"
import type { FinancialData } from "@/lib/types"
import { generateAiInsightsAction } from "@/app/actions"
import { format } from "date-fns"
import toast from "react-hot-toast"

interface AiInsightsProps {
  data: FinancialData[]
  dateRange: DateRange | undefined
}

export default function AiInsights({ data, dateRange }: AiInsightsProps) {
  const [insights, setInsights] = React.useState<{ summary: string, recommendations: string } | null>(null)
  const [loading, setLoading] = React.useState(false)


  const handleGenerateInsights = async () => {
    setLoading(true)
    const loadingToast = toast.loading("Generating insights...")
    setInsights(null)
    try {
      const { totalRevenue, totalExpenses, netProfit } = data.reduce(
        (acc, item) => {
          if (item.type === 'income') acc.totalRevenue += item.amount;
          else acc.totalExpenses += item.amount;
          acc.netProfit = acc.totalRevenue - acc.totalExpenses;
          return acc;
        },
        { totalRevenue: 0, totalExpenses: 0, netProfit: 0 }
      );
      
      const rangeString = dateRange?.from && dateRange?.to 
        ? `${format(dateRange.from, "LLL dd, y")} to ${format(dateRange.to, "LLL dd, y")}`
        : "the selected period";

      const result = await generateAiInsightsAction({
        revenue: totalRevenue,
        expenses: totalExpenses,
        netProfit: netProfit,
        dateRange: rangeString,
      });
      
      if (result) {
        setInsights(result);
      } else {
        console.log(result)
        toast.error("Failed to generate insights. Please try again later.", {
            duration: 5000,
        })
      }

    } catch (error) {
      console.error("Failed to generate insights:", error)
      toast.error("An error occurred while generating insights. Please try again.", {
        duration: 5000,
        })
    } finally {
        toast.dismiss(loadingToast)
      setLoading(false)
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-brand-500">
          <FaLightbulb className="h-5 w-5" />
          AI-Powered Insights
        </CardTitle>
        <CardDescription className="text-muted-foreground dark:text-gray-300 text-slate-400">
          Automatically generated summary and recommendations based on your data.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {loading ? (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold dark:text-gray-300">Summary</h4>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <h4 className="text-sm font-semibold pt-4 dark:text-gray-300">Recommendations</h4>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : insights ? (
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-1 dark:text-gray-300">Summary</h4>
              <p className="text-muted-foreground dark:text-gray-300">{insights.summary}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1 dark:text-gray-300">Recommendations</h4>
              <p className="text-muted-foreground dark:text-gray-300">{insights.recommendations}</p>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <p className="dark:text-gray-300">Click the button to generate insights.</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleGenerateInsights} disabled={loading} className="w-full">
          <FaHandSparkles className="mr-2 h-4 w-4" />
          {loading ? "Generating..." : "Generate Insights"}
        </Button>
      </CardFooter>
    </Card>
  )
}
