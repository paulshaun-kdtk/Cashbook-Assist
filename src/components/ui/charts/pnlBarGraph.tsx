"use client"

import * as React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { format, startOfMonth } from 'date-fns';

import type { FinancialData } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card/card"

interface PnlChartProps {
  data: FinancialData[];
}

export default function PnlChart({ data }: PnlChartProps) {
  const monthlyData = React.useMemo(() => {
    const months: { [key: string]: { income: number, expenses: number } } = {};

    data.forEach(item => {
      const monthKey = format(startOfMonth(new Date(item.date)), 'MMM yyyy');
      if (!months[monthKey]) {
        months[monthKey] = { income: 0, expenses: 0 };
      }
      if (item.type === 'income') {
        months[monthKey].income += item.amount;
      } else {
        months[monthKey].expenses += item.amount;
      }
    });

    return Object.keys(months).map(month => ({
      name: month,
      income: months[month].income,
      expenses: months[month].expenses,
    })).sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
  }, [data]);

  return (
    <Card className="dark:bg-slate-900 dark:text-slate-100 border dark:border-slate-700">
      <CardHeader>
        <CardTitle className="text-brand-500">Profit & Loss Overview</CardTitle>
        <CardDescription className="text-slate-400">Monthly revenue vs. expenses.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: "#475569" }}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: "#475569" }}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderColor: '#475569',
                  color: '#e2e8f0',
                }}
                cursor={{ fill: '#1e40af20' }}
              />
              <Legend
                iconSize={12}
                wrapperStyle={{ color: '#94a3b8' }}
              />
              <Bar dataKey="income" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
