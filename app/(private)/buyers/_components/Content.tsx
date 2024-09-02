'use client';

import { useBuyers } from "../_hooks/useBuyers";
import { useEffect, useMemo, useState } from "react";
import { Button, Listbox, ListboxItem, Pagination, Skeleton } from "@nextui-org/react";
import { useRouter } from "next/navigation";

const BuyersContent = () => {
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const buyersQuery = useBuyers({ page });
  const router = useRouter();
  const buyersData = useMemo(() => buyersQuery.data?.data || [], [buyersQuery.data]);

  useEffect(() => {
    setTotal((prev) => {
      if (buyersQuery.data?.count) {
        return buyersQuery.data.count;
      }
      return prev;
    })
  }, [buyersQuery.data?.count])

  const handleNewBuyer = () => {
    router.push("/buyers/new")
  }

  return (
    <div className="flex flex-col items-center py-4 gap-3">
      {
        buyersQuery.isLoading ? (
          <>
            {[...Array(10)].map((_, index) => (
              <div key={index} className="flex items-center gap-2 py-1">
                <Skeleton className="w-full rounded-lg">
                  <div className="h-4 w-full rounded-lg bg-default-200"></div>
                </Skeleton>
              </div>
            ))}
          </>
        ) : (
          <Listbox
            classNames={{
              base: "p-0",
            }}
            items={buyersData}
            variant="flat"
            emptyContent="No hay compradores"
            selectionMode="single"
          >
            {buyersData.map((buyer) => (
              <ListboxItem
                key={buyer._id}
                className="mb-2 px-4"
                textValue={buyer.name}
                classNames={{
                  base: 'border-b border-default-200 dark:border-default-100 rounded',
                }}
              >
                <div className="flex items-center gap-2 py-1">
                  <div className="ml-2 min-w-0 flex-1">
                    <div className="text-small font-semibold text-default-foreground">
                      {buyer.name}
                    </div>
                  </div>
                </div>
              </ListboxItem>
            ))}
          </Listbox>
        )
      }
      <Pagination
        showControls
        showShadow
        color="primary"
        total={Math.ceil(total / 10)}
        page={page}
        onChange={setPage}
      />
    </div>
  );
};

export default BuyersContent;