import { ProductRepository } from "@/repositories/v2/ProductRepository";
import { NextRequest, NextResponse } from "next/server";
import { ProductBaseWithIdType } from "@/types/v2/Product/Base.type";

export const GET = async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const lowStockThreshold = parseInt(searchParams.get("lowStockThreshold") || "10");
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    const baseFilter = includeDeleted ? {} : { deleted_at: null };

    const [
      totalProducts,
      activeProducts,
      deletedProducts,
      outOfStock,
      lowStock,
      products
    ] = await Promise.all([
      ProductRepository.count({}),
      ProductRepository.count({ deleted_at: null }),
      ProductRepository.count({ deleted_at: { $ne: null } }),
      ProductRepository.count({ ...baseFilter, quantity: { $lte: 0 } }),
      ProductRepository.count({
        ...baseFilter,
        quantity: { $gt: 0, $lte: lowStockThreshold }
      }),
      ProductRepository.find(baseFilter)
    ]);

    const stockLevels = {
      outOfStock: products.filter((p: ProductBaseWithIdType) => p.quantity <= 0).length,
      critical: products.filter((p: ProductBaseWithIdType) => p.quantity > 0 && p.quantity <= 5).length,
      low: products.filter((p: ProductBaseWithIdType) => p.quantity > 5 && p.quantity <= lowStockThreshold).length,
      normal: products.filter((p: ProductBaseWithIdType) => p.quantity > lowStockThreshold && p.quantity <= 50).length,
      high: products.filter((p: ProductBaseWithIdType) => p.quantity > 50).length,
    };

    const colorDistribution: Record<string, number> = {};
    const sizeDistribution: Record<string, number> = {};
    const colorSizeMatrix: Record<string, Record<string, number>> = {};

    products.forEach((product: ProductBaseWithIdType) => {
      if (product.color) {
        colorDistribution[product.color] = (colorDistribution[product.color] || 0) + 1;
      }

      if (product.size) {
        sizeDistribution[product.size] = (sizeDistribution[product.size] || 0) + 1;
      }

      if (product.color && product.size) {
        if (!colorSizeMatrix[product.color]) {
          colorSizeMatrix[product.color] = {};
        }
        colorSizeMatrix[product.color][product.size] =
          (colorSizeMatrix[product.color][product.size] || 0) + 1;
      }
    });

    const totalStock = products.reduce((sum: number, p: ProductBaseWithIdType) => sum + (p.quantity || 0), 0);
    const averageStock = products.length > 0 ? totalStock / products.length : 0;

    const stockValueByPricing = {
      webPage: products.reduce((sum: number, p: ProductBaseWithIdType) =>
        sum + ((p.quantity || 0) * (p.webPagePrice || 0)), 0),
      wholesale: products.reduce((sum: number, p: ProductBaseWithIdType) =>
        sum + ((p.quantity || 0) * (p.wholesalePrice || 0)), 0),
      retail: products.reduce((sum: number, p: ProductBaseWithIdType) =>
        sum + ((p.quantity || 0) * (p.retailPrice || 0)), 0),
      special: products.reduce((sum: number, p: ProductBaseWithIdType) =>
        sum + ((p.quantity || 0) * (p.specialPrice || 0)), 0),
    };

    const criticalProducts = products
      .filter((p: ProductBaseWithIdType) => p.quantity > 0 && p.quantity <= 5)
      .sort((a: ProductBaseWithIdType, b: ProductBaseWithIdType) => a.quantity - b.quantity)
      .slice(0, 10)
      .map((p: ProductBaseWithIdType) => ({
        id: p._id,
        uniqId: p.uniqId,
        name: p.name,
        quantity: p.quantity,
        color: p.color,
        size: p.size,
      }));

    const outOfStockProducts = products
      .filter((p: ProductBaseWithIdType) => p.quantity <= 0)
      .slice(0, 10)
      .map((p: ProductBaseWithIdType) => ({
        id: p._id,
        uniqId: p.uniqId,
        name: p.name,
        color: p.color,
        size: p.size,
        lastUpdated: p.updated_at,
      }));

    const stockDistribution = calculateStockDistribution(products);

    const response = {
      summary: {
        totalProducts,
        activeProducts,
        deletedProducts,
        totalStock,
        averageStock: Math.round(averageStock * 100) / 100,
      },
      stockStatus: {
        outOfStock,
        lowStock,
        adequate: activeProducts - outOfStock - lowStock,
      },
      stockLevels,
      distribution: {
        byColor: Object.entries(colorDistribution)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([color, count]) => ({ color, count })),
        bySize: Object.entries(sizeDistribution)
          .sort((a, b) => b[1] - a[1])
          .map(([size, count]) => ({ size, count })),
        colorSizeMatrix: Object.entries(colorSizeMatrix)
          .slice(0, 10)
          .reduce((acc, [color, sizes]) => {
            acc[color] = sizes;
            return acc;
          }, {} as Record<string, Record<string, number>>),
      },
      stockValue: {
        webPage: Math.round(stockValueByPricing.webPage * 100) / 100,
        wholesale: Math.round(stockValueByPricing.wholesale * 100) / 100,
        retail: Math.round(stockValueByPricing.retail * 100) / 100,
        special: Math.round(stockValueByPricing.special * 100) / 100,
      },
      alerts: {
        criticalProducts,
        outOfStockProducts,
      },
      stockDistribution,
      metadata: {
        timestamp: new Date().toISOString(),
        lowStockThreshold,
        includeDeleted,
      }
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=120',
      }
    });

  } catch (error) {
    console.error("Inventory stats error:", error);
    if (error instanceof Error) {
      return NextResponse.json({
        error: error.message,
        devMessage: "Failed to fetch inventory statistics"
      }, { status: 500 });
    }
    return NextResponse.json({
      error: "An unexpected error occurred",
      devMessage: "Unknown error in inventory statistics"
    }, { status: 500 });
  }
};

function calculateStockDistribution(products: ProductBaseWithIdType[]) {
  const ranges = [
    { min: 0, max: 0, label: "Out of Stock" },
    { min: 1, max: 5, label: "1-5" },
    { min: 6, max: 10, label: "6-10" },
    { min: 11, max: 25, label: "11-25" },
    { min: 26, max: 50, label: "26-50" },
    { min: 51, max: 100, label: "51-100" },
    { min: 101, max: Infinity, label: "100+" },
  ];

  return ranges.map(range => ({
    range: range.label,
    count: products.filter((p: ProductBaseWithIdType) =>
      p.quantity >= range.min && (range.max === Infinity ? true : p.quantity <= range.max)
    ).length,
  }));
}