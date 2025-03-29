import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useSalesPerMonth } from "../_hooks/useSalesPerMonth";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type SalesData = {
  [year: number]: {
    [month: string]: number; // El total de ventas para cada mes
  };
};

const salesData: SalesData = {
  2023: {
    January: 200,
    February: 300,
    March: 400,
    April: 250,
    May: 500,
    June: 350,
    July: 0,
    August: 0,
    September: 100,
    October: 150,
    November: 200,
    December: 250,
  },
  2024: {
    January: 300,
    February: 400,
    March: 500,
    April: 300,
    May: 600,
    June: 450,
    July: 0,
    August: 0,
    September: 200,
    October: 250,
    November: 300,
    December: 350,
  },
};

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const SalesPerMonth = () => {
  const salesPerMonthQuery = useSalesPerMonth();
  const salesPerMonth = useMemo(
    () => salesPerMonthQuery.data || {},
    [salesPerMonthQuery.data],
  );

  const chartData = useMemo(() => {
    return months.map((month) => ({
      month,
      ...Object.keys(salesPerMonth).reduce(
        (acc, year) => {
          acc[year] = salesPerMonth[parseInt(year)][month] || 0;

          return acc;
        },
        {} as Record<string, number>,
      ),
    }));
  }, [salesPerMonth]);

  const chartConfig = useMemo(() => {
    return Object.keys(salesData).reduce((acc, year, index) => {
      acc[year] = {
        label: year,
        color: `hsl(var(--chart-${index + 1}))`,
      };

      return acc;
    }, {} as ChartConfig);
  }, [salesPerMonth]);

  return (
    <Card className="max-w-xs" x-chunk="charts-01-chunk-2">
      <CardHeader>
        <CardTitle>Ventas por mes ($)</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="month"
              tickFormatter={(value) => value.slice(0, 3)}
              tickLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              content={<ChartTooltipContent indicator="dot" />}
              cursor={false}
            />
            {Object.keys(salesData).map((year) => (
              <Area
                key={year}
                dataKey={year}
                fill={`var(--color-${year})`}
                fillOpacity={0.4}
                stroke={`var(--color-${year})`}
                type="natural"
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Comparación anual
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              {Object.keys(salesData).join(" - ")}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SalesPerMonth;
