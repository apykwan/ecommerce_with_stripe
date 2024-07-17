"use client";

import { 
  CartesianGrid, 
  Pie, 
  PieChart, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

import { formatCurrency } from '@/lib/formatters';


type RevenueByProductChartProps = {
  data: {
    name: string;
    revenue: number;
  }[]
}

export default function RevenueByProductChart({ data }: RevenueByProductChartProps) {
  return (
    <ResponsiveContainer width="100%" minHeight={300}>
      <PieChart>
        <Tooltip cursor={{ fill: "hsl(var(--muted))"}} formatter={value => formatCurrency(value as number)}/>
        <Pie data={data} dataKey="revenue" nameKey="name" stroke="hsl(var(--primary))" />
      </PieChart>
    </ResponsiveContainer>
  );
}