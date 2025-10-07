"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import _ from "lodash";
import { CalendarIcon, TrendingUp, Package, DollarSign, ShoppingCart, ArrowLeft } from "lucide-react";
import { es } from "date-fns/locale";
import moment from "moment-timezone";
import numeral from "numeral";

import { useBuyerStatistic } from "../../_hooks/useBuyerStatistic";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";

const monthsParsed: { [key: number]: string } = {
  1: "Enero",
  2: "Febrero",
  3: "Marzo",
  4: "Abril",
  5: "Mayo",
  6: "Junio",
  7: "Julio",
  8: "Agosto",
  9: "Septiembre",
  10: "Octubre",
  11: "Noviembre",
  12: "Diciembre",
};

const chartConfig = {
  sales: {
    label: "Ventas",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const chartConfig2 = {
  products: {
    label: "Productos",
    color: "hsl(var(--chart-2))",
  },
};

const chartConfig3 = {
  models: {
    label: "Modelo",
    color: "hsl(var(--chart-3))",
  },
};

const BuyerStatisticsPage = () => {
  const router = useRouter();
  const [date, setDate] = useState<string>(
    moment().tz("America/Mexico_City").toISOString(),
  );
  const { id } = useParams() as { id: string };
  const buyerStatisticQuery = useBuyerStatistic({ id, date });
  const buyerStatistics = useMemo(
    () => buyerStatisticQuery.data || {},
    [buyerStatisticQuery.data],
  ) as {
    finalAmountPerMonth: { [key: number]: number };
    productsPerMonth: { [key: number]: number };
    mostPopularProducts: { [key: string]: number };
    samples: number;
    buyerName?: string;
  };

  const chartData1 = useMemo(() => {
    const orderPerMonth = buyerStatistics.finalAmountPerMonth || {};

    return Object.keys(orderPerMonth).map((month) => {
      const monthNumber = parseInt(month);

      return {
        month,
        sales: buyerStatistics.finalAmountPerMonth[monthNumber],
      };
    });
  }, [buyerStatistics]);

  const chartData2 = useMemo(() => {
    const orderPerMonth = buyerStatistics.productsPerMonth || {};

    return Object.keys(orderPerMonth).map((month) => {
      const monthNumber = parseInt(month);

      return {
        month,
        products: buyerStatistics.productsPerMonth[monthNumber],
      };
    });
  }, [buyerStatistics]);

  const chartData3 = useMemo(() => {
    const popularProducts = buyerStatistics.mostPopularProducts || {};
    const sorted = _.sortBy(
      _.toPairs(popularProducts),
      ([key, value]) => value,
    ).reverse();
    const sortedObj = _.fromPairs(sorted);

    return Object.keys(sortedObj)
      .slice(0, 5)
      .map((key) => {
        return {
          model: key,
          models: buyerStatistics.mostPopularProducts[key],
        };
      });
  }, [buyerStatistics]);

  // Calculate totals
  const totalSales = useMemo(() => {
    const sales = buyerStatistics.finalAmountPerMonth || {};
    return Object.values(sales).reduce((acc, val) => acc + val, 0);
  }, [buyerStatistics]);

  const totalProducts = useMemo(() => {
    const products = buyerStatistics.productsPerMonth || {};
    return Object.values(products).reduce((acc, val) => acc + val, 0);
  }, [buyerStatistics]);

  const selectedYear = moment(date).year();

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumbs */}
      <div className="mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/buyers">Compradores</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Estadísticas</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                Estadísticas del Comprador
              </h1>
              <p className="text-muted-foreground text-lg">
                Análisis de compras y productos favoritos
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Date Picker and Sample Info */}
      <div className="mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex items-center gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !date && "text-muted-foreground",
                      )}
                      variant={"outline"}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? (
                        moment(date).tz("America/Mexico_City").format("DD/MM/YYYY")
                      ) : (
                        <span>Selecciona una fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      initialFocus
                      locale={es}
                      mode="single"
                      selected={moment(date).tz("America/Mexico_City").toDate()}
                      onSelect={(date) => {
                        if (date) {
                          setDate(date.toISOString());
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  <ShoppingCart className="h-3 w-3 mr-1" />
                  {buyerStatistics.samples || 0} órdenes analizadas
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {numeral(totalSales).format("$0,0.00")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Año {selectedYear}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Vendidos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {numeral(totalProducts).format("0,0")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Unidades totales
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Ventas Mensuales</CardTitle>
            <CardDescription>
              Evolución de ventas - {selectedYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <LineChart accessibilityLayer data={chartData1}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  axisLine={false}
                  dataKey="month"
                  tickFormatter={(value) => monthsParsed[value]?.slice(0, 3) || value}
                  tickLine={false}
                  tickMargin={8}
                />
                <ChartTooltip
                  content={<ChartTooltipContent hideLabel />}
                  formatter={(value) => numeral(value).format("$0,0.00")}
                />
                <YAxis />
                <Line
                  dataKey="sales"
                  stroke="var(--color-sales)"
                  strokeWidth={2}
                  type="monotone"
                  dot={{ fill: "var(--color-sales)", r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productos Vendidos</CardTitle>
            <CardDescription>
              Unidades por mes - {selectedYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig2}>
              <LineChart accessibilityLayer data={chartData2}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  axisLine={false}
                  dataKey="month"
                  tickFormatter={(value) => monthsParsed[value]?.slice(0, 3) || value}
                  tickLine={false}
                  tickMargin={8}
                />
                <ChartTooltip
                  content={<ChartTooltipContent hideLabel />}
                  formatter={(value) => `${value} unidades`}
                />
                <YAxis />
                <Line
                  dataKey="products"
                  stroke="var(--color-products)"
                  strokeWidth={2}
                  type="monotone"
                  dot={{ fill: "var(--color-products)", r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Popular Products */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Top 5 Productos Más Comprados</CardTitle>
          <CardDescription>
            Modelos con mayor número de compras
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig3}>
            <BarChart accessibilityLayer data={chartData3}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                axisLine={false}
                dataKey="model"
                tickLine={false}
                tickMargin={10}
              />
              <ChartTooltip
                content={<ChartTooltipContent hideLabel />}
                cursor={false}
                formatter={(value) => `${value} unidades`}
              />
              <Bar dataKey="models" fill="var(--color-models)" radius={8}>
                <LabelList
                  className="fill-foreground"
                  fontSize={12}
                  offset={12}
                  position="top"
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default BuyerStatisticsPage;
