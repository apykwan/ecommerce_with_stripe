import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader,
  CardTitle 
} from '@/components/ui/card';

import { formatNumber, formatCurrency } from '@/lib/formatters';
import db from '@/db';

async function getSalesData() {
  const data = await db.order.aggregate({
    _sum: { pricePaidInCents: true },
    _count: true
  });

  return { 
    amount: (data._sum.pricePaidInCents || 0) / 100,
    numberOfSales: data._count 
  }
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
    getSalesData(),
    getUserData(),
    getProductData()
  ]);

  return (
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