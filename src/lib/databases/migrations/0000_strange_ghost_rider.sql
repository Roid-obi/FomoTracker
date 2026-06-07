CREATE TABLE "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"app_id" uuid NOT NULL,
	"device_id" uuid NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"ended_at" timestamp with time zone NOT NULL,
	"duration_seconds" integer NOT NULL,
	"is_midnight" boolean DEFAULT false NOT NULL,
	"is_productive_hour" boolean DEFAULT false NOT NULL,
	"is_continuous" boolean DEFAULT false NOT NULL,
	"source" varchar(20) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "apps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"package_name" varchar(255),
	"web_domain" varchar(255),
	"category" varchar(50) DEFAULT 'social_media' NOT NULL,
	"icon_url" varchar(500),
	"platform" varchar(20) NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "behavioral_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"score_date" date NOT NULL,
	"usage_duration_score" double precision DEFAULT 0 NOT NULL,
	"open_frequency_score" double precision DEFAULT 0 NOT NULL,
	"midnight_usage_score" double precision DEFAULT 0 NOT NULL,
	"continuous_usage_score" double precision DEFAULT 0 NOT NULL,
	"productive_hour_score" double precision DEFAULT 0 NOT NULL,
	"total_score" double precision DEFAULT 0 NOT NULL,
	"daily_status" varchar(20) DEFAULT 'good' NOT NULL,
	"flag_excessive_usage" boolean DEFAULT false,
	"flag_compulsive_checking" boolean DEFAULT false,
	"flag_midnight_usage" boolean DEFAULT false,
	"flag_continuous_usage" boolean DEFAULT false,
	"flag_productive_hour_distraction" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "behavioral_scores_user_date_unique" UNIQUE("user_id","score_date")
);
--> statement-breakpoint
CREATE TABLE "daily_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"app_id" uuid NOT NULL,
	"stat_date" date NOT NULL,
	"total_duration_seconds" integer DEFAULT 0 NOT NULL,
	"open_frequency" integer DEFAULT 0 NOT NULL,
	"midnight_duration_seconds" integer DEFAULT 0 NOT NULL,
	"productive_hour_duration_seconds" integer DEFAULT 0 NOT NULL,
	"max_continuous_seconds" integer DEFAULT 0 NOT NULL,
	"peak_active_hour" smallint,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "daily_stats_user_app_date_unique" UNIQUE("user_id","app_id","stat_date")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"platform" varchar(20) NOT NULL,
	"device_name" varchar(255),
	"browser_name" varchar(100),
	"is_connected" boolean DEFAULT false,
	"last_synced_at" timestamp with time zone,
	"connected_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"productive_start" time DEFAULT '08:00' NOT NULL,
	"productive_end" time DEFAULT '17:00' NOT NULL,
	"sleep_start" time DEFAULT '22:00' NOT NULL,
	"sleep_end" time DEFAULT '06:00' NOT NULL,
	"screen_time_limit_seconds" integer DEFAULT 10800 NOT NULL,
	"continuous_limit_seconds" integer DEFAULT 2700 NOT NULL,
	"notif_screen_time_enabled" boolean DEFAULT true,
	"notif_productive_hour_enabled" boolean DEFAULT true,
	"notif_midnight_enabled" boolean DEFAULT true,
	"notif_continuous_enabled" boolean DEFAULT true,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "user_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_tracked_apps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"app_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true,
	"added_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "user_tracked_apps_user_app_unique" UNIQUE("user_id","app_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"hashed_password" varchar(255),
	"avatar_url" varchar(500),
	"provider" varchar(16) NOT NULL,
	"onboarding_completed" boolean DEFAULT false,
	"data_start_date" date,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "weekly_insights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"week_start" date NOT NULL,
	"week_end" date NOT NULL,
	"generated_at" timestamp with time zone NOT NULL,
	"total_screen_time_seconds" integer DEFAULT 0 NOT NULL,
	"avg_behavioral_score" double precision DEFAULT 0 NOT NULL,
	"weekly_status" varchar(20) NOT NULL,
	"best_day" date,
	"worst_day" date,
	"top_app_id" uuid,
	"prev_week_screen_time_seconds" integer,
	"ai_weekly_status_label" varchar(100),
	"ai_positive_notes" text,
	"ai_concern_notes" text,
	"ai_analysis" text,
	"ai_tips" text,
	"generation_status" varchar(20) DEFAULT 'pending',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "weekly_insights_user_week_unique" UNIQUE("user_id","week_start")
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_device_id_user_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."user_devices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "behavioral_scores" ADD CONSTRAINT "behavioral_scores_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_stats" ADD CONSTRAINT "daily_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_stats" ADD CONSTRAINT "daily_stats_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_devices" ADD CONSTRAINT "user_devices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tracked_apps" ADD CONSTRAINT "user_tracked_apps_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tracked_apps" ADD CONSTRAINT "user_tracked_apps_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_insights" ADD CONSTRAINT "weekly_insights_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_insights" ADD CONSTRAINT "weekly_insights_top_app_id_apps_id_fk" FOREIGN KEY ("top_app_id") REFERENCES "public"."apps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_logs_user_started_idx" ON "activity_logs" USING btree ("user_id","started_at");--> statement-breakpoint
CREATE INDEX "activity_logs_user_app_started_idx" ON "activity_logs" USING btree ("user_id","app_id","started_at");--> statement-breakpoint
CREATE INDEX "activity_logs_user_id_idx" ON "activity_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "apps_package_name_idx" ON "apps" USING btree ("package_name");--> statement-breakpoint
CREATE INDEX "apps_web_domain_idx" ON "apps" USING btree ("web_domain");--> statement-breakpoint
CREATE INDEX "apps_platform_idx" ON "apps" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "behavioral_scores_user_id_idx" ON "behavioral_scores" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "daily_stats_user_date_idx" ON "daily_stats" USING btree ("user_id","stat_date");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_user_is_read_idx" ON "notifications" USING btree ("user_id","is_read");--> statement-breakpoint
CREATE INDEX "notifications_user_created_at_idx" ON "notifications" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "user_devices_user_id_idx" ON "user_devices" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_devices_user_platform_idx" ON "user_devices" USING btree ("user_id","platform");--> statement-breakpoint
CREATE INDEX "user_tracked_apps_user_id_idx" ON "user_tracked_apps" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "weekly_insights_user_id_idx" ON "weekly_insights" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "weekly_insights_generation_status_idx" ON "weekly_insights" USING btree ("generation_status");