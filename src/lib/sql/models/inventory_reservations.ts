import { index, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { orders } from "./orders.js";
import { GenericStatus, genericStatusEnum } from "./shared.js";

export const inventory_reservations = pgTable('inventory_reservations', {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id').notNull().references(() => orders.id).unique(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    status: genericStatusEnum('status').default(GenericStatus.PENDING).notNull()
},
    (table) => [
        index('idx_inventory_reservations_status').on(table.status),
        index('idx_inventory_reservations_order_id').on(table.orderId)
    ]
)