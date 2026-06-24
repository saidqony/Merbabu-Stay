import crypto from "crypto";
import type { DuitkuInquiryRequest, DuitkuInquiryResponse } from "@/types";

export const DUITKU_CONFIG = {
  merchantCode: process.env.DUITKU_MERCHANT_CODE || "",
  apiKey: process.env.DUITKU_API_KEY || "",
  baseUrl:
    process.env.DUITKU_ENV === "production"
      ? "https://passport.duitku.com"
      : "https://sandbox.duitku.com",
  callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payment/callback`,
  returnUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pesanan/sukses`,
  expiryPeriod: 1440, // 24 hours in minutes
};

/**
 * Generate HMAC-SHA256 signature for Duitku V2 request
 * Formula: HMAC-SHA256(merchantCode + merchantOrderId + amount, apiKey)
 */
export function generateDuitkuSignature(
  merchantOrderId: string,
  amount: number
): string {
  const { merchantCode, apiKey } = DUITKU_CONFIG;
  const rawString = `${merchantCode}${merchantOrderId}${amount}`;
  return crypto.createHmac("sha256", apiKey).update(rawString).digest("hex");
}

/**
 * Verify Duitku callback signature
 * Supports HMAC-SHA256 (V2), MD5 (V1), and SHA256 fallbacks
 */
export function verifyCallbackSignature(
  amount: string,
  merchantOrderId: string,
  receivedSignature: string
): boolean {
  const { merchantCode, apiKey } = DUITKU_CONFIG;
  const rawString = `${merchantCode}${amount}${merchantOrderId}`;
  
  // Duitku V2 Callback Signature: HMAC-SHA256(merchantCode + amount + merchantOrderId, apiKey)
  const calculatedHmac = crypto.createHmac("sha256", apiKey).update(rawString).digest("hex");
  
  // Duitku V1 Callback Signature: MD5(merchantCode + amount + merchantOrderId + apiKey)
  const rawStringV1 = `${rawString}${apiKey}`;
  const calculatedMd5 = crypto.createHash("md5").update(rawStringV1).digest("hex");
  const calculatedSha256 = crypto.createHash("sha256").update(rawStringV1).digest("hex");

  const receivedLower = receivedSignature.toLowerCase();
  return (
    receivedLower === calculatedHmac.toLowerCase() ||
    receivedLower === calculatedMd5.toLowerCase() ||
    receivedLower === calculatedSha256.toLowerCase()
  );
}

/**
 * Create a payment invoice/transaction in Duitku
 */
export async function createDuitkuPayment(payload: {
  merchantOrderId: string;
  amount: number;
  productDetails: string;
  email: string;
  noHp: string;
  namaLengkap: string;
  paymentMethod?: string;
}): Promise<DuitkuInquiryResponse> {
  const signature = generateDuitkuSignature(payload.merchantOrderId, payload.amount);

  const requestBody: any = {
    merchantCode: DUITKU_CONFIG.merchantCode,
    paymentAmount: payload.amount,
    merchantOrderId: payload.merchantOrderId,
    productDetails: payload.productDetails,
    email: payload.email,
    phoneNumber: payload.noHp,
    callbackUrl: DUITKU_CONFIG.callbackUrl,
    returnUrl: `${DUITKU_CONFIG.returnUrl}?order_id=${payload.merchantOrderId}`,
    signature: signature,
    expiryPeriod: DUITKU_CONFIG.expiryPeriod,
    customerDetail: {
      firstName: payload.namaLengkap,
      email: payload.email,
      phoneNumber: payload.noHp,
    },
  };

  // Add paymentMethod if provided (mandatory in some Duitku V2 flows)
  if (payload.paymentMethod) {
    requestBody.paymentMethod = payload.paymentMethod;
  }

  const endpoint = `${DUITKU_CONFIG.baseUrl}/webapi/api/merchant/v2/inquiry`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    let detail = "";
    try {
      const errData = await res.json();
      detail = errData.statusMessage || errData.message || JSON.stringify(errData);
    } catch (_) {
      try {
        detail = await res.text();
      } catch (_) {}
    }
    throw new Error(`Duitku Inquiry failed with status ${res.status}: ${detail}`);
  }

  const data: DuitkuInquiryResponse = await res.json();
  return data;
}
