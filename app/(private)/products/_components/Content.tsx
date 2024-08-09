'use client';

import Layout from '@/components/layout/layout';
import Table from './Table'
import Grid from './Grid'
import { useEffect, useMemo, useState } from 'react';
import { useProducts } from '../_hooks/useProducts';
import { Input } from '@nextui-org/input';
import { Icon } from '@iconify/react';
import { Switch } from '@nextui-org/switch';
import { Pagination } from '@nextui-org/react';

const ProductsContent = () => {
  const [list, setList] = useState(true)
  const [total, setTotal] = useState(0)
  const [tempQ, setTempQ] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1)
  const productsQuery = useProducts({ page, q });

  const products = useMemo(() => {
    return productsQuery.data?.data || [];
  }, [productsQuery.data?.data]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setPage(1);
      setQ(tempQ);
    }
  }

  useEffect(() => {
    setTotal((prev) => {
      if (productsQuery.data?.count) {
        return productsQuery.data.count;
      }
      return prev;
    })
  }, [productsQuery.data?.count])

  return (
    <Layout
      title='Productos'
      breadcrumbs={['Productos', 'Buscar']}
    >
      <div className='py-4'>
        <div className='flex flex-col gap-3'>
          <div className="flex flex-col items-center gap-3 md:flex-row w-full justify-end">
            <Input
              placeholder="Buscar producto"
              className="max-w-xs"
              classNames={{
                inputWrapper: "h-full"
              }}
              onKeyDown={handleKeyDown}
              endContent={<Icon icon="carbon:search" />}
              value={tempQ}
              onChange={(e) => setTempQ(e.currentTarget.value)}
            />
            <Switch
              isSelected={list}
              onChange={() => setList((prev) => !prev)}
              defaultSelected
              size="lg"
              color="primary"
              thumbIcon={({ isSelected, className }) =>
                isSelected ? (
                  <Icon icon="solar:list-linear" className={className} />
                ) : (
                  <Icon icon="system-uicons:grid" className={className} />
                )
              }
            />
          </div>
          <div className='flex items-center justify-center'>
            {
              list ? (
                <Table loading={productsQuery.isLoading} products={products} />
              ) : (
                <Grid isLoading={productsQuery.isLoading} products={products} />
              )
            }
          </div>
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              color="primary"
              page={page}
              total={Math.ceil(total / 10)}
              onChange={(page) => setPage(page)}
            />
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ProductsContent;