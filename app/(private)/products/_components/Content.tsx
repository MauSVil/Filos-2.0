import Layout from '@/components/layout/layout';
import Table from './Table'

const ProductsContent = () => {
  return (
    <Layout
      title='Productos'
      breadcrumbs={['Productos', 'Buscar']}
    >
      <div className='py-4'>
        <Table />
      </div>
    </Layout>
  )
}

export default ProductsContent;