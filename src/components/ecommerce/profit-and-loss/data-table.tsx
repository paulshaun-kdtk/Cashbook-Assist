"use client"

import * as React from 'react';
import type { FinancialData } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card/card';
import { ScrollArea } from '@/components/ui/scroll/scroll-area';
import Badge from '@/components/ui/badge/Badge';
import { formatTextTruncate } from '@/utils/formatters/text_formatter';

interface DataTableProps {
  data: FinancialData[];
}

export default function DataTable({ data }: DataTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-brand-500'>Transactions</CardTitle>
        <CardDescription className='text-slate-400'>A detailed list of your recent financial activities.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >Date</TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >Category</TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >Description</TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-right"
                >Amount</TableCell >
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{formatDate(item.date)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="solid"
                      color={
                        item.type === 'income'
                          ? 'info'
                          : item.type === 'expense'
                          ? 'primary'
                          : 'dark'
                      }
                    >
                      {item.category ? item.category : "Uncategorized"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{formatTextTruncate(item.description, 30)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className={`text-right font-medium ${item.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                    <div className="flex items-center justify-end">
                      <span className="mr-1">
                        {item.type === 'income' ? '+' : '-'}
                      </span>
                      <span>
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
