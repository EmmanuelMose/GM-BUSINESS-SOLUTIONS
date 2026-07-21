ALTER TABLE "admins" DROP CONSTRAINT "admins_user_id_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "staff" DROP CONSTRAINT "staff_user_id_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "admins" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "staff" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "admins" ADD CONSTRAINT "admins_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;