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

import ChartCard from './_components/ChartCard';
import OrdersByDayChart from './_components/charts/OrdersByDayChart';
import UsersByDayChart from './_components/charts/UsersByDayChart';
import RevenueByProductChart from './_components/charts/RevenueByProductChart';
import { formatNumber, formatDate, formatCurrency } from '@/lib/formatters';
import { getRangeOption, RANGE_OPTIONS } from '@/lib/rangeOptions';
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

async function getUserData(createdAfter: Date | null, createdBefore: Date | null) {
  const createdAtQuery: Prisma.UserWhereInput["createdAt"] = {};
  if (createdAfter) createdAtQuery.gte = createdAfter;
  if (createdBefore) createdAtQuery.lte = createdBefore;
  
  const [userCount, orderData, chartData] = await Promise.all([
     db.user.count(),
     db.order.aggregate({
      _sum: { pricePaidInCents: true }
    }),
    db.user.findMany({ 
      select: { createdAt: true },
      where: { createdAt: createdAtQuery },
      orderBy: { createdAt: "asc"}
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
      totalUsers: 0
    };
  });

  return {
    chartData: chartData.reduce((data, user) => {
      const formattedDate = formatDate(user.createdAt);
      const entry = dayArray.find(day => day.date == formattedDate);

      if (entry == null) return data;
      entry.totalUsers += 1;
      return data;
    }, dayArray),
    userCount,
    averageValuePerUser: userCount === 0 ? 0 : (orderData._sum.pricePaidInCents || 0) / userCount/ 100
  };
}

async function getProductData(createdAfter: Date | null, createdBefore: Date | null) {
  const createdAtQuery: Prisma.OrderWhereInput["createdAt"] = {}
  if (createdAfter) createdAtQuery.gte = createdAfter;
  if (createdBefore) createdAtQuery.lte = createdBefore;

  const [activeCount, inActiveCount, chartData] = await Promise.all([
    db.product.count({ where: { isAvailableForPurchase: true }}),
    db.product.count({ where: { isAvailableForPurchase: false }}),
    db.product.findMany({
      select: {
        name: true,
        orders: {
          select: { pricePaidInCents: true },
          where: { createdAt: createdAtQuery },
        },
      },
    }),
  ]);

  return {
    chartData: chartData.map(product => {
      return {
        name: product.name,
        revenue: product.orders.reduce((sum, order) => {
          return sum + order.pricePaidInCents / 100
        }, 0)
      }
    }).filter(product => product.revenue > 0),
    activeCount, 
    inActiveCount 
  };
}

export default async function AdminDashboard({ 
  searchParams: {
    totalSalesRange,
    totalSalesRangeFrom,
    totalSalesRangeTo,
    newCustomersRange,
    newCustomersRangeFrom,
    newCustomersRangeTo,
    revenueByProductRange,
    revenueByProductRangeFrom,
    revenueByProductRangeTo,
  },
}: {
  searchParams: {
    totalSalesRange?: string
    totalSalesRangeFrom?: string
    totalSalesRangeTo?: string
    newCustomersRange?: string
    newCustomersRangeFrom?: string
    newCustomersRangeTo?: string
    revenueByProductRange?: string
    revenueByProductRangeFrom?: string
    revenueByProductRangeTo?: string
  }
}) {
  const totalSalesRangeOption =
    getRangeOption(totalSalesRange, totalSalesRangeFrom, totalSalesRangeTo) ||
    RANGE_OPTIONS.last_7_days;

  const newCustomersRangeOption =
    getRangeOption(
      newCustomersRange,
      newCustomersRangeFrom,
      newCustomersRangeTo
    ) || RANGE_OPTIONS.last_7_days;

  const revenueByProductRangeOption =
    getRangeOption(
      revenueByProductRange,
      revenueByProductRangeFrom,
      revenueByProductRangeTo
    ) || RANGE_OPTIONS.all_time;

  const [salesData, userData, productData] = await Promise.all([
    getSalesData(totalSalesRangeOption.startDate, totalSalesRangeOption.endDate),
    getUserData(newCustomersRangeOption.startDate, newCustomersRangeOption.endDate),
    getProductData(revenueByProductRangeOption.startDate, revenueByProductRangeOption.endDate)
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
        <ChartCard 
          title="Total Sales" 
          queryKey="totalSalesRange" 
          selectedRangeLabel={totalSalesRangeOption.label}
        >
          <OrdersByDayChart 
            data={salesData.chartData} 
          />
        </ChartCard>
        <ChartCard 
          title="New Clients" 
          queryKey="newCustomersRange"
          selectedRangeLabel={newCustomersRangeOption.label}
        >
          <UsersByDayChart
            data={userData.chartData} 
          />
        </ChartCard>
        <ChartCard 
          title="Revenue By Product" 
          queryKey="revenueByProductRange"
          selectedRangeLabel={revenueByProductRangeOption.label}
        >
          <RevenueByProductChart
            data={productData.chartData} 
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