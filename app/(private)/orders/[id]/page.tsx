import React from "react";

import Content from "./_components/Content";

interface Props {
  params: Promise<{ id: string }>
}

const OrderEditPage = async ({ params }: Props) => {
  const { id } = await params;

  return <Content id={id} />;
};

export default OrderEditPage;
