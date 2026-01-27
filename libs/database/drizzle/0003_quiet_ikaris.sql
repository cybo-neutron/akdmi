begin;
ALTER TABLE "role_resource_permission" ALTER COLUMN "permission" SET DATA TYPE jsonb using permission::text::jsonb;--> statement-breakpoint
ALTER TABLE "role_resource_permission" ALTER COLUMN "permission" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "content" ADD COLUMN "sequence" integer DEFAULT 1 NOT NULL;
commit;