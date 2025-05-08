import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { toast } from "sonner";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

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
  const salesPerMonthQuery = useQuery<{ [year: number]: { [month: string]: number } }>({
    queryKey: ["salesPerMonth"],
    retry: 0,
    queryFn: async () => {
      try {
        const resp = (await ky
          .get("/api/statistics/dashboard/sales")
          .json()) as { data: { [year: number]: { [month: string]: number } } };
        return resp.data || {};
      } catch (error) {
        toast.error("An error occurred");
        throw new Error("An error occurred");
      }
    },
  });

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
    return Object.keys(salesPerMonth).reduce((acc, year, index) => {
      acc[year] = {
        label: year,
        color: `hsl(var(--chart-${index + 1}))`,
      };
      return acc;
    }, {} as ChartConfig);
  }, [salesPerMonth]);

  return (
    <Card className="col-span-3">
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
            {Object.keys(salesPerMonth).map((year, index) => (
              <Area
                key={year}
                dataKey={year}
                fill={`hsl(var(--chart-${index + 1}))`}
                fillOpacity={0.4}
                stroke={`hsl(var(--chart-${index + 1}))`}
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
              {Object.keys(salesPerMonth).join(" - ")}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SalesPerMonth;
