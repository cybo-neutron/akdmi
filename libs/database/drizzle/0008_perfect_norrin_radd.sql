BEGIN;

CREATE TYPE "public"."completion_status" AS ENUM('not_started', 'in_progress', 'completed');--> statement-breakpoint
CREATE TABLE "user_content_log" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigserial NOT NULL,
	"content_id" bigserial NOT NULL,
	"completion_status" "completion_status" DEFAULT 'not_started' NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "cover_art" text;--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "introduction_video" text;--> statement-breakpoint
ALTER TABLE "user_content_log" ADD CONSTRAINT "user_content_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_content_log" ADD CONSTRAINT "user_content_log_content_id_content_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_content_log_unique_idx" ON "user_content_log" USING btree ("user_id","content_id");

COMMIT;