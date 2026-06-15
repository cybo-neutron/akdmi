CREATE TYPE "public"."account_role" AS ENUM('admin', 'mentor', 'student', 'manager');--> statement-breakpoint
ALTER TABLE "account_user" ALTER COLUMN "role" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "account_user" ALTER COLUMN "role" SET DATA TYPE "public"."account_role" USING "role"::text::"public"."account_role";--> statement-breakpoint
ALTER TABLE "account_user" ALTER COLUMN "role" SET DEFAULT 'student';--> statement-breakpoint
ALTER TABLE "content" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "course" ALTER COLUMN "description" DROP NOT NULL;