import { OrderQueue } from "./lib/queue/order-queue.js";
import { createInventoryReservation } from "./lib/sql/operations/inventory.js";

setInterval(() => {
    
    (async () => {
        try {
            const oldestMessage = await OrderQueue.receiveOne();
            if (!oldestMessage){
                return;                
            }
            const { MessageId, ReceiptHandle, Body } = oldestMessage;
            
            const parsedBody = Body && JSON.parse(Body);
            const { orderId } = parsedBody;

            console.log('ORDER-ID => ', orderId);    
            await createInventoryReservation(orderId);
            
        } catch (error) {
            console.error('SWW => ', error);
        }
    })();

}, 5000);