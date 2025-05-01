"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";

import { useBuyers } from "../../../_hooks/useBuyers";
import { BuyerClientType } from "@/types/v2/Buyer/Client.type";


const BuyerGeneralPage = () => {
  const { id } = useParams() as { id: string };

  const buyerQuery = useBuyers({ id });
  const buyer = useMemo(
    () => buyerQuery?.data?.[0] || {},
    [buyerQuery.data],
  ) as BuyerClientType;

  return (
    <div className="flex flex-col w-full items-center py-4 gap-3">
      BuyerGeneralPage
    </div>
  );
};

export default BuyerGeneralPage;
