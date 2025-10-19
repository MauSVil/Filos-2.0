"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarDay {
  date: string;
  count: number;
  orders: Array<{
    id: string;
    name: string;
    totalAmount: number;
  }>;
}

interface WeekCalendarProps {
  weekInfo: {
    startDate: string;
    endDate: string;
    currentDay: string;
  };
  calendar: CalendarDay[];
}

const WeekCalendar = ({ weekInfo, calendar }: WeekCalendarProps) => {
  const startDate = new Date(weekInfo.startDate);
  const today = new Date(weekInfo.currentDay);

  // Generate all 7 days of the week
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateKey = date.toISOString().split("T")[0];
    const dayData = calendar.find((d) => d.date === dateKey);
    return {
      date,
      dateKey,
      dayData: dayData || null
    };
  });

  const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  const isToday = (date: Date) => {
    return date.toISOString().split("T")[0] === today.toISOString().split("T")[0];
  };

  const isPast = (date: Date) => {
    return date < today && !isToday(date);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-400" />
          Entregas de la Semana
        </CardTitle>
        <CardDescription>
          {new Date(weekInfo.startDate).toLocaleDateString("es-MX", {
            day: "numeric",
            month: "short"
          })}{" "}
          -{" "}
          {new Date(weekInfo.endDate).toLocaleDateString("es-MX", {
            day: "numeric",
            month: "short",
            year: "numeric"
          })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => (
            <div key={day.dateKey} className="text-center">
              <div className="text-xs text-muted-foreground mb-1">{dayNames[index]}</div>
              <div
                className={cn(
                  "aspect-square rounded-lg border-2 flex flex-col items-center justify-center p-2 transition-all",
                  isToday(day.date) && "border-primary bg-primary/10",
                  !isToday(day.date) && !day.dayData && "border-border",
                  !isToday(day.date) && day.dayData && "border-green-500 bg-green-500/10 hover:bg-green-500/20",
                  isPast(day.date) && "opacity-50"
                )}
              >
                <div className="text-lg font-semibold">{day.date.getDate()}</div>
                {day.dayData && (
                  <Badge
                    variant="secondary"
                    className="mt-1 text-xs px-1 py-0 h-5 bg-green-600 text-white hover:bg-green-600"
                  >
                    {day.dayData.count}
                  </Badge>
                )}
              </div>
              {day.dayData && (
                <div className="mt-2 space-y-1">
                  {day.dayData.orders.slice(0, 2).map((order) => (
                    <div key={order.id} className="text-xs p-1 bg-secondary rounded truncate" title={order.name}>
                      {order.name}
                    </div>
                  ))}
                  {day.dayData.orders.length > 2 && (
                    <div className="text-xs text-muted-foreground">+{day.dayData.orders.length - 2} más</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {calendar.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No hay entregas programadas esta semana</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeekCalendar;
