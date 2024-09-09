import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useMemo } from "react";
import Lottie from 'react-lottie';
import animationData from '@/lib/animations/boxes.json';
import animationData1 from '@/lib/animations/finish.json';

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
              options={defaultOptions}
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
              height={250}
              width={300}
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
      <Card
        className="overflow-hidden" x-chunk="dashboard-05-chunk-4"
      >
        <CardContent className="p-6 flex flex-col items-center gap-8">
          {/* <Progress value={(orderGenerationStep + 1) * 100 / 3} /> */}
          {component}
        </CardContent>
      </Card>
    </div>
  )
}

export default Step2;