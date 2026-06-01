// FomoTracker logical database schema for dbdiagram.io
// Auth is handled by Supabase Auth. This schema stores the app profile and tracking data.
// Page coverage:
// - /auth/login, /auth/register -> Supabase Auth + users profile row
// - /onboarding, /settings/monitoring -> monitored apps and user settings
// - /dashboard, /analytics -> daily stats, activity logs, behavior scores
// - /insight -> weekly reports and AI insights
// - /notifications -> notifications table
// - /settings/profile, /settings/privacy, /settings/notifications -> users, user_settings, notifications

Table users {
	id uuid [pk, default: `gen_random_uuid()`]
	username varchar [not null]
	profile_url varchar
	timezone varchar
	onboarding_completed_at timestamp
	created_at timestamp [default: `now()`]
	updated_at timestamp
}

Table sessions {
	id int [pk, increment]
	user_id uuid [not null]
	expired_at timestamp
	created_at timestamp [default: `now()`]
}

Table apps {
	id int [pk, increment]
	package_name varchar [not null, unique]
	app_name varchar [not null]
	category varchar
	platform varchar
	is_active boolean [default: true]
	created_at timestamp [default: `now()`]
}

Table user_monitored_apps {
	id int [pk, increment]
	user_id uuid [not null]
	app_id int [not null]
	platform varchar [not null]
	enabled boolean [default: true]
	created_at timestamp [default: `now()`]
	updated_at timestamp
}

Table user_settings {
	id int [pk, increment]
	user_id uuid [not null, unique]
	productivity_start time
	productivity_end time
	midnight_start time
	midnight_end time
	screen_time_threshold_sec int
	continuous_threshold_sec int
	notification_enabled boolean [default: true]
	usage_warning_enabled boolean [default: true]
	focus_reminder_enabled boolean [default: true]
	midnight_alert_enabled boolean [default: true]
	continuous_usage_enabled boolean [default: false]
	updated_at timestamp
}

Table daily_stats {
	id int [pk, increment]
	user_id uuid [not null]
	app_id int [not null]
	stat_date date
	total_duration_seconds int
	open_frequency int
	midnight_duration_seconds int
	productive_hour_duration_seconds int
	max_continuous_seconds int
	peak_active_hour int
}

Table activity_log {
	id int [pk, increment]
	user_id uuid [not null]
	app_id int [not null]
	started_at timestamp
	ended_at timestamp
	duration_seconds int
	is_midnight boolean [default: false]
	is_productive_hour boolean [default: false]
	is_continuous boolean [default: false]
	created_at timestamp [default: `now()`]
}

Table behaviour_scores {
	id int [pk, increment]
	user_id uuid [not null]
	score_date timestamp
	usage_duration_score float
	open_frequency_score float
	midnight_usage_score float
	continuous_usage_score float
	productivity_hour_score float
	total_score float
	risk_level varchar
	excessive_usage_flag boolean
	compulsive_checking_flag boolean
	midnight_tendency_flag boolean
	continuous_usage_flag boolean
	distraction_tendency_flag boolean
	created_at timestamp [default: `now()`]
	updated_at timestamp
}

Table weekly_reports {
	id int [pk, increment]
	user_id uuid [not null]
	week_start date
	week_end date
	total_screen_time_seconds int
	avg_behavioral_score float
	avg_risk_level varchar
	prev_week_screen_time_sec int
	screen_time_change_pct float
	risk_trend varchar
	usage_summary jsonb
	ai_reflection text
	created_at timestamp [default: `now()`]
	updated_at timestamp
}

Table ai_insights {
	id int [pk, increment]
	user_id uuid [not null]
	behavioral_id int [not null]
	weekly_report_id int [not null]
	insight_type varchar
	content text
	recommendation text
	created_at timestamp [default: `now()`]
}

Table notifications {
	id int [pk, increment]
	user_id uuid [not null]
	notification_type varchar
	title varchar
	message varchar
	is_read boolean [default: false]
	severity varchar
	source_app_id int
	payload jsonb
	created_at timestamp [default: `now()`]
}

Ref: sessions.user_id > users.id
Ref: user_monitored_apps.user_id > users.id
Ref: user_monitored_apps.app_id > apps.id
Ref: user_settings.user_id > users.id
Ref: daily_stats.user_id > users.id
Ref: daily_stats.app_id > apps.id
Ref: activity_log.user_id > users.id
Ref: activity_log.app_id > apps.id
Ref: behaviour_scores.user_id > users.id
Ref: weekly_reports.user_id > users.id
Ref: ai_insights.user_id > users.id
Ref: ai_insights.behavioral_id > behaviour_scores.id
Ref: ai_insights.weekly_report_id > weekly_reports.id
Ref: notifications.user_id > users.id
Ref: notifications.source_app_id > apps.id
