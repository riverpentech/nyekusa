import { paymentRepository } from "@/modules/payments/payments.repository";
import { NotFoundError, ValidationError } from "@/lib/shared/errors";
import { initiateStkPush } from "@/lib/mpesa";
import { PaymentPurpose } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createHmac, timingSafeEqual } from "node:crypto";

function verifySignature(secret: string, body: string, header: string, toleranceSec = 300): boolean {
    try {
        const parts = Object.fromEntries(
            header.split(",").map((p) => {
                const [k, v] = p.split("=");
                return [k?.trim(), v?.trim()];
            })
        );
        const t = Number(parts.t);
        const v1 = parts.v1;
        if (!t || !v1) return false;
        if (Math.abs(Date.now() / 1000 - t) > toleranceSec) return false;
        const expected = createHmac("sha256", secret).update(`${t}.${body}`).digest("hex");
        const a = Buffer.from(v1, "hex");
        const b = Buffer.from(expected, "hex");
        if (a.length !== b.length) return false;
        return timingSafeEqual(a, b);
    } catch (error) {
        return false;
    }
}

export const paymentService = {
    async getPaymentStatus(checkoutRequestId: string) {
        const payment = await paymentRepository.findByCheckoutRequestId(checkoutRequestId);
        if (!payment) throw new NotFoundError("Payment not found");
        return {
            status: payment.status,
            userId: payment.userId
        };
    },

    async initiatePayment(userId: string, phoneNumber: string, amount: number, purposeInput: string) {
        if (!phoneNumber) {
            throw new ValidationError("Phone number is required");
        }
        if (!amount || amount <= 0) {
            throw new ValidationError("Amount must be greater than zero");
        }

        const categoryCode = purposeInput.toUpperCase();

        // Query the category configuration
        const category = await prisma.paymentCategory.findUnique({
            where: { code: categoryCode }
        });

        // Sum already completed payments for this user and category code
        const completedPayments = await prisma.payment.findMany({
            where: {
                userId,
                categoryCode,
                status: "COMPLETED"
            }
        });
        const alreadyPaid = completedPayments.reduce((sum, p) => sum + p.amount, 0);

        if (category) {
            // Check deadline
            if (category.deadline && new Date() > new Date(category.deadline)) {
                throw new ValidationError(`The deadline for ${category.name} has passed (${new Date(category.deadline).toLocaleDateString()})`);
            }

            if (category.mandatoryAmount > 0) {
                const remaining = category.mandatoryAmount - alreadyPaid;

                if (alreadyPaid >= category.mandatoryAmount) {
                    throw new ValidationError(`You have already paid the required KES ${category.mandatoryAmount.toFixed(2)} for ${category.name} in full.`);
                }

                // If user attempts to pay more than the remaining balance
                if (amount > remaining) {
                    throw new ValidationError(`The remaining balance for ${category.name} is KES ${remaining.toFixed(2)}. You cannot pay KES ${amount.toFixed(2)}.`);
                }

                // Enforce minimum open amount per installment (unless they are paying the exact remaining balance)
                if (category.minAmount > 0 && amount < category.minAmount && amount < remaining) {
                    throw new ValidationError(`Minimum payment amount for ${category.name} is KES ${category.minAmount.toFixed(2)}.`);
                }
            } else {
                if (category.minAmount > 0 && amount < category.minAmount) {
                    throw new ValidationError(`Minimum payment amount for ${category.name} is KES ${category.minAmount.toFixed(2)}.`);
                }
            }

            if (category.isLocked && amount !== category.amount) {
                throw new ValidationError(`Amount for ${category.name} is fixed at KES ${category.amount.toFixed(2)}`);
            }
        }

        // Validate purpose
        let purpose: PaymentPurpose = PaymentPurpose.OTHER;
        if (Object.values(PaymentPurpose).includes(categoryCode as PaymentPurpose)) {
            purpose = categoryCode as PaymentPurpose;
        }

        // If the purpose is MEMBERSHIP, check if they already have a completed registration payment
        if (purpose === PaymentPurpose.MEMBERSHIP) {
            const existingReg = await paymentRepository.findByUserId(userId);
            if (existingReg && existingReg.status === "COMPLETED") {
                throw new ValidationError("You have already completed your registration payment");
            }
        }

        // Create a new payment record in PENDING state
        const tempCheckoutId = `temp_${userId}_${Date.now()}`;
        const payment = await paymentRepository.create({
            user: { connect: { id: userId } },
            amount,
            status: "PENDING",
            purpose,
            categoryCode,
            checkoutRequestID: tempCheckoutId,
            phoneNumber,
        });

        try {
            // Initiate M-Pesa STK Push via Lipa na RiverPen aggregator
            const mpesaResponse = await initiateStkPush(phoneNumber, amount, `${payment.purpose}-${payment.id}`);

            // Update payment with real checkoutRequestID
            await paymentRepository.update(payment.id, {
                checkoutRequestID: mpesaResponse.CheckoutRequestID
            });

            return {
                success: true,
                message: "STK Push initiated successfully",
                checkoutRequestId: mpesaResponse.CheckoutRequestID,
            };
        } catch (error) {
            // If Safaricom push fails immediately, mark payment as FAILED
            await paymentRepository.update(payment.id, {
                status: "FAILED"
            });
            throw error;
        }
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
    },

    async listAllPayments(limit: number = 100) {
        return paymentRepository.findMany({ take: limit });
    },

    async deletePayment(id: string) {
        return paymentRepository.remove(id);
    },

    async updatePayment(id: string, data: any) {
        return paymentRepository.update(id, data);
    },

    async handleRiverpenWebhook(headers: Headers, bodyString: string) {
        const signatureHeader = headers.get("x-riverpen-signature") || "";
        if (!signatureHeader) {
            throw new Error("Missing x-riverpen-signature header");
        }

        const secrets = [
            process.env.LIPA_NA_RIVERPEN_WEBHOOK_SECRET,
            process.env.LIPA_NA_RIVERPEN_DEV_WEBHOOK_SECRET
        ].filter(Boolean) as string[];

        let isValid = false;
        
        for (const secret of secrets) {
            if (verifySignature(secret, bodyString, signatureHeader)) {
                isValid = true;
                break;
            }
        }

        if (!isValid) {
            throw new Error("Invalid webhook signature");
        }

        const payload = JSON.parse(bodyString);
        const { type, data } = payload;

        if (type === "payment.succeeded") {
            const { checkout_request_id, mpesa_receipt, amount_cents, msisdn, reference } = data;
            const amount = amount_cents ? amount_cents / 100 : 50.0;
            
            // Extract original payment ID if stored in reference context (e.g. MEMBERSHIP-cly123...)
            let paymentId = "";
            if (reference && reference.includes("-")) {
                paymentId = reference.split("-")[1];
            }

            const updateData: any = {
                status: "COMPLETED",
                mpesaReceiptCode: mpesa_receipt?.toString(),
                phoneNumber: msisdn?.toString(),
                amount: amount
            };

            // Locate and update record
            if (paymentId) {
                await paymentRepository.update(paymentId, updateData);
                console.log(`RiverPen webhook payment succeeded by reference mapping: ${paymentId}`);
            } else {
                await paymentRepository.updateByCheckoutRequestId(checkout_request_id, {
                    ...updateData,
                    checkoutRequestID: checkout_request_id
                });
                console.log(`RiverPen webhook payment succeeded by checkoutRequestId fallback: ${checkout_request_id}`);
            }
        } else if (type === "payment.failed") {
            const { checkout_request_id, reference } = data;
            let paymentId = "";
            if (reference && reference.includes("-")) {
                paymentId = reference.split("-")[1];
            }

            if (paymentId) {
                await paymentRepository.update(paymentId, { status: "FAILED" });
                console.log(`RiverPen webhook payment failed by reference mapping: ${paymentId}`);
            } else {
                await paymentRepository.updateByCheckoutRequestId(checkout_request_id, { status: "FAILED" });
                console.log(`RiverPen webhook payment failed by checkoutRequestId fallback: ${checkout_request_id}`);
            }
        }

        return { success: true };
    }
};
