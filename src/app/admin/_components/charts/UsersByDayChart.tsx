"use client";

import { 
  CartesianGrid, 
  Bar, 
  BarChart, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

import { formatNumber } from '@/lib/formatters';

type UsersByDayChartProps = {
  data: {
    date: string;
    totalUsers: number;
  }[]
}

export default function UsersByDayChart({ data }: UsersByDayChartProps) {
  return (
    <ResponsiveContainer width="100%" minHeight={300}>
      <BarChart data={data}>
        <CartesianGrid stroke="hsl(var(--muted))" />
        <XAxis dataKey="date" stroke="hsl(var(--primary))" />
        <YAxis
          tickFormatter={tick => formatNumber(tick)}
          stroke="hsl(var(--primary))"
        />
        <Tooltip
          cursor={{ fill: "hsl(var(--muted))" }}
          formatter={value => formatNumber(value as number)}
        />
        <Bar
          dataKey="totalUsers"
          name="New Customers"
          stroke="hsl(var(--primary))"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}