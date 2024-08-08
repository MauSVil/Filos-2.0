"use client";

import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/react";
import { ReactNode } from "react"

interface Props {
  children: ReactNode;
  title: string;
  breadcrumbs?: string[];
}

const Layout = (props: Props) => {
  const { children, title, breadcrumbs } = props;
  return (
    <div className="container mx-auto px-4 flex flex-col gap-3">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <Breadcrumbs isDisabled>
        {breadcrumbs?.map((breadcrumb, index) => (
          <BreadcrumbItem>{breadcrumb}</BreadcrumbItem>
        ))}
      </Breadcrumbs>
      {children}
    </div>
  )
}

export default Layout;