import { createSelector } from "@reduxjs/toolkit";

export const selectStockItemsWithSalesCount = createSelector(
  [
    (state) => state.stock_items.stock_items,
    (state) => state.sales.sales,
  ],
  (stockItems, sales) => {
    return stockItems.map((item) => {
      const count = sales.filter((sale) =>
        sale.items_sold.toLowerCase().includes(item.item_name.toLowerCase())
      ).length;

      return {
        ...item,
        sales_count: count,
      };
    });
  }
);

export const selectTopMovingStock = createSelector(
  [selectStockItemsWithSalesCount],
  (stockItemsWithSalesCount) =>
    [...stockItemsWithSalesCount]  // spread to avoid mutating original
      .sort((a, b) => b.sales_count - a.sales_count)
      .slice(0, 5)
);

export const selectLeastMovingStock = createSelector(
  [selectStockItemsWithSalesCount],
  (stockItemsWithSalesCount) =>
    [...stockItemsWithSalesCount]  
      .sort((a, b) => b.sales_count - a.sales_count).reverse()
      .slice(0, 5)
);

export const selectTop200Stock = createSelector(
  [selectStockItemsWithSalesCount],
  (stockItemsWithSalesCount) =>
    [...stockItemsWithSalesCount]  
      .sort((a, b) => b.sales_count - a.sales_count)
      .slice(0, 200)
);

export const selectLeast200Stock = createSelector(
  [selectStockItemsWithSalesCount],
  (stockItemsWithSalesCount) =>
    [...stockItemsWithSalesCount]  
      .sort((a, b) => b.sales_count - a.sales_count).reverse()
      .slice(0, 50)
);

