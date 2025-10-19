"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, DollarSign, AlertCircle } from "lucide-react";

interface WeeklySummaryProps {
  summary: {
    deliveriesThisWeek: number;
    overdueOrders: number;
    pendingPayments: number;
    overduePayments: number;
    criticalStock: number;
    outOfStock: number;
    totalPendingAmount: number;
    totalOverdueAmount: number;
  };
}

const WeeklySummary = ({ summary }: WeeklySummaryProps) => {
  const stats = [
    {
      title: "Entregas esta semana",
      value: summary.deliveriesThisWeek,
      icon: Clock
    },
    {
      title: "Entregas atrasadas",
      value: summary.overdueOrders,
      subValue: summary.overdueOrders > 0 ? "No entregadas a tiempo" : "Sin atrasos",
      icon: AlertCircle
    },
    {
      title: "Pagos por cobrar",
      value: summary.pendingPayments,
      subValue: summary.overduePayments > 0
        ? `${summary.overduePayments} vencido(s) • $${summary.totalOverdueAmount.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
        : `$${summary.totalPendingAmount.toLocaleString("es-MX", { minimumFractionDigits: 2 })} total`,
      icon: DollarSign
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {stat.title}
              </CardDescription>
              <CardTitle className="text-2xl">{stat.value}</CardTitle>
              {stat.subValue && (
                <p className="text-xs text-muted-foreground mt-1">{stat.subValue}</p>
              )}
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
};

export default WeeklySummary;
