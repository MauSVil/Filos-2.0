"use client"
import { Bar, BarChart, CartesianGrid, LabelList, Line, LineChart, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
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
import _ from "lodash"

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

const chartConfig3 = {
  models: {
    label: "Modelo",
    color: "hsl(var(--chart-1))",
  },
}

const BuyerStatisticsPage = () => {
  const { id } = useParams() as { id: string }
  const buyerStatisticQuery = useBuyerStatistic({ id })
  const buyerStatistics = useMemo(() => buyerStatisticQuery.data || {}, [buyerStatisticQuery.data]) as { finalAmountPerMonth: { [key: number]: number }, productsPerMonth: { [key: number]: number }, mostPopularProducts: { [key: string]: number } }

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

  const chartData3 = useMemo(() => {
    const popularProducts = buyerStatistics.mostPopularProducts || {};
    const sorted = _.sortBy(_.toPairs(popularProducts), ([key, value]) => value).reverse();
    const sortedObj = _.fromPairs(sorted);
    return Object.keys(sortedObj).slice(0, 5).map((key) => {
      return {
        model: key,
        models: buyerStatistics.mostPopularProducts[key],
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
      <Card>
      <CardHeader>
        <CardTitle>Productos populares</CardTitle>
        <CardDescription>Enero - Diciembre 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig3}>
          <BarChart
            accessibilityLayer
            data={chartData3}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="model"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="models" fill="var(--color-models)" radius={8}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
    </div>
  ); 
}

export default BuyerStatisticsPage;