"use client";

import { useParams } from "next/navigation";
import { useBuyers } from "../../../_hooks/useBuyers";
import { Buyer } from "@/types/MongoTypes/Buyer";
import { useMemo } from "react";

const BuyerGeneralPage = () => {
  const { id } = useParams() as { id: string }

  const buyerQuery = useBuyers({ id });
  const buyer = useMemo(() => buyerQuery?.data?.[0] || {}, [buyerQuery.data]) as Buyer;

  return (
    <div className="flex flex-col w-full items-center py-4 gap-3">
      BuyerGeneralPage
    </div>
  ); 
}

export default BuyerGeneralPage;