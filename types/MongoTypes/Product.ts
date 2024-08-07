export interface Product {
  _id: string;
  baseId: string;
  uniqId: string;
  color: string;
  name: string;
  webPagePrice: number;
  wholesalePrice: number;
  retailPrice: number;
  specialPrice: number;
  quantity: number;
  size: string;
  deleted_at: null | Date;
  image: string;
  updated_at: Date;
}