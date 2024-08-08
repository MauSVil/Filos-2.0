import type {IconSvgProps} from "@/types/icon";
import { Image } from "@nextui-org/react";

import React from "react";

export const AcmeIcon: React.FC<IconSvgProps> = ({size = 32, width, height, className, ...props}) => (
  <Image src="/logo/filos.png" width={size} height={size} className={className} />
);
