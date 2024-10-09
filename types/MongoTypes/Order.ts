export interface Order {
  _id: string;
  name: string;
  requestDate: Date;
  dueDate: Date;
  products: { product: string, quantity: number, total: number }[];
  buyer: string;
  active: boolean;
  status: 'Pendiente' | 'Completado' | 'Cancelado';
  orderType: 'retailPrice' | 'wholesalePrice' | 'specialPrice' | 'webPagePrice';
  freightPrice: number;
  advancedPayment: number;
  description: string;
  finalAmount: number;
  totalAmount: number;
  documents: { order: string };
  pdfStatus: string;
  paid: boolean;
}