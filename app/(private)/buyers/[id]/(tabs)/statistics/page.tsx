"use client"
import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useBuyerStatistic } from "../../../_hooks/useBuyerStatistic"
import { useParams } from "next/navigation"
import { useMemo } from "react"

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
}

const chartConfig = {
  sales: {
    label: "Ventas",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

const chartConfig2 = {
  products: {
    label: "Ventas",
    color: "hsl(var(--chart-1))",
  },
}

const BuyerStatisticsPage = () => {
  const { id } = useParams() as { id: string }
  const buyerStatisticQuery = useBuyerStatistic({ id })
  const buyerStatistics = useMemo(() => buyerStatisticQuery.data || {}, [buyerStatisticQuery.data]) as { finalAmountPerMonth: { [key: number]: number }, productsPerMonth: { [key: number]: number } }

  const chartData1 = useMemo(() => {
    const orderPerMonth = buyerStatistics.finalAmountPerMonth || {};
    return   Object.keys(orderPerMonth).map((month) => {
      const monthNumber = parseInt(month);
      return {
        month,
        sales: buyerStatistics.finalAmountPerMonth[monthNumber],
      }
    })
  }, [buyerStatistics])

  const chartData2 = useMemo(() => {
    const orderPerMonth = buyerStatistics.productsPerMonth || {};
    return   Object.keys(orderPerMonth).map((month) => {
      const monthNumber = parseInt(month);
      return {
        month,
        products: buyerStatistics.productsPerMonth[monthNumber],
      }
    })
  }, [buyerStatistics])

  return (
    <div className="grid grid-cols-1 gap-4 p-4 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Ventas totales ($)</CardTitle>
          <CardDescription>Enero - Diciembre 2024</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <LineChart
              accessibilityLayer
              data={chartData1}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => monthsParsed[value].slice(0, 3)}
              />
              <ChartTooltip
                content={<ChartTooltipContent hideLabel />}
              />
              <YAxis  />
              <Line
                dataKey="sales"
                type="linear"
                stroke="var(--color-sales)"
                strokeWidth={2}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Productos vendidos</CardTitle>
          <CardDescription>Enero - Diciembre 2024</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig2}>
            <LineChart
              accessibilityLayer
              data={chartData2}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => monthsParsed[value].slice(0, 3)}
              />
              <ChartTooltip
                content={<ChartTooltipContent hideLabel />}
              />
              <YAxis  />
              <Line
                dataKey="products"
                type="linear"
                stroke="var(--color-products)"
                strokeWidth={2}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  ); 
}

export default BuyerStatisticsPage;