import dynamic from "next/dynamic";

// Carga el componente Lottie dinámicamente solo en el cliente
const Lottie = dynamic(() => import("react-lottie"), { ssr: false });

interface Props {
  defaultOptions: any;
}

const LottieAnimation = (props: Props) => {
  const { defaultOptions } = props;

  console.log(defaultOptions, "defaultOptions");

  return <Lottie height={250} options={defaultOptions} width={300} />;
};

export default LottieAnimation;
