import React from "react";
import Content from "./_components/Content";

interface Props {
  params: {
    id: string;
  }
}

const OrderEditPage = ({ params }: Props) => {
  const { id } = params;

  return <Content id={id} />;
};

export default OrderEditPage;
