-- Keep one assignment per user and shift, preserving claimed beer and timestamps.
UPDATE `user_shift`
SET `is_beer_claimed` = (
    SELECT MAX(other.`is_beer_claimed`) FROM `user_shift` AS other
    WHERE other.`user_id` = `user_shift`.`user_id` AND other.`shift_id` = `user_shift`.`shift_id`
),
`created_at` = (
    SELECT MIN(other.`created_at`) FROM `user_shift` AS other
    WHERE other.`user_id` = `user_shift`.`user_id` AND other.`shift_id` = `user_shift`.`shift_id`
),
`updated_at` = (
    SELECT MAX(other.`updated_at`) FROM `user_shift` AS other
    WHERE other.`user_id` = `user_shift`.`user_id` AND other.`shift_id` = `user_shift`.`shift_id`
)
WHERE rowid IN (
    SELECT MAX(rowid) FROM `user_shift` GROUP BY `user_id`, `shift_id` HAVING COUNT(*) > 1
);
--> statement-breakpoint
-- Keep the most recently inserted assignment's status.
DELETE FROM `user_shift`
WHERE rowid NOT IN (
    SELECT MAX(rowid) FROM `user_shift` GROUP BY `user_id`, `shift_id`
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_shift_user_id_shift_id_unique` ON `user_shift` (`user_id`,`shift_id`);