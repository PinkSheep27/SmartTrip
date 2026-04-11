ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_cart_id_carts_id_fk";
--> statement-breakpoint
ALTER TABLE "carts" DROP CONSTRAINT "carts_trip_id_trips_id_fk";
--> statement-breakpoint
ALTER TABLE "participants" DROP CONSTRAINT "participants_trip_id_trips_id_fk";
--> statement-breakpoint
ALTER TABLE "cart_items" ALTER COLUMN "cart_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "participants" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "trips" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;