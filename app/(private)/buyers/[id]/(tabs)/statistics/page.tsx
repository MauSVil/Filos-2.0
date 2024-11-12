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
import { useMemo, useState } from "react"
import _ from "lodash"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { es } from "date-fns/locale"
import moment from "moment-timezone";

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
  const [date, setDate] = useState<string>(moment().tz('America/Mexico_City').toISOString());
  const { id } = useParams() as { id: string }
  const buyerStatisticQuery = useBuyerStatistic({ id, date })
  const buyerStatistics = useMemo(() => buyerStatisticQuery.data || {}, [buyerStatisticQuery.data]) as { finalAmountPerMonth: { [key: number]: number }, productsPerMonth: { [key: number]: number }, mostPopularProducts: { [key: string]: number }, samples: number }

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
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-4 items-center justify-between md:flex-row">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? moment(date).tz('America/Mexico_City').format('DD/MM/YYYY') : <span>Selecciona una fecha</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={moment(date).tz('America/Mexico_City').toDate()}
              onSelect={(date) => {
                if (date) {
                  setDate(date.toISOString());
                }
              }}
              initialFocus
              locale={es}
            />
          </PopoverContent>
        </Popover>
        <p>El tamaño de la muestra es de {buyerStatistics.samples} ordenes</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
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
        <Card className="md:col-span-2">
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
    </div>
  ); 
}

export default BuyerStatisticsPage;