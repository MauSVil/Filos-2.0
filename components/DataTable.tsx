'use client';

import { Table as TableType, flexRender } from '@tanstack/react-table';
import { CSSProperties } from 'react';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu';
import { cn } from '@/utils/cn';
import { Input } from './ui/input';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DataTableProps<TData> {
  table: TableType<TData>;
  className?: string;
  error?: string;
  isFooterVisible?: boolean;
  style?: CSSProperties;
  emptyText?: string;
  isLoading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  to?: (row: any) => void;
  idIncludeTo?: string[];
  columns: any[];
  enableInput?: boolean;
  onRowClick?: (row: any) => void;
  enableShowColumns?: boolean
}

export function DataTable<TData>({
  table,
  isLoading,
  columns,
  className,
  enableInput = true,
  onRowClick,
  enableShowColumns = true
}: DataTableProps<TData>) {

  return (
    <div className={cn("", className)}>
      <div className="flex items-between pb-2 gap-4">
        <div className='flex items-center gap-2 mb-4'>
          <Button
            form=''
            size={'sm'}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft size={14} />
          </Button>
          <span className="text-sm">
            {`${table.getState().pagination.pageIndex + 1 } / ${table.getPageCount()}`}
          </span>
          <Button
            form=''
            size={'sm'}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight size={14} />
          </Button>
          <Input
            className='w-12'
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (Number(e.currentTarget.value) > 0) {
                  table.setPageIndex(Number(e.currentTarget.value) - 1);
                }
              }
            }}
          />
        </div>
        {
          enableInput && (
            <Input
              className="flex-1"
              placeholder="Buscar..."
              value={table.getState().globalFilter}
              onChange={(e) => table.setGlobalFilter(e.target.value)}
            />
          )
        }
        {
          enableShowColumns && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="ml-auto">
                  Mostrar columnas
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter(
                    (column) => column.getCanHide()
                  )
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        }
      </div>
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
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
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
