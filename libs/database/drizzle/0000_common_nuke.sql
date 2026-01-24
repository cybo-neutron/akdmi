CREATE TYPE "public"."role" AS ENUM('admin', 'mentor', 'student', 'manager');--> statement-breakpoint
CREATE TYPE "public"."content_document_type" AS ENUM('pdf', 'doc', 'ppt', 'other');--> statement-breakpoint
CREATE TYPE "public"."content_media_type" AS ENUM('video', 'audio', 'image');--> statement-breakpoint
CREATE TYPE "public"."content_type" AS ENUM('text', 'media', 'document');--> statement-breakpoint
CREATE TABLE "account_user" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"account_id" bigserial NOT NULL,
	"user_id" bigserial NOT NULL,
	"role" "role" DEFAULT 'student' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_document" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"url" varchar(255) NOT NULL,
	"type" "content_document_type" NOT NULL,
	"content_id" bigserial NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_media" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"url" varchar(255) NOT NULL,
	"type" "content_media_type" NOT NULL,
	"content_id" bigserial NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_text" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"content_id" bigserial NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"type" "content_type" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" bigserial NOT NULL,
	"last_updated_by" bigserial NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" bigserial NOT NULL,
	"last_updated_by" bigserial NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"first_name" varchar(255),
	"last_name" varchar(255),
	"email" varchar(255) NOT NULL,
	"password" text NOT NULL,
	"avatar_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "account_user" ADD CONSTRAINT "account_user_account_id_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_user" ADD CONSTRAINT "account_user_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_document" ADD CONSTRAINT "content_document_content_id_content_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_media" ADD CONSTRAINT "content_media_content_id_content_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_text" ADD CONSTRAINT "content_text_content_id_content_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content" ADD CONSTRAINT "content_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content" ADD CONSTRAINT "content_last_updated_by_user_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course" ADD CONSTRAINT "course_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course" ADD CONSTRAINT "course_last_updated_by_user_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;