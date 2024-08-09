"use client";

import React from "react";
import {Button, Image, Skeleton} from "@nextui-org/react";
import {Icon} from "@iconify/react";

import {cn} from "@/utils/cn";
import { Product } from "@/types/MongoTypes/Product";

export type PlaceListItemColor = {
  name: string;
  hex: string;
};

export type GridListItemProps = Omit<React.HTMLAttributes<HTMLDivElement>, "id"> & {
  isLoading?: boolean;
} & Product;

const GridListItem = React.forwardRef<HTMLDivElement, GridListItemProps>(
  (
    {name, isLoading, className, image, uniqId, ...props},
    ref,
  ) => {
    const [isLiked, setIsLiked] = React.useState(false);

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex w-full flex-none flex-col gap-3",
          className,
        )}
        {...props}
      >
        <Button
          isIconOnly
          className="absolute right-3 top-3 z-20 bg-background/60 backdrop-blur-md backdrop-saturate-150 dark:bg-default-100/50"
          radius="full"
          size="sm"
          variant="flat"
          onPress={() => setIsLiked(!isLiked)}
        >
          <Icon
            className={cn("text-default-900/50", {
              "text-danger-400": isLiked,
            })}
            icon="solar:heart-bold"
            width={16}
          />
        </Button>
        <Image
          isBlurred
          isZoomed
          alt={name}
          className="aspect-square w-full hover:scale-110"
          isLoading={isLoading}
          src={image}
        />

        <div className="mt-1 flex flex-col gap-2 px-1">
          {isLoading ? (
            <div className="my-1 flex flex-col gap-3">
              <Skeleton className="w-3/5 rounded-lg">
                <div className="h-3 w-3/5 rounded-lg bg-default-200" />
              </Skeleton>
              <Skeleton className="mt-3 w-4/5 rounded-lg">
                <div className="h-3 w-4/5 rounded-lg bg-default-200" />
              </Skeleton>
              <Skeleton className="mt-4 w-2/5 rounded-lg">
                <div className="h-3 w-2/5 rounded-lg bg-default-300" />
              </Skeleton>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-1">
                <h3 className="text-small font-medium text-default-700">{name}</h3>
              </div>
              {uniqId ? <p className="text-small text-default-500">{uniqId}</p> : null}
              {/* <p className="text-small font-medium text-default-500">${price}</p> */}
            </>
          )}
        </div>
      </div>
    );
  },
);

GridListItem.displayName = "GridListItem";

export default GridListItem;
