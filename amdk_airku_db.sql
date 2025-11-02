-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 02, 2025 at 10:17 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

START TRANSACTION;

SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */
;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */
;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */
;
/*!40101 SET NAMES utf8mb4 */
;

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
    `totalAmount` decimal(12, 2) NOT NULL,
    `status` enum(
        'Pending',
        'Routed',
        'Delivering',
        'Delivered',
        'Failed'
    ) NOT NULL,
    `orderDate` date NOT NULL,
    `desiredDeliveryDate` date DEFAULT NULL,
    `assignedVehicleId` varchar(36) DEFAULT NULL,
    `orderedById` varchar(36) NOT NULL,
    `orderedByName` varchar(255) NOT NULL,
    `orderedByRole` varchar(50) NOT NULL,
    `priority` tinyint(1) NOT NULL DEFAULT 0
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO
    `orders` (
        `id`,
        `storeId`,
        `totalAmount`,
        `status`,
        `orderDate`,
        `desiredDeliveryDate`,
        `assignedVehicleId`,
        `orderedById`,
        `orderedByName`,
        `orderedByRole`,
        `priority`
    )
VALUES (
        '01f110ee-508c-4c9f-8234-901408944308',
        '84cb81dd-3f3d-4390-a607-89bcff1d9658',
        2000.00,
        'Routed',
        '2025-11-02',
        '2025-11-02',
        NULL,
        '79d62b55-981c-4f76-9703-546701161a96',
        'Admin Utama',
        'Admin',
        0
    ),
    (
        '0ef11c14-ad1d-413a-a5fe-fa7eb596a0af',
        '22ea99cc-e4ed-4b31-bb04-8072be2ba26b',
        25000.00,
        'Routed',
        '2025-11-02',
        '2025-11-02',
        NULL,
        '79d62b55-981c-4f76-9703-546701161a96',
        'Admin Utama',
        'Admin',
        0
    ),
    (
        '2a6697a5-2d7d-4ab4-85ae-290c562bb6d7',
        'f6cf7a69-ed9b-451c-b35f-1ae3326cb25e',
        20000.00,
        'Routed',
        '2025-11-02',
        '2025-11-03',
        NULL,
        '79d62b55-981c-4f76-9703-546701161a96',
        'Admin Utama',
        'Admin',
        0
    ),
    (
        '2ffbb3e3-aea6-43dc-83de-7b959dfef7fe',
        'fe4fab09-e639-492e-b91c-f931f643abca',
        20000.00,
        'Routed',
        '2025-11-02',
        '2025-11-03',
        NULL,
        '79d62b55-981c-4f76-9703-546701161a96',
        'Admin Utama',
        'Admin',
        0
    ),
    (
        '57bc4d09-4dc5-405d-9141-84de5b5f2378',
        'ce1a3121-3c1d-4484-89ec-859803c4a145',
        19000.00,
        'Routed',
        '2025-09-16',
        '2025-09-18',
        '6082a2a5-fe06-4dd4-bea9-6a6110469c11',
        '79d62b55-981c-4f76-9703-546701161a96',
        'Admin Utama',
        'Admin',
        0
    ),
    (
        '61ff488c-5c80-4ec2-95f8-b94744e62a16',
        '22ea99cc-e4ed-4b31-bb04-8072be2ba26b',
        20000.00,
        'Routed',
        '2025-09-16',
        '2025-09-16',
        '6082a2a5-fe06-4dd4-bea9-6a6110469c11',
        '79d62b55-981c-4f76-9703-546701161a96',
        'Admin Utama',
        'Admin',
        0
    ),
    (
        '6eff134c-5002-4c52-ba98-852203339ccc',
        'bf8d081d-840a-49c1-aa86-697d55b6e903',
        5000.00,
        'Pending',
        '2025-11-02',
        NULL,
        NULL,
        '79d62b55-981c-4f76-9703-546701161a96',
        'Admin Utama',
        'Admin',
        0
    ),
    (
        '746ef69b-bafe-4b06-92eb-400a74647190',
        '22ea99cc-e4ed-4b31-bb04-8072be2ba26b',
        20000.00,
        'Routed',
        '2025-09-16',
        '2025-09-18',
        '6082a2a5-fe06-4dd4-bea9-6a6110469c11',
        '79d62b55-981c-4f76-9703-546701161a96',
        'Admin Utama',
        'Admin',
        0
    ),
    (
        '9196e25a-f8a0-4cd9-a81b-babb8764b86d',
        'ce1a3121-3c1d-4484-89ec-859803c4a145',
        20000.00,
        'Routed',
        '2025-09-16',
        '2025-09-16',
        '6082a2a5-fe06-4dd4-bea9-6a6110469c11',
        '79d62b55-981c-4f76-9703-546701161a96',
        'Admin Utama',
        'Admin',
        0
    ),
    (
        'cb907b44-3aee-41cc-a26a-5385033eb715',
        'ef01d952-20b5-4b07-8594-5f8230bbe609',
        20000.00,
        'Routed',
        '2025-11-02',
        '2025-11-03',
        NULL,
        '79d62b55-981c-4f76-9703-546701161a96',
        'Admin Utama',
        'Admin',
        0
    ),
    (
        'cfb40e3f-b6f5-46ce-ba05-3d9bd764bae9',
        'fe4fab09-e639-492e-b91c-f931f643abca',
        23000.00,
        'Routed',
        '2025-11-02',
        '2025-11-04',
        'v-001-l300',
        '79d62b55-981c-4f76-9703-546701161a96',
        'Admin Utama',
        'Admin',
        0
    ),
    (
        'd67dabb2-b189-4ecc-bf9e-892fbacc8231',
        'f6cf7a69-ed9b-451c-b35f-1ae3326cb25e',
        20000.00,
        'Pending',
        '2025-11-02',
        '2025-11-02',
        NULL,
        '79d62b55-981c-4f76-9703-546701161a96',
        'Admin Utama',
        'Admin',
        0
    ),
    (
        'e632ce0b-45d1-43a5-b5e7-e2ab6e457765',
        'a847def4-f29b-42d2-a593-aab3032a8db9',
        24000.00,
        'Routed',
        '2025-11-02',
        '2025-11-04',
        'v-001-l300',
        '79d62b55-981c-4f76-9703-546701161a96',
        'Admin Utama',
        'Admin',
        0
    );

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
    `id` varchar(36) NOT NULL,
    `orderId` varchar(36) NOT NULL,
    `productId` varchar(36) NOT NULL,
    `quantity` int(11) NOT NULL,
    `originalPrice` decimal(10, 2) NOT NULL,
    `specialPrice` decimal(10, 2) DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO
    `order_items` (
        `id`,
        `orderId`,
        `productId`,
        `quantity`,
        `originalPrice`,
        `specialPrice`
    )
