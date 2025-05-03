"use client";

import ProductsOutOfStock from "./_components/ProductsOutOfStock";
import HistoryMovements from "./_components/HistoryMovements";
import SalesPerMonth from "./_components/SalesPerMonth";
import { SectionCards } from "@/components/section-cards";

const Home = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
      <ProductsOutOfStock />
      <SalesPerMonth />
      <div className="col-span-6">
        <SectionCards />
      </div>
      <HistoryMovements />
    </div>
  );
};

export default Home;
