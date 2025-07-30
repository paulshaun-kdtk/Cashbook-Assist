"use client"
import * as React from "react"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { CalenderIcon } from "@/icons"
import Button from "@/components/ui/button/Button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover/popover"
import { Calendar } from "@/components/ui/calender/calender"

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined;
  setDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
}

export function DateRangePicker({
  className,
  date,
  setDate
}: DateRangePickerProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover defaultOpen>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            size="sm"
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalenderIcon />
            {date?.from ? (
              date.to ? (
                <>
                  {(date.from.toISOString().split("T")[0])} - {(date.to.toISOString().split("T")[0])}
                </>
              ) : (
                (date.from.toISOString().split("T")[0])
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
