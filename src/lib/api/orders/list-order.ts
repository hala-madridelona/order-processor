
import { pgClient } from "../../sql/client.js"
import { orders } from "../../sql/models/orders.js";
import { desc } from 'drizzle-orm';
import { Request, Response } from "express";

export const listOrders = async (request: Request, response: Response) => {
    const client = pgClient.getClient();
    try {
        const result = await client.select().from(orders).orderBy(desc(orders.createdAt));
        return response.status(200).send(result);
    } catch (error) {
        return response.status(500).end();
    }
}