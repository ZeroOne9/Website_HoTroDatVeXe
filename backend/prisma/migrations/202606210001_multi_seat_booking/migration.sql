-- Add total fare to Booking before removing legacy fare/seat/trip columns.
ALTER TABLE `Booking` ADD COLUMN `totalFareVnd` INTEGER NULL;
UPDATE `Booking` SET `totalFareVnd` = `fareVnd`;

-- CreateTable
CREATE TABLE `BookingSeat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bookingId` INTEGER NOT NULL,
    `tripId` INTEGER NOT NULL,
    `seatId` INTEGER NOT NULL,
    `fareVnd` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BookingSeat_bookingId_seatId_key`(`bookingId`, `seatId`),
    INDEX `BookingSeat_bookingId_idx`(`bookingId`),
    INDEX `BookingSeat_tripId_idx`(`tripId`),
    INDEX `BookingSeat_seatId_idx`(`seatId`),
    INDEX `BookingSeat_tripId_seatId_idx`(`tripId`, `seatId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `BookingSeat` (`bookingId`, `tripId`, `seatId`, `fareVnd`, `createdAt`, `updatedAt`)
SELECT `id`, `tripId`, `seatId`, `fareVnd`, `createdAt`, `updatedAt`
FROM `Booking`;

-- Migrate Ticket from Booking to BookingSeat.
ALTER TABLE `Ticket` ADD COLUMN `bookingSeatId` INTEGER NULL;

UPDATE `Ticket` AS `t`
INNER JOIN `BookingSeat` AS `bs` ON `bs`.`bookingId` = `t`.`bookingId`
SET `t`.`bookingSeatId` = `bs`.`id`;

ALTER TABLE `Ticket` DROP FOREIGN KEY `Ticket_bookingId_fkey`;
ALTER TABLE `Ticket` DROP INDEX `Ticket_bookingId_key`;
ALTER TABLE `Ticket` MODIFY `bookingSeatId` INTEGER NOT NULL;
ALTER TABLE `Ticket` DROP COLUMN `bookingId`;

-- Remove legacy direct seat/trip fields from Booking.
ALTER TABLE `Booking` DROP FOREIGN KEY `Booking_tripId_fkey`;
ALTER TABLE `Booking` DROP FOREIGN KEY `Booking_seatId_fkey`;
ALTER TABLE `Booking` DROP INDEX `Booking_tripId_idx`;
ALTER TABLE `Booking` DROP INDEX `Booking_seatId_idx`;
ALTER TABLE `Booking` DROP INDEX `Booking_tripId_seatId_status_idx`;
ALTER TABLE `Booking` MODIFY `totalFareVnd` INTEGER NOT NULL;
ALTER TABLE `Booking` DROP COLUMN `tripId`;
ALTER TABLE `Booking` DROP COLUMN `seatId`;
ALTER TABLE `Booking` DROP COLUMN `fareVnd`;

-- AddForeignKey
ALTER TABLE `BookingSeat` ADD CONSTRAINT `BookingSeat_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `BookingSeat` ADD CONSTRAINT `BookingSeat_tripId_fkey` FOREIGN KEY (`tripId`) REFERENCES `Trip`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `BookingSeat` ADD CONSTRAINT `BookingSeat_seatId_fkey` FOREIGN KEY (`seatId`) REFERENCES `Seat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add Ticket relation to BookingSeat.
ALTER TABLE `Ticket` ADD UNIQUE INDEX `Ticket_bookingSeatId_key`(`bookingSeatId`);
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_bookingSeatId_fkey` FOREIGN KEY (`bookingSeatId`) REFERENCES `BookingSeat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
