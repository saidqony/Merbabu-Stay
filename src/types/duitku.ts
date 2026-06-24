export interface DuitkuInquiryRequest {
  merchantCode: string;
  paymentAmount: number;
  merchantOrderId: string;
  productDetails: string;
  email: string;
  callbackUrl: string;
  returnUrl: string;
  signature: string;
  expiryPeriod?: number;
  additionalParam?: string;
  merchantUserInfo?: string;
  customerVaName?: string;
  phoneNumber?: string;
  itemDetails?: DuitkuItemDetail[];
  customerDetail?: DuitkuCustomerDetail;
}

export interface DuitkuInquiryResponse {
  merchantCode: string;
  reference: string;
  paymentUrl: string;
  vaNumber?: string;
  amount: string;
  statusCode: string;
  statusMessage: string;
}

export interface DuitkuCallbackPayload {
  merchantCode: string;
  amount: string;
  merchantOrderId: string;
  productDetail: string;
  additionalParam: string;
  paymentCode: string;
  resultCode: string;
  merchantUserId: string;
  reference: string;
  publisherOrderId: string;
  spUserHash: string;
  settlementDate: string;
  issuerCode: string;
  signature: string;
}

export interface DuitkuItemDetail {
  name: string;
  price: number;
  quantity: number;
}

export interface DuitkuCustomerDetail {
  firstName: string;
  lastName?: string;
  email: string;
  phoneNumber: string;
}
