import axios from "axios";

const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.MPESA_SECRET_KEY; // Using MPESA_SECRET_KEY from .env
const SHORTCODE = process.env.MPESA_SHORTCODE || "174379"; // Standard M-Pesa Sandbox Shortcode
const PASSKEY = process.env.MPESA_PASSKEY || "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"; // Standard M-Pesa Sandbox Passkey
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL || `${process.env.NEXT_PUBLIC_APP_URL}/api/mpesa/callback`;

const getAccessToken = async () => {
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");
  try {
    const response = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error("M-Pesa Auth Error", error);
    throw new Error("Failed to get M-Pesa access token");
  }
};

export const initiateStkPush = async (phoneNumber: string, amount: number) => {
  const token = await getAccessToken();
  const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
  const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString("base64");

  // Normalize phone number to 254...
  let formattedPhone = phoneNumber;
  if (formattedPhone.startsWith("0")) {
    formattedPhone = "254" + formattedPhone.slice(1);
  } else if (formattedPhone.startsWith("+")) {
    formattedPhone = formattedPhone.slice(1);
  }

  try {
    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: formattedPhone,
        PartyB: SHORTCODE,
        PhoneNumber: formattedPhone,
        CallBackURL: CALLBACK_URL,
        AccountReference: "Nyekusa Registration",
        TransactionDesc: "Registration Fee",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("M-Pesa STK Push Error", error.response?.data || error.message);
    throw new Error("Failed to initiate M-Pesa STK push");
  }
};
