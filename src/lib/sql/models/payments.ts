import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { orders } from "./orders.js";
import { GenericStatus, genericStatusEnum } from "./shared.js";

export const payments = pgTable('payments', {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id').notNull().references(() => orders.id).unique(),
    idempotencyKey: text('idempotency_key').unique().notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    gatewayPaymentId: text('gateway_payment_id').unique(),
    status: genericStatusEnum('status').default(GenericStatus.PENDING).notNull()
}, (table) => [
    index("idx_payment_status").on(table.status),
    index("idx_payment_order_id").on(table.orderId),
    index("idx_payment_updated_at").on(table.updatedAt)
])