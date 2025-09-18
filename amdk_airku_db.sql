-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 16, 2025 at 01:03 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `amdk_airku_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` varchar(36) NOT NULL,
  `storeId` varchar(36) NOT NULL,
  `totalAmount` decimal(12,2) NOT NULL,
  `status` enum('Pending','Routed','Delivering','Delivered','Failed') NOT NULL,
  `orderDate` date NOT NULL,
  `desiredDeliveryDate` date DEFAULT NULL,
  `assignedVehicleId` varchar(36) DEFAULT NULL,
  `orderedById` varchar(36) NOT NULL,
  `orderedByName` varchar(255) NOT NULL,
  `orderedByRole` varchar(50) NOT NULL,
  `priority` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `storeId`, `totalAmount`, `status`, `orderDate`, `desiredDeliveryDate`, `assignedVehicleId`, `orderedById`, `orderedByName`, `orderedByRole`, `priority`) VALUES
('57bc4d09-4dc5-405d-9141-84de5b5f2378', 'ce1a3121-3c1d-4484-89ec-859803c4a145', 19000.00, 'Routed', '2025-09-16', '2025-09-18', '6082a2a5-fe06-4dd4-bea9-6a6110469c11', '79d62b55-981c-4f76-9703-546701161a96', 'Admin Utama', 'Admin', 0),
('61ff488c-5c80-4ec2-95f8-b94744e62a16', '22ea99cc-e4ed-4b31-bb04-8072be2ba26b', 20000.00, 'Routed', '2025-09-16', '2025-09-16', '6082a2a5-fe06-4dd4-bea9-6a6110469c11', '79d62b55-981c-4f76-9703-546701161a96', 'Admin Utama', 'Admin', 0),
('746ef69b-bafe-4b06-92eb-400a74647190', '22ea99cc-e4ed-4b31-bb04-8072be2ba26b', 20000.00, 'Routed', '2025-09-16', '2025-09-18', '6082a2a5-fe06-4dd4-bea9-6a6110469c11', '79d62b55-981c-4f76-9703-546701161a96', 'Admin Utama', 'Admin', 0),
('9196e25a-f8a0-4cd9-a81b-babb8764b86d', 'ce1a3121-3c1d-4484-89ec-859803c4a145', 20000.00, 'Routed', '2025-09-16', '2025-09-16', '6082a2a5-fe06-4dd4-bea9-6a6110469c11', '79d62b55-981c-4f76-9703-546701161a96', 'Admin Utama', 'Admin', 0);

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` varchar(36) NOT NULL,
  `orderId` varchar(36) NOT NULL,
  `productId` varchar(36) NOT NULL,
  `quantity` int(11) NOT NULL,
  `originalPrice` decimal(10,2) NOT NULL,
  `specialPrice` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `orderId`, `productId`, `quantity`, `originalPrice`, `specialPrice`) VALUES
('31ef983e-8e70-424e-a0ca-ec16d7b037b1', '61ff488c-5c80-4ec2-95f8-b94744e62a16', 'c6f73ff6-42f8-403d-bd2a-bea075da2895', 1, 20000.00, NULL),
('5fac6656-65d1-445f-99fe-73a39231f069', '746ef69b-bafe-4b06-92eb-400a74647190', 'c6f73ff6-42f8-403d-bd2a-bea075da2895', 1, 20000.00, NULL),
('c5eeddd9-5d29-4380-a5ff-a3a8774b8a21', '57bc4d09-4dc5-405d-9141-84de5b5f2378', 'c6f73ff6-42f8-403d-bd2a-bea075da2895', 1, 20000.00, 19000.00),
('e1ca6b59-f6b6-4a12-8156-2e55df84543d', '9196e25a-f8a0-4cd9-a81b-babb8764b86d', 'c6f73ff6-42f8-403d-bd2a-bea075da2895', 1, 20000.00, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` varchar(36) NOT NULL,
  `sku` varchar(100) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `reservedStock` int(11) NOT NULL DEFAULT 0,
  `capacityUnit` decimal(5,2) NOT NULL DEFAULT 1.00 COMMENT 'Bobot kapasitas per\r\n  item untuk perhitungan muatan'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `sku`, `name`, `price`, `stock`, `reservedStock`, `capacityUnit`) VALUES
