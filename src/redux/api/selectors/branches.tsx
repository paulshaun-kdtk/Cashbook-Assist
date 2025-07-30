import { createSelector } from "@reduxjs/toolkit";
import { Branch } from "@/components/tables/branches";
import { Income } from "@/components/tables/income";
import { Sale } from "@/components/tables/sales";
import { Expense } from "@/components/tables/expenses";
import { Account } from "@/components/tables/accounts";

export const selectBranches = createSelector(
    [
        (state) => state.income_sources.income_sources,
        (state) => state.income.income,
        (state) => state.expenses.expenses,
        (state) => state.sales.sales,
        (state) => state.accounts.accounts
    ],
    (branches, income, expenses, sales, companies) => {
        return branches.reduce((acc: Record<string, any>, branch: Branch ) => {
            const incomeCount = income.filter((inc: Income) => inc.income_source === branch.id_on_device).length;
            const incomeAmount = income.filter((inc: Income) => inc.income_source === branch.id_on_device).reduce((total: number, inc: Income) => total + parseFloat(inc.amount || "0"), 0);
            const expenseCount = expenses.filter((exp: Expense) => exp.income_source === branch.id_on_device).length;
            const expenseAmount = expenses.filter((exp: Expense) => exp.income_source === branch.id_on_device).reduce((total: number, exp: Expense) => total + parseFloat(exp.amount || "0"), 0);
            const salesCount = sales.filter((sale: Sale) => sale.income_source === branch.id_on_device).length;
            const which_company = companies.find((company: Account) => company.id_on_device === branch.account);
            
            acc[branch.id_on_device] = {
                branch,
                totals: {
                    income_count: incomeCount,
                    expense_count: expenseCount,
                    income_amount: incomeAmount.toFixed(2),
                    expense_amount: expenseAmount.toFixed(2),
                    sales_count: salesCount,
                    which_company: which_company ? which_company.name : ""
                }
            };
            return acc;
        }, []);
    }
);
