const express = require('express');
const router = express.Router();

let inventory = [
    { id: 1, name: 'Widget Pro', category: 'Electronics', quantity: 245, price: 29.99, status: 'In Stock' },
    { id: 2, name: 'Gadget X', category: 'Electronics', quantity: 12, price: 149.99, status: 'Low Stock' },
    { id: 3, name: 'Component A', category: 'Parts', quantity: 890, price: 5.99, status: 'In Stock' },
    { id: 4, name: 'Module Z', category: 'Parts', quantity: 0, price: 45.00, status: 'Out of Stock' },
    { id: 5, name: 'Device Pro', category: 'Hardware', quantity: 156, price: 299.99, status: 'In Stock' },
    { id: 6, name: 'Sensor Unit', category: 'Electronics', quantity: 78, price: 19.99, status: 'In Stock' }
];

router.get('/', (req, res) => {
    const { category, status, search } = req.query;

    let filtered = [...inventory];

    if (category) {
        filtered = filtered.filter(item => item.category.toLowerCase() === category.toLowerCase());
    }

    if (status) {
        filtered = filtered.filter(item => item.status.toLowerCase().includes(status.toLowerCase()));
    }

    if (search) {
        filtered = filtered.filter(item =>
            item.name.toLowerCase().includes(search.toLowerCase())
        );
    }

    res.json({
        success: true,
        count: filtered.length,
        data: filtered
    });
});

router.get('/:id', (req, res) => {
    const item = inventory.find(i => i.id === parseInt(req.params.id));

    if (!item) {
        return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, data: item });
});

router.post('/', (req, res) => {
    const { name, category, quantity, price } = req.body;

    if (!name || !category || quantity === undefined || !price) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const newItem = {
        id: inventory.length + 1,
        name,
        category,
        quantity,
        price,
        status: quantity === 0 ? 'Out of Stock' : quantity < 20 ? 'Low Stock' : 'In Stock'
    };

    inventory.push(newItem);
    res.status(201).json({ success: true, data: newItem });
});

router.put('/:id', (req, res) => {
    const index = inventory.findIndex(i => i.id === parseInt(req.params.id));

    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const { name, category, quantity, price } = req.body;

    inventory[index] = {
        ...inventory[index],
        name: name || inventory[index].name,
        category: category || inventory[index].category,
        quantity: quantity !== undefined ? quantity : inventory[index].quantity,
        price: price || inventory[index].price,
        status: (quantity !== undefined ? quantity : inventory[index].quantity) === 0
            ? 'Out of Stock'
            : (quantity !== undefined ? quantity : inventory[index].quantity) < 20
                ? 'Low Stock'
                : 'In Stock'
    };

    res.json({ success: true, data: inventory[index] });
});

router.delete('/:id', (req, res) => {
    const index = inventory.findIndex(i => i.id === parseInt(req.params.id));

    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Item not found' });
    }

    inventory.splice(index, 1);
    res.json({ success: true, message: 'Item deleted' });
});

module.exports = router;
