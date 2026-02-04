
import { Request, Response } from "express";
import { pgClient } from "../../sql/client.js";
import { orders } from "../../sql/models/orders.js";
import { eq } from "drizzle-orm";
import { OrderQueue } from "../../queue/order-queue.js";

export const createOrder = async (request: Request, response: Response) => {

    const idemKey = request.get("X-Id-Key");
    if (!idemKey){
        return response.status(403).send('Missing X-Id-Key header');
    }

    // Connect to db client
    const client = pgClient.getClient();
    try {
        const existingEntry = await client.select().from(orders).where(
            eq(
                orders.idempotencyKey,
                idemKey
            )
        )

        if (existingEntry.length){
            return response.status(409).send('Client seems to be in an inconsistent state');
        }

        const newOrderResult = await client.insert(orders).values({
            idempotencyKey: idemKey,
            userId: "sample-user"
        }).returning({
            id: orders.id,
            status: orders.status
        })

        const newOrder = newOrderResult?.[0];
        const newOrderId = newOrder?.id;

        try {
            await OrderQueue.enqueue({ orderId: newOrderId});
        } catch (error){
            console.log("Something went wrong with SQS");
        }
    
        return response.status(200).send(JSON.stringify(newOrder));

    } catch (error) {
        return response.status(500).end();
    }

}