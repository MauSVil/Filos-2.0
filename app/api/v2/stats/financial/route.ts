import { OrderRepository } from "@/repositories/v2/OrderRepository";
import { NextRequest, NextResponse } from "next/server";
import { OrderBaseWithIdType } from "@/types/v2/Order/Base.type";

export const GET = async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const dateRangeStart = searchParams.get("dateRangeStart");
    const dateRangeEnd = searchParams.get("dateRangeEnd");
    const groupBy = searchParams.get("groupBy") || "month";

    const dateFilter = dateRangeStart && dateRangeEnd ? {
      requestDate: {
        $gte: new Date(dateRangeStart),
        $lte: new Date(dateRangeEnd)
      }
    } : {};

    const orders = await OrderRepository.find(dateFilter);

    const totalRevenue = orders.reduce((sum: number, order: OrderBaseWithIdType) =>
      sum + (order.totalAmount || 0), 0);

    const paidRevenue = orders
      .filter((o: OrderBaseWithIdType) => o.paid)
      .reduce((sum: number, order: OrderBaseWithIdType) => sum + (order.totalAmount || 0), 0);

    const outstandingPayments = orders
      .filter((o: OrderBaseWithIdType) => !o.paid)
      .reduce((sum: number, order: OrderBaseWithIdType) => sum + (order.totalAmount || 0), 0);

    const advancedPayments = orders.reduce((sum: number, order: OrderBaseWithIdType) =>
      sum + (order.advancedPayment || 0), 0);

    const freightCosts = orders.reduce((sum: number, order: OrderBaseWithIdType) =>
      sum + (order.freightPrice || 0), 0);

    const revenueByType = {
      retail: orders
        .filter((o: OrderBaseWithIdType) => o.orderType === "retailPrice")
        .reduce((sum: number, o: OrderBaseWithIdType) => sum + (o.totalAmount || 0), 0),
      wholesale: orders
        .filter((o: OrderBaseWithIdType) => o.orderType === "wholesalePrice")
        .reduce((sum: number, o: OrderBaseWithIdType) => sum + (o.totalAmount || 0), 0),
      special: orders
        .filter((o: OrderBaseWithIdType) => o.orderType === "specialPrice")
        .reduce((sum: number, o: OrderBaseWithIdType) => sum + (o.totalAmount || 0), 0),
      webPage: orders
        .filter((o: OrderBaseWithIdType) => o.orderType === "webPagePrice")
        .reduce((sum: number, o: OrderBaseWithIdType) => sum + (o.totalAmount || 0), 0),
    };

    const netRevenue = totalRevenue - freightCosts;

    const profitMargins = {
      retail: revenueByType.retail > 0
        ? ((revenueByType.retail - (revenueByType.retail * 0.7)) / revenueByType.retail) * 100
        : 0,
      wholesale: revenueByType.wholesale > 0
        ? ((revenueByType.wholesale - (revenueByType.wholesale * 0.8)) / revenueByType.wholesale) * 100
        : 0,
      special: revenueByType.special > 0
        ? ((revenueByType.special - (revenueByType.special * 0.75)) / revenueByType.special) * 100
        : 0,
      webPage: revenueByType.webPage > 0
        ? ((revenueByType.webPage - (revenueByType.webPage * 0.65)) / revenueByType.webPage) * 100
        : 0,
    };

    const periodRevenue = calculatePeriodRevenue(orders, groupBy);

    const revenueGrowth = calculateRevenueGrowth(periodRevenue);

    const cashFlow = {
      inflow: paidRevenue + advancedPayments,
      pending: outstandingPayments,
      netCashFlow: paidRevenue + advancedPayments - freightCosts,
    };

    const averageTransactionValue = orders.length > 0
      ? totalRevenue / orders.length
      : 0;

    const paymentHealth = {
      paidPercentage: totalRevenue > 0
        ? (paidRevenue / totalRevenue) * 100
        : 0,
      overdueAmount: orders
        .filter((o: OrderBaseWithIdType) =>
          !o.paid && new Date(o.dueDate) < new Date()
        )
        .reduce((sum: number, o: OrderBaseWithIdType) => sum + (o.totalAmount || 0), 0),
    };

    const forecast = calculateForecast(periodRevenue);

    const response = {
      revenue: {
        total: Math.round(totalRevenue * 100) / 100,
        paid: Math.round(paidRevenue * 100) / 100,
        outstanding: Math.round(outstandingPayments * 100) / 100,
        net: Math.round(netRevenue * 100) / 100,
      },
      payments: {
        advanced: Math.round(advancedPayments * 100) / 100,
        freight: Math.round(freightCosts * 100) / 100,
      },
      byType: {
        retail: Math.round(revenueByType.retail * 100) / 100,
        wholesale: Math.round(revenueByType.wholesale * 100) / 100,
        special: Math.round(revenueByType.special * 100) / 100,
        webPage: Math.round(revenueByType.webPage * 100) / 100,
      },
      profitMargins: {
        retail: Math.round(profitMargins.retail * 100) / 100,
        wholesale: Math.round(profitMargins.wholesale * 100) / 100,
        special: Math.round(profitMargins.special * 100) / 100,
        webPage: Math.round(profitMargins.webPage * 100) / 100,
      },
      trends: periodRevenue,
      growth: revenueGrowth,
      cashFlow: {
        inflow: Math.round(cashFlow.inflow * 100) / 100,
        pending: Math.round(cashFlow.pending * 100) / 100,
        net: Math.round(cashFlow.netCashFlow * 100) / 100,
      },
      metrics: {
        averageTransactionValue: Math.round(averageTransactionValue * 100) / 100,
        paymentCompletionRate: Math.round(paymentHealth.paidPercentage * 100) / 100,
        overdueAmount: Math.round(paymentHealth.overdueAmount * 100) / 100,
      },
      forecast,
      metadata: {
        timestamp: new Date().toISOString(),
        dateRange: {
          start: dateRangeStart || null,
          end: dateRangeEnd || null,
        },
        groupBy,
        totalOrders: orders.length,
      }
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=120',
      }
    });

  } catch (error) {
    console.error("Financial stats error:", error);
    if (error instanceof Error) {
      return NextResponse.json({
        error: error.message,
        devMessage: "Failed to fetch financial statistics"
      }, { status: 500 });
    }
    return NextResponse.json({
      error: "An unexpected error occurred",
      devMessage: "Unknown error in financial statistics"
    }, { status: 500 });
  }
};

