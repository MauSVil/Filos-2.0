import { OrderRepository } from "@/repositories/v2/OrderRepository";
import { NextRequest, NextResponse } from "next/server";
import { OrderBaseWithIdType } from "@/types/v2/Order/Base.type";

export const GET = async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const dateRangeStart = searchParams.get("dateRangeStart");
    const dateRangeEnd = searchParams.get("dateRangeEnd");

    const dateFilter = dateRangeStart && dateRangeEnd ? {
      requestDate: {
        $gte: new Date(dateRangeStart),
        $lte: new Date(dateRangeEnd)
      }
    } : {};

    const orders = await OrderRepository.find(dateFilter);

    const statusBreakdown = {
      pending: orders.filter((o: OrderBaseWithIdType) => o.status === "Pendiente").length,
      completed: orders.filter((o: OrderBaseWithIdType) => o.status === "Completado").length,
      cancelled: orders.filter((o: OrderBaseWithIdType) => o.status === "Cancelado").length,
    };

    const today = new Date();
    const overdueOrders = orders.filter((order: OrderBaseWithIdType) =>
      order.status === "Pendiente" && new Date(order.dueDate) < today
    );

    const processingTimes = orders
      .filter((o: OrderBaseWithIdType) => o.status === "Completado")
      .map((order: OrderBaseWithIdType) => {
        const requestDate = new Date(order.requestDate);
        const dueDate = new Date(order.dueDate);
        return Math.floor((dueDate.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24));
      });

    const averageProcessingTime = processingTimes.length > 0
      ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length
      : 0;

    const fulfillmentRate = orders.length > 0
      ? (orders.filter((o: OrderBaseWithIdType) => o.status === "Completado").length / orders.length) * 100
      : 0;

    const ordersWithDocuments = orders.filter((o: OrderBaseWithIdType) =>
      o.documents && Object.keys(o.documents).length > 0
    ).length;

    const ordersByMonth: Record<string, number> = {};
    orders.forEach((order: OrderBaseWithIdType) => {
      const month = new Date(order.requestDate).toISOString().substring(0, 7);
      ordersByMonth[month] = (ordersByMonth[month] || 0) + 1;
    });

    const monthlyTrends = Object.entries(ordersByMonth)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, count]) => ({ month, count }));

    const upcomingDeliveries = orders
      .filter((o: OrderBaseWithIdType) =>
        o.status === "Pendiente" && new Date(o.dueDate) >= today
      )
      .sort((a: OrderBaseWithIdType, b: OrderBaseWithIdType) =>
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      )
      .slice(0, 10)
      .map((order: OrderBaseWithIdType) => ({
        id: order._id,
        name: order.name,
        dueDate: order.dueDate,
        totalAmount: order.totalAmount,
        paid: order.paid,
      }));

    const response = {
      summary: {
        total: orders.length,
        ...statusBreakdown,
        overdueCount: overdueOrders.length,
      },
      status: statusBreakdown,
      processing: {
        averageProcessingTime: Math.round(averageProcessingTime * 10) / 10,
        fulfillmentRate: Math.round(fulfillmentRate * 100) / 100,
      },
      documents: {
        ordersWithDocuments,
        ordersWithoutDocuments: orders.length - ordersWithDocuments,
      },
      overdue: overdueOrders.slice(0, 10).map((order: OrderBaseWithIdType) => ({
        id: order._id,
        name: order.name,
        dueDate: order.dueDate,
        daysPastDue: Math.floor((today.getTime() - new Date(order.dueDate).getTime()) / (1000 * 60 * 60 * 24)),
        totalAmount: order.totalAmount,
      })),
      upcoming: upcomingDeliveries,
      monthlyTrends,
      metadata: {
        timestamp: new Date().toISOString(),
        dateRange: {
          start: dateRangeStart || null,
          end: dateRangeEnd || null,
        },
      }
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=120',
      }
    });

  } catch (error) {
    console.error("Order stats error:", error);
    if (error instanceof Error) {
      return NextResponse.json({
        error: error.message,
        devMessage: "Failed to fetch order statistics"
      }, { status: 500 });
    }
    return NextResponse.json({
      error: "An unexpected error occurred",
      devMessage: "Unknown error in order statistics"
    }, { status: 500 });
  }
};