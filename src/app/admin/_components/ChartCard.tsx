"use client";

import { type ReactNode, useState } from 'react';
import {
    eachDayOfInterval,
    interval,
    subDays,
} from "date-fns";
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { DateRange } from "react-day-picker";

import { RANGE_OPTIONS } from '@/lib/rangeOptions';

type ChartCardProps = {
  title: string;
  queryKey: string;
  selectedRangeLabel: string;
  children: ReactNode;
}

export default function ChartCard({ title, children, queryKey, selectedRangeLabel }: ChartCardProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date()
  });
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  function setRange(range: keyof typeof RANGE_OPTIONS | DateRange) {
    const params = new URLSearchParams(searchParams);

    if (typeof range === "string") {
      params.set(queryKey, range);
      params.delete(`${queryKey}From`);
      params.delete(`${queryKey}To`);
    } else {
      if (range.from == null || range.to == null) return;
      params.delete(queryKey);
      params.set(`${queryKey}From`, range.from.toISOString());
      params.set(`${queryKey}To`, range.to.toISOString());
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function handleSubmit() {
    if (dateRange == null) return;
    setRange(dateRange);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex gap-4 justify-between items-center">
          <CardTitle>{title}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>{selectedRangeLabel}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {Object.entries(RANGE_OPTIONS).map(([key, value])=> (
                <DropdownMenuItem 
                  key={key} 
                  onClick={setRange.bind(null, key as keyof typeof RANGE_OPTIONS)}
                >
                  {value.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Custom</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <div>
                      <Calendar 
                        mode="range" 
                        disabled={{ after: new Date() }}
                        selected={dateRange}
                        defaultMonth={dateRange?.from}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                      />
                      <DropdownMenuItem className="hover:bg-auto">
                        <Button
                          className="w-full" 
                          disabled={dateRange == null}
                          onClick={handleSubmit}
                        >
                          Submit
                        </Button>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}