VALUES (
        '0a5a5b14-2a2c-438b-84b0-a741459abeee',
        '0ef11c14-ad1d-413a-a5fe-fa7eb596a0af',
        'p-003-600ml',
        1,
        5000.00,
        NULL
    ),
    (
        '0ed3b459-296a-4a8d-b48c-58e93019e66a',
        '0ef11c14-ad1d-413a-a5fe-fa7eb596a0af',
        'p-005-19L',
        1,
        20000.00,
        NULL
    ),
    (
        '2d48522e-d146-433b-8303-d2f7525ac043',
        '2a6697a5-2d7d-4ab4-85ae-290c562bb6d7',
        '1906008e-53ff-485a-8d1f-adce00d40fe5',
        1,
        20000.00,
        NULL
    ),
    (
        '31ef983e-8e70-424e-a0ca-ec16d7b037b1',
        '61ff488c-5c80-4ec2-95f8-b94744e62a16',
        'c6f73ff6-42f8-403d-bd2a-bea075da2895',
        1,
        20000.00,
        NULL
    ),
    (
        '3ba455b6-cb81-44a8-9ff0-67390bb245f8',
        '2ffbb3e3-aea6-43dc-83de-7b959dfef7fe',
        '1906008e-53ff-485a-8d1f-adce00d40fe5',
        1,
        20000.00,
        NULL
    ),
    (
        '3bb676fc-acbe-4d9e-9d5b-aa2b0c0664d0',
        'e632ce0b-45d1-43a5-b5e7-e2ab6e457765',
        'p-004-330ml',
        1,
        4000.00,
        NULL
    ),
    (
        '44878325-ea44-4bc3-8ef3-6853b757e914',
        'cfb40e3f-b6f5-46ce-ba05-3d9bd764bae9',
        'p-001-240ml',
        1,
        3000.00,
        NULL
    ),
    (
        '49c6827f-feb3-4c7a-bac7-b5dbc7bd97bd',
        'e632ce0b-45d1-43a5-b5e7-e2ab6e457765',
        'p-005-19L',
        1,
        20000.00,
        NULL
    ),
    (
        '4c89eda4-6dd9-404a-841a-dbab2b98142c',
        'cb907b44-3aee-41cc-a26a-5385033eb715',
        '1906008e-53ff-485a-8d1f-adce00d40fe5',
        1,
        20000.00,
        NULL
    ),
    (
        '577fd768-c90a-4e9a-b1d1-cb190b74ee7c',
        '6eff134c-5002-4c52-ba98-852203339ccc',
        'p-003-600ml',
        1,
        5000.00,
        NULL
    ),
    (
        '5fac6656-65d1-445f-99fe-73a39231f069',
        '746ef69b-bafe-4b06-92eb-400a74647190',
        'c6f73ff6-42f8-403d-bd2a-bea075da2895',
        1,
        20000.00,
        NULL
    ),
    (
        '91ea4f21-d3d4-40a5-a868-a57f8f9a457a',
        'cfb40e3f-b6f5-46ce-ba05-3d9bd764bae9',
        '56c4d221-fe98-4db4-92f6-a548efecc031',
        1,
        20000.00,
        NULL
    ),
    (
        'a472bf47-5ba8-4098-af4d-a1f035cd6f55',
        'd67dabb2-b189-4ecc-bf9e-892fbacc8231',
        '1906008e-53ff-485a-8d1f-adce00d40fe5',
        1,
        20000.00,
        NULL
    ),
    (
        'c5eeddd9-5d29-4380-a5ff-a3a8774b8a21',
        '57bc4d09-4dc5-405d-9141-84de5b5f2378',
        'c6f73ff6-42f8-403d-bd2a-bea075da2895',
        1,
        20000.00,
        19000.00
    ),
    (
        'e1ca6b59-f6b6-4a12-8156-2e55df84543d',
        '9196e25a-f8a0-4cd9-a81b-babb8764b86d',
        'c6f73ff6-42f8-403d-bd2a-bea075da2895',
        1,
        20000.00,
        NULL
    ),
    (
        'fa701be4-86f6-4597-a27a-3ec185e53f29',
        '01f110ee-508c-4c9f-8234-901408944308',
        'p-002-120ml',
        1,
        2000.00,
        NULL
    );

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
    `id` varchar(36) NOT NULL,
    `sku` varchar(100) NOT NULL,
    `name` varchar(255) NOT NULL,
    `price` decimal(10, 2) NOT NULL,
    `stock` int(11) NOT NULL DEFAULT 0,
    `reservedStock` int(11) NOT NULL DEFAULT 0,
    `capacityUnit` decimal(5, 2) DEFAULT NULL COMMENT 'DEPRECATED: Homogeneous capacity now depends on vehicle type (see VEHICLE_CAPACITY_DATA in backend)',
    `capacityConversionHeterogeneous` decimal(5, 2) DEFAULT 1.00 COMMENT 'Conversion rate for heterogeneous loads (relative to 240ml = 1.0)',
    `capacityConversionHomogeneous` decimal(10, 4) DEFAULT 1.0000 COMMENT 'Conversion factor for homogeneous load capacity (default 1.0 = 100%)'
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO
    `products` (
        `id`,
        `sku`,
        `name`,
        `price`,
        `stock`,
        `reservedStock`,
        `capacityUnit`,
        `capacityConversionHeterogeneous`,
        `capacityConversionHomogeneous`
    )
