import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

let cart = [
    { id: 1, productName: 'Wireless Mouse', price: 25.99, quantity: 2, category: 'Electronics' },
    { id: 2, productName: 'Mechanical Keyboard', price: 79.99, quantity: 1, category: 'Electronics' },
    { id: 3, productName: 'Notebook A5', price: 5.49, quantity: 5, category: 'Stationery' },
];

const findItem = (id) => cart.find(item => item.id === parseInt(id));

app.get('/cart', (req, res) => {
    res.status(200).json({
        success: true,
        totalItems: cart.length,
        cart
    });
});

app.get('/cart/:id', (req, res) => {
    const item = findItem(req.params.id);

    if (!item) {
        return res.status(404).json({
            success: false,
            error: `Product with ID ${req.params.id} not found.`
        });
    }

    res.status(200).json({
        success: true,
        item: {
            ...item,
            totalPrice: parseFloat((item.price * item.quantity).toFixed(2))
        }
    });
});

app.post('/cart', (req, res) => {
    const { productName, price, quantity, category } = req.body;

    if (!productName || price === undefined || quantity === undefined || !category) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields: productName, price, quantity, category.'
        });
    }

    if (typeof price !== 'number' || price <= 0) {
        return res.status(400).json({ success: false, error: 'price must be a positive number.' });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({ success: false, error: 'quantity must be a positive integer.' });
    }

    const newItem = {
        id: cart.length > 0 ? Math.max(...cart.map(i => i.id)) + 1 : 1,
        productName,
        price,
        quantity,
        category
    };

    cart.push(newItem);

    res.status(201).json({
        success: true,
        message: `'${productName}' added to cart successfully.`,
        item: newItem,
        totalItems: cart.length
    });
});

app.put('/cart/:id', (req, res) => {
    const item = findItem(req.params.id);

    if (!item) {
        return res.status(404).json({
            success: false,
            error: `Product with ID ${req.params.id} not found.`
        });
    }

    const { productName, price, quantity, category } = req.body;

    if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
        return res.status(400).json({ success: false, error: 'price must be a positive number.' });
    }

    if (quantity !== undefined && (!Number.isInteger(quantity) || quantity <= 0)) {
        return res.status(400).json({ success: false, error: 'quantity must be a positive integer.' });
    }

    if (productName !== undefined) item.productName = productName;
    if (price !== undefined) item.price = price;
    if (quantity !== undefined) item.quantity = quantity;
    if (category !== undefined) item.category = category;

    res.status(200).json({
        success: true,
        message: `Product ID ${item.id} updated successfully.`,
        item: {
            ...item,
            totalPrice: parseFloat((item.price * item.quantity).toFixed(2))
        }
    });
});

app.delete('/cart/:id', (req, res) => {
    const index = cart.findIndex(item => item.id === parseInt(req.params.id));

    if (index === -1) {
        return res.status(404).json({
            success: false,
            error: `Product with ID ${req.params.id} not found.`
        });
    }

    const [removed] = cart.splice(index, 1);

    res.status(200).json({
        success: true,
        message: `'${removed.productName}' removed from cart.`,
        removedItem: removed,
        totalItems: cart.length
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: `Route '${req.method} ${req.originalUrl}' not found.`
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Express server running at http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log('  GET    /cart');
    console.log('  GET    /cart/:id');
    console.log('  POST   /cart');
    console.log('  PUT    /cart/:id');
    console.log('  DELETE /cart/:id');
});

export default app;
