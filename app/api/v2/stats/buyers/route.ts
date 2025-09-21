import { BuyerRepository } from "@/repositories/v2/BuyerRepository";
import { OrderRepository } from "@/repositories/v2/OrderRepository";
import { NextRequest, NextResponse } from "next/server";
import { BuyerBaseWithIdType } from "@/types/v2/Buyer/Base.type";
import { OrderBaseWithIdType } from "@/types/v2/Order/Base.type";

export const GET = async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const dateRangeStart = searchParams.get("dateRangeStart");
    const dateRangeEnd = searchParams.get("dateRangeEnd");

    const buyers = await BuyerRepository.find({ deletedAt: { $exists: false } });

    const dateFilter = dateRangeStart && dateRangeEnd ? {
      requestDate: {
        $gte: new Date(dateRangeStart),
        $lte: new Date(dateRangeEnd)
      }
    } : {};

    const orders = await OrderRepository.find(dateFilter);

    const buyerMap = new Map<string, BuyerBaseWithIdType>();
    buyers.forEach((b: BuyerBaseWithIdType) => buyerMap.set(b._id.toString(), b));

    const buyerMetrics: Record<string, {
      orderCount: number;
      totalRevenue: number;
      products: number;
      lastOrder?: Date;
    }> = {};

    orders.forEach((order: OrderBaseWithIdType) => {
      if (!buyerMetrics[order.buyer]) {
        buyerMetrics[order.buyer] = {
          orderCount: 0,
          totalRevenue: 0,
          products: 0,
        };
      }

      buyerMetrics[order.buyer].orderCount++;
      buyerMetrics[order.buyer].totalRevenue += order.totalAmount || 0;
      buyerMetrics[order.buyer].products += order.products.length;

      if (!buyerMetrics[order.buyer].lastOrder ||
          new Date(order.requestDate) > buyerMetrics[order.buyer].lastOrder!) {
        buyerMetrics[order.buyer].lastOrder = new Date(order.requestDate);
      }
    });

    const topBuyersByOrders = Object.entries(buyerMetrics)
      .sort((a, b) => b[1].orderCount - a[1].orderCount)
      .slice(0, 10)
      .map(([buyerId, metrics]) => {
        const buyer = buyerMap.get(buyerId);
        return {
          id: buyerId,
          name: buyer?.name || "Unknown",
          orderCount: metrics.orderCount,
          totalRevenue: Math.round(metrics.totalRevenue * 100) / 100,
          averageOrderValue: Math.round((metrics.totalRevenue / metrics.orderCount) * 100) / 100,
          lastOrder: metrics.lastOrder,
        };
      });

    const topBuyersByRevenue = Object.entries(buyerMetrics)
      .sort((a, b) => b[1].totalRevenue - a[1].totalRevenue)
      .slice(0, 10)
      .map(([buyerId, metrics]) => {
        const buyer = buyerMap.get(buyerId);
        return {
          id: buyerId,
          name: buyer?.name || "Unknown",
          totalRevenue: Math.round(metrics.totalRevenue * 100) / 100,
          orderCount: metrics.orderCount,
          averageOrderValue: Math.round((metrics.totalRevenue / metrics.orderCount) * 100) / 100,
        };
      });

    const buyerTypes = {
      chain: buyers.filter((b: BuyerBaseWithIdType) => b.isChain).length,
      individual: buyers.filter((b: BuyerBaseWithIdType) => !b.isChain).length,
    };

    const activeBuyers = Object.keys(buyerMetrics).length;
    const inactiveBuyers = buyers.length - activeBuyers;

    const averageOrdersPerBuyer = activeBuyers > 0
      ? Object.values(buyerMetrics).reduce((sum, m) => sum + m.orderCount, 0) / activeBuyers
      : 0;

    const averageRevenuePerBuyer = activeBuyers > 0
      ? Object.values(buyerMetrics).reduce((sum, m) => sum + m.totalRevenue, 0) / activeBuyers
      : 0;

    const buyerAcquisition: Record<string, number> = {};
    buyers.forEach((buyer: BuyerBaseWithIdType) => {
      if (buyer.createdAt) {
        const month = new Date(buyer.createdAt).toISOString().substring(0, 7);
        buyerAcquisition[month] = (buyerAcquisition[month] || 0) + 1;
      }
    });

    const acquisitionTrends = Object.entries(buyerAcquisition)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12)
      .map(([month, count]) => ({ month, count }));

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentlyActive = Object.entries(buyerMetrics)
      .filter(([_, metrics]) => metrics.lastOrder && metrics.lastOrder >= thirtyDaysAgo)
      .length;

    const response = {
      summary: {
        totalBuyers: buyers.length,
        activeBuyers,
        inactiveBuyers,
        recentlyActive,
      },
      types: buyerTypes,
      topByOrders: topBuyersByOrders,
      topByRevenue: topBuyersByRevenue,
      averages: {
        ordersPerBuyer: Math.round(averageOrdersPerBuyer * 10) / 10,
        revenuePerBuyer: Math.round(averageRevenuePerBuyer * 100) / 100,
      },
      retention: {
        activeBuyers,
        inactiveBuyers,
        retentionRate: buyers.length > 0
          ? Math.round((activeBuyers / buyers.length) * 10000) / 100
          : 0,
      },
      acquisitionTrends,
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
    console.error("Buyer stats error:", error);
    if (error instanceof Error) {
      return NextResponse.json({
        error: error.message,
        devMessage: "Failed to fetch buyer statistics"
      }, { status: 500 });
    }
    return NextResponse.json({
      error: "An unexpected error occurred",
      devMessage: "Unknown error in buyer statistics"
    }, { status: 500 });
  }
};