import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const calculateChangePorcentage = (
  oldValue: number,
  newValue: number,
) => {
  if (oldValue === 0) {
    return newValue > 0 ? 100 : newValue === 0 ? 0 : -100;
  }
  const diferencia = newValue - oldValue;
  const porcentajeCambio = (diferencia / oldValue) * 100;

  return porcentajeCambio.toFixed(2);
};

export const isMobileDevice = (userAgent: string) => {
  const mobileRegex =
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

  return mobileRegex.test(userAgent);
};
