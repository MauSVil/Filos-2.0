import { ProductRepository } from "@/repositories/v2/ProductRepository";
import { OrderRepository } from "@/repositories/v2/OrderRepository";
import { BuyerRepository } from "@/repositories/v2/BuyerRepository";
import { UserRepository } from "@/repositories/v2/UserRepository";
import { NextRequest, NextResponse } from "next/server";
import { OrderBaseWithIdType } from "@/types/v2/Order/Base.type";
import { ProductBaseWithIdType } from "@/types/v2/Product/Base.type";

export const GET = async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const dateRangeStart = searchParams.get("dateRangeStart");
    const dateRangeEnd = searchParams.get("dateRangeEnd");
    const lowStockThreshold = parseInt(searchParams.get("lowStockThreshold") || "10");

    const dateFilter = dateRangeStart && dateRangeEnd ? {
      requestDate: {
        $gte: new Date(dateRangeStart),
        $lte: new Date(dateRangeEnd)
      }
    } : {};

    const [
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      orders,
      totalBuyers,
      totalUsers,
      recentOrders
    ] = await Promise.all([
      ProductRepository.count({ deleted_at: null }),

      ProductRepository.findWithOptions({
        deleted_at: null,
        quantity: { $gt: 0, $lte: lowStockThreshold }
      }, { limit: 10 }),

      ProductRepository.count({
        deleted_at: null,
        quantity: { $lte: 0 }
      }),

      OrderRepository.find(dateFilter),

      BuyerRepository.count({ $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] }),

      UserRepository.count({ $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] }),

      OrderRepository.findWithOptions(
        {},
        {
          limit: 5,
          sort: { requestDate: -1 }
        }
      )
    ]);

    const orderStats = {
      total: orders.length,
      pending: orders.filter((o: OrderBaseWithIdType) => o.status === "Pendiente").length,
      completed: orders.filter((o: OrderBaseWithIdType) => o.status === "Completado").length,
      cancelled: orders.filter((o: OrderBaseWithIdType) => o.status === "Cancelado").length,
    };

    const revenueStats = {
      total: orders.reduce((sum: number, order: OrderBaseWithIdType) => sum + (order.totalAmount || 0), 0),
      pending: orders
        .filter((o: OrderBaseWithIdType) => !o.paid)
        .reduce((sum: number, order: OrderBaseWithIdType) => sum + (order.totalAmount || 0), 0),
      completed: orders
        .filter((o: OrderBaseWithIdType) => o.paid)
        .reduce((sum: number, order: OrderBaseWithIdType) => sum + (order.totalAmount || 0), 0),
      averageOrderValue: orders.length > 0
        ? orders.reduce((sum: number, order: OrderBaseWithIdType) => sum + (order.totalAmount || 0), 0) / orders.length
        : 0,
    };

    const paymentStats = {
      paid: orders.filter((o: OrderBaseWithIdType) => o.paid).length,
      pending: orders.filter((o: OrderBaseWithIdType) => !o.paid).length,
      advancedPayments: orders.reduce((sum: number, order: OrderBaseWithIdType) => sum + (order.advancedPayment || 0), 0),
    };

    const today = new Date();
    const overduOrders = orders.filter((order: OrderBaseWithIdType) =>
      order.status === "Pendiente" &&
      new Date(order.dueDate) < today
    ).length;

    const lowStockAlert = lowStockProducts.map((product: ProductBaseWithIdType) => ({
      id: product._id,
      uniqId: product.uniqId,
      name: product.name,
      quantity: product.quantity,
      color: product.color,
      size: product.size,
    }));

    const recentActivity = recentOrders.map((order: OrderBaseWithIdType) => ({
      id: order._id,
      name: order.name,
      status: order.status,
      totalAmount: order.totalAmount,
      requestDate: order.requestDate,
      paid: order.paid,
    }));

    const orderTrends = calculateOrderTrends(orders);
    const revenueTrends = calculateRevenueTrends(orders);

    const response = {
      overview: {
        totalProducts,
        outOfStockProducts,
        totalOrders: orderStats.total,
        totalBuyers,
        totalUsers,
        totalRevenue: revenueStats.total,
        averageOrderValue: Math.round(revenueStats.averageOrderValue * 100) / 100,
      },
      orderStats,
      revenueStats: {
        ...revenueStats,
        total: Math.round(revenueStats.total * 100) / 100,
        pending: Math.round(revenueStats.pending * 100) / 100,
        completed: Math.round(revenueStats.completed * 100) / 100,
        averageOrderValue: Math.round(revenueStats.averageOrderValue * 100) / 100,
      },
      paymentStats,
      alerts: {
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts,
        overdueOrdersCount: overduOrders,
        lowStockProducts: lowStockAlert,
      },
      recentActivity,
      trends: {
        orders: orderTrends,
        revenue: revenueTrends,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        dateRange: {
          start: dateRangeStart || null,
          end: dateRangeEnd || null,
        },
        lowStockThreshold,
      }
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=60',
      }
    });

  } catch (error) {
    console.error("Dashboard stats error:", error);
    if (error instanceof Error) {
      return NextResponse.json({
        error: error.message,
        devMessage: "Failed to fetch dashboard statistics"
      }, { status: 500 });
    }
    return NextResponse.json({
      error: "An unexpected error occurred",
      devMessage: "Unknown error in dashboard statistics"
    }, { status: 500 });
  }
};

function calculateOrderTrends(orders: OrderBaseWithIdType[]) {
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  const dailyOrders: Record<string, number> = {};

  orders
    .filter(order => new Date(order.requestDate) >= last30Days)
    .forEach(order => {
      const date = new Date(order.requestDate).toISOString().split('T')[0];
      dailyOrders[date] = (dailyOrders[date] || 0) + 1;
    });

  const sortedDates = Object.keys(dailyOrders).sort();

  return sortedDates.slice(-7).map(date => ({
    date,
    count: dailyOrders[date],
  }));
}

function calculateRevenueTrends(orders: OrderBaseWithIdType[]) {
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  const dailyRevenue: Record<string, number> = {};

  orders
    .filter(order => new Date(order.requestDate) >= last30Days)
    .forEach(order => {
      const date = new Date(order.requestDate).toISOString().split('T')[0];
      dailyRevenue[date] = (dailyRevenue[date] || 0) + (order.totalAmount || 0);
    });

  const sortedDates = Object.keys(dailyRevenue).sort();

  return sortedDates.slice(-7).map(date => ({
    date,
    amount: Math.round(dailyRevenue[date] * 100) / 100,
  }));
}