"use client";

import React, { ReactNode } from "react";
import {Avatar, Button, ScrollShadow, Spacer, Tooltip} from "@nextui-org/react";
import {Icon} from "@iconify/react";
import {useMediaQuery} from "usehooks-ts";
import {usePathname, useRouter} from "next/navigation";

import {AcmeIcon} from "@/components/icon";
import {items} from "@/components/layout/sidebar-items";
import {cn} from "@/utils/cn";

import Sidebar from "@/components/layout/sidebar";
import Cookies from "js-cookie";


const PrivateLayout = ({ children }: { children: ReactNode }) => {
  const isCompact = useMediaQuery("(max-width: 768px)");

  const pathname = usePathname();
  const currentPath = pathname.split("/")?.[1]

  const router = useRouter();

  return (
    <div className="flex h-dvh w-full">
      <div
        className={cn(
          "relative flex h-full w-72 flex-col !border-r-small border-divider p-6 transition-width",
          {
            "w-16 items-center px-2 py-6": isCompact,
          },
        )}
      >
        <div
          className={cn(
            "flex items-center gap-3 px-3",

            {
              "justify-center gap-0": isCompact,
            },
          )}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground">
            <AcmeIcon className="text-background" />
          </div>
          <span
            className={cn("text-small font-bold uppercase opacity-100", {
              "w-0 opacity-0": isCompact,
            })}
          >
            Acme
          </span>
        </div>
        <Spacer y={8} />
        <div className="flex items-center gap-3 px-3">
          <Avatar
            isBordered
            className="flex-none"
            size="sm"
            src="https://i.pravatar.cc/150?u=a04258114e29026708c"
          />
          <div className={cn("flex max-w-full flex-col", {hidden: isCompact})}>
            <p className="truncate text-small font-medium text-default-600">John Doe</p>
            <p className="truncate text-tiny text-default-400">Product Designer</p>
          </div>
        </div>
        <ScrollShadow className="-mr-6 h-full max-h-full py-6 pr-6">
          <Sidebar defaultSelectedKey="home" selectedKeys={[currentPath]} isCompact={isCompact} items={items} />
        </ScrollShadow>
        <Spacer y={2} />
        <div
          className={cn("mt-auto flex flex-col", {
            "items-center": isCompact,
          })}
        >
          <Tooltip content="Cerrar sesion" isDisabled={!isCompact} placement="right">
            <Button
              onPress={() => {
                Cookies.remove("token");
                router.push("/sign-in");
              }}
              className={cn("justify-start text-default-500 data-[hover=true]:text-foreground", {
                "justify-center": isCompact,
              })}
              isIconOnly={isCompact}
              startContent={
                isCompact ? null : (
                  <Icon
                    className="flex-none rotate-180 text-default-500"
                    icon="solar:minus-circle-line-duotone"
                    width={24}
                  />
                )
              }
              variant="light"
            >
              {isCompact ? (
                <Icon
                  className="rotate-180 text-default-500"
                  icon="solar:minus-circle-line-duotone"
                  width={24}
                />
              ) : (
                "Cerrar sesion"
              )}
            </Button>
          </Tooltip>
        </div>
      </div>
      <div className="w-full flex flex-1 flex-col p-4 gap-4">
        <main
          className="w-full flex-1 flex flex-col gap-4 rounded-medium border-small border-divider p-6 overflow-y-auto"
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default PrivateLayout;