-- Migration: Menambahkan kolom untuk konversi kapasitas produk heterogen
-- Tanggal: 2025-10-23
-- Deskripsi: Menambahkan capacityConversionHeterogeneous untuk perhitungan kapasitas produk campuran

-- Tambah kolom capacityConversionHeterogeneous pada tabel products
-- Nilai default 1.00 untuk backward compatibility
ALTER TABLE `products`
ADD COLUMN `capacityConversionHeterogeneous` decimal(5, 2) NOT NULL DEFAULT 1.00 COMMENT 'Konversi kapasitas saat produk dicampur dengan produk lain dalam 1 armada. Contoh: 240ml=1.0, 120ml=0.5' AFTER `capacityUnit`;

-- Update existing products dengan conversion rate yang sudah ditentukan
-- Berdasarkan ukuran produk: 240ml=1.0, 120ml=0.57, 600ml=1.6, 330ml=1.0, 19L=3.3
UPDATE `products`
SET
    `capacityConversionHeterogeneous` = 3.30
WHERE
    `sku` = 'G-19';

-- Insert atau update produk standar dengan conversion rate yang benar
INSERT INTO
    `products` (
        `id`,
        `sku`,
        `name`,
        `price`,
        `stock`,
        `reservedStock`,
        `capacityUnit`,
        `capacityConversionHeterogeneous`
    )
VALUES (
        'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
        'BTL-240',
        'Air Mineral 240ml',
        5000.00,
        1000,
        0,
        1.00,
        1.00
    ),
    (
        'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e',
        'BTL-120',
        'Air Mineral 120ml',
        3000.00,
        1000,
        0,
        1.00,
        0.57
    ),
    (
        'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f',
        'BTL-600',
        'Air Mineral 600ml',
        8000.00,
        1000,
        0,
        1.00,
        1.60
    ),
    (
        'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a',
        'BTL-330',
        'Air Mineral 330ml',
        6000.00,
        1000,
        0,
        1.00,
        1.00
    )
ON DUPLICATE KEY UPDATE
    `name` = VALUES(`name`),
    `price` = VALUES(`price`),
    `capacityUnit` = VALUES(`capacityUnit`),
    `capacityConversionHeterogeneous` = VALUES(
        `capacityConversionHeterogeneous`
    );

-- Tambahkan index untuk optimasi query
CREATE INDEX idx_products_capacity ON `products` (
    `capacityUnit`,
    `capacityConversionHeterogeneous`
);