function calculatePeriodRevenue(orders: OrderBaseWithIdType[], groupBy: string) {
  const periodRevenue: Record<string, number> = {};

  orders.forEach((order: OrderBaseWithIdType) => {
    const date = new Date(order.requestDate);
    let key: string;

    switch (groupBy) {
      case "year":
        key = date.getFullYear().toString();
        break;
      case "quarter":
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        key = `${date.getFullYear()}-Q${quarter}`;
        break;
      case "week":
        const weekNum = getWeekNumber(date);
        key = `${date.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
        break;
      case "day":
        key = date.toISOString().split('T')[0];
        break;
      default:
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    periodRevenue[key] = (periodRevenue[key] || 0) + (order.totalAmount || 0);
  });

  return Object.entries(periodRevenue)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([period, revenue]) => ({
      period,
      revenue: Math.round(revenue * 100) / 100,
    }));
}

function calculateRevenueGrowth(periodRevenue: { period: string; revenue: number }[]) {
  if (periodRevenue.length < 2) return null;

  const current = periodRevenue[periodRevenue.length - 1].revenue;
  const previous = periodRevenue[periodRevenue.length - 2].revenue;

  const growthRate = previous > 0
    ? ((current - previous) / previous) * 100
    : 0;

  return {
    currentPeriod: periodRevenue[periodRevenue.length - 1].period,
    previousPeriod: periodRevenue[periodRevenue.length - 2].period,
    growthRate: Math.round(growthRate * 100) / 100,
    growthAmount: Math.round((current - previous) * 100) / 100,
  };
}

function calculateForecast(periodRevenue: { period: string; revenue: number }[]) {
  if (periodRevenue.length < 3) return null;

  const recentPeriods = periodRevenue.slice(-6);
  const averageRevenue = recentPeriods.reduce((sum, p) => sum + p.revenue, 0) / recentPeriods.length;

  const growthRates: number[] = [];
  for (let i = 1; i < recentPeriods.length; i++) {
    const growthRate = recentPeriods[i - 1].revenue > 0
      ? (recentPeriods[i].revenue - recentPeriods[i - 1].revenue) / recentPeriods[i - 1].revenue
      : 0;
    growthRates.push(growthRate);
  }

  const averageGrowthRate = growthRates.length > 0
    ? growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length
    : 0;

  const lastRevenue = periodRevenue[periodRevenue.length - 1].revenue;
  const nextPeriodForecast = lastRevenue * (1 + averageGrowthRate);

  return {
    nextPeriod: Math.round(nextPeriodForecast * 100) / 100,
    averageGrowthRate: Math.round(averageGrowthRate * 10000) / 100,
    basedOnPeriods: recentPeriods.length,
  };
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNum;
}