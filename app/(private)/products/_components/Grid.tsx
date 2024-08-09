"use client";

import React from "react";

import {cn} from "@/utils/cn";
import { Product } from "@/types/MongoTypes/Product";
import GridListItem from "./grid-list-item";

export default function Component({className, products, isLoading}: {className?: string, products: Product[], isLoading: boolean}) {
  return (
    <div
      className={cn(
        "my-auto grid max-w-7xl grid-cols-1 gap-5 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
        className,
      )}
    >
      {products.map((product) => (
        <GridListItem key={product._id} isLoading={isLoading} {...product} />
      ))}
    </div>
  );
}