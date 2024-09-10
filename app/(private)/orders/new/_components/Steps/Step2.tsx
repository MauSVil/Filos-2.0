import { Card, CardContent } from "@/components/ui/card";
import { useMemo } from "react";
import Lottie from 'react-lottie';
import animationData from '@/lib/animations/boxes.json';
import animationData1 from '@/lib/animations/finish.json';
import animationData2 from '@/lib/animations/order.json';

interface Props {
  orderGenerationStep: number;
}

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: animationData,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice"
  }
};

const defaultOptions1 = {
  loop: false,
  autoplay: true,
  animationData: animationData1,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice"
  }
};

const defaultOptions2 = {
  loop: false,
  autoplay: true,
  animationData: animationData2,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice"
  }
};

const Step2 = (props: Props) => {
  const { orderGenerationStep } = props;

  const component = useMemo(() => {
    switch (orderGenerationStep) {
      case 0:
        return (
          <div className="flex gap-4 items-center justify-center">
            <Lottie
              options={defaultOptions}
              height={250}
              width={300}
            />
          </div>
        );
      case 1:
        return (
          <div className="flex gap-4 items-center justify-center">
            <Lottie
              options={defaultOptions2}
              height={250}
              width={300}
            />
          </div>
        );
      case 2:
        return (
          <div className="flex gap-4 items-center justify-center">
            <Lottie
              options={defaultOptions1}
              height={150}
              width={150}
            />
          </div>
        );
      default:
        return "";
    }
  }, [orderGenerationStep]);

  return (
    <div className="flex flex-col">
      <h3 className="text-lg font-semibold mb-4">Confirmar orden</h3>
      {component}
    </div>
  )
}

export default Step2;