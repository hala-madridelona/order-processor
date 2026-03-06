ALTER TABLE "payments" RENAME COLUMN "gateway_payment_id" TO "payment_intent_id";--> statement-breakpoint
ALTER TABLE "payments" DROP CONSTRAINT "payments_gateway_payment_id_unique";--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "amount" text;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_payment_intent_id_unique" UNIQUE("payment_intent_id");