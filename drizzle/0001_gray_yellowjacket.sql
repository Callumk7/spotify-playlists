ALTER TABLE users ADD `spotify_id` text;--> statement-breakpoint
CREATE UNIQUE INDEX `users_spotify_id_unique` ON `users` (`spotify_id`);