// import { createSelector } from "@reduxjs/toolkit";
// import { useSelector, UseSelector } from "react-redux";

// const selectCompanies = createSelector(
//     (state: any) => state.accounts.accounts,
//     (accounts) => {
//         return accounts.map((account: any) => {
//             const incomeSource = useSelector(selectCompanies);
//             return {
//                 ...account, 
//                 revenue_under_company: incomeSource.filter((income: any) => income.income_source === account.id_on_device).length,
//                 expenses_under_company: incomeSource.filter((expense: any) => expense.income_source === account.id_on_device).length,
//             };
//         });
//     }
// );
