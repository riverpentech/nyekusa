import { paymentRepository } from "@/modules/payments/payments.repository";
import { NotFoundError } from "@/lib/shared/errors";

export const paymentService = {
    async getPaymentStatus(checkoutRequestId: string) {
        const payment = await paymentRepository.findByCheckoutRequestId(checkoutRequestId);
        if (!payment) throw new NotFoundError("Payment not found");
        return {
            status: payment.status,
            userId: payment.userId
        };
    },

    async handleMpesaCallback(body: any) {
        const { stkCallback } = body.Body || body;
        if (!stkCallback) return { ResultCode: 1, ResultDesc: "Invalid body" };

        const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

        if (ResultCode === 0 && CallbackMetadata) {
            const items = CallbackMetadata.Item || [];
            const amount = items.find((i: any) => i.Name === "Amount")?.Value;
            const mpesaReceiptCode = items.find((i: any) => i.Name === "MpesaReceiptNumber")?.Value;
            const phoneNumber = items.find((i: any) => i.Name === "PhoneNumber")?.Value;

            await paymentRepository.updateByCheckoutRequestId(CheckoutRequestID, {
                status: "COMPLETED",
                mpesaReceiptCode: mpesaReceiptCode?.toString(),
                phoneNumber: phoneNumber?.toString(),
                amount: amount ? parseFloat(amount.toString()) : 50.0
            });
            console.log(`Payment confirmed for CheckoutRequestID: ${CheckoutRequestID}`);
        } else {
            await paymentRepository.updateByCheckoutRequestId(CheckoutRequestID, {
                status: "FAILED"
            });
            console.log(`Payment failed for CheckoutRequestID: ${CheckoutRequestID}. Reason: ${ResultDesc}`);
        }

        return { ResultCode: 0, ResultDesc: "Accepted" };
    }
};
