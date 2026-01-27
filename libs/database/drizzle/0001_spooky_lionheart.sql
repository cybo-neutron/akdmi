BEGIN;

CREATE TYPE "public"."permission" AS ENUM('create', 'read', 'update', 'delete');--> statement-breakpoint
CREATE TYPE "public"."resource" AS ENUM('user', 'content', 'course');--> statement-breakpoint
CREATE TABLE "role_resource_permission" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"resource" "resource" NOT NULL,
	"permission" "permission" NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" "role" DEFAULT 'student' NOT NULL;

COMMIT;