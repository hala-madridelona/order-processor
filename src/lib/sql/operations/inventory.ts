import { eq, InferSelectModel, Update } from "drizzle-orm";
import { pgClient } from "../client.js";
import { inventory_reservations } from "../models/inventory_reservations.js";
import { GenericStatus } from "../models/shared.js";

type CreateInventoryResult = Pick<InferSelectModel<typeof inventory_reservations>, 'id' | 'orderId' | 'status'> | null;
type UpdateInventoryResult = CreateInventoryResult;


export const createInventoryReservation = async (orderId: string): Promise<CreateInventoryResult> => {
    if (!orderId){
        throw new Error("No order-id was provided");
    }
    const client = pgClient.getClient();
    try {

        // Check if there is an entry present
        const isEntryPresentResult = await client.select().from(inventory_reservations).where(
            eq(inventory_reservations.orderId, orderId)
        )

        if (isEntryPresentResult && isEntryPresentResult.length ){
            return isEntryPresentResult?.[0] ?? null; 
        }


        const result = await client.insert(inventory_reservations).values({
            orderId,
            status: GenericStatus.PENDING
        }).returning({
            id: inventory_reservations.id,
            orderId: inventory_reservations.orderId,
            status: inventory_reservations.status
        });

        if (!result || !result.length) {
            throw new Error("No ack was returned from db operation")
        }
        return result?.[0] ?? null;
    } catch (error) {
        const errorMessage = (error as Error).message;
        throw new Error(`Failed creating an inventory reservation: ${errorMessage}`);
    }
}

export const updateInventoryReservationStatus = async (inventoryId: string | null, status: GenericStatus): Promise<UpdateInventoryResult> => {

    if (!inventoryId) {
        throw new Error("No inventory id was provided");
    }
    const client = pgClient.getClient();
    try {   
        const result = await client.update(inventory_reservations).set({
            status,
            updatedAt: new Date()
        }).where(
            eq(inventory_reservations.id, inventoryId)
        ).returning({
            id: inventory_reservations.id, 
            orderId: inventory_reservations.orderId,
            status: inventory_reservations.status
        })

        if (!result || !result.length) {
            throw new Error("No ack was returned from db operation")
        }

        return result?.[0] ?? null;
    
    } catch (error) {
        const errorMessage = (error as Error).message;
        throw new Error(`Failed updating inventory reservation for inventoryId: ${inventoryId} with error:  ${errorMessage}`);
    }

}