import { useCallback, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import moment from "moment-timezone";

import { useHistoryMovements } from "../_hooks/useHistoryMovements";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MovementHistory } from "@/types/RepositoryTypes/MovementHistory";
import { Button } from "@/components/ui/button";

const HistoryMovements = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;
  const movementsHistoryQuery = useHistoryMovements();
  const movementsHistory = useMemo(
    () => movementsHistoryQuery.data || [],
    [movementsHistoryQuery.data],
  ) as MovementHistory[];
  const totalPages = Math.ceil(movementsHistory.length / pageSize);
  const paginatedMovements = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return movementsHistory.slice(start, start + pageSize);
  }, [movementsHistory, currentPage]);

  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

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
      <>
        <CardContent className="flex-1 flex flex-col items-center gap-3 p-6 [&>div]:flex-1">
          {paginatedMovements.map((movementHistory) => {
            return (
              <div key={movementHistory._id} className="w-full mb-4 p-3 border rounded bg-muted/30">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold capitalize text-primary">
                    {movementHistory.type === "insert" ? "Alta" : "Actualización"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {movementHistory.collection}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mb-1">
                  {movementHistory.createdAt ? moment(movementHistory.createdAt).format("DD/MM/YYYY HH:mm") : "Sin fecha"}
                </div>
              </div>
            );
          })}
        </CardContent>
        <CardFooter className="flex justify-between items-center w-full">
          <span className="text-xs text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrev} disabled={currentPage === 1}>
              Anterior
            </Button>
            <Button variant="outline" size="sm" onClick={handleNext} disabled={currentPage === totalPages}>
              Siguiente
            </Button>
          </div>
        </CardFooter>
      </>
    );
  }, [movementsHistory, movementsHistoryQuery.isLoading, paginatedMovements, currentPage, totalPages]);

  return (
    <Card className="flex flex-col col-span-6">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2 [&>div]:flex-1">
        <CardTitle className="text-2xl tabular-nums">
          Ultimos movimientos
        </CardTitle>
      </CardHeader>
      {returnContent()}
    </Card>
  );
};

export default HistoryMovements;
