"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock, Package, DollarSign, TrendingDown, ExternalLink } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import { useState } from "react";

interface OrderDetail {
  id: string;
  name: string;
  dueDate: string;
  totalAmount: number;
  daysOverdue?: number;
  daysUntilDue?: number;
}

interface ProductDetail {
  id: string;
  uniqId: string;
  name: string;
  color: string;
  size: string;
  quantity: number;
}

interface UrgentAction {
  type: string;
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  count: number;
  amount?: number;
  actionLabel: string;
  actionUrl: string;
  orders?: OrderDetail[];
  products?: ProductDetail[];
}

interface UrgentActionsProps {
  actions: UrgentAction[];
}

const UrgentActions = ({ actions }: UrgentActionsProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case "overdue_orders":
        return <AlertCircle className="h-5 w-5" />;
      case "deliveries_this_week":
        return <Clock className="h-5 w-5" />;
      case "overdue_payments":
        return <DollarSign className="h-5 w-5" />;
      case "out_of_stock":
        return <Package className="h-5 w-5" />;
      case "low_stock":
        return <TrendingDown className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  if (actions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-green-500" />
            Acciones Pendientes
          </CardTitle>
          <CardDescription>Todo está al día</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No hay acciones urgentes en este momento. ¡Excelente trabajo! 🎉
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          Acciones Urgentes
        </CardTitle>
        <CardDescription>Tareas que requieren tu atención</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actions.map((action, index) => {
            const hasDetails = (action.orders && action.orders.length > 0) || (action.products && action.products.length > 0);

            return (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={`text-${getPriorityColor(action.priority)}`}>{getIcon(action.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{action.title}</p>
                      <Badge variant={getPriorityColor(action.priority) as any} className="text-xs">
                        {action.priority === "high" ? "Alta" : action.priority === "medium" ? "Media" : "Baja"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </div>

                {hasDetails ? (
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm">
                        {action.actionLabel}
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                      <div className="px-6 py-6">
                        <SheetHeader>
                          <SheetTitle>{action.title}</SheetTitle>
                          <SheetDescription>
                            {action.orders ? "Detalles de las órdenes" : "Detalles de los productos"}
                          </SheetDescription>
                        </SheetHeader>

                        <div className="mt-6 space-y-3">
                          {action.orders?.map((order) => (
                          <Link
                            key={order.id}
                            href={`/orders/${order.id}`}
                            className="block p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                          >
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <p className="font-medium truncate" title={order.name}>
                                    {order.name}
                                  </p>
                                  <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="font-mono font-medium text-sm">
                                    ${order.totalAmount.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                                  </p>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Fecha compromiso: {new Date(order.dueDate).toLocaleDateString("es-MX")}
                              </p>
                              {order.daysOverdue !== undefined && order.daysOverdue > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  Atrasada {order.daysOverdue} día(s)
                                </Badge>
                              )}
                              {order.daysUntilDue !== undefined && (
                                <p className="text-xs text-muted-foreground">
                                  {order.daysUntilDue < 0
                                    ? `Pago vencido hace ${Math.abs(order.daysUntilDue)} día(s)`
                                    : `Vence en ${order.daysUntilDue} día(s)`}
                                </p>
                              )}
                            </div>
                          </Link>
                        ))}

                        {action.products?.map((product) => (
                          <Link
                            key={product.id}
                            href={`/products/${product.id}`}
                            className="block p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <p className="font-medium truncate flex-1" title={product.name}>
                                  {product.name}
                                </p>
                                <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              </div>
                              <p className="text-xs text-muted-foreground truncate" title={`ID: ${product.uniqId} • ${product.color} • Talla ${product.size}`}>
                                ID: {product.uniqId} • {product.color} • Talla {product.size}
                              </p>
                              <Badge
                                variant={product.quantity === 0 ? "destructive" : "secondary"}
                                className="text-xs"
                              >
                                Stock: {product.quantity}
                              </Badge>
                            </div>
                          </Link>
                        ))}
                        </div>

                        <div className="mt-6 pt-4 border-t">
                          <Link href={action.actionUrl}>
                            <Button variant="default" className="w-full">
                              Ver todos en {action.actionUrl === "/orders" ? "Órdenes" : "Productos"}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                ) : (
                  <Link href={action.actionUrl}>
                    <Button variant="outline" size="sm">
                      {action.actionLabel}
                    </Button>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default UrgentActions;
