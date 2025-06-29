export interface ShoppingCartItem {
  id: string;
  name: string;
  type: 'medicine' | 'food';
  price: {
    naira: number;
    dollar: number;
  };
  quantity: number;
  description: string;
}

export interface ShippingInfo {
  receiverName: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
}

export interface PaymentInfo {
  email: string;
  amount: number;
  currency: 'NGN' | 'USD';
  reference: string;
}