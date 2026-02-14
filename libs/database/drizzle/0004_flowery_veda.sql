begin;

ALTER TABLE "content" ADD COLUMN "parent_id" bigint;--> statement-breakpoint
ALTER TABLE "content" ADD COLUMN "course_id" bigint NOT NULL;--> statement-breakpoint
ALTER TABLE "content" ADD CONSTRAINT "content_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE no action ON UPDATE no action;

commit;