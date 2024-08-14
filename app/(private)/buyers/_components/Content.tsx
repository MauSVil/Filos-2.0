'use client';

import Layout from "@/components/layout/layout";
import { useBuyers } from "../_hooks/useBuyers";
import { useEffect, useMemo, useState } from "react";
import { Listbox, ListboxItem, Pagination, ScrollShadow } from "@nextui-org/react";

const BuyersContent = () => {
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const buyersQuery = useBuyers({ page });
  const buyersData = useMemo(() => buyersQuery.data?.data || [], [buyersQuery.data]);

  useEffect(() => {
    setTotal((prev) => {
      if (buyersQuery.data?.count) {
        return buyersQuery.data.count;
      }
      return prev;
    })
  }, [buyersQuery.data?.count])

  return (
    <Layout
      title='Compradores'
      breadcrumbs={['Compradores', 'Buscar']}
    >
      <div className="flex flex-col items-center py-4 gap-3">
        <ScrollShadow className="flex w-full h-full max-h-[calc(100vh-196px)] flex-col gap-6 overflow-y-auto px-3">
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
                  base: 'border-b border-default-200 dark:border-default-100 py-2 rounded',
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
        </ScrollShadow>
        <Pagination
          showControls
          showShadow
          color="primary"
          total={Math.ceil(total / 10)}
          page={page}
          onChange={setPage}
        />
      </div>
    </Layout>
  );
};

export default BuyersContent;