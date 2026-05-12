CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`buildspace_user_id` text NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`avatar_url` text,
	`role` text DEFAULT 'member' NOT NULL,
	`marketing_opt_in` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_buildspace_user_id_idx` ON `users` (`buildspace_user_id`);