import { ColumnDef, ColumnFiltersState, SortingState, VisibilityState } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ImageModal } from "../_modals/ImageModal";
import { NewCatalogModal } from "../_modals/NewCatalogueModal";
import { EditProductModal } from "../_modals/EditProductModal";
import { MeiliSearchProduct, Product } from "@/types/RepositoryTypes/Product";
import { useQuery } from "@tanstack/react-query";
import ky from "ky";

export const useModule = () => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});
  const [productsToUpdate, setProductsToUpdate] = useState<{
    [key: string]: Product;
  }>({});

  const productsQuery = useQuery<MeiliSearchProduct>({
    queryKey: ["products", pagination.pageIndex],
    queryFn: async () => {
      const resp = (await ky
        .get(`/api/products/search?limit=${pagination.pageSize}&page=${pagination.pageIndex + 1}&query="${globalFilter}"`)
        .json<MeiliSearchProduct>());

      return resp;
    },
  });

  useEffect(() => {
    productsQuery.refetch();
  }, [pagination.pageIndex, globalFilter]);

  const handleImageClick = async (image: string) => {
    try {
      await ImageModal({ image });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);

        return;
      }
      toast.error("An error occurred");
    }
  };

  const handleNewCatalogClick = async () => {
    try {
      const productIds = Object.keys(rowSelection);

      await NewCatalogModal({ productIds });
      setRowSelection({});
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);

        return;
      }
      toast.error("An error occurred");
    }
  };

  const handleUpdateProductsClick = async () => {
    try {
      const resp = await EditProductModal({ products: productsQuery.data?.hits || [], productsToUpdate });

      productsQuery.refetch();
      if (resp === "ok") {
        setProductsToUpdate({});
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);

        return;
      }
      toast.error("An error occurred");
    }
  };

  return {
    localData: {
      pagination,
      sorting,
      rowSelection,
      columnFilters,
      columnVisibility,
      productsToUpdate,
      products: productsQuery.data?.hits || [],
      total: productsQuery.data?.estimatedTotalHits || 0,
    },
    methods: {
      handleImageClick,
      handleNewCatalogClick,
      handleUpdateProductsClick,
      setPagination,
      setSorting,
      setRowSelection,
      setColumnFilters,
      setProductsToUpdate,
      setColumnVisibility,
      setGlobalFilter,
    },
    flags: {
      isLoading: productsQuery.isLoading,
      isError: productsQuery.isError,
    }
  }
}