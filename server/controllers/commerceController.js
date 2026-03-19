import { Category, Product, Order, OrderItem, Lead } from '../models/index.js';
import logger from '../config/logger.js';

// --- CATEGORIES ---

export const getCategories = async (req, res) => {
    try {
        const { organizationId } = req.user;
        const categories = await Category.findAll({ 
            where: { organizationId },
            include: [{ model: Product, foreignKey: 'categoryId' }]
        });
        res.json(categories);
    } catch (error) {
        logger.error(`[COMMERCE] Fetch Categories Error: ${error.message}`);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
};

export const createCategory = async (req, res) => {
    try {
        const { organizationId } = req.user;
        const { name } = req.body;
        const category = await Category.create({ organizationId, name });
        res.status(201).json(category);
    } catch (error) {
        logger.error(`[COMMERCE] Create Category Error: ${error.message}`);
        res.status(500).json({ error: 'Failed to create category' });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { organizationId } = req.user;
        const { name } = req.body;

        const category = await Category.findOne({ where: { id, organizationId } });
        if (!category) return res.status(404).json({ error: 'Category not found' });

        await category.update({ name });
        res.json(category);
    } catch (error) {
        logger.error(`[COMMERCE] Update Category Error: ${error.message}`);
        res.status(500).json({ error: 'Failed to update category' });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { organizationId } = req.user;
        
        const count = await Category.destroy({ where: { id, organizationId } });
        if (count === 0) return res.status(404).json({ error: 'Category not found' });
        
        res.json({ success: true });
    } catch (error) {
        logger.error(`[COMMERCE] Delete Category Error: ${error.message}`);
        res.status(500).json({ error: 'Failed to delete category (Ensure it has no products)' });
    }
};

// --- PRODUCTS ---

export const getProducts = async (req, res) => {
    try {
        const { organizationId } = req.user;
        const products = await Product.findAll({ 
            where: { organizationId },
            include: [{ model: Category, attributes: ['id', 'name'] }]
        });
        res.json(products);
    } catch (error) {
        logger.error(`[COMMERCE] Fetch Products Error: ${error.message}`);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

export const createProduct = async (req, res) => {
    try {
        const { organizationId } = req.user;
        const { name, description, price, imageUrl, categoryId, isActive } = req.body;
        
        const product = await Product.create({ 
            organizationId, name, description, price, imageUrl, categoryId, isActive 
        });
        res.status(201).json(product);
    } catch (error) {
        logger.error(`[COMMERCE] Create Product Error: ${error.message}`);
        res.status(500).json({ error: 'Failed to create product' });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { organizationId } = req.user;
        
        const product = await Product.findOne({ where: { id, organizationId } });
        if (!product) return res.status(404).json({ error: 'Product not found' });

        await product.update(req.body);
        res.json(product);
    } catch (error) {
        logger.error(`[COMMERCE] Update Product Error: ${error.message}`);
        res.status(500).json({ error: 'Failed to update product' });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { organizationId } = req.user;
        
        const count = await Product.destroy({ where: { id, organizationId } });
        if (count === 0) return res.status(404).json({ error: 'Product not found' });
        
        res.json({ success: true });
    } catch (error) {
        logger.error(`[COMMERCE] Delete Product Error: ${error.message}`);
        res.status(500).json({ error: 'Failed to delete product' });
    }
};

// --- ORDERS ---

export const getOrders = async (req, res) => {
    try {
        const { organizationId } = req.user;
        const orders = await Order.findAll({ 
            where: { organizationId },
            include: [
                { model: Lead, attributes: ['id', 'businessName', 'phone'] },
                { 
                    model: OrderItem, 
                    as: 'items', 
                    include: [{ model: Product, attributes: ['name', 'imageUrl'] }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        logger.error(`[COMMERCE] Fetch Orders Error: ${error.message}`);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const { organizationId } = req.user;

        const order = await Order.findOne({ where: { id, organizationId } });
        if (!order) return res.status(404).json({ error: 'Order not found' });

        await order.update({ status });
        res.json(order);
    } catch (error) {
        logger.error(`[COMMERCE] Update Order Error: ${error.message}`);
        res.status(500).json({ error: 'Failed to update order status' });
    }
};
