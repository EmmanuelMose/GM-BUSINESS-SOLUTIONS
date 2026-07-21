import axios from "axios";
import crypto from "crypto-js";

interface MpesaConfig {
  consumerKey: string;
  consumerSecret: string;
  shortCode: string;
  passkey: string;
  environment: "sandbox" | "production";
  baseUrl: string;
  callBackUrl: string;
}

const getEnvVar = (key: string, defaultValue: string = ""): string => {
  const value = process.env[key];
  return value !== undefined && value !== null ? value : defaultValue;
};

const config: MpesaConfig = {
  consumerKey: getEnvVar("MPESA_CONSUMER_KEY"),
  consumerSecret: getEnvVar("MPESA_CONSUMER_SECRET"),
  shortCode: getEnvVar("MPESA_SHORT_CODE"),
  passkey: getEnvVar("MPESA_PASSKEY"),
  environment: (getEnvVar("MPESA_ENVIRONMENT", "sandbox") as "sandbox" | "production"),
  baseUrl: getEnvVar("MPESA_ENVIRONMENT", "sandbox") === "production" 
    ? "https://api.safaricom.co.ke" 
    : "https://sandbox.safaricom.co.ke",
  callBackUrl: getEnvVar("MPESA_CALLBACK_URL")
};

export class MpesaService {
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    const auth = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString("base64");

    try {
      const response = await axios.get(
        `${config.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = new Date(Date.now() + 3500 * 1000);
      
      return this.accessToken || "";
    } catch (error: any) {
      console.error("M-Pesa Token Error:", error.response?.data || error.message);
      throw new Error("Failed to get M-Pesa access token");
    }
  }

  generatePassword(shortCode: string, passkey: string, timestamp: string): string {
    const str = `${shortCode}${passkey}${timestamp}`;
    return crypto.enc.Base64.stringify(crypto.enc.Utf8.parse(str));
  }

  async stkPush(
    phoneNumber: string,
    amount: number,
    accountReference: string,
    transactionDesc: string = "Payment for Order"
  ): Promise<any> {
    try {
      const token = await this.getAccessToken();
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
      const password = this.generatePassword(config.shortCode, config.passkey, timestamp);

      let formattedPhone = phoneNumber;
      if (formattedPhone.startsWith("0")) {
        formattedPhone = `254${formattedPhone.substring(1)}`;
      } else if (formattedPhone.startsWith("+254")) {
        formattedPhone = formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith("254")) {
        formattedPhone = `254${formattedPhone}`;
      }

      const requestData = {
        BusinessShortCode: config.shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(amount),
        PartyA: formattedPhone,
        PartyB: config.shortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: config.callBackUrl,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc,
      };

      const response = await axios.post(
        `${config.baseUrl}/mpesa/stkpush/v1/processrequest`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("STK Push Error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.errorMessage || "Failed to initiate M-Pesa payment");
    }
  }

  async queryStkPush(checkoutRequestID: string): Promise<any> {
    try {
      const token = await this.getAccessToken();
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
      const password = this.generatePassword(config.shortCode, config.passkey, timestamp);

      const requestData = {
        BusinessShortCode: config.shortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestID,
      };

      const response = await axios.post(
        `${config.baseUrl}/mpesa/stkpushquery/v1/query`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("STK Push Query Error:", error.response?.data || error.message);
      throw new Error("Failed to query M-Pesa payment status");
    }
  }
}

export const mpesaService = new MpesaService();
export default config;