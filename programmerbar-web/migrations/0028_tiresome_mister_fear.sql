UPDATE `user` SET `role` = 'inactive' WHERE `is_active` = 0;
--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `is_active`;
