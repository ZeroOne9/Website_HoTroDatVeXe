-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fullName` VARCHAR(120) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `role` ENUM('passenger', 'admin') NOT NULL DEFAULT 'passenger',
    `status` ENUM('active', 'locked') NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_phone_key`(`phone`),
    INDEX `User_role_idx`(`role`),
    INDEX `User_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BusCompany` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `email` VARCHAR(191) NULL,
    `address` VARCHAR(255) NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BusCompany_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Vehicle` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `busCompanyId` INTEGER NOT NULL,
    `licensePlate` VARCHAR(20) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `vehicleType` VARCHAR(80) NOT NULL,
    `capacity` INTEGER NOT NULL,
    `status` ENUM('active', 'maintenance', 'inactive') NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Vehicle_licensePlate_key`(`licensePlate`),
    INDEX `Vehicle_busCompanyId_idx`(`busCompanyId`),
    INDEX `Vehicle_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Seat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vehicleId` INTEGER NOT NULL,
    `seatCode` VARCHAR(20) NOT NULL,
    `seatType` ENUM('standard', 'sleeper', 'vip') NOT NULL DEFAULT 'standard',
    `floor` INTEGER NOT NULL DEFAULT 1,
    `rowNumber` INTEGER NULL,
    `colNumber` INTEGER NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Seat_vehicleId_idx`(`vehicleId`),
    INDEX `Seat_isActive_idx`(`isActive`),
    UNIQUE INDEX `Seat_vehicleId_seatCode_key`(`vehicleId`, `seatCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Location` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(120) NOT NULL,
    `province` VARCHAR(120) NOT NULL,
    `address` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Location_province_idx`(`province`),
    UNIQUE INDEX `Location_name_province_key`(`name`, `province`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Route` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `departureLocationId` INTEGER NOT NULL,
    `destinationLocationId` INTEGER NOT NULL,
    `distanceKm` DECIMAL(8, 2) NULL,
    `estimatedMinutes` INTEGER NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Route_departureLocationId_idx`(`departureLocationId`),
    INDEX `Route_destinationLocationId_idx`(`destinationLocationId`),
    INDEX `Route_status_idx`(`status`),
    UNIQUE INDEX `Route_departureLocationId_destinationLocationId_key`(`departureLocationId`, `destinationLocationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Trip` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `routeId` INTEGER NOT NULL,
    `vehicleId` INTEGER NOT NULL,
    `departureTime` DATETIME(3) NOT NULL,
    `arrivalTime` DATETIME(3) NULL,
    `priceVnd` INTEGER NOT NULL,
    `status` ENUM('scheduled', 'departed', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Trip_routeId_idx`(`routeId`),
    INDEX `Trip_vehicleId_idx`(`vehicleId`),
    INDEX `Trip_departureTime_idx`(`departureTime`),
    INDEX `Trip_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Booking` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bookingCode` VARCHAR(40) NOT NULL,
    `userId` INTEGER NULL,
    `tripId` INTEGER NOT NULL,
    `seatId` INTEGER NOT NULL,
    `passengerName` VARCHAR(120) NOT NULL,
    `passengerPhone` VARCHAR(20) NOT NULL,
    `passengerEmail` VARCHAR(191) NULL,
    `fareVnd` INTEGER NOT NULL,
    `status` ENUM('pending', 'confirmed', 'cancelled', 'expired') NOT NULL DEFAULT 'pending',
    `expiresAt` DATETIME(3) NULL,
    `confirmedAt` DATETIME(3) NULL,
    `cancelledAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Booking_bookingCode_key`(`bookingCode`),
    INDEX `Booking_userId_idx`(`userId`),
    INDEX `Booking_tripId_idx`(`tripId`),
    INDEX `Booking_seatId_idx`(`seatId`),
    INDEX `Booking_status_idx`(`status`),
    INDEX `Booking_tripId_seatId_status_idx`(`tripId`, `seatId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ticket` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bookingId` INTEGER NOT NULL,
    `code` VARCHAR(40) NOT NULL,
    `qrCode` TEXT NULL,
    `status` ENUM('valid', 'used', 'cancelled') NOT NULL DEFAULT 'valid',
    `issuedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `usedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Ticket_bookingId_key`(`bookingId`),
    UNIQUE INDEX `Ticket_code_key`(`code`),
    INDEX `Ticket_status_idx`(`status`),
    INDEX `Ticket_issuedAt_idx`(`issuedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Vehicle` ADD CONSTRAINT `Vehicle_busCompanyId_fkey` FOREIGN KEY (`busCompanyId`) REFERENCES `BusCompany`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Seat` ADD CONSTRAINT `Seat_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `Vehicle`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Route` ADD CONSTRAINT `Route_departureLocationId_fkey` FOREIGN KEY (`departureLocationId`) REFERENCES `Location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Route` ADD CONSTRAINT `Route_destinationLocationId_fkey` FOREIGN KEY (`destinationLocationId`) REFERENCES `Location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Trip` ADD CONSTRAINT `Trip_routeId_fkey` FOREIGN KEY (`routeId`) REFERENCES `Route`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Trip` ADD CONSTRAINT `Trip_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `Vehicle`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_tripId_fkey` FOREIGN KEY (`tripId`) REFERENCES `Trip`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_seatId_fkey` FOREIGN KEY (`seatId`) REFERENCES `Seat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
