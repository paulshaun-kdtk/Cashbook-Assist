import MultiSelect from "../MultiSelect"
import Button from "@/components/ui/button/Button"
import { StockItem } from "@/components/tables/stock"
import { MdDelete } from "react-icons/md"

export function InvoiceItemsBody({invoice, stock_items, selectedItemIds, handleItemChange, handleItemAddToSelection, handleAddItem, handleRemoveItem}) {
    return (
        <>
          {/* Items Table */}
        <div className="mb-10">
          <div className="grid grid-cols-12 gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 pb-3 border-b border-gray-200 dark:border-gray-600 mb-4">
            <div className="col-span-5">DESCRIPTION</div>
            <div className="col-span-2 text-center">QTY</div>
            <div className="col-span-2 text-right">PRICE</div>
            <div className="col-span-2 text-right">TOTAL</div>
            <div className="col-span-1"></div> {/* For delete button */}
          </div>

          {invoice.items.map((item) => (
            <div key={item.uid} className="grid grid-cols-12 ...">
              <div className="col-span-5">
                <input
                  type="text"
                  name="item_name"
                  value={item.item_name}
                  onChange={(e) => handleItemChange(item.uid, e)}
                  placeholder="Item Description"
                  className="w-full bg-transparent border-b border-gray-200 dark:border-gray-600 focus:border-blue-400 outline-none transition-all duration-200"
                />
              </div>
              <div className="col-span-2 text-center">
                <input
                  type="number"
                  name="quantity"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(item.uid, e)}
                  className="w-full bg-transparent border-b border-gray-200 dark:border-gray-600 focus:border-blue-400 outline-none text-center transition-all duration-200"
                  min="0"
                />
              </div>
              <div className="col-span-2 text-right">
                <input
                  type="number"
                  name="item_cost"
                  value={item.item_cost}
                  onChange={(e) => handleItemChange(item.uid, e)}
                  className="w-full bg-transparent border-b border-gray-200 dark:border-gray-600 focus:border-blue-400 outline-none text-right transition-all duration-200"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="col-span-2 text-right font-medium text-gray-800 dark:text-gray-100">
                ${(item.quantity * item.item_cost).toFixed(2)}
              </div>
              <div className="col-span-1 flex justify-center" id="no-print">
                  <Button onClick={() => handleRemoveItem(item.uid)} startIcon={<MdDelete size={18} />} variant="danger" />
              </div>
            </div>
          ))}

          {/* Item Selection Dropdown and Add Button */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-4" id="no-print">
           <MultiSelect
              options={stock_items.map((item: StockItem) => ({
                value: item.$id,
                text: item.item_name,
                selected: selectedItemIds.includes(item.$id)
              }))}
              onChange={handleItemAddToSelection}
            />

            <Button 
              variant="link"
              onClick={handleAddItem}
              className="min-w-xs"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Items
            </Button>
          </div>
        </div>
        </>
    )
}