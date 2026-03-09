import { eq } from "drizzle-orm";
import { pgClient } from "../sql/client.js";
import { payments } from "../sql/models/payments.js";
import { orders, OrderStatus } from "../sql/models/orders.js";
import { updateOrderStatus } from "../sql/operations/orders.js";
import { updatePaymentStatus } from "../sql/operations/payment.js";
import { GenericStatus } from "../sql/models/shared.js";

export const handleStripePaymentSuccess = async (eventObj: Record<string, any>) => {
    try {
        const { id: paymentIntentId, metadata } = eventObj;
        const { orderId } = metadata;
        const client = pgClient.getClient();

        const paymentResult = await client.select().from(payments).where(
            eq(payments.paymentIntentId, paymentIntentId)
        )

        if (!paymentResult || !paymentResult.length){
            throw new Error(`No such record for this paymentIntentId in db`);
        }

        const paymentEntry = paymentResult?.[0];

        if (paymentEntry?.orderId !== orderId){
            throw new Error(`Db integrity issue => OrderId doesnt match with webhook event payload`);
        }

        await updatePaymentStatus(paymentEntry?.id as string, GenericStatus.SUCCEEDED);
        await updateOrderStatus(orderId, OrderStatus.PAYMENT_SUCCEEDED);
    } catch (error) {
        console.error(`Something went wrong with ${handleStripePaymentSuccess.name}: `, (error as Error).message);
    }
}

export const handleStripePaymentFailure = async (eventObj: Record<string, any>) => {
    try {
        const { id: paymentIntentId, metadata } = eventObj;
        const { orderId } = metadata;
        const client = pgClient.getClient();

        const paymentResult = await client.select().from(payments).where(
            eq(payments.paymentIntentId, paymentIntentId)
        )

        if (!paymentResult || !paymentResult.length){
            throw new Error(`No such record for this paymentIntentId in db`);
        }

        const paymentEntry = paymentResult?.[0];

        if (paymentEntry?.orderId !== orderId){
            throw new Error(`Db integrity issue => OrderId doesnt match with webhook event payload`);
        }

        await updatePaymentStatus(paymentEntry?.id as string, GenericStatus.FAILED);
        await updateOrderStatus(orderId, OrderStatus.PAYMENT_FAILED);
    } catch (error) {
        console.error(`Something went wrong with ${handleStripePaymentFailure.name}: `, (error as Error).message);
    }
}
