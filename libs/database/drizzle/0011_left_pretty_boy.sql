begin;

CREATE TYPE "public"."type" AS ENUM('content_completed', 'course_completed');--> statement-breakpoint
CREATE TABLE "user_activity" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigserial NOT NULL,
	"activity_type" "type" NOT NULL,
	"metadata" jsonb,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_activity" ADD CONSTRAINT "user_activity_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
commit;