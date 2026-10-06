CREATE TABLE `admin_credentials` (
	`id` text PRIMARY KEY NOT NULL,
	`password_salt` text NOT NULL,
	`password_hash` text NOT NULL,
	`session_secret` text NOT NULL,
	`version` integer NOT NULL,
	`updated_at` text NOT NULL
);
