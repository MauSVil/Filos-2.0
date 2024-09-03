import { useProducts } from "@/app/(private)/products/_hooks/useProducts";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useMemo, useState } from "react";

interface Props {
  onSubmit: () => void;
}

const Step1 = (props: Props) => {
  const [query, setQuery] = useState('');
  const productsQuery = useProducts();
  const products = useMemo(() => productsQuery.data?.data || [], [productsQuery.data]);

  return (
    <div className="flex flex-col">
      <h3 className="text-lg font-semibold mb-4">Productos</h3>
      <Input
        className="mb-8"
        placeholder="Buscar producto..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}

      />
      <div className="grid grid-cols-3 gap-3">
        {products.filter((product) => product.uniqId).slice(0, 9).map((product) => (
          <div key={product._id} className="relative rounded-lg flex items-center justify-center">
            <Image
              width={250}
              height={250}
              src={product.image}
              alt={product.name}
            />
            <div className="absolute bottom-0 m-auto w-1/2 p-2 bg-black bg-opacity-50 text-white">
              <p>{product.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Step1;