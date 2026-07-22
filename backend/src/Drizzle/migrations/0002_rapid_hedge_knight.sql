CREATE TABLE "pickup_locations" (
	"location_id" serial PRIMARY KEY NOT NULL,
	"station_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"address" text NOT NULL,
	"landmark" varchar(255),
	"phone" varchar(20),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pickup_stations" (
	"station_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"county" varchar(100) NOT NULL,
	"town" varchar(100) NOT NULL,
	"address" text NOT NULL,
	"phone" varchar(20),
	"email" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "payment_method" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."payment_method";--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('mpesa');--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "payment_method" SET DATA TYPE "public"."payment_method" USING "payment_method"::"public"."payment_method";--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "pickup_station_id" integer;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "pickup_location_id" integer;--> statement-breakpoint
ALTER TABLE "pickup_locations" ADD CONSTRAINT "pickup_locations_station_id_pickup_stations_station_id_fk" FOREIGN KEY ("station_id") REFERENCES "public"."pickup_stations"("station_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_pickup_station_id_pickup_stations_station_id_fk" FOREIGN KEY ("pickup_station_id") REFERENCES "public"."pickup_stations"("station_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_pickup_location_id_pickup_locations_location_id_fk" FOREIGN KEY ("pickup_location_id") REFERENCES "public"."pickup_locations"("location_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "addresses" DROP COLUMN "pickup_station";--> statement-breakpoint
ALTER TABLE "addresses" DROP COLUMN "pickup_station_address";--> statement-breakpoint
ALTER TABLE "addresses" DROP COLUMN "pickup_station_phone";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "shipping_cost";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "discount";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "coupon_code";--> statement-breakpoint
ALTER TABLE "payments" DROP COLUMN "bank_reference";--> statement-breakpoint
ALTER TABLE "payments" DROP COLUMN "card_last_four";--> statement-breakpoint
ALTER TABLE "payments" DROP COLUMN "card_brand";