"use client";

import { useEffect, useState } from "react";
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductsOutOfStock from "./_components/ProductsOutOfStock";
import SalesPerMonth from "./_components/SalesPerMonth";
import UrgentActions from "./_components/UrgentActions";
import WeekCalendar from "./_components/WeekCalendar";
import WeeklySummary from "./_components/WeeklySummary";

interface DashboardStats {
  overview: {
    totalProducts: number;
    totalOrders: number;
    totalBuyers: number;
    totalRevenue: number;
  };
}

interface SalesStats {
  revenue: {
    total: number;
    byType: {
      retail: number;
      wholesale: number;
      special: number;
      webPage: number;
    };
    averageOrderValue: number;
  };
  topProducts: Array<{
    id: string;
    uniqId: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  paymentStatus: {
    paid: {
      count: number;
      amount: number;
    };
    pending: {
      count: number;
      amount: number;
    };
  };
}

interface WeeklyStats {
  weekInfo: {
    startDate: string;
    endDate: string;
    currentDay: string;
  };
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
  urgentActions: Array<{
    type: string;
    priority: "high" | "medium" | "low";
    title: string;
    description: string;
    count: number;
    amount?: number;
    actionLabel: string;
    actionUrl: string;
    orders?: Array<{
      id: string;
      name: string;
      dueDate: string;
      totalAmount: number;
      daysOverdue?: number;
      daysUntilDue?: number;
    }>;
    products?: Array<{
      id: string;
      uniqId: string;
      name: string;
      color: string;
      size: string;
      quantity: number;
    }>;
  }>;
  calendar: Array<{
    date: string;
    count: number;
    orders: Array<{
      id: string;
      name: string;
      totalAmount: number;
    }>;
  }>;
}

const Home = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [salesStats, setSalesStats] = useState<SalesStats | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingWeekly, setIsLoadingWeekly] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();

    const morningGreetings = [
      "Buenos días",
      "¡Buen día!",
      "¡Hola! Que tengas un gran día",
      "¡Buenos días! Listo para empezar",
      "¡Buen inicio de día!",
    ];

    const afternoonGreetings = [
      "Buenas tardes",
      "¡Buena tarde!",
      "¡Hola! Que tengas una gran tarde",
      "¡Buenas tardes! Sigamos con todo",
      "¡Hola! ¿Cómo va tu día?",
    ];

    const eveningGreetings = [
      "Buenas noches",
      "¡Buena noche!",
      "¡Hola! Aún hay tiempo para trabajar",
      "¡Buenas noches! Terminemos fuerte",
      "¡Hola! Cerremos el día bien",
    ];

    let greetings;
    if (hour >= 5 && hour < 12) {
      greetings = morningGreetings;
    } else if (hour >= 12 && hour < 19) {
      greetings = afternoonGreetings;
    } else {
      greetings = eveningGreetings;
    }

    const randomIndex = Math.floor(Math.random() * greetings.length);
    return greetings[randomIndex];
  };

  const fetchWeeklyStats = async () => {
    try {
      setIsLoadingWeekly(true);
      const response = await fetch("/api/v2/stats/dashboard/weekly");
      if (response.ok) {
        const data = await response.json();
        setWeeklyStats(data);
      }
    } catch (error) {
      console.error("Error fetching weekly stats:", error);
    } finally {
      setIsLoadingWeekly(false);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const params = new URLSearchParams({
          dateRangeStart: startOfYear.toISOString(),
          dateRangeEnd: now.toISOString(),
        });

        const [dashboardRes, salesRes, weeklyRes] = await Promise.all([
          fetch(`/api/v2/stats/dashboard?${params}`),
          fetch(`/api/v2/stats/sales?${params}`),
          fetch("/api/v2/stats/dashboard/weekly")
        ]);

        if (dashboardRes.ok) {
          const data = await dashboardRes.json();
          setStats(data);
        }

        if (salesRes.ok) {
          const data = await salesRes.json();
          setSalesStats(data);
        }

        if (weeklyRes.ok) {
          const data = await weeklyRes.json();
          setWeeklyStats(data);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{getGreeting()} 👋</h1>
        <p className="text-muted-foreground">Resumen de tu negocio</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="week" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="week" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Esta Semana
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            General
          </TabsTrigger>
        </TabsList>

        {/* Weekly View */}
        <TabsContent value="week" className="space-y-4">
          {weeklyStats && (
            <>
              <WeeklySummary summary={weeklyStats.summary} />
              <UrgentActions actions={weeklyStats.urgentActions} />
              <WeekCalendar weekInfo={weeklyStats.weekInfo} calendar={weeklyStats.calendar} />
            </>
          )}
          {!weeklyStats && !isLoading && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No se pudieron cargar los datos semanales</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Productos
              </CardDescription>
              <CardTitle className="text-2xl">{stats.overview.totalProducts}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Pedidos ({new Date().getFullYear()})
              </CardDescription>
              <CardTitle className="text-2xl">{stats.overview.totalOrders}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Compradores
              </CardDescription>
              <CardTitle className="text-2xl">{stats.overview.totalBuyers}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Ingresos ({new Date().getFullYear()})
              </CardDescription>
              <CardTitle className="text-2xl font-mono">
                ${stats.overview.totalRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="col-span-1 md:col-span-3">
          <ProductsOutOfStock />
        </div>
        <div className="col-span-1 md:col-span-3">
          <SalesPerMonth />
        </div>

        {/* Top Selling Products */}
        {salesStats?.topProducts && salesStats.topProducts.length > 0 && (
          <div className="col-span-1 md:col-span-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-gray-400" />
                  Productos Más Vendidos
                </CardTitle>
                <CardDescription>Top 10 productos por ingresos este año</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {salesStats.topProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">ID: {product.uniqId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Cantidad</p>
                          <p className="font-medium">{product.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Ingresos</p>
                          <p className="font-mono font-medium">
                            ${product.revenue.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Home;
