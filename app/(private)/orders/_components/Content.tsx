'use client';

import Layout from '@/components/layout/layout';
import Table from './Table'
import { useEffect, useMemo, useState } from 'react';
import { useOrders } from '../_hooks/useOrders';
import { Pagination, Select, SelectItem } from '@nextui-org/react';

const OrdersContent = () => {
  const [status, setStatus] = useState('Pendiente')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const ordersQuery = useOrders({ page, status });

  const orders = useMemo(() => {
    return ordersQuery.data?.data || [];
  }, [ordersQuery.data?.data]);

  useEffect(() => {
    setTotal((prev) => {
      if (ordersQuery.data?.count) {
        return ordersQuery.data.count;
      }
      return prev;
    })
  }, [ordersQuery.data?.count])

  return (
    <Layout
      title='Ordenes'
      breadcrumbs={['Ordenes', 'Buscar']}
    >
      <div className='py-4'>
        <div className='flex flex-col gap-3'>
          <div className="flex flex-col items-center gap-3 md:flex-row w-full justify-end">
            <Select
              className='max-w-xs'
              placeholder='Filtrar por'
              selectedKeys={[status]}
              onChange={(e) => setStatus(e.target.value)}
            >
              <SelectItem key="Pendiente">Pendiente</SelectItem>
              <SelectItem key="Completado">Completado</SelectItem>
              <SelectItem key="Cancelado">Cancelado</SelectItem>
            </Select>
          </div>
          <Table orders={orders} isLoading={ordersQuery.isLoading} />
          <div className="flex w-full justify-center">
            <Pagination
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

export default OrdersContent;