/**
 * Types & Schémas pour la passerelle de paiement Mobile Money
 */

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";

export interface PaymentCustomer {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
}

export interface InitiateSoftpayParams {
  amount: number;
  currency: string;
  country: string;
  network: string;
  description: string;
  customer: PaymentCustomer;
  otp?: string; // Prepayment OTP (Orange CI / Orange BF)
  metadata?: Record<string, unknown>;
  returnUrl?: string; // Requis pour Card / Crypto
}

export interface SoftpayResponse {
  id: string;
  status: PaymentStatus;
  checkout_url?: string;
  message?: string;
  code?: string;
}

export interface ConfirmOtpResponse {
  id: string;
  status: PaymentStatus;
  message?: string;
  code?: string;
}

export interface VerifyPaymentResponse {
  id: string;
  reference: string;
  status: PaymentStatus;
  requested_amount: string;
  currency: string;
  network: string;
  country: string;
  client_fee?: string;
  debited_amount?: string;
  net_amount?: string;
  message?: string;
  code?: string;
}

export interface PaymentWebhookPayload {
  event: "transaction.success" | "transaction.failed" | "transaction.cancelled" | "transaction.created" | string;
  data: {
    id: string;
    reference: string;
    type: string;
    status: PaymentStatus;
    amount: string;
    fee: string;
    charged: string;
    net_amount: string;
    currency: string;
    country: string;
    network: string;
    msisdn?: string;
    metadata?: {
      user_id?: string;
      credits?: number;
      pack_id?: string;
      [key: string]: unknown;
    };
  };
}
