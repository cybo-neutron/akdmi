BEGIN;

CREATE TYPE "public"."publish_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "status" "publish_status" DEFAULT 'draft' NOT NULL;

COMMIT;