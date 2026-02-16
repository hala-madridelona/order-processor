ALTER TABLE "inventory_reservations" DROP CONSTRAINT "inventory_reservations_idempotency_key_unique";--> statement-breakpoint
ALTER TABLE "payments" DROP CONSTRAINT "payments_idempotency_key_unique";--> statement-breakpoint
ALTER TABLE "inventory_reservations" DROP COLUMN "idempotency_key";--> statement-breakpoint
ALTER TABLE "payments" DROP COLUMN "idempotency_key";