import { pgClient } from "../../sql/client.js";
import { orders } from "../../sql/models/orders.js";
import { eq, InferSelectModel } from 'drizzle-orm';

export type FetchStatusResult = {
    found: boolean;
    entry: Pick<InferSelectModel<typeof orders>, 'id' | 'status' > | null;
    error: string | null;
}

export const fetchOrderStatus = async (orderId: string): Promise<FetchStatusResult> => {

    if (!orderId){
        return {
            found: false,
            entry: null,
            error: `No orderId was provided`
        }
    }

    const client = pgClient.getClient();
    try {
        const orderEntries = await client.select({
            id: orders.id,
            status: orders.status
        }).from(orders).where(
            eq(orders.id, orderId)
        )

        if (!orderEntries || !orderEntries.length){
            return {
                found: false,
                entry: null,
                error: `No db entry for this id`
            }
        }
        

        const entry = orderEntries?.[0] ?? null;
        return {
            found: true,
            entry,
            error: null
        }
    
    } catch (error) {
        return {
            found: false,
            entry: null,
            error: (error as Error)?.message || `Something went wrong`
        }
    }

}