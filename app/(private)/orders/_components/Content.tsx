import Layout from '@/components/layout/layout';
import Table from './Table'

const OrdersContent = () => {
  return (
    <Layout
      title='Ordenes'
      breadcrumbs={['Ordenes', 'Buscar']}
    >
      <div className='py-4'>
        {/* <Table /> */}
      </div>
    </Layout>
  )
}

export default OrdersContent;