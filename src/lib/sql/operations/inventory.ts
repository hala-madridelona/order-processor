import { pgClient } from "../client.js";
import { inventory_reservations } from "../models/inventory_reservations.js";
import { GenericStatus } from "../models/shared.js";


export const createInventoryReservation = async (orderId: string) => {
    if (!orderId){
        return Promise.reject("No order-id was provided");
    }
    const client = pgClient.getClient();
    try {
        const result = await client.insert(inventory_reservations).values({
            orderId,
            status: GenericStatus.PENDING
        })
        return result;
    } catch (error) {
        console.error("Failed creating an inventory reservation => ", error);
    }
}