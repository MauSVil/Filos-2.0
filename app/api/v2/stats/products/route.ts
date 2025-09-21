import { ProductRepository } from "@/repositories/v2/ProductRepository";
import { OrderRepository } from "@/repositories/v2/OrderRepository";
import { NextRequest, NextResponse } from "next/server";
import { ProductBaseWithIdType } from "@/types/v2/Product/Base.type";
import { OrderBaseWithIdType } from "@/types/v2/Order/Base.type";

export const GET = async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const dateRangeStart = searchParams.get("dateRangeStart");
    const dateRangeEnd = searchParams.get("dateRangeEnd");
    const limit = parseInt(searchParams.get("limit") || "10");

    const products = await ProductRepository.find({ deleted_at: { $exists: false } });

    const dateFilter = dateRangeStart && dateRangeEnd ? {
      requestDate: {
        $gte: new Date(dateRangeStart),
        $lte: new Date(dateRangeEnd)
      }
    } : {};

    const orders = await OrderRepository.find(dateFilter);

    const productSales: Record<string, {
      quantity: number;
      revenue: number;
      orderCount: number;
    }> = {};

    orders.forEach((order: OrderBaseWithIdType) => {
      order.products.forEach(p => {
        if (!productSales[p.product]) {
          productSales[p.product] = {
            quantity: 0,
            revenue: 0,
            orderCount: 0,
          };
        }
        productSales[p.product].quantity += p.quantity;
        productSales[p.product].revenue += p.total;
        productSales[p.product].orderCount++;
      });
    });

    const productMap = new Map<string, ProductBaseWithIdType>();
    products.forEach((p: ProductBaseWithIdType) => productMap.set(p._id.toString(), p));

    const bestSelling = Object.entries(productSales)
      .sort((a, b) => b[1].quantity - a[1].quantity)
      .slice(0, limit)
      .map(([productId, sales]) => {
        const product = productMap.get(productId);
        return {
          id: productId,
          uniqId: product?.uniqId || "Unknown",
          name: product?.name || "Unknown",
          color: product?.color,
          size: product?.size,
          quantitySold: sales.quantity,
          revenue: Math.round(sales.revenue * 100) / 100,
          orderCount: sales.orderCount,
        };
      });

    const mostProfitable = Object.entries(productSales)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, limit)
      .map(([productId, sales]) => {
        const product = productMap.get(productId);
        return {
          id: productId,
          uniqId: product?.uniqId || "Unknown",
          name: product?.name || "Unknown",
          revenue: Math.round(sales.revenue * 100) / 100,
          quantitySold: sales.quantity,
          averagePrice: Math.round((sales.revenue / sales.quantity) * 100) / 100,
        };
      });

    const slowMoving = products
      .filter((p: ProductBaseWithIdType) => {
        const sales = productSales[p._id.toString()];
        return p.quantity > 0 && (!sales || sales.quantity === 0);
      })
      .slice(0, limit)
      .map((p: ProductBaseWithIdType) => ({
        id: p._id,
        uniqId: p.uniqId,
        name: p.name,
        quantity: p.quantity,
        color: p.color,
        size: p.size,
        lastUpdated: p.updated_at,
      }));

    const neverOrdered = products
      .filter((p: ProductBaseWithIdType) => !productSales[p._id.toString()])
      .length;

    const priceAnalysis = {
      webPage: {
        min: Math.min(...products.map((p: ProductBaseWithIdType) => p.webPagePrice || 0)),
        max: Math.max(...products.map((p: ProductBaseWithIdType) => p.webPagePrice || 0)),
        average: products.length > 0
          ? products.reduce((sum, p) => sum + (p.webPagePrice || 0), 0) / products.length
          : 0,
      },
      wholesale: {
        min: Math.min(...products.map((p: ProductBaseWithIdType) => p.wholesalePrice || 0)),
        max: Math.max(...products.map((p: ProductBaseWithIdType) => p.wholesalePrice || 0)),
        average: products.length > 0
          ? products.reduce((sum, p) => sum + (p.wholesalePrice || 0), 0) / products.length
          : 0,
      },
      retail: {
        min: Math.min(...products.map((p: ProductBaseWithIdType) => p.retailPrice || 0)),
        max: Math.max(...products.map((p: ProductBaseWithIdType) => p.retailPrice || 0)),
        average: products.length > 0
          ? products.reduce((sum, p) => sum + (p.retailPrice || 0), 0) / products.length
          : 0,
      },
      special: {
        min: Math.min(...products.map((p: ProductBaseWithIdType) => p.specialPrice || 0)),
        max: Math.max(...products.map((p: ProductBaseWithIdType) => p.specialPrice || 0)),
        average: products.length > 0
          ? products.reduce((sum, p) => sum + (p.specialPrice || 0), 0) / products.length
          : 0,
      },
    };

    Object.keys(priceAnalysis).forEach(tier => {
      const analysis = priceAnalysis[tier as keyof typeof priceAnalysis];
      analysis.min = Math.round(analysis.min * 100) / 100;
      analysis.max = Math.round(analysis.max * 100) / 100;
      analysis.average = Math.round(analysis.average * 100) / 100;
    });

    const totalRevenue = Object.values(productSales)
      .reduce((sum, sales) => sum + sales.revenue, 0);

    const turnoverRate = products.length > 0
      ? (Object.keys(productSales).length / products.length) * 100
      : 0;

    const response = {
      performance: {
        bestSelling,
        mostProfitable,
        slowMoving,
      },
      summary: {
        totalProducts: products.length,
        productsSold: Object.keys(productSales).length,
        neverOrdered,
        turnoverRate: Math.round(turnoverRate * 100) / 100,
      },
      pricing: priceAnalysis,
      revenue: {
        total: Math.round(totalRevenue * 100) / 100,
        averagePerProduct: products.length > 0
          ? Math.round((totalRevenue / products.length) * 100) / 100
          : 0,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        dateRange: {
          start: dateRangeStart || null,
          end: dateRangeEnd || null,
        },
        limit,
      }
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=120',
      }
    });

  } catch (error) {
    console.error("Product stats error:", error);
    if (error instanceof Error) {
      return NextResponse.json({
        error: error.message,
        devMessage: "Failed to fetch product performance statistics"
      }, { status: 500 });
    }
    return NextResponse.json({
      error: "An unexpected error occurred",
      devMessage: "Unknown error in product performance statistics"
    }, { status: 500 });
  }
};