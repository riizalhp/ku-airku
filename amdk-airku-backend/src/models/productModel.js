const pool = require('../config/db');
const { randomUUID } = require('crypto');

const Product = {
    getAll: async () => {
        const query = 'SELECT * FROM products';
        const [rows] = await pool.query(query);
        return rows;
    },

    getById: async (id) => {
        const query = 'SELECT * FROM products WHERE id = ?';
        const [rows] = await pool.query(query, [id]);
        return rows[0];
    },

    create: async (productData) => {
        const { sku, name, price, stock, capacityUnit, capacityConversionHeterogeneous } = productData;
        const id = randomUUID();
        
        // capacityUnit is deprecated, set to NULL or use for backward compatibility
        // capacityConversionHeterogeneous is the main field (default 1.0 if not provided)
        const conversionHeterogeneous = capacityConversionHeterogeneous || 1.0;
        const capacityUnitValue = capacityUnit !== undefined ? capacityUnit : null;
        
        const query = 'INSERT INTO products (id, sku, name, price, stock, capacityUnit, capacityConversionHeterogeneous, reservedStock) VALUES (?, ?, ?, ?, ?, ?, ?, 0)';
        
        await pool.query(query, [id, sku, name, price, stock, capacityUnitValue, conversionHeterogeneous]);
        const [newProduct] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
        return newProduct[0];
    },

    update: async (id, productData) => {
        const { sku, name, price, stock, capacityUnit, capacityConversionHeterogeneous, reservedStock } = productData;
        
        // capacityUnit is deprecated (can be NULL)
        // capacityConversionHeterogeneous is the main field
        const conversionHeterogeneous = capacityConversionHeterogeneous !== undefined 
            ? capacityConversionHeterogeneous 
            : 1.0;
        const capacityUnitValue = capacityUnit !== undefined ? capacityUnit : null;
        
        const query = 'UPDATE products SET sku = ?, name = ?, price = ?, stock = ?, capacityUnit = ?, capacityConversionHeterogeneous = ?, reservedStock = ? WHERE id = ?';
        
        await pool.query(query, [sku, name, price, stock, capacityUnitValue, conversionHeterogeneous, reservedStock, id]);
        return { id, ...productData };
    },

    delete: async (id) => {
        const query = 'DELETE FROM products WHERE id = ?';
        const [result] = await pool.query(query, [id]);
        return result.affectedRows > 0;
    },
};

module.exports = Product;