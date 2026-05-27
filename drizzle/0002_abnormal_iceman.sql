ALTER TABLE "profiles" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "profiles" CASCADE;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "profile_url" varchar;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "email";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "hashed_password";