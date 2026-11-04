CREATE TYPE "public"."comment_status" AS ENUM('pending', 'approved', 'hidden');--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(40) NOT NULL,
	"body" varchar(500) NOT NULL,
	"image_url" text,
	"status" "comment_status" DEFAULT 'pending' NOT NULL,
	"pinned" boolean DEFAULT false NOT NULL,
	"ip_hash" char(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"moderated_at" timestamp with time zone,
	CONSTRAINT "comments_pinned_requires_approved" CHECK (NOT "comments"."pinned" OR "comments"."status" = 'approved')
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"bucket" varchar(32) NOT NULL,
	"key_hash" char(64) NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"hits" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "rate_limits_bucket_key_hash_window_start_pk" PRIMARY KEY("bucket","key_hash","window_start")
);
--> statement-breakpoint
CREATE INDEX "comments_public_idx" ON "comments" USING btree ("status","pinned","created_at");