VALUES (
        '1906008e-53ff-485a-8d1f-adce00d40fe5',
        '120-ml',
        '120 ML',
        20000.00,
        1000,
        4,
        350.00,
        0.57,
        1.0000
    ),
    (
        '56c4d221-fe98-4db4-92f6-a548efecc031',
        '240-ml',
        '240 ML',
        20000.00,
        1000,
        1,
        200.00,
        1.00,
        1.0000
    ),
    (
        'c6f73ff6-42f8-403d-bd2a-bea075da2895',
        'G-19',
        '19L',
        20000.00,
        900,
        4,
        1.00,
        3.33,
        1.0000
    ),
    (
        'p-001-240ml',
        'AIR-240ML',
        'Air Mineral 240ml',
        3000.00,
        500,
        1,
        NULL,
        1.00,
        1.0000
    ),
    (
        'p-002-120ml',
        'AIR-120ML',
        'Air Mineral 120ml',
        2000.00,
        800,
        1,
        NULL,
        0.57,
        1.0000
    ),
    (
        'p-003-600ml',
        'AIR-600ML',
        'Air Mineral 600ml',
        5000.00,
        300,
        2,
        NULL,
        1.60,
        1.0000
    ),
    (
        'p-004-330ml',
        'AIR-330ML',
        'Air Mineral 330ml',
        4000.00,
        600,
        1,
        NULL,
        1.00,
        1.0000
    ),
    (
        'p-005-19L',
        'GALON-19L',
        'Galon 19L',
        20000.00,
        200,
        2,
        NULL,
        3.33,
        1.0000
    );

-- --------------------------------------------------------

--
-- Table structure for table `route_plans`
--

