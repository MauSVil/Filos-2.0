"use client";

import { BreadcrumbItem, Breadcrumbs, ScrollShadow } from "@nextui-org/react";
import { ReactNode } from "react"

interface Props {
  children: ReactNode;
  title: string;
  breadcrumbs?: string[];
  actions?: ReactNode;
}

const Layout = (props: Props) => {
  const { children, title, breadcrumbs, actions } = props;
  return (
    <div className="container mx-auto px-2 flex flex-col gap-2">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <div className="flex justify-between items-center">
        <Breadcrumbs isDisabled>
          {breadcrumbs?.map((breadcrumb, index) => (
            <BreadcrumbItem>{breadcrumb}</BreadcrumbItem>
          ))}
        </Breadcrumbs>
        <div className="flex gap-3">
          {actions}
        </div>
      </div>
      <ScrollShadow
        hideScrollBar
        className="flex w-full h-full max-h-[calc(100vh-196px)] flex-col gap-6 overflow-y-auto pr-2"
      >
        {children}
      </ScrollShadow>
    </div>
  )
}

export default Layout;