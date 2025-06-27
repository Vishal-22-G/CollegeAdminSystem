CREATE TABLE "divisions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"department" text NOT NULL,
	"semester" integer NOT NULL,
	"academic_year" text NOT NULL,
	"student_count" integer DEFAULT 0,
	CONSTRAINT "divisions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "excel_uploads" (
	"id" serial PRIMARY KEY NOT NULL,
	"filename" text NOT NULL,
	"original_name" text NOT NULL,
	"file_size" integer NOT NULL,
	"status" text DEFAULT 'processing' NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	"processed_rows" integer DEFAULT 0,
	"total_rows" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "faculty" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"position" text NOT NULL,
	"department" text NOT NULL,
	"max_hours" integer NOT NULL,
	"current_hours" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "faculty_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"department" text NOT NULL,
	"credits" integer NOT NULL,
	"semester" integer NOT NULL,
	CONSTRAINT "subjects_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "timetable_slots" (
	"id" serial PRIMARY KEY NOT NULL,
	"division_id" integer NOT NULL,
	"faculty_id" integer NOT NULL,
	"subject_id" integer NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"classroom" text NOT NULL,
	"type" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "workload_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"faculty_id" integer NOT NULL,
	"subject_id" integer NOT NULL,
	"division_id" integer NOT NULL,
	"type" text NOT NULL,
	"hours_per_week" integer NOT NULL,
	"classroom" text,
	"status" text DEFAULT 'assigned' NOT NULL
);