('c6f73ff6-42f8-403d-bd2a-bea075da2895', 'G-19', '19L', 20000.00, 900, 4, 1.00);

-- --------------------------------------------------------

--
-- Table structure for table `route_plans`
--

CREATE TABLE `route_plans` (
  `id` varchar(36) NOT NULL,
  `driverId` varchar(36) NOT NULL,
  `vehicleId` varchar(36) NOT NULL,
  `date` date NOT NULL,
  `region` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `route_plans`
--

INSERT INTO `route_plans` (`id`, `driverId`, `vehicleId`, `date`, `region`) VALUES
('2a395e10-7013-4716-8832-f71fcfcf01f9', 'a93c1c9f-a76e-4b67-bc20-a39fa22d9466', '6082a2a5-fe06-4dd4-bea9-6a6110469c11', '2025-09-16', 'Timur'),
('ea218384-ea9d-4a33-9c06-91c1df2f9a3a', 'a93c1c9f-a76e-4b67-bc20-a39fa22d9466', '6082a2a5-fe06-4dd4-bea9-6a6110469c11', '2025-09-18', 'Timur');

-- --------------------------------------------------------

--
-- Table structure for table `route_stops`
--

CREATE TABLE `route_stops` (
  `id` varchar(36) NOT NULL,
  `routePlanId` varchar(36) NOT NULL,
  `orderId` varchar(36) NOT NULL,
  `storeId` varchar(36) NOT NULL,
  `storeName` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `lat` decimal(10,8) NOT NULL,
  `lng` decimal(11,8) NOT NULL,
  `status` enum('Pending','Completed','Failed') NOT NULL,
  `sequence` int(11) NOT NULL,
  `proofOfDeliveryImage` longtext DEFAULT NULL,
  `failureReason` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `route_stops`
--

INSERT INTO `route_stops` (`id`, `routePlanId`, `orderId`, `storeId`, `storeName`, `address`, `lat`, `lng`, `status`, `sequence`, `proofOfDeliveryImage`, `failureReason`) VALUES
('8a82759a-aada-4ea7-aa22-29e9d068e1f7', '2a395e10-7013-4716-8832-f71fcfcf01f9', '61ff488c-5c80-4ec2-95f8-b94744e62a16', '22ea99cc-e4ed-4b31-bb04-8072be2ba26b', 'Kue Kering', 'Perumahan Darussalam Dukuh Dlaban RT.8/RW.4, Kali Bondol, Sentolo, Kec. Sentolo, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 55664', -7.83017590, 110.21616700, 'Pending', 2, NULL, NULL),
('ceb782b2-1953-4210-8599-4cf1fd0c923f', 'ea218384-ea9d-4a33-9c06-91c1df2f9a3a', '746ef69b-bafe-4b06-92eb-400a74647190', '22ea99cc-e4ed-4b31-bb04-8072be2ba26b', 'Kue Kering', 'Perumahan Darussalam Dukuh Dlaban RT.8/RW.4, Kali Bondol, Sentolo, Kec. Sentolo, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 55664', -7.83017590, 110.21616700, 'Pending', 2, NULL, NULL),
('d9f10b44-2cc6-4dda-8154-01d9d844344a', 'ea218384-ea9d-4a33-9c06-91c1df2f9a3a', '57bc4d09-4dc5-405d-9141-84de5b5f2378', 'ce1a3121-3c1d-4484-89ec-859803c4a145', 'Rumah Mbah Kemo', '56H7+68X, Bantarejo, Banguncipto, Kec. Sentolo, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 109', -7.82145650, 110.20934520, 'Pending', 1, NULL, NULL),
('da974494-07f8-4fd4-8018-52dccc889f3c', '2a395e10-7013-4716-8832-f71fcfcf01f9', '9196e25a-f8a0-4cd9-a81b-babb8764b86d', 'ce1a3121-3c1d-4484-89ec-859803c4a145', 'Rumah Mbah Kemo', '56H7+68X, Bantarejo, Banguncipto, Kec. Sentolo, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 109', -7.82145650, 110.20934520, 'Pending', 1, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `sales_visit_route_plans`
--

CREATE TABLE `sales_visit_route_plans` (
  `id` varchar(36) NOT NULL,
  `salesPersonId` varchar(36) NOT NULL,
  `date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sales_visit_route_plans`
--

INSERT INTO `sales_visit_route_plans` (`id`, `salesPersonId`, `date`) VALUES
('7bc58e2a-f75f-4844-8b1c-fb4d9806c439', 'a4ce23ab-2e0f-4556-b958-1e3d907decb2', '2025-09-16');

-- --------------------------------------------------------

--
-- Table structure for table `sales_visit_route_stops`
--

CREATE TABLE `sales_visit_route_stops` (
  `id` varchar(36) NOT NULL,
  `planId` varchar(36) NOT NULL,
  `visitId` varchar(36) NOT NULL,
  `storeId` varchar(36) NOT NULL,
  `storeName` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `purpose` varchar(255) NOT NULL,
  `sequence` int(11) NOT NULL,
  `lat` decimal(10,8) NOT NULL,
  `lng` decimal(11,8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sales_visit_route_stops`
--

INSERT INTO `sales_visit_route_stops` (`id`, `planId`, `visitId`, `storeId`, `storeName`, `address`, `purpose`, `sequence`, `lat`, `lng`) VALUES
('dfc10e59-6a6d-46d1-92bb-fa0bbd3d8c99', '7bc58e2a-f75f-4844-8b1c-fb4d9806c439', '8ce76543-db0c-4bd5-9e71-6f41a595899f', 'ce1a3121-3c1d-4484-89ec-859803c4a145', 'Rumah Mbah Kemo', '56H7+68X, Bantarejo, Banguncipto, Kec. Sentolo, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 109', 'Penagihan', 1, -7.82145650, 110.20934520);

-- --------------------------------------------------------

--
-- Table structure for table `stores`
--

CREATE TABLE `stores` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `lat` decimal(10,8) NOT NULL,
  `lng` decimal(11,8) NOT NULL,
  `region` varchar(50) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `subscribedSince` date NOT NULL,
  `lastOrder` varchar(50) DEFAULT 'N/A',
  `isPartner` tinyint(1) NOT NULL DEFAULT 0,
  `partnerCode` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stores`
--

INSERT INTO `stores` (`id`, `name`, `address`, `lat`, `lng`, `region`, `owner`, `phone`, `subscribedSince`, `lastOrder`, `isPartner`, `partnerCode`) VALUES
('155219e7-56b4-4328-8312-c7ac2f64e4a6', 'Pangkalan Gas LPG 3Kg Mountain', 'Bantarjo, Banguncipto, Kec. Sentolo, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 55664', -7.82237850, 110.21108600, 'Timur', 'Pak Sumili', '081392962402', '2025-09-16', 'N/A', 0, NULL),
('22ea99cc-e4ed-4b31-bb04-8072be2ba26b', 'Kue Kering', 'Perumahan Darussalam Dukuh Dlaban RT.8/RW.4, Kali Bondol, Sentolo, Kec. Sentolo, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 55664', -7.83017590, 110.21616700, 'Timur', 'Pak Kibbi', '085659142198', '2025-09-16', 'N/A', 0, NULL),
('ce1a3121-3c1d-4484-89ec-859803c4a145', 'Rumah Mbah Kemo', '56H7+68X, Bantarejo, Banguncipto, Kec. Sentolo, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 109', -7.82145650, 110.20934520, 'Timur', 'Mbah Kemo', '0862367523', '2025-09-16', 'N/A', 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `survey_responses`
--

CREATE TABLE `survey_responses` (
  `id` varchar(36) NOT NULL,
  `salesPersonId` varchar(36) NOT NULL,
  `surveyDate` date NOT NULL,
  `storeName` varchar(255) NOT NULL,
  `storeAddress` text DEFAULT NULL,
  `storePhone` varchar(20) DEFAULT NULL,
  `mostSoughtProducts` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`mostSoughtProducts`)),
  `popularAirkuVariants` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`popularAirkuVariants`)),
  `competitorPrices` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`competitorPrices`)),
  `competitorVolumes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`competitorVolumes`)),
  `feedback` text DEFAULT NULL,
  `proofOfSurveyImage` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('Admin','Sales','Driver') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`) VALUES
('79d62b55-981c-4f76-9703-546701161a96', 'Admin Utama', 'admin@kuairku.com', '$2a$10$dlXt951R4zxdg5JmVdJfB.dx7qJPVV8fdhRVHE.dFh76aMDgnX.aS', 'Admin'),
('a4ce23ab-2e0f-4556-b958-1e3d907decb2', 'Sales Utama', 'sales@kuairku.com', '$2a$10$h7Rk09IM16.ElVnvDk4B5.Bnv.QE4YkGTeblVKdUutBwyoNZNs/jm', 'Sales'),
('a93c1c9f-a76e-4b67-bc20-a39fa22d9466', 'Driver Utama', 'driver@kuairku.com', '$2a$10$yBhhw9NiFYGZIfsAkiRa1ezxbondCX/RMiP5fvjOjj8D96ntcT/DK', 'Driver');

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

CREATE TABLE `vehicles` (
  `id` varchar(36) NOT NULL,
  `plateNumber` varchar(20) NOT NULL,
  `model` varchar(100) NOT NULL,
  `capacity` int(11) NOT NULL,
  `status` enum('Idle','Sedang Mengirim','Dalam Perbaikan') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vehicles`
--

INSERT INTO `vehicles` (`id`, `plateNumber`, `model`, `capacity`, `status`) VALUES
('6082a2a5-fe06-4dd4-bea9-6a6110469c11', 'AB 1234 CD', 'Suzuki R3', 200, 'Sedang Mengirim');

-- --------------------------------------------------------

--
-- Table structure for table `visits`
--

CREATE TABLE `visits` (
  `id` varchar(36) NOT NULL,
  `storeId` varchar(36) NOT NULL,
  `salesPersonId` varchar(36) NOT NULL,
  `visitDate` date NOT NULL,
  `purpose` varchar(255) NOT NULL,
  `status` enum('Akan Datang','Selesai','Dilewati/Gagal') NOT NULL,
  `notes` text DEFAULT NULL,
  `proofOfVisitImage` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `visits`
--

INSERT INTO `visits` (`id`, `storeId`, `salesPersonId`, `visitDate`, `purpose`, `status`, `notes`, `proofOfVisitImage`) VALUES
('8ce76543-db0c-4bd5-9e71-6f41a595899f', 'ce1a3121-3c1d-4484-89ec-859803c4a145', 'a4ce23ab-2e0f-4556-b958-1e3d907decb2', '2025-09-16', 'Penagihan', 'Akan Datang', NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_orders_store_idx` (`storeId`),
  ADD KEY `fk_orders_vehicle_idx` (`assignedVehicleId`),
  ADD KEY `fk_orders_user_idx` (`orderedById`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_order_items_order_idx` (`orderId`),
  ADD KEY `fk_order_items_product_idx` (`productId`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sku_UNIQUE` (`sku`);

--
-- Indexes for table `route_plans`
--
ALTER TABLE `route_plans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_routes_driver_idx` (`driverId`),
  ADD KEY `fk_routes_vehicle_idx` (`vehicleId`);

--
-- Indexes for table `route_stops`
--
ALTER TABLE `route_stops`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `orderId` (`orderId`),
  ADD KEY `fk_stops_plan_idx` (`routePlanId`),
  ADD KEY `fk_stops_order_idx` (`orderId`),
  ADD KEY `fk_stops_store_idx` (`storeId`);

--
-- Indexes for table `sales_visit_route_plans`
--
ALTER TABLE `sales_visit_route_plans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_sales_routes_user_idx` (`salesPersonId`);

--
-- Indexes for table `sales_visit_route_stops`
--
ALTER TABLE `sales_visit_route_stops`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `visitId` (`visitId`),
  ADD KEY `fk_sales_stops_plan_idx` (`planId`),
  ADD KEY `fk_sales_stops_visit_idx` (`visitId`),
  ADD KEY `fk_sales_stops_store_idx` (`storeId`);

--
-- Indexes for table `stores`
--
ALTER TABLE `stores`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `survey_responses`
--
ALTER TABLE `survey_responses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_surveys_user_idx` (`salesPersonId`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email_UNIQUE` (`email`);

--
-- Indexes for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `plateNumber_UNIQUE` (`plateNumber`);

--
-- Indexes for table `visits`
--
ALTER TABLE `visits`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_visits_store_idx` (`storeId`),
  ADD KEY `fk_visits_user_idx` (`salesPersonId`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_store` FOREIGN KEY (`storeId`) REFERENCES `stores` (`id`),
  ADD CONSTRAINT `fk_orders_user` FOREIGN KEY (`orderedById`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_orders_vehicle` FOREIGN KEY (`assignedVehicleId`) REFERENCES `vehicles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_order_items_order` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_order_items_product` FOREIGN KEY (`productId`) REFERENCES `products` (`id`);

--
-- Constraints for table `route_plans`
--
ALTER TABLE `route_plans`
  ADD CONSTRAINT `fk_routes_driver` FOREIGN KEY (`driverId`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_routes_vehicle` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles` (`id`);

--
-- Constraints for table `route_stops`
--
ALTER TABLE `route_stops`
  ADD CONSTRAINT `fk_stops_order` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`),
  ADD CONSTRAINT `fk_stops_plan` FOREIGN KEY (`routePlanId`) REFERENCES `route_plans` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_stops_store` FOREIGN KEY (`storeId`) REFERENCES `stores` (`id`),
  ADD CONSTRAINT `route_stops_ibfk_2` FOREIGN KEY (`storeId`) REFERENCES `stores` (`id`);

--
-- Constraints for table `sales_visit_route_plans`
--
ALTER TABLE `sales_visit_route_plans`
  ADD CONSTRAINT `fk_sales_routes_user` FOREIGN KEY (`salesPersonId`) REFERENCES `users` (`id`);

--
-- Constraints for table `sales_visit_route_stops`
--
ALTER TABLE `sales_visit_route_stops`
  ADD CONSTRAINT `fk_sales_stops_plan` FOREIGN KEY (`planId`) REFERENCES `sales_visit_route_plans` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_sales_stops_store` FOREIGN KEY (`storeId`) REFERENCES `stores` (`id`),
  ADD CONSTRAINT `fk_sales_stops_visit` FOREIGN KEY (`visitId`) REFERENCES `visits` (`id`),
  ADD CONSTRAINT `sales_visit_route_stops_ibfk_2` FOREIGN KEY (`visitId`) REFERENCES `visits` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sales_visit_route_stops_ibfk_3` FOREIGN KEY (`storeId`) REFERENCES `stores` (`id`);

--
-- Constraints for table `survey_responses`
--
ALTER TABLE `survey_responses`
  ADD CONSTRAINT `fk_surveys_user` FOREIGN KEY (`salesPersonId`) REFERENCES `users` (`id`);

--
-- Constraints for table `visits`
--
ALTER TABLE `visits`
  ADD CONSTRAINT `fk_visits_store` FOREIGN KEY (`storeId`) REFERENCES `stores` (`id`),
  ADD CONSTRAINT `fk_visits_user` FOREIGN KEY (`salesPersonId`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
