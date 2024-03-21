CREATE TABLE `tracks` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`artist` text,
	`album` text
);
--> statement-breakpoint
CREATE TABLE `tracks_to_groups` (
	`track_id` text NOT NULL,
	`group_id` text NOT NULL,
	PRIMARY KEY(`group_id`, `track_id`)
);
