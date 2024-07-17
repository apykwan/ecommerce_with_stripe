import { type ReactNode } from 'react';
import { Prisma } from '@prisma/client';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import {
  differenceInDays,
  differenceInMonths,
  differenceInWeeks,
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  eachYearOfInterval,
  endOfWeek,
  interval,
  max,
  min,
  startOfDay,
  startOfWeek,
  subDays,
} from "date-fns";

import OrdersByDayChart from './_components/charts/OrdersByDayChart';
import UsersByDayChart from './_components/charts/UsersByDayChart';
import { formatNumber, formatDate, formatCurrency } from '@/lib/formatters';
import db from '@/db';

async function getSalesData(createdAfter: Date | null, createdBefore: Date | null) {
  const createdAtQuery: Prisma.OrderWhereInput["createdAt"] = {};
  if (createdAfter) createdAtQuery.gte = createdAfter;
  if (createdBefore) createdAtQuery.lte = createdBefore;

  const [data, chartData] = await Promise.all([
    db.order.aggregate({
      _sum: { pricePaidInCents: true },
      _count: true
    }),
    db.order.findMany({
      select: {
        createdAt: true,
        pricePaidInCents: true,
      },
      where: {
        createdAt: createdAtQuery
      },
      orderBy: { createdAt: "asc" }
    })
  ]);

  const dayArray = eachDayOfInterval(
    interval(
      createdAfter || startOfDay(chartData[0].createdAt), 
      createdBefore || new Date()
    )
  ).map(day => {
    return {
      date: formatDate(day),
      totalSales: 0
    };
  });

  return {
    chartData: chartData.reduce((data, order) => {
      const formattedDate = formatDate(order.createdAt);
      const entry = dayArray.find(day => day.date == formattedDate);

      if (entry == null) return data;
      entry.totalSales += order.pricePaidInCents / 100;
      return data;
    }, dayArray), 
    amount: (data._sum.pricePaidInCents || 0) / 100,
    numberOfSales: data._count 
  };
}

async function getUserData() {
  const [userCount, orderData] = await Promise.all([
     db.user.count(),
     db.order.aggregate({
      _sum: { pricePaidInCents: true }
    })
  ]);

  return {
    userCount,
    averageValuePerUser: userCount === 0 ? 0 : (orderData._sum.pricePaidInCents || 0) / userCount/ 100
  };
}

async function getProductData() {
  const [activeCount, inActiveCount] = await Promise.all([
    db.product.count({ where: { isAvailableForPurchase: true }}),
    db.product.count({ where: { isAvailableForPurchase: false }}),
  ]);

  return { activeCount, inActiveCount };
}

export default async function AdminDashboard() {
  const [salesData, userData, productData] = await Promise.all([
    getSalesData(subDays(new Date(), 6), new Date()),
    getUserData(),
    getProductData()
  ]);

  return (
    <main className="grid gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Dashboard 
          title="Sales" 
          subtitle={`${formatNumber(salesData.numberOfSales)} Orders`} 
          body={formatCurrency(salesData.amount)} 
        />

        <Dashboard 
          title="Customers" 
          subtitle={`${formatNumber(userData.averageValuePerUser)} Average Value`} 
          body={formatNumber(userData.userCount)} 
        />

        <Dashboard 
          title="Products" 
          subtitle={`${formatNumber(productData.inActiveCount)} Inactive`} 
          body={formatNumber(productData.activeCount)}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Total Sales">
          <OrdersByDayChart 
            data={salesData.chartData} 
          />
        </ChartCard>
        <ChartCard title="Total Users">
          <UsersByDayChart
            data={[
              { date: "Day 1", totalUsers: 12 },
              { date: "Day 2", totalUsers: 2 },
              { date: "Day 3", totalUsers: 7 },
              { date: "Day 4", totalUsers: 28 },
            ]} 
          />
        </ChartCard>
      </div>
    </main>
  );
}

type DashboardCardProps = {
  title: string;
  subtitle: string;
  body: string;
}

function Dashboard({ title, subtitle, body}: DashboardCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{body}</p>
      </CardContent>
    </Card>
  );
}

type ChartCardProps = {
  title: string;
  children: ReactNode;
}

function ChartCard({ title, children }: ChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}