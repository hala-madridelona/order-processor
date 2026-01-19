CREATE TYPE "public"."order_status" AS ENUM('ORDER_CREATED', 'INVENTORY_RESERVATION_INITIATED', 'INVENTORY_RESERVATION_SUCCEEDED', 'INVENTORY_RESERVATION_FAILED', 'PAYMENT_INITIATED', 'PAYMENT_SUCCEEDED', 'PAYMENT_FAILED', 'ORDER_CONFIRMED', 'ORDER_FAILED', 'ORDER_CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."generic_status" AS ENUM('PENDING', 'SUCCEEDED', 'FAILED');--> statement-breakpoint
CREATE TABLE "inventory_reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"idempotency_key" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"status" "generic_status" DEFAULT 'PENDING' NOT NULL,
	CONSTRAINT "inventory_reservations_order_id_unique" UNIQUE("order_id"),
	CONSTRAINT "inventory_reservations_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"idempotency_key" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"status" "order_status" DEFAULT 'ORDER_CREATED' NOT NULL,
	"failure_code" text,
	"failure_reason" text,
	CONSTRAINT "orders_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"idempotency_key" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"gateway_payment_id" text,
	"status" "generic_status" DEFAULT 'PENDING' NOT NULL,
	CONSTRAINT "payments_order_id_unique" UNIQUE("order_id"),
	CONSTRAINT "payments_idempotency_key_unique" UNIQUE("idempotency_key"),
	CONSTRAINT "payments_gateway_payment_id_unique" UNIQUE("gateway_payment_id")
);
--> statement-breakpoint
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_inventory_reservations_status" ON "inventory_reservations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_inventory_reservations_order_id" ON "inventory_reservations" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_orders_user_id" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_orders_status" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_orders_c_at" ON "orders" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_payment_status" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_payment_order_id" ON "payments" USING btree ("order_id");