"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { useMemo, ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
}

const BuyersTabsLayout = (props: Props) => {
  const { children } = props;
  const params = useParams();
  const pathname = usePathname();

  const tabSelected = useMemo(() => pathname.split("/").pop(), [pathname]);

  const router = useRouter();

  const onSubMenuClick = (route: string) => {
    router.push(`/buyers/${params.id}/${route}`);
  };

  return (
    <Card className="w-full flex-1 flex flex-col">
      <CardContent className="flex gap-8 p-4 flex-1">
        <nav className="flex flex-col gap-4 text-sm text-muted-foreground">
          <p
            className={cn("font-semibold cursor-pointer", {
              "text-primary": tabSelected === "general",
            })}
            onClick={() => onSubMenuClick("general")}
          >
            General
          </p>
          <p
            className={cn("font-semibold cursor-pointer", {
              "text-primary": tabSelected === "statistics",
            })}
            onClick={() => onSubMenuClick("statistics")}
          >
            Estadisticas
          </p>
        </nav>
        <div className="bg-muted/40 flex-1">{children}</div>
      </CardContent>
    </Card>
  );
};

export default BuyersTabsLayout;
