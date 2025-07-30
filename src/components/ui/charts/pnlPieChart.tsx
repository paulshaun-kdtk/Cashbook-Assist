"use client"

import * as React from "react"
import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Cell,
  Tooltip,
  Legend
} from "recharts"
import type { FinancialData } from "@/lib/types"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card/card"

interface ExpensesPieChartProps {
  data: FinancialData[]
}

const COLORS = [
  "#0ea5e9", // sky-500
  "#6366f1", // indigo-500
  "#38bdf8", // sky-400
  "#818cf8", // indigo-400
  "#22d3ee", // cyan-400
]

export default function ExpensesPieChart({ data }: ExpensesPieChartProps) {
  const expenseData = React.useMemo(() => {
    const expenseCategories: { [key: string]: number } = {}
    data
      .filter(item => item.type === "expense")
      .forEach(item => {
        if (!expenseCategories[item.category]) {
          expenseCategories[item.category] = 0
        }
        expenseCategories[item.category] += item.amount
      })

    return Object.entries(expenseCategories).map(([name, value]) => ({
      name,
      value,
    }))
  }, [data])

  return (
    <Card className="dark:bg-slate-900 dark:text-slate-100 border dark:border-slate-700">
      <CardHeader>
        <CardTitle className="text-brand-500">Expense Breakdown</CardTitle>
        <CardDescription className="text-slate-400">Spending by category.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenseData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={85}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
                  const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180))
                  const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180))
                  return (
                    <text
                      x={x}
                      y={y}
                      fill="#f1f5f9"
                      textAnchor={x > cx ? "start" : "end"}
                      dominantBaseline="central"
                      fontSize={12}
                    >
                      {`${(percent * 100).toFixed(0)}%`}
                    </text>
                  )
                }}
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",  // slate-800
                  borderColor: "#475569",      // slate-600
                  color: "#f1f5f9",            // slate-100
                  borderRadius: 6,
                  padding: 12,
                }}
                labelStyle={{
                  color: "#f1f5f9",            // label text color
                  fontWeight: 600,
                  fontSize: 14,
                }}
                itemStyle={{
                  color: "#e0f2fe",            // sky-100 for value text
                  fontSize: 13,
                }}
                cursor={{ fill: "#1e40af20" }}
                formatter={(value: number) =>
                  new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(value)
                }
              />

              <Legend
                iconSize={12}
                wrapperStyle={{ color: "#94a3b8" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
