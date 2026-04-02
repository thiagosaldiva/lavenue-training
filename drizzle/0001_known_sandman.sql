CREATE TABLE `dishes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`nameFr` varchar(255) DEFAULT '',
	`category` enum('entradas-frias','massas','pratos-principais','sobremesas') NOT NULL,
	`description` text DEFAULT (''),
	`ingredients` json DEFAULT ('[]'),
	`allergens` json DEFAULT ('[]'),
	`preparation` text DEFAULT (''),
	`curiosity` text DEFAULT (''),
	`imageUrl` text DEFAULT (''),
	`imageKey` varchar(512) DEFAULT '',
	`price` varchar(50) DEFAULT '',
	`isNew` boolean DEFAULT false,
	`isPromo` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dishes_id` PRIMARY KEY(`id`)
);
