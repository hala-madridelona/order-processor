import { pgClient } from "../client.js";
import { orders, OrderStatus } from "../models/orders.js";
import { eq, InferSelectModel } from 'drizzle-orm';

type OrderUpdateResult = Pick<InferSelectModel<typeof orders>, 'id' | 'status' | 'updatedAt'> | null;

export const updateOrderStatus = async (orderId: string, orderStatus: OrderStatus): Promise<OrderUpdateResult> => {
    if (!orderId || !orderStatus){
        throw new Error("something missing in required arguments: id and status");
    }

    const client = pgClient.getClient();
    try {

        const result = await client.update(orders).set({
            status: orderStatus,
            updatedAt: new Date()
        }).where(
            eq(orders.id, orderId)
        ).returning({
            id: orders.id,
            status: orders.status,
            updatedAt: orders.updatedAt
        })

        if (!result || !result.length){
            throw new Error("no ack was received from db");
        }

        return result?.[0] ?? null;
    } catch (error) {
        const errorMessage = (error as Error).message;
        throw new Error(`Failed to update orders table for orderId: ${orderId} with error: ${errorMessage}`)
    }
}