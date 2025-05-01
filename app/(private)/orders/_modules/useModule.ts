import { Meilisearch } from "@/types/Meilisearch";
import { useQuery } from "@tanstack/react-query"
import { useDebounce } from "@uidotdev/usehooks";
import ky from "ky";
import { useEffect, useState } from "react"
import { OrderDetailModal } from "../_modals/OrderDetail";
import { BuyerClientType } from "@/types/v2/Buyer/Client.type";
import { OrderClientType } from "@/types/v2/Order/Client.type";

const orderStatuses = ["Pendiente", "Completado", "Cancelado"];

export const useModule = () => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [q, setQ] = useState<string>("");
  const debouncedValue = useDebounce(q, 500);

  const [status, setStatus] = useState(orderStatuses[0]);
  const [buyersStore, setBuyersStore] = useState<Record<string, BuyerClientType>>({});

  const ordersQuery = useQuery({
    queryKey: ['orders', debouncedValue],
    queryFn: async () => {
      const resp = await ky.get(`/api/v2/orders/search?limit=${pagination.pageSize}&page=${pagination.pageIndex + 1}&query=${debouncedValue}&filters=status=${status}`).json<Meilisearch<OrderClientType>>();
      return resp
    }
  })

  const buyersQuery = useQuery({
    queryKey: ['buyers'],
    queryFn: async () => {
      const resp = await ky.post(`/api/v2/buyers/search`, { json: {} }).json<BuyerClientType[]>();
      return resp
    },
    enabled: !!ordersQuery.data?.hits.length,
  })

  useEffect(() => {
    if (buyersQuery.data) {
      const buyersMap: Record<string, BuyerClientType> = {};
      buyersQuery.data.forEach((buyer) => {
        buyersMap[buyer._id.toString()] = buyer;
      });
      setBuyersStore(buyersMap);
    }
  }, [buyersQuery.data])

  useEffect(() => {
    ordersQuery.refetch();
  }, [pagination.pageIndex, debouncedValue, status])

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }))
  }, [status, debouncedValue])

  const setDownloadClick = (url?: string) => {
    window.open(url, "_blank");
  };

  const openOrderDetail = async (order: OrderClientType) => {
    try {
      await OrderDetailModal({ orderId: order._id.toString() });
      ordersQuery.refetch();
    } catch (error) {
      console.error("Error opening order detail:", error);
    }
  }

  return {
    localData: {
      orders: ordersQuery.data?.hits || [],
      q,
      total: ordersQuery.data?.estimatedTotalHits || 0,
      pagination,
      status,
      orderStatuses
    },
    store: {
      buyers: buyersStore,
    },
    methods: {
      setQ,
      setPagination,
      setStatus,
      setDownloadClick,
      openOrderDetail,
    },
    flags: {
      isLoading: ordersQuery.isLoading || buyersQuery.isLoading,
      isError: ordersQuery.isError || buyersQuery.isError,
      isRefetching: ordersQuery.isRefetching || buyersQuery.isRefetching,
    }
  }
}