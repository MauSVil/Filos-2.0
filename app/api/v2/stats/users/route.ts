import { UserRepository } from "@/repositories/v2/UserRepository";
import { NextRequest, NextResponse } from "next/server";
import { MongoUser } from "@/types/RepositoryTypes/User";

export const GET = async (req: NextRequest) => {
  try {
    const users = await UserRepository.find({ $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] });

    const roleDistribution: Record<string, number> = {};
    users.forEach((user: MongoUser) => {
      if (user.role) {
        roleDistribution[user.role] = (roleDistribution[user.role] || 0) + 1;
      }
    });

    const totalUsers = users.length;
    const deletedUsers = await UserRepository.count({ deletedAt: { $ne: null } });

    const userCreationByMonth: Record<string, number> = {};
    users.forEach((user: MongoUser) => {
      if (user.createdAt) {
        const month = new Date(user.createdAt).toISOString().substring(0, 7);
        userCreationByMonth[month] = (userCreationByMonth[month] || 0) + 1;
      }
    });

    const creationTrends = Object.entries(userCreationByMonth)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12)
      .map(([month, count]) => ({ month, count }));

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentlyCreated = users.filter((user: MongoUser) =>
      user.createdAt && new Date(user.createdAt) >= thirtyDaysAgo
    ).length;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const lastWeekCreated = users.filter((user: MongoUser) =>
      user.createdAt && new Date(user.createdAt) >= sevenDaysAgo
    ).length;

    const userList = users.slice(0, 20).map((user: MongoUser) => ({
      id: user._id,
      name: `${user.name || ''} ${user.firstLastName || ''} ${user.secondLastName || ''}`.trim(),
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    }));

    const emailDomains: Record<string, number> = {};
    users.forEach((user: MongoUser) => {
      if (user.email) {
        const domain = user.email.split('@')[1];
        if (domain) {
          emailDomains[domain] = (emailDomains[domain] || 0) + 1;
        }
      }
    });

    const topDomains = Object.entries(emailDomains)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([domain, count]) => ({ domain, count }));

    const response = {
      summary: {
        totalActive: totalUsers,
        totalDeleted: deletedUsers,
        total: totalUsers + deletedUsers,
        recentlyCreated,
        lastWeekCreated,
      },
      roles: Object.entries(roleDistribution).map(([role, count]) => ({
        role,
        count,
        percentage: totalUsers > 0 ? Math.round((count / totalUsers) * 10000) / 100 : 0,
      })),
      trends: {
        monthly: creationTrends,
        growth: calculateUserGrowth(creationTrends),
      },
      emailDomains: topDomains,
      recentUsers: userList,
      metadata: {
        timestamp: new Date().toISOString(),
      }
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=120',
      }
    });

  } catch (error) {
    console.error("User stats error:", error);
    if (error instanceof Error) {
      return NextResponse.json({
        error: error.message,
        devMessage: "Failed to fetch user statistics"
      }, { status: 500 });
    }
    return NextResponse.json({
      error: "An unexpected error occurred",
      devMessage: "Unknown error in user statistics"
    }, { status: 500 });
  }
};

function calculateUserGrowth(trends: { month: string; count: number }[]) {
  if (trends.length < 2) return null;

  const current = trends[trends.length - 1].count;
  const previous = trends[trends.length - 2].count;

  const growthRate = previous > 0
    ? ((current - previous) / previous) * 100
    : 0;

  return {
    currentMonth: trends[trends.length - 1].month,
    previousMonth: trends[trends.length - 2].month,
    growthRate: Math.round(growthRate * 100) / 100,
    newUsers: current - previous,
  };
}