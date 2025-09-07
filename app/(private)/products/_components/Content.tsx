"use client";

import { useMemo, useState } from "react";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import numeral from "numeral";
import Image from "next/image";
import { Edit, MinusIcon, PlusIcon, Trash, PlusCircle, File, Package, Download, ImageIcon, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import DataTableColumnHeader from "@/components/DataTableHeader";
import { DataTable } from "@/components/DataTable";
import { Product } from "@/types/RepositoryTypes/Product";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { useModule } from "../_module/useModule";

const ProductsContent = () => {
  const { methods, localData, flags } = useModule();
  const { handleNewCatalogClick, handleUpdateProductsClick, setPagination, setColumnVisibility, setColumnFilters, setGlobalFilter, setSorting, setRowSelection, setProductsToUpdate } = methods;
  const { products, sorting, columnFilters, columnVisibility, pagination, rowSelection, productsToUpdate, total } = localData;

  const router = useRouter();
  const [previewImage, setPreviewImage] = useState<{ url: string; product: Product } | null>(null);

  const columns: ColumnDef<Product>[] = useMemo(
    () =>
      [
        {
          id: "select",
          header: ({ table }) => (
            <Checkbox
              {...{
                checked: table.getIsSomeRowsSelected()
                  ? "indeterminate"
                  : table.getIsAllRowsSelected(),
                // onCheckedChange: table.getToggleAllRowsSelectedHandler(),
              }}
            />
          ),
          cell: ({ row }) => (
            <div className="px-1">
              <Checkbox
                {...{
                  checked: row.getIsSelected(),
                  disabled: !row.getCanSelect(),
                  onCheckedChange: row.getToggleSelectedHandler(),
                }}
              />
            </div>
          ),
        },
        {
          id: "Imagen",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Imagen" />
          ),
          accessorKey: "image",
          cell: (cellData) => {
            const product = cellData.row.original;
            const hasValidImage = product.image && product.image !== 'undefined' && product.image !== '/';
            
            return (
              <div className="flex items-center p-2">
                {hasValidImage ? (
                  <div 
                    className="relative group cursor-pointer"
                    onClick={() => setPreviewImage({ url: product.image!, product })}
                  >
                    <div className="relative w-16 h-12 rounded-md overflow-hidden border border-border/50 group-hover:border-primary/50 transition-all duration-200 group-hover:shadow-md">
                      <Image
                        alt={`Imagen de ${product.name}`}
                        className="w-full h-full object-cover"
                        height={48}
                        width={64}
                        src={product.image!}
                        unoptimized
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                      <Eye className="h-3 w-3 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="w-16 h-12 rounded-md border border-dashed border-border/50 flex items-center justify-center bg-muted/30">
                    <ImageIcon className="h-3 w-3 text-muted-foreground" />
                  </div>
                )}
              </div>
            );
          },
        },
        {
          id: "Acciones",
          header: "Acciones",
          cell: (cellData) => (
            <div className="flex items-center gap-1">
              <Button
                className="h-7 w-7 cursor-pointer"
                size="icon"
                variant="ghost"
                onClick={() => {
                  router.push(`/products/${cellData.row.original._id}`);
                }}
                title="Editar producto"
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                className="h-7 w-7 cursor-pointer"
                size="icon"
                variant="ghost"
                onClick={() => {
                  methods.deleteProduct(cellData.row.original._id);
                }}
                title="Eliminar producto"
              >
                <Trash className="h-3.5 w-3.5 text-red-400" />
              </Button>
            </div>
          ),
        },
        {
          id: "Modelo",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Modelo" />
          ),
          accessorKey: "uniqId",
          enableGlobalFilter: true,
          enableSorting: true,
          filterFn: "auto",
          enableColumnFilter: true,
          sortingFn: "textCaseSensitive",
        },
        {
          id: "Nombre",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Nombre" />
          ),
          accessorKey: "name",
          enableGlobalFilter: true,
          enableSorting: true,
          filterFn: "auto",
          enableColumnFilter: true,
          sortingFn: "textCaseSensitive",
        },
        {
          id: "Color",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Color" />
          ),
          accessorKey: "color",
          enableGlobalFilter: true,
          enableSorting: true,
          filterFn: "auto",
          enableColumnFilter: true,
          sortingFn: "textCaseSensitive",
        },
        {
          id: "Talla",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Talla" />
          ),
          accessorKey: "size",
          enableGlobalFilter: true,
          enableSorting: true,
          filterFn: "auto",
          enableColumnFilter: true,
          sortingFn: "textCaseSensitive",
        },
        {
          id: "Disponibilidad",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Disponibilidad" />
          ),
          accessorKey: "quantity",
          cell: (cellData) => {
            return (
              <div className="flex items-center gap-2">
                <Button
                  className="h-6 w-6"
                  size="icon"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();

                    setProductsToUpdate((prevState) => {
                      return {
                        ...prevState,
                        [cellData.row.original._id]: {
                          ...cellData.row.original,
                          quantity:
                            (productsToUpdate[cellData.row.original._id]
                              ?.quantity ||
                              cellData.row.original.quantity ||
                              0) - 1,
                        },
                      };
                    });
                  }}
                >
                  <MinusIcon className="h-3.5 w-3.5" />
                </Button>
                <p
                  className={cn("text-base text-gray-500", {
                    "text-red-200":
                      (productsToUpdate[cellData.row.original._id]?.quantity ||
                        cellData.row.original.quantity ||
                        0) < 0,
                  })}
                >
                  {productsToUpdate[cellData.row.original._id]?.quantity ||
                    cellData.row.original.quantity ||
                    0}
                </p>
                <Button
                  className="h-6 w-6"
                  size="icon"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setProductsToUpdate((prevState) => {
                      return {
                        ...prevState,
                        [cellData.row.original._id]: {
                          ...cellData.row.original,
                          quantity:
                            (productsToUpdate[cellData.row.original._id]
                              ?.quantity ||
                              cellData.row.original.quantity ||
                              0) + 1,
                        },
                      };
                    });
                  }}
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                  <span className="sr-only">More</span>
                </Button>
              </div>
            );
          },
          enableGlobalFilter: true,
          enableSorting: true,
          filterFn: "auto",
          enableColumnFilter: true,
          sortingFn: "textCaseSensitive",
        },
        {
          id: "Precio especial",
          header: ({ column }) => (
            <DataTableColumnHeader
              className="text-green-400"
              column={column}
              title="Precio especial"
            />
          ),
          accessorKey: "specialPrice",
          accessorFn: ({ specialPrice }) =>
            numeral(specialPrice).format("$0,0.00"),
          enableGlobalFilter: true,
          enableSorting: true,
          filterFn: "auto",
          enableColumnFilter: true,
          sortingFn: "textCaseSensitive",
        },
        {
          id: "Precio mayoreo",
          header: ({ column }) => (
            <DataTableColumnHeader
              className="text-purple-400"
              column={column}
              title="Precio mayoreo"
            />
          ),
          accessorKey: "wholesalePrice",
          accessorFn: ({ wholesalePrice }) =>
            numeral(wholesalePrice).format("$0,0.00"),
          enableGlobalFilter: true,
          enableSorting: true,
          filterFn: "auto",
          enableColumnFilter: true,
          sortingFn: "textCaseSensitive",
        },
        {
          id: "Precio semi-mayoreo",
          header: ({ column }) => (
            <DataTableColumnHeader
              className="text-yellow-400"
              column={column}
              title="Precio semi-mayoreo"
            />
          ),
          accessorKey: "retailPrice",
          accessorFn: ({ retailPrice }) =>
            numeral(retailPrice).format("$0,0.00"),
          enableGlobalFilter: true,
          enableSorting: true,
          filterFn: "auto",
          enableColumnFilter: true,
          sortingFn: "textCaseSensitive",
        },
        {
          id: "Precio pagina web",
          header: ({ column }) => (
            <DataTableColumnHeader
              className="text-red-400"
              column={column}
              title="Precio pagina web"
            />
          ),
          accessorKey: "webPagePrice",
          accessorFn: ({ webPagePrice }) =>
            numeral(webPagePrice).format("$0,0.00"),
          enableGlobalFilter: true,
          enableSorting: true,
          filterFn: "auto",
          enableColumnFilter: true,
          sortingFn: "textCaseSensitive",
        },
      ] satisfies ColumnDef<Product>[],
    [productsToUpdate],
  );

  const table = useReactTable({
    data: products,
    columns,
    getRowId(originalRow) {
      return originalRow._id;
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(total / pagination.pageSize),
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    manualFiltering: true,
    onSortingChange: setSorting,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: "auto",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
      rowSelection,
    },
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumbs */}
      <div className="mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Productos</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight mb-2">Gestión de Productos</h1>
              <p className="text-muted-foreground text-lg">
                Administra tu inventario, precios y disponibilidad de productos
              </p>
            </div>
          </div>
          
          <Button
            onClick={() => router.push("/products/new")}
            size="default"
            className="gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Nuevo Producto
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-card border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              disabled={!Object.keys(productsToUpdate).length}
              onClick={handleUpdateProductsClick}
              variant="secondary"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Actualizar ({Object.keys(productsToUpdate).length})
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <File className="h-4 w-4" />
                  Catálogo
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  disabled={!table.getSelectedRowModel().rows.length}
                  onClick={handleNewCatalogClick}
                >
                  <File className="h-4 w-4 mr-2" />
                  Crear catálogo con seleccionados ({table.getSelectedRowModel().rows.length})
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-card border rounded-lg">
        <DataTable
          columns={columns}
          isLoading={flags.isLoading}
          table={table}
          totalHits={total}
        />
      </div>

      {/* Image Preview Modal */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
          {previewImage && (
            <>
              <DialogHeader className="pb-4">
                <DialogTitle className="flex items-center gap-3 text-xl">
                  <Package className="h-6 w-6 text-primary" />
                  {previewImage.product.name}
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Image Section */}
                <div className="lg:col-span-2">
                  <div className="relative aspect-square rounded-lg overflow-hidden border bg-muted/30">
                    <Image
                      alt={`Vista completa de ${previewImage.product.name}`}
                      className="w-full h-full object-contain"
                      height={600}
                      width={600}
                      src={previewImage.url}
                      unoptimized
                      priority
                    />
                  </div>
                </div>

                {/* Product Details Section */}
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b border-border pb-2">Información del Producto</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Modelo:</span>
                        <span className="font-medium">{previewImage.product.uniqId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Color:</span>
                        <span className="font-medium">{previewImage.product.color}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Talla:</span>
                        <span className="font-medium">{previewImage.product.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stock:</span>
                        <span className={cn("font-semibold", {
                          "text-red-400": previewImage.product.quantity === 0,
                          "text-orange-400": previewImage.product.quantity > 0 && previewImage.product.quantity <= 5,
                          "text-green-400": previewImage.product.quantity > 5
                        })}>{previewImage.product.quantity} unidades</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b border-border pb-2">Precios</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <span className="text-green-400 font-medium">Precio Especial</span>
                        <span className="text-green-400 font-bold text-lg">
                          {numeral(previewImage.product.specialPrice).format("$0,0.00")}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                        <span className="text-purple-400 font-medium">Precio Mayoreo</span>
                        <span className="text-purple-400 font-bold text-lg">
                          {numeral(previewImage.product.wholesalePrice).format("$0,0.00")}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                        <span className="text-yellow-400 font-medium">Semi-mayoreo</span>
                        <span className="text-yellow-400 font-bold text-lg">
                          {numeral(previewImage.product.retailPrice).format("$0,0.00")}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                        <span className="text-red-400 font-medium">Página Web</span>
                        <span className="text-red-400 font-bold text-lg">
                          {numeral(previewImage.product.webPagePrice).format("$0,0.00")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 pt-4">
                    <Button
                      onClick={() => router.push(`/products/${previewImage.product._id}`)}
                      className="w-full"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Producto
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setPreviewImage(null)}
                      className="w-full"
                    >
                      Cerrar
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsContent;
