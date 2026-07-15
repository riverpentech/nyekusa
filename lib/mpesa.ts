import axios from "axios";

const LIPA_NA_RIVERPEN_KEY = process.env.LIPA_NA_RIVERPEN_KEY;
const LIPA_NA_RIVERPEN_URL = process.env.LIPA_NA_RIVERPEN_URL || "https://lipa.riverpen.com";

export const initiateStkPush = async (phoneNumber: string, amount: number, reference?: string) => {
  if (!LIPA_NA_RIVERPEN_KEY) {
    throw new Error("LIPA_NA_RIVERPEN_KEY is not configured in .env file");
  }

  // Normalize phone number to 254...
  let formattedPhone = phoneNumber.trim().replace(/\D/g, "");
  if (formattedPhone.startsWith("0")) {
    formattedPhone = "254" + formattedPhone.slice(1);
  } else if (formattedPhone.startsWith("+")) {
    formattedPhone = formattedPhone.slice(1);
  }

  try {
    const url = `${LIPA_NA_RIVERPEN_URL.replace(/\/$/, "")}/api/v1/stk/push`;
    console.log(`Initiating STK Push via Lipa na RiverPen: ${url}`);
    
    const response = await axios.post(
      url,
      {
        amount: amount,
        phoneNumber: formattedPhone,
        reference: reference || null,
      },
      {
        headers: {
          Authorization: `Bearer ${LIPA_NA_RIVERPEN_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Map Lipa na RiverPen response structure back to Safaricom's expected shape for Nyekusa
    const data = response.data;
    return {
      CheckoutRequestID: data.checkoutRequestId,
      ResponseCode: data.success ? "0" : "1",
      CustomerMessage: data.message || "STK Push initiated successfully",
      ResponseDescription: data.message || "STK Push initiated successfully",
    };
  } catch (error: any) {
    const responseData = axios.isAxiosError(error) ? error.response?.data : null;
    console.error("Lipa na RiverPen STK Push Error:", responseData || error.message);
    throw new Error(
      responseData?.message || 
      responseData?.error || 
      "Failed to initiate STK push via Lipa na RiverPen"
    );
  }
};
