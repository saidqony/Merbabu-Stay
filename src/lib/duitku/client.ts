import crypto from "crypto";
import type { DuitkuInquiryRequest, DuitkuInquiryResponse } from "@/types";

// Read env vars inside functions, NOT at module scope (prevents cold-start capture bug on Vercel)
function getDuitkuConfig() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://merbabu-stay.qonypro.cloud"; // Hardcoded production fallback

  return {
    merchantCode: process.env.DUITKU_MERCHANT_CODE || "",
    apiKey: process.env.DUITKU_API_KEY || "",
    baseUrl:
      process.env.DUITKU_ENV === "production"
        ? "https://passport.duitku.com"
        : "https://sandbox.duitku.com",
    callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL || appUrl}/api/payment/callback`,
    returnUrl: `${process.env.NEXT_PUBLIC_APP_URL || appUrl}/pesanan/sukses`,
    expiryPeriod: 1440, // 24 hours in minutes
  };
}

// Keep DUITKU_CONFIG as a getter for backward compatibility
export const DUITKU_CONFIG = {
  get merchantCode() { return process.env.DUITKU_MERCHANT_CODE || ""; },
  get apiKey() { return process.env.DUITKU_API_KEY || ""; },
  get baseUrl() {
    return process.env.DUITKU_ENV === "production"
      ? "https://passport.duitku.com"
      : "https://sandbox.duitku.com";
  },
  get callbackUrl() {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://merbabu-stay.qonypro.cloud";
    return `${appUrl}/api/payment/callback`;
  },
  get returnUrl() {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://merbabu-stay.qonypro.cloud";
    return `${appUrl}/pesanan/sukses`;
  },
  expiryPeriod: 1440,
};

/**
 * Generate HMAC-SHA256 signature for Duitku V2 request
 * Formula: HMAC-SHA256(merchantCode + merchantOrderId + amount, apiKey)
 */
export function generateDuitkuSignature(
  merchantOrderId: string,
  amount: number
): string {
  const merchantCode = process.env.DUITKU_MERCHANT_CODE || "";
  const apiKey = process.env.DUITKU_API_KEY || "";
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
  const merchantCode = process.env.DUITKU_MERCHANT_CODE || "";
  const apiKey = process.env.DUITKU_API_KEY || "";
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
  const merchantCode = process.env.DUITKU_MERCHANT_CODE || "";
  const apiKey = process.env.DUITKU_API_KEY || "";
  const isDev = process.env.DUITKU_ENV !== "production";
  const baseUrl = isDev ? "https://sandbox.duitku.com" : "https://passport.duitku.com";

  // CRITICAL: Use the production URL for callback — never localhost
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://merbabu-stay.qonypro.cloud";
  const callbackUrl = `${appUrl}/api/payment/callback`;
  const returnUrl = `${appUrl}/pesanan/sukses?order_id=${payload.merchantOrderId}`;

  console.log(`[Duitku] Creating payment. CallbackURL: ${callbackUrl}`);

  const rawString = `${merchantCode}${payload.merchantOrderId}${payload.amount}`;
  const signature = crypto.createHmac("sha256", apiKey).update(rawString).digest("hex");

  const requestBody: any = {
    merchantCode: merchantCode,
    paymentAmount: payload.amount,
    merchantOrderId: payload.merchantOrderId,
    productDetails: payload.productDetails,
    email: payload.email,
    phoneNumber: payload.noHp,
    callbackUrl: callbackUrl,
    returnUrl: returnUrl,
    signature: signature,
    expiryPeriod: 1440,
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

  const endpoint = `${baseUrl}/webapi/api/merchant/v2/inquiry`;

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
