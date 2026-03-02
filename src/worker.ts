import { InventoryQueue } from "./lib/queue/inventory-queue.js";
import { OrderQueue } from "./lib/queue/order-queue.js";
import { GenericStatus } from "./lib/sql/models/shared.js";
import { createInventoryReservation, updateInventoryReservationStatus } from "./lib/sql/operations/inventory.js";
import { updateOrderStatus } from "./lib/sql/operations/orders.js";
import { delay } from "./lib/utils/datetime.js";
import { prepareOrderStatusFromInventoryStatus } from "./lib/utils/status.js";

setInterval(() => {
    (async () => {
        try {
            const oldestOrderMessage = await OrderQueue.receiveOne();
            if (!oldestOrderMessage){
                return;                
            }
            const { MessageId, ReceiptHandle, Body } = oldestOrderMessage;
            
            const parsedBody = Body && JSON.parse(Body);
            const { orderId } = parsedBody;

            console.log('ORDER-ID IN ORDER WORKER => ', orderId);    

            const entry = await createInventoryReservation(orderId);
            await delay(250);
            const updateEntry = await updateInventoryReservationStatus(entry?.id ?? null, GenericStatus.SUCCEEDED);
            
            if (!updateEntry) {
                throw new Error('Empty result from update db operation for inventory');
            }
         
            try {
                InventoryQueue.enqueue({ orderId, inventoryStatus: updateEntry?.status});
            } catch (error) {
                console.log("Something went wrong with SQS => ", error);
            }

 
        } catch (error) {
            console.error('SWW in worker for O queue => ', error);
        }
    })();
}, 1000);

setInterval(() => {
    (async () => {
        try {
            const oldestInventroyMessage = await InventoryQueue.receiveOne();
            if (!oldestInventroyMessage) {
                return;
            }

            const { MessageId, ReceiptHandle, Body } = oldestInventroyMessage;

            const parsedBody = Body && JSON.parse(Body);
            const { orderId, inventoryStatus } = parsedBody;

            console.log('ORDER-ID IN INVENTORY WORKER => ', orderId);    

            const orderStatus = prepareOrderStatusFromInventoryStatus(inventoryStatus as GenericStatus);

            await updateOrderStatus(orderId, orderStatus);
        } catch (error) {
            console.error('SWW in worker for IR Queue ',  error);
        }
    })();
}, 750);