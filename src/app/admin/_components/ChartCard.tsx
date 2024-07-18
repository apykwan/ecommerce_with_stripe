"use client";

import { type ReactNode } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

import { RANGE_OPTIONS } from '@/lib/rangeOptions';

type ChartCardProps = {
  title: string;
  queryKey: string;
  selectedRangeLabel: string;
  children: ReactNode;
}

export default function ChartCard({ title, children, queryKey, selectedRangeLabel }: ChartCardProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  function setRange(range: keyof typeof RANGE_OPTIONS) {
    const params = new URLSearchParams(searchParams);
    params.set(queryKey, range);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
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