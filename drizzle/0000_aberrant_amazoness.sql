CREATE TABLE "activity_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"app_id" integer NOT NULL,
	"started_at" timestamp,
	"ended_at" timestamp,
	"duration_seconds" integer,
	"is_midnight" boolean,
	"is_productive_hour" boolean,
	"is_continuous" boolean,
	"created_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ai_insights" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"behavioral_id" integer NOT NULL,
	"weekly_report_id" integer NOT NULL,
	"insight_type" varchar,
	"content" text,
	"recommendation" text,
	"created_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "apps" (
	"id" serial PRIMARY KEY NOT NULL,
	"package_name" varchar,
	"app_name" varchar,
	"category" varchar,
	"platfrom" varchar,
	"is_active" boolean,
	"created_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "behaviour_scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"score_date" timestamp,
	"usage_duration_score" real,
	"open_frequency_score" real,
	"midnight_usage_score" real,
	"continuous_usage_score" real,
	"productivity_hour_score" real,
	"total_score" real,
	"risk_level" varchar,
	"excessive_usage_flag" boolean,
	"compulsive_checking_flag" boolean,
	"midnight_tendency_flag" boolean,
	"continuous_usage_flag" boolean,
	"distraction_tendency_flag" boolean,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "daily_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"app_id" integer NOT NULL,
	"stat_date" date,
	"total_duration_seconds" integer,
	"open_frequency" integer,
	"midnight_duration_seconds" integer,
	"productive_hour_duration_seconds" integer,
	"max_continuous_seconds" integer,
	"peak_active_hour" integer
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"message" varchar,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"url" varchar,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expired_at" timestamp,
	"created_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"productivity_start" time,
	"productivity_end" time,
	"midnight_start" time,
	"midnight_end" time,
	"screen_time_threshold_sec" integer,
	"continuous_threshold_sec" integer,
	"notification_enabled" boolean,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar,
	"email" varchar,
	"hashed_password" varchar,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "weekly_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"week_start" date,
	"week_end" date,
	"total_screen_time_seconds" integer,
	"avg_behavioral_score" real,
	"avg_risk_level" varchar,
	"prev_week_screen_time_sec" integer,
	"screen_time_change_pct" real,
	"risk_trend" varchar,
	"usage_summary" json,
	"ai_reflection" text,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_insights" ADD CONSTRAINT "ai_insights_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_insights" ADD CONSTRAINT "ai_insights_behavioral_id_behaviour_scores_id_fk" FOREIGN KEY ("behavioral_id") REFERENCES "public"."behaviour_scores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_insights" ADD CONSTRAINT "ai_insights_weekly_report_id_weekly_reports_id_fk" FOREIGN KEY ("weekly_report_id") REFERENCES "public"."weekly_reports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "behaviour_scores" ADD CONSTRAINT "behaviour_scores_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_stats" ADD CONSTRAINT "daily_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_stats" ADD CONSTRAINT "daily_stats_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_reports" ADD CONSTRAINT "weekly_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;