CREATE TABLE `unavailability` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`start_at` integer NOT NULL,
	`end_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "unavailability_valid_interval" CHECK("unavailability"."end_at" > "unavailability"."start_at")
);
--> statement-breakpoint
CREATE INDEX `unavailability_user_id_idx` ON `unavailability` (`user_id`);