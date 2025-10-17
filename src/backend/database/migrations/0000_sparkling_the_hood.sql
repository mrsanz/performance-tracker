CREATE TABLE `persons` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`title` text,
	`start_date` integer NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `persons_email_unique` ON `persons` (`email`);--> statement-breakpoint
CREATE INDEX `idx_persons_email` ON `persons` (`email`);--> statement-breakpoint
CREATE TABLE `performance_events` (
	`id` text PRIMARY KEY NOT NULL,
	`person_id` text NOT NULL,
	`timestamp` integer NOT NULL,
	`type` text NOT NULL,
	`payload` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`person_id`) REFERENCES `persons`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_performance_events_timestamp` ON `performance_events` (`timestamp`);--> statement-breakpoint
CREATE INDEX `idx_performance_events_type` ON `performance_events` (`type`);--> statement-breakpoint
CREATE INDEX `idx_performance_events_type_timestamp` ON `performance_events` (`type`,`timestamp`);