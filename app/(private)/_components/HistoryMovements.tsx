import { useCallback, useMemo, useState } from "react";
import { ChevronsUpDown, Loader2 } from "lucide-react";
import moment from "moment-timezone";

import { useHistoryMovements } from "../_hooks/useHistoryMovements";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MovementHistory } from "@/types/RepositoryTypes/MovementHistory";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

const HistoryMovements = () => {
  const [activeCollapsible, setActiveCollapsible] = useState<string | null>(
    null,
  );
  const movementsHistoryQuery = useHistoryMovements();
  const movementsHistory = useMemo(
    () => movementsHistoryQuery.data || [],
    [movementsHistoryQuery.data],
  ) as MovementHistory[];

  const returnContent = useCallback(() => {
    if (movementsHistoryQuery.isLoading)
      return <Loader2 className="animate-spin" />;
    if (movementsHistory.length === 0) {
      return (
        <p className="text-sm text-muted-foreground">
          No hay movimientos registrados
        </p>
      );
    }

    return (
      <Card className="flex flex-col w-full">
        <CardContent className="p-3">
          {movementsHistory.slice(0, 3).map((movementHistory) => {
            const isOpen = activeCollapsible === movementHistory._id;

            return (
              <Collapsible
                key={movementHistory._id}
                className="w-full space-y-2"
                open={isOpen}
                onOpenChange={(open) => {
                  setActiveCollapsible(open ? movementHistory._id || null : null);
                }}
              >
                <div className="flex flex-row justify-between items-center gap-7">
                  <div className="flex flex-col gap-1 flex-1">
                    <p className="text-sm font-medium text-default-500">
                      {`Se hizo un movimiento de tipo ${movementHistory.type === "insert" ? "inserción" : "actualización"} de ${movementHistory.collection}`}
                    </p>
                    <CardDescription>
                      {moment(movementHistory.createdAt)
                        .tz("America/Mexico_City")
                        .format("DD/MM/YYYY HH:mm:ss")}
                    </CardDescription>
                  </div>
                  <CollapsibleTrigger asChild>
                    <Button
                      className="h-6 w-10"
                      size={"icon"}
                      variant={"outline"}
                    >
                      <ChevronsUpDown className="h-4 w-4" />
                      <span className="sr-only">Toggle</span>
                    </Button>
                  </CollapsibleTrigger>
                </div>

                <CollapsibleContent className="space-y-2">
                  <pre className="whitespace-pre-wrap break-all p-2 rounded-md max-h-24 overflow-y-auto text-sm">
                    {JSON.stringify(movementHistory.values, null, 2)}
                  </pre>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </CardContent>
        <CardFooter className="flex-col items-start gap-1">
          <CardDescription>
            La cantidad mostrada es la{" "}
            <strong className="font-bold text-primary">cantidad total </strong>del
            producto.
          </CardDescription>
        </CardFooter>
      </Card>
    );
  }, [movementsHistory, movementsHistoryQuery.isLoading, activeCollapsible]);

  return (
    <Card className="flex flex-col col-span-6">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2 [&>div]:flex-1">
        <CardTitle className="text-2xl tabular-nums">
          Ultimos movimientos
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 p-6 [&>div]:flex-1">
        {returnContent()}
      </CardContent>
    </Card>
  );
};

export default HistoryMovements;
