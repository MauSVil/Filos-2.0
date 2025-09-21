import { OrderRepository } from "@/repositories/v2/OrderRepository";
import { ProductRepository } from "@/repositories/v2/ProductRepository";
import { NextRequest, NextResponse } from "next/server";
import { OrderBaseWithIdType } from "@/types/v2/Order/Base.type";
import { ProductBaseWithIdType } from "@/types/v2/Product/Base.type";
import { ObjectId } from "mongodb";

export const GET = async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const dateRangeStart = searchParams.get("dateRangeStart");
    const dateRangeEnd = searchParams.get("dateRangeEnd");
    const groupBy = searchParams.get("groupBy") || "day";

    const dateFilter = dateRangeStart && dateRangeEnd ? {
      requestDate: {
        $gte: new Date(dateRangeStart),
        $lte: new Date(dateRangeEnd)
      }
    } : {};

    const orders = await OrderRepository.find(dateFilter);

    const totalRevenue = orders.reduce((sum: number, order: OrderBaseWithIdType) =>
      sum + (order.totalAmount || 0), 0);

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

    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    const salesTrends = calculateSalesTrends(orders, groupBy);

    const paymentStatus = {
      paid: {
        count: orders.filter((o: OrderBaseWithIdType) => o.paid).length,
        amount: orders
          .filter((o: OrderBaseWithIdType) => o.paid)
          .reduce((sum: number, o: OrderBaseWithIdType) => sum + (o.totalAmount || 0), 0),
      },
      pending: {
        count: orders.filter((o: OrderBaseWithIdType) => !o.paid).length,
        amount: orders
          .filter((o: OrderBaseWithIdType) => !o.paid)
          .reduce((sum: number, o: OrderBaseWithIdType) => sum + (o.totalAmount || 0), 0),
      }
    };

    const orderCompletion = {
      completed: orders.filter((o: OrderBaseWithIdType) => o.status === "Completado").length,
      pending: orders.filter((o: OrderBaseWithIdType) => o.status === "Pendiente").length,
      cancelled: orders.filter((o: OrderBaseWithIdType) => o.status === "Cancelado").length,
      completionRate: orders.length > 0
        ? (orders.filter((o: OrderBaseWithIdType) => o.status === "Completado").length / orders.length) * 100
        : 0,
    };

    const productIds = new Set<string>();
    orders.forEach((order: OrderBaseWithIdType) => {
      order.products.forEach(p => productIds.add(p.product));
    });

    const products = productIds.size > 0
      ? await ProductRepository.find({ _id: { $in: Array.from(productIds).map(id => new ObjectId(id)) } })
      : [];

    const productMap = new Map<string, ProductBaseWithIdType>();
    products.forEach((p: ProductBaseWithIdType) => productMap.set(p._id.toString(), p));

    const topSellingProducts = calculateTopProducts(orders, productMap);

    const freightAnalysis = {
      totalFreight: orders.reduce((sum: number, o: OrderBaseWithIdType) =>
        sum + (o.freightPrice || 0), 0),
      averageFreight: orders.length > 0
        ? orders.reduce((sum: number, o: OrderBaseWithIdType) =>
            sum + (o.freightPrice || 0), 0) / orders.length
        : 0,
    };

    const advancePayments = {
      total: orders.reduce((sum: number, o: OrderBaseWithIdType) =>
        sum + (o.advancedPayment || 0), 0),
      ordersWithAdvance: orders.filter((o: OrderBaseWithIdType) =>
        o.advancedPayment && o.advancedPayment > 0).length,
    };

    const response = {
      revenue: {
        total: Math.round(totalRevenue * 100) / 100,
        byType: {
          retail: Math.round(revenueByType.retail * 100) / 100,
          wholesale: Math.round(revenueByType.wholesale * 100) / 100,
          special: Math.round(revenueByType.special * 100) / 100,
          webPage: Math.round(revenueByType.webPage * 100) / 100,
        },
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      },
      trends: salesTrends,
      paymentStatus: {
        paid: {
          ...paymentStatus.paid,
          amount: Math.round(paymentStatus.paid.amount * 100) / 100,
        },
        pending: {
          ...paymentStatus.pending,
          amount: Math.round(paymentStatus.pending.amount * 100) / 100,
        }
      },
      orderCompletion: {
        ...orderCompletion,
        completionRate: Math.round(orderCompletion.completionRate * 100) / 100,
      },
      topProducts: topSellingProducts,
      freight: {
        total: Math.round(freightAnalysis.totalFreight * 100) / 100,
        average: Math.round(freightAnalysis.averageFreight * 100) / 100,
      },
      advancePayments: {
        total: Math.round(advancePayments.total * 100) / 100,
        ordersWithAdvance: advancePayments.ordersWithAdvance,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        dateRange: {
          start: dateRangeStart || null,
          end: dateRangeEnd || null,
        },
        totalOrders: orders.length,
        groupBy,
      }
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=120',
      }
    });

  } catch (error) {
    console.error("Sales stats error:", error);
    if (error instanceof Error) {
      return NextResponse.json({
        error: error.message,
        devMessage: "Failed to fetch sales statistics"
      }, { status: 500 });
    }
    return NextResponse.json({
      error: "An unexpected error occurred",
      devMessage: "Unknown error in sales statistics"
    }, { status: 500 });
  }
};

function calculateSalesTrends(orders: OrderBaseWithIdType[], groupBy: string) {
  const trends: Record<string, { count: number; revenue: number }> = {};

  orders.forEach((order: OrderBaseWithIdType) => {
    const date = new Date(order.requestDate);
    let key: string;

    switch (groupBy) {
      case "month":
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      case "week":
        const weekNum = getWeekNumber(date);
        key = `${date.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
        break;
      default:
        key = date.toISOString().split('T')[0];
    }

    if (!trends[key]) {
      trends[key] = { count: 0, revenue: 0 };
    }

    trends[key].count++;
    trends[key].revenue += order.totalAmount || 0;
  });

  return Object.entries(trends)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, data]) => ({
      date,
      count: data.count,
      revenue: Math.round(data.revenue * 100) / 100,
    }));
}

function calculateTopProducts(
  orders: OrderBaseWithIdType[],
  productMap: Map<string, ProductBaseWithIdType>
) {
  const productSales: Record<string, { quantity: number; revenue: number }> = {};

  orders.forEach((order: OrderBaseWithIdType) => {
    order.products.forEach(p => {
      if (!productSales[p.product]) {
        productSales[p.product] = { quantity: 0, revenue: 0 };
      }
      productSales[p.product].quantity += p.quantity;
      productSales[p.product].revenue += p.total;
    });
  });

  return Object.entries(productSales)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 10)
    .map(([productId, data]) => {
      const product = productMap.get(productId);
      return {
        id: productId,
        uniqId: product?.uniqId || "Unknown",
        name: product?.name || "Unknown",
        quantity: data.quantity,
        revenue: Math.round(data.revenue * 100) / 100,
      };
    });
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNum;
}