CREATE TABLE `route_plans` (
    `id` varchar(36) NOT NULL,
    `driverId` varchar(36) DEFAULT NULL,
    `vehicleId` varchar(36) DEFAULT NULL,
    `date` date NOT NULL,
    `region` varchar(50) NOT NULL,
    `assignmentStatus` enum(
        'unassigned',
        'assigned',
        'departed',
        'completed'
    ) NOT NULL DEFAULT 'unassigned' COMMENT 'Status penugasan rute: unassigned, assigned, departed, completed'
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

--
-- Dumping data for table `route_plans`
--

INSERT INTO
    `route_plans` (
        `id`,
        `driverId`,
        `vehicleId`,
        `date`,
        `region`,
        `assignmentStatus`
    )
VALUES (
        '11f922a4-bfed-46f1-a96f-e5d79b7b14c5',
        NULL,
        NULL,
        '2025-11-03',
        '',
        'unassigned'
    ),
    (
        '2a395e10-7013-4716-8832-f71fcfcf01f9',
        'a93c1c9f-a76e-4b67-bc20-a39fa22d9466',
        '6082a2a5-fe06-4dd4-bea9-6a6110469c11',
        '2025-09-16',
        'Timur',
        'assigned'
    ),
    (
        '3a3f9ae9-68e1-4180-9af9-c0e042ff560e',
        'a93c1c9f-a76e-4b67-bc20-a39fa22d9466',
        'v-001-l300',
        '2025-11-04',
        '',
        'assigned'
    ),
    (
        '9b106213-5910-4b5c-a5ed-96c0eef2c5d4',
        NULL,
        NULL,
        '2025-11-02',
        '',
        'unassigned'
    ),
    (
        'ea218384-ea9d-4a33-9c06-91c1df2f9a3a',
        'a93c1c9f-a76e-4b67-bc20-a39fa22d9466',
        '6082a2a5-fe06-4dd4-bea9-6a6110469c11',
        '2025-09-18',
        'Timur',
        'assigned'
    ),
    (
        'fc1c9f8c-855c-43d0-a003-0389d0a23182',
        NULL,
        NULL,
        '2025-11-02',
        '',
        'unassigned'
    );

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
    `lat` decimal(10, 8) NOT NULL,
    `lng` decimal(11, 8) NOT NULL,
    `status` enum(
        'Pending',
        'Completed',
        'Failed'
    ) NOT NULL,
    `sequence` int(11) NOT NULL,
    `proofOfDeliveryImage` longtext DEFAULT NULL,
    `failureReason` text DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

--
-- Dumping data for table `route_stops`
--

INSERT INTO
    `route_stops` (
        `id`,
        `routePlanId`,
        `orderId`,
        `storeId`,
        `storeName`,
        `address`,
        `lat`,
        `lng`,
        `status`,
        `sequence`,
        `proofOfDeliveryImage`,
        `failureReason`
    )
VALUES (
        '432b0963-4bc2-4726-b712-fdf2fe6fa0de',
        'fc1c9f8c-855c-43d0-a003-0389d0a23182',
        '0ef11c14-ad1d-413a-a5fe-fa7eb596a0af',
        '22ea99cc-e4ed-4b31-bb04-8072be2ba26b',
        'Kue Kering',
        'Perumahan Darussalam Dukuh Dlaban RT.8/RW.4, Kali Bondol, Sentolo, Kec. Sentolo, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 55664',
        -7.83017590,
        110.21616700,
        'Pending',
        1,
        NULL,
        NULL
    ),
    (
        '51e58627-7f8b-4ce6-90ed-4d8065501a6f',
        '11f922a4-bfed-46f1-a96f-e5d79b7b14c5',
        'cb907b44-3aee-41cc-a26a-5385033eb715',
        'ef01d952-20b5-4b07-8594-5f8230bbe609',
        'Toko Azis',
        'Karang, RT.29/RW.11, Jati Ngarang Lor, Jati Sarono, Kec. Nanggulan, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 55671',
        -7.75845040,
        110.19326490,
        'Pending',
        1,
        NULL,
        NULL
    ),
    (
        'a81aebca-ae2d-4741-9d04-85ac35f1b5e6',
        '3a3f9ae9-68e1-4180-9af9-c0e042ff560e',
        'cfb40e3f-b6f5-46ce-ba05-3d9bd764bae9',
        'fe4fab09-e639-492e-b91c-f931f643abca',
        'Pasti Jaya Tb.kempong Banjaroya',
        'Jalan Kalibawang-Sendang Sono km 1 kempong, Banjaroyo, Kalibawang, Kempoeng, Banjaroyo, Kec. Kalibawang, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 55672',
        -7.65122780,
        110.24850720,
        'Pending',
        2,
        NULL,
        NULL
    ),
    (
        'ab538ff4-dec1-4ecf-931e-ee14445243cf',
        '11f922a4-bfed-46f1-a96f-e5d79b7b14c5',
        '2a6697a5-2d7d-4ab4-85ae-290c562bb6d7',
        'f6cf7a69-ed9b-451c-b35f-1ae3326cb25e',
        'Perusahaan Umum Daerah \" Aneka Usaha Kulon Progo\"',
        'Jl. Khudori No.51, Dipan, Wates, Kec. Wates, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 55651',
        -7.86488200,
        110.15201000,
        'Pending',
        3,
        NULL,
        NULL
    ),
    (
        'adb41c76-fe7e-4609-94c0-2f24f2540788',
        '9b106213-5910-4b5c-a5ed-96c0eef2c5d4',
        '01f110ee-508c-4c9f-8234-901408944308',
        '84cb81dd-3f3d-4390-a607-89bcff1d9658',
        'PT. ODIXA PHARMA LABORATORIES',
        'Jl. Wates No.KM 20, Blimbing, Sukoreno, Kec. Sentolo, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 55664',
        -7.85634740,
        110.21498260,
        'Pending',
        1,
        NULL,
        NULL
    ),
    (
        'c9d3e800-b35e-43fe-919c-3efc37b46377',
        '11f922a4-bfed-46f1-a96f-e5d79b7b14c5',
        '2ffbb3e3-aea6-43dc-83de-7b959dfef7fe',
        'fe4fab09-e639-492e-b91c-f931f643abca',
        'Pasti Jaya Tb.kempong Banjaroya',
        'Jalan Kalibawang-Sendang Sono km 1 kempong, Banjaroyo, Kalibawang, Kempoeng, Banjaroyo, Kec. Kalibawang, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 55672',
        -7.65122780,
        110.24850720,
        'Pending',
        2,
        NULL,
        NULL
    ),
    (
        'eeb2f8e1-4f9c-4ef7-bf43-fd8af32d270b',
        '3a3f9ae9-68e1-4180-9af9-c0e042ff560e',
        'e632ce0b-45d1-43a5-b5e7-e2ab6e457765',
        'a847def4-f29b-42d2-a593-aab3032a8db9',
        'Toko Sumadi',
        'Dusun VII, Gotakan, Kec. Panjatan, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta',
        -7.87886720,
        110.15789100,
        'Pending',
        1,
        NULL,
        NULL
    );

-- --------------------------------------------------------

--
-- Table structure for table `sales_visit_route_plans`
--

CREATE TABLE `sales_visit_route_plans` (
    `id` varchar(36) NOT NULL,
    `salesPersonId` varchar(36) NOT NULL,
    `date` date NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

--
-- Dumping data for table `sales_visit_route_plans`
--

INSERT INTO
    `sales_visit_route_plans` (`id`, `salesPersonId`, `date`)
VALUES (
        '7bc58e2a-f75f-4844-8b1c-fb4d9806c439',
        'a4ce23ab-2e0f-4556-b958-1e3d907decb2',
        '2025-09-16'
    );

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
    `lat` decimal(10, 8) NOT NULL,
    `lng` decimal(11, 8) NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

--
-- Dumping data for table `sales_visit_route_stops`
--

INSERT INTO
    `sales_visit_route_stops` (
        `id`,
        `planId`,
        `visitId`,
        `storeId`,
        `storeName`,
        `address`,
        `purpose`,
        `sequence`,
        `lat`,
        `lng`
    )
VALUES (
        'dfc10e59-6a6d-46d1-92bb-fa0bbd3d8c99',
        '7bc58e2a-f75f-4844-8b1c-fb4d9806c439',
        '8ce76543-db0c-4bd5-9e71-6f41a595899f',
        'ce1a3121-3c1d-4484-89ec-859803c4a145',
        'Rumah Mbah Kemo',
        '56H7+68X, Bantarejo, Banguncipto, Kec. Sentolo, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 109',
        'Penagihan',
        1,
        -7.82145650,
        110.20934520
    );

-- --------------------------------------------------------

--
-- Table structure for table `stores`
--

CREATE TABLE `stores` (
    `id` varchar(36) NOT NULL,
    `name` varchar(255) NOT NULL,
    `address` text NOT NULL,
    `lat` decimal(10, 8) NOT NULL,
    `lng` decimal(11, 8) NOT NULL,
    `region` varchar(50) NOT NULL,
    `owner` varchar(255) NOT NULL,
    `phone` varchar(50) NOT NULL,
    `subscribedSince` date NOT NULL,
    `lastOrder` varchar(50) DEFAULT 'N/A',
    `isPartner` tinyint(1) NOT NULL DEFAULT 0,
    `partnerCode` varchar(50) DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

--
-- Dumping data for table `stores`
--

INSERT INTO
    `stores` (
        `id`,
        `name`,
        `address`,
        `lat`,
        `lng`,
        `region`,
        `owner`,
        `phone`,
        `subscribedSince`,
        `lastOrder`,
        `isPartner`,
        `partnerCode`
    )
VALUES (
        '0735c2bd-0b5a-4a07-9ae0-aa3510f885ad',
        ' TOKO TUTIK',
        '76MC+F52, Jl. Persandian, Ngipik Rejo, Banjararum, Kec. Kalibawang, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 55672',
        -7.70918680,
        110.20635280,
        'Kulon Progo - Timur',
        'Ibu Tutik',
        '0',
        '2025-11-02',
        'N/A',
        0,
        NULL
    ),
    (
        '0a68b001-f33c-4a6f-8eb7-d21d2474f8c0',
        'TOKO SALYA GROSIR ECER',
        '55CC+93H, Paingan, Sendangsari, Kec. Pengasih, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 55652',
        -7.82905100,
        110.17028000,
        'Kulon Progo - Timur',
        'Minimarket',
        '089518575737',
        '2025-11-02',
        'N/A',
        0,
        NULL
    ),
    (
        '0aa530e2-1a98-4603-ae8b-ce111417852e',
        'Warung Agus',
        '8728+3Q7, Salam, Banjarharjo, Kec. Kalibawang, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 55672',
        -7.69983440,
        110.26692820,
        'Kulon Progo - Timur',
        'Pak Agus',
        '0',
        '2025-11-02',
        'N/A',
        0,
        NULL
    ),
    (
        '0d29847d-59d9-40e5-8b19-1b715390fa08',
        'Novotel',
        'Jl. Wates - Purworejo No.KM 10 95, Seling, Temon Kulon, Kec. Temon, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 55654',
        -7.88681920,
        110.07272650,
        'Kulon Progo - Barat',
        'Hotel',
        '02747727878',
        '2025-11-02',
        'N/A',
        0,
        NULL
    ),
    (
        '155219e7-56b4-4328-8312-c7ac2f64e4a6',
        'Pangkalan Gas LPG 3Kg Mountain',
        'Bantarjo, Banguncipto, Kec. Sentolo, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 55664',
        -7.82237850,
        110.21108600,
        'Timur',
        'Pak Sumili',
        '081392962402',
        '2025-09-16',
        'N/A',
        0,
        NULL
    ),
    (
        '1c8a335e-dd29-4e19-993b-c2d98fa06a31',
        ' Disalin ke clipboard Hyper Cell Samigaluh',
        'JL. Dekso Plono, Km. 12, Jetis, Gerbosari, Kec. Samigaluh, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 55673',
        -7.66767570,
        110.16565540,
        'Kulon Progo - Timur',
        'Toko Ponsel',
        '087839281381',
        '2025-11-02',
        'N/A',
        0,
        NULL
    ),
    (
        '1e2c85a5-a72c-4531-9e95-a257d45951ee',
        'Rahma Mart',
        '44VP+Q54, Kopat, Karangsari, Kec. Pengasih, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 55652',
        -7.71636540,
        110.15036320,
        'Kulon Progo - Timur',
        'Toko Bahan Makanan',
        '0',
        '2025-11-02',
        'N/A',
        0,
        NULL
    ),
    (
        '1f572480-1706-414f-b096-d1cf6c4d436b',
        'SDN 3 Pengasih',
        '5549+JH8, Pengasih, Kec. Pengasih, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 55652',
        -7.85561540,
        110.13544030,
        'Kulon Progo - Barat',
        'Sekolah Dasar`',
        '0',
        '2025-11-02',
        'N/A',
        0,
        NULL
    ),
    (
        '21a41e4b-175a-45fd-a9d3-1b9e88e38bc2',
        'Swiss-belhotel Airport Yogyakarta',
        'Weton, Kebonrejo, Kec. Temon, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 55654',
        -7.88706380,
        110.06989890,
        'Kulon Progo - Barat',
        'Hotel Bintang 4',
        '02747073000',
        '2025-11-02',
        'N/A',
        0,
        NULL
    ),
    (
        '22ea99cc-e4ed-4b31-bb04-8072be2ba26b',
        'Kue Kering',
        'Perumahan Darussalam Dukuh Dlaban RT.8/RW.4, Kali Bondol, Sentolo, Kec. Sentolo, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 55664',
        -7.83017590,
        110.21616700,
        'Timur',
        'Pak Kibbi',
        '085659142198',
        '2025-09-16',
        'N/A',
        0,
        NULL
    ),
    (
        '4cb5436d-4672-4926-9311-aa78f04c1312',
        'Toko Bintang',
        'Dusun 4, Banaran, Kec. Galur, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 55661',
        -7.95770410,
        110.22258330,
        'Kulon Progo - Timur',
        'Pak Bintang',
        '0',
        '2025-11-02',
        'N/A',
        0,
        NULL
    ),
    (
        '7728cbf1-2477-4125-a1fc-b7b501b7bb57',
        'Sidoagung Toserba',
        'Jl. Brigjen Katamso No.69, Wates, Kec. Wates, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 55651',
        -7.86283290,
        110.15767470,
        'Kulon Progo - Timur',
        'Pusat Perbelanjaan',
        '0274774297',
        '2025-11-02',
        'N/A',
        0,
        NULL
    ),
    (
        '78ea362b-38c0-449f-b489-ffd8c6b39f44',
        ' Toko Umar',
        'Ruko Gawok, Jl. KH Ahmad Dahlan Wates, Utara Pasar Gula, Area Sawah, Wates, Kec. Wates, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 55651',
        -7.86487620,
        110.15028240,
        'Kulon Progo - Timur',
        'Pak Umar',
        '081328885503',
        '2025-11-02',
        'N/A',
        0,
        NULL
    ),
    (
        '7ad93526-21af-4c29-9ca6-a7fdae64d6f1',
        'Hotel Morazen',
        'Jalan Nasional III Yogyakarta - Purworejo KM 41.5, KM 41.5, Kec. Temon, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 55654',
        -7.88618070,
        110.06553550,
        'Kulon Progo - Barat',
        'Hotel Bintang 4',
        '02747722888',
        '2025-11-02',
        'N/A',
        0,
        NULL
    ),
    (
        '7cbd01d6-d1ef-440f-9d31-0748d09ef7d8',
        'Warung Supri',
        'Kuncen, Bendungan, Kec. Wates, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta',
        -7.87677420,
        110.14652560,
        'Kulon Progo - Barat',
        'Pak Supri',
        '0',
        '2025-11-02',
        'N/A',
        0,
        NULL
    ),
    (
        '84168e97-70f5-42ac-a882-a4647f9e46f3',
        'DG Mart',
        'Jl. Sentolo - Brosot, Belik, Demangrejo, Kec. Sentolo, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 55664',
        -7.88712400,
        110.20503690,
        'Kulon Progo - Timur',
        'Toko Swalayan',
        '0',
        '2025-11-02',
        'N/A',
        0,
        NULL
    ),
    (
        '84cb81dd-3f3d-4390-a607-89bcff1d9658',
        'PT. ODIXA PHARMA LABORATORIES',
        'Jl. Wates No.KM 20, Blimbing, Sukoreno, Kec. Sentolo, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 55664',
        -7.85634740,
        110.21498260,
        'Kulon Progo - Timur',
        'Kantor Perusahaan',
        '0',
        '2025-11-02',
        'N/A',
        0,
        NULL
    ),
    (
        '8aa9f1cc-e4bb-4b39-b0ee-e8879ffc24c4',
        'Abadi Dekso',
        'Jalan Nanggulan Mendut Kanoman 1 Banjararum Kalibawang, Sayangan, Banjararum, Kec. Kalibawang, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 55672',
        -7.71275300,
        110.22858800,
        'Kulon Progo - Timur',
        'Toko Mebel',
        '081392332111',
        '2025-11-02',
        'N/A',
        0,
        NULL
    ),
    (
        'a5b5607a-5294-4b75-80fe-fd0bd4f7b630',
        'Toko Qita',
        'Jl. Ndalem Giripeni No.14, Kali Kepek, Giri Peni, Kec. Wates, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 55651',
        -7.87651970,
        110.17421730,
        'Kulon Progo - Timur',
        'Pusat Perbelanjaan',
        '081229774199',
        '2025-11-02',
        'N/A',
        0,
        NULL
    ),
    (
        'a847def4-f29b-42d2-a593-aab3032a8db9',
        'Toko Sumadi',
        'Dusun VII, Gotakan, Kec. Panjatan, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta',
        -7.87886720,
        110.15789100,
        'Kulon Progo - Timur',
        'Pak Sumadi',
        '0',
        '2025-11-02',
        'N/A',
        0,
        NULL
    ),
    (
        'b67550a6-b125-4c2b-8799-ab5590065db7',
        'Dunia Busa - Branch Wates',
        'Jl. Tentara Pelajar No.KM, RW.01, Kopat, Karangsari, Kec. Pengasih, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 55652',
        -7.85815900,
        110.14579710,
        'Kulon Progo - Barat',
        'Toko',
        '08179838198',
        '2025-11-02',
        'N/A',
        0,
        NULL
    ),
    (
        'bf8d081d-840a-49c1-aa86-697d55b6e903',
        'PDAM Tirta Binangun Kabupaten Kulon Progo',
        'Masjid Agung Kulon Progo, Area Sawah, Wates, Kec. Wates, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 55651',
        -7.86656690,
        110.11364000,
        'Kulon Progo - Barat',
        'Perusahaan Induk',
        '0274773908',
        '2025-11-02',
        'N/A',
        0,
        NULL
    ),
    (
        'ce1a3121-3c1d-4484-89ec-859803c4a145',
        'Rumah Mbah Kemo',
        '56H7+68X, Bantarejo, Banguncipto, Kec. Sentolo, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 109',
        -7.82145650,
        110.20934520,
        'Timur',
        'Mbah Kemo',
        '0862367523',
        '2025-09-16',
        'N/A',
        0,
        NULL
    ),
    (
        'd3fddd82-2e7f-4c58-866f-a2ae1742ff16',
        'Kantor Satpol PP Kabupaten Kulon Progo',
        'Jl. Sugiman No.12, Kemiri, Pengasih, Kec. Wates, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 55652',
        -7.85656850,
        110.16555120,
        'Kulon Progo - Timur',
        'Polisi Sipil',
        '0',
        '2025-11-02',
        'N/A',
        0,
        NULL
    ),
    (
        'd45da5c9-da17-42fc-a0f5-102eea11c013',
        'Toko Bahan Roti Sari Murni',
        'Jl. KH. Wahid Hasyim No.22, Klopo Sepuluh, Bendungan, Kec. Wates, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 55651',
        -7.89516160,
        110.14954940,
        'Kulon Progo - Timur',
        'Ibu Sari',
        '0',
        '2025-11-02',
        'N/A',
        0,
        NULL
    ),
    (
        'da131971-aa8d-4fe1-9a5a-6e0536f91a82',
        'Pabrik Rokok PT HM SAMPOERNA Wates',
        'Sideman, Giri Peni, Kec. Wates, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 55651',
        -7.87224280,
        110.15372020,
        'Kulon Progo - Timur',
        'Kantor Perusahaan',
        '0',
        '2025-11-02',
        'N/A',
        0,
        NULL
    ),
    (
        'ef01d952-20b5-4b07-8594-5f8230bbe609',
        'Toko Azis',
        'Karang, RT.29/RW.11, Jati Ngarang Lor, Jati Sarono, Kec. Nanggulan, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 55671',
        -7.75845040,
        110.19326490,
        'Kulon Progo - Timur',
        'Pak Asis',
        '08979356059',
        '2025-11-02',
        'N/A',
        0,
        NULL
    ),
    (
        'f6cf7a69-ed9b-451c-b35f-1ae3326cb25e',
        'Perusahaan Umum Daerah \" Aneka Usaha Kulon Progo\"',
        'Jl. Khudori No.51, Dipan, Wates, Kec. Wates, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 55651',
        -7.86488200,
        110.15201000,
        'Kulon Progo - Timur',
        'Kantor Perusahaan',
        '0274774466',
        '2025-11-02',
        'N/A',
        0,
        NULL
    ),
    (
        'fe4fab09-e639-492e-b91c-f931f643abca',
        'Pasti Jaya Tb.kempong Banjaroya',
        'Jalan Kalibawang-Sendang Sono km 1 kempong, Banjaroyo, Kalibawang, Kempoeng, Banjaroyo, Kec. Kalibawang, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta 55672',
        -7.65122780,
        110.24850720,
        'Kulon Progo - Timur',
        'Toko Bahan Bangunan',
        '082137359621',
        '2025-11-02',
        'N/A',
        0,
        NULL
    );

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
    `mostSoughtProducts` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (
        json_valid(`mostSoughtProducts`)
    ),
    `popularAirkuVariants` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (
        json_valid(`popularAirkuVariants`)
    ),
    `competitorPrices` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (
        json_valid(`competitorPrices`)
    ),
    `competitorVolumes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (
        json_valid(`competitorVolumes`)
    ),
    `feedback` text DEFAULT NULL,
    `proofOfSurveyImage` longtext DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
    `id` varchar(36) NOT NULL,
    `name` varchar(255) NOT NULL,
    `email` varchar(255) NOT NULL,
    `password` varchar(255) NOT NULL,
    `role` enum('Admin', 'Sales', 'Driver') NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO
    `users` (
        `id`,
        `name`,
        `email`,
        `password`,
        `role`
    )
VALUES (
        '79d62b55-981c-4f76-9703-546701161a96',
        'Admin Utama',
        'admin@kuairku.com',
        '$2a$10$dlXt951R4zxdg5JmVdJfB.dx7qJPVV8fdhRVHE.dFh76aMDgnX.aS',
        'Admin'
    ),
    (
        'a4ce23ab-2e0f-4556-b958-1e3d907decb2',
        'Sales Utama',
        'sales@kuairku.com',
        '$2a$10$h7Rk09IM16.ElVnvDk4B5.Bnv.QE4YkGTeblVKdUutBwyoNZNs/jm',
        'Sales'
    ),
    (
        'a93c1c9f-a76e-4b67-bc20-a39fa22d9466',
        'Driver Utama',
        'driver@kuairku.com',
        '$2a$10$yBhhw9NiFYGZIfsAkiRa1ezxbondCX/RMiP5fvjOjj8D96ntcT/DK',
        'Driver'
    );

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

CREATE TABLE `vehicles` (
    `id` varchar(36) NOT NULL,
    `plateNumber` varchar(20) NOT NULL,
    `model` varchar(100) NOT NULL,
    `capacity` int(11) NOT NULL COMMENT 'Kapasitas maksimal (setara 240ml)',
    `status` enum(
        'Idle',
        'Sedang Mengirim',
        'Dalam Perbaikan'
    ) NOT NULL,
    `vehicleType` varchar(50) DEFAULT 'L300' COMMENT 'Tipe kendaraan: L300, Cherry Box, dll'
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

--
-- Dumping data for table `vehicles`
--

INSERT INTO
    `vehicles` (
        `id`,
        `plateNumber`,
        `model`,
        `capacity`,
        `status`,
        `vehicleType`
    )
VALUES (
        '6082a2a5-fe06-4dd4-bea9-6a6110469c11',
        'AB 1234 CD',
        'Suzuki R3',
        200,
        'Sedang Mengirim',
        'L300'
    ),
    (
        'v-001-l300',
        'AB-1234-CD',
        'L300',
        200,
        'Idle',
        'L300'
    ),
    (
        'v-002-cherrybox',
        'AB-5678-EF',
        'Cherry Box',
        170,
        'Idle',
        'Cherry Box'
    );

-- --------------------------------------------------------

--
-- Table structure for table `vehicle_product_capacities`
--

CREATE TABLE `vehicle_product_capacities` (
    `id` varchar(36) NOT NULL,
    `vehicleType` varchar(50) NOT NULL COMMENT 'L300, Cherry Box, dll',
    `productSize` varchar(50) NOT NULL COMMENT '240ml, 120ml, 600ml, 330ml, 19L',
    `homogeneousCapacity` int(11) NOT NULL COMMENT 'Kapasitas maksimal saat hanya 1 jenis produk',
    `conversionRate` decimal(10, 4) NOT NULL COMMENT 'Conversion rate untuk heterogeneous',
    `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

--
-- Dumping data for table `vehicle_product_capacities`
--

INSERT INTO
    `vehicle_product_capacities` (
        `id`,
        `vehicleType`,
        `productSize`,
        `homogeneousCapacity`,
        `conversionRate`,
        `createdAt`
    )
VALUES (
        '9aff8100-b7b9-11f0-8075-93bbf38ff211',
        'L300',
        '240ml',
        200,
        1.0000,
        '2025-11-02 07:00:24'
    ),
    (
        '9aff94ba-b7b9-11f0-8075-93bbf38ff211',
        'L300',
        '120ml',
        350,
        0.5710,
        '2025-11-02 07:00:24'
    ),
    (
        '9aff9693-b7b9-11f0-8075-93bbf38ff211',
        'L300',
        '600ml',
        150,
        1.6000,
        '2025-11-02 07:00:24'
    ),
    (
        '9aff973f-b7b9-11f0-8075-93bbf38ff211',
        'L300',
        '330ml',
        200,
        1.0000,
        '2025-11-02 07:00:24'
    ),
    (
        '9aff97c9-b7b9-11f0-8075-93bbf38ff211',
        'L300',
        '19L',
        60,
        3.3300,
        '2025-11-02 07:00:24'
    ),
    (
        '9b01d6d0-b7b9-11f0-8075-93bbf38ff211',
        'Cherry Box',
        '240ml',
        170,
        1.0000,
        '2025-11-02 07:00:24'
    ),
    (
        '9b01e4bf-b7b9-11f0-8075-93bbf38ff211',
        'Cherry Box',
        '120ml',
        300,
        0.5710,
        '2025-11-02 07:00:24'
    ),
    (
        '9b01e56b-b7b9-11f0-8075-93bbf38ff211',
        'Cherry Box',
        '600ml',
        100,
        1.6000,
        '2025-11-02 07:00:24'
    ),
    (
        '9b01e5a7-b7b9-11f0-8075-93bbf38ff211',
        'Cherry Box',
        '330ml',
        170,
        1.0000,
        '2025-11-02 07:00:24'
    ),
    (
        '9b01e5da-b7b9-11f0-8075-93bbf38ff211',
        'Cherry Box',
        '19L',
        50,
        3.3300,
        '2025-11-02 07:00:24'
    );

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
    `status` enum(
        'Akan Datang',
        'Selesai',
        'Dilewati/Gagal'
    ) NOT NULL,
    `notes` text DEFAULT NULL,
    `proofOfVisitImage` longtext DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

--
-- Dumping data for table `visits`
--

INSERT INTO
    `visits` (
        `id`,
        `storeId`,
        `salesPersonId`,
        `visitDate`,
        `purpose`,
        `status`,
        `notes`,
        `proofOfVisitImage`
    )
VALUES (
        '8ce76543-db0c-4bd5-9e71-6f41a595899f',
        'ce1a3121-3c1d-4484-89ec-859803c4a145',
        'a4ce23ab-2e0f-4556-b958-1e3d907decb2',
        '2025-09-16',
        'Penagihan',
        'Akan Datang',
        NULL,
        NULL
    );

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
ADD KEY `fk_routes_vehicle_idx` (`vehicleId`),
ADD KEY `idx_assignment_status` (`assignmentStatus`),
ADD KEY `idx_date_status` (`date`, `assignmentStatus`);

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
ALTER TABLE `stores` ADD PRIMARY KEY (`id`);

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
-- Indexes for table `vehicle_product_capacities`
--
ALTER TABLE `vehicle_product_capacities`
ADD PRIMARY KEY (`id`),
ADD UNIQUE KEY `unique_vehicle_product` (`vehicleType`, `productSize`);

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

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */
;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */
;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */
;