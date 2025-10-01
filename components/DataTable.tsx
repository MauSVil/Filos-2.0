"use client";

import { Table as TableType, flexRender } from "@tanstack/react-table";
import { CSSProperties, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/utils/cn";
import { useDebounce } from "@uidotdev/usehooks";

interface DataTableProps<TData> {
  table: TableType<TData>;
  className?: string;
  error?: string;
  isFooterVisible?: boolean;
  style?: CSSProperties;
  emptyText?: string;
  emptyMessage?: string;
  isLoading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  to?: (row: any) => void;
  idIncludeTo?: string[];
  columns: any[];
  enableInput?: boolean;
  onRowClick?: (row: any) => void;
  enableShowColumns?: boolean;
  totalHits?: number;
}

export function DataTable<TData>({
  table,
  isLoading,
  columns,
  className,
  enableInput = true,
  onRowClick,
  enableShowColumns = true,
  totalHits
}: DataTableProps<TData>) {
  const [q, setQ] = useState<string>("");

  const debouncedValue = useDebounce(q, 500);

  useEffect(() => {
    if (debouncedValue) {
      table.setGlobalFilter(debouncedValue);
    } else {
      table.setGlobalFilter("");
    }
  }, [debouncedValue]);

  return (
    <div className={cn("", className)}>
      <div className="flex items-between pb-2 gap-4">
        <div className="flex items-center gap-2 mb-4">
          <Button
            disabled={!table.getCanPreviousPage()}
            form=""
            size={"sm"}
            onClick={() => table.previousPage()}
          >
            <ChevronLeft size={14} />
          </Button>
          <span className="text-sm">
            {`${table.getState().pagination.pageIndex + 1} / ${table.getPageCount()}`}
          </span>
          <Button
            disabled={!table.getCanNextPage()}
            form=""
            size={"sm"}
            onClick={() => table.nextPage()}
          >
            <ChevronRight size={14} />
          </Button>
          <Input
            className="w-12"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (Number(e.currentTarget.value) > 0) {
                  table.setPageIndex(Number(e.currentTarget.value) - 1);
                }
              }
            }}
          />
        </div>
        {enableInput && (
          <Input
            className="flex-1"
            placeholder="Buscar..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        )}
        {enableShowColumns && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="ml-auto">Mostrar columnas</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      className="capitalize"
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      {totalHits !== undefined && (
        <div className="text-sm text-gray-500 mb-2">
          Total de resultados: {totalHits}
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  className="h-24 text-center"
                  colSpan={columns.length}
                >
                  Cargando...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => {
                    if (onRowClick) {
                      onRowClick(row.original);
                    }
                  }}
                  // data-state={row.getIsSelected() && messages.app.pages.accounts.tables.main.helpers.selected}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-24 text-center"
                  colSpan={columns.length}
                >
                  No hay resultados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
