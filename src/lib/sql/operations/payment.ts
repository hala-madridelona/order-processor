import { InferSelectModel } from "drizzle-orm";
import { pgClient } from "../client.js";
import { payments } from "../models/payments.js";

export const createPayment = async (orderId: string, paymentIntentId: string): 
Promise<InferSelectModel<typeof payments> | null> => {
    
    if (!orderId){
        throw new Error("No order-id was provided");
    }
    const client = pgClient.getClient();
    try {

        const result = await client.insert(payments).values({
            orderId,
            paymentIntentId,
            amount: '100'
        }).returning();

        if (!result || !result.length) {
            throw new Error("No ack was returned from db operation")
        }
        return result?.[0] ?? null;
    } catch (error) {
        const errorMessage = (error as Error).message;
        throw new Error(`Failed creating a payment: ${errorMessage}`);
    }
}