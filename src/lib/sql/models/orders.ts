import { index, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export enum OrderStatus {
    ORDER_CREATED = "ORDER_CREATED",

    INVENTORY_RESERVATION_INITIATED = "INVENTORY_RESERVATION_INITIATED",
    INVENTORY_RESERVATION_SUCCEEDED = "INVENTORY_RESERVATION_SUCCEEDED",
    INVENTORY_RESERVATION_FAILED = "INVENTORY_RESERVATION_FAILED",
  
    PAYMENT_INITIATED = "PAYMENT_INITIATED",
    PAYMENT_SUCCEEDED = "PAYMENT_SUCCEEDED",
    PAYMENT_FAILED = "PAYMENT_FAILED",
  
    ORDER_CONFIRMED = "ORDER_CONFIRMED",
    ORDER_FAILED = "ORDER_FAILED",
    ORDER_CANCELLED = "ORDER_CANCELLED",
}

export const orderStatusEnum = pgEnum(
    'order_status',
    OrderStatus
)

export const orders = pgTable('orders', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    idempotencyKey: text('idempotency_key').unique().notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    status: orderStatusEnum('status').default(OrderStatus.ORDER_CREATED).notNull(),
    failureCode: text('failure_code'),
    failureReason: text('failure_reason')
}, (table) => [
    index("idx_orders_user_id").on(table.userId),
    index("idx_orders_status").on(table.status),
    index("idx_orders_c_at").on(table.createdAt.desc())
])