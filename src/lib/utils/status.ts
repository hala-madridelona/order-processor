import { OrderStatus } from "../sql/models/orders.js";
import { GenericStatus } from "../sql/models/shared.js";

export const prepareOrderStatusFromInventoryStatus = (status: GenericStatus): OrderStatus => {
    switch (status) {
        case GenericStatus.FAILED: 
            return OrderStatus.INVENTORY_RESERVATION_FAILED;
        case GenericStatus.SUCCEEDED:
            return OrderStatus.INVENTORY_RESERVATION_SUCCEEDED;
        case GenericStatus.PENDING:
            return OrderStatus.INVENTORY_RESERVATION_INITIATED;
        default:
            return OrderStatus.INVENTORY_RESERVATION_INITIATED;
    }
}