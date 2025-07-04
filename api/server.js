const express = require('express');
const cors = require('cors');
const path = require('path');
const pricingRoutes = require('./routes/pricing');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (Excel dosyası için)
app.use('/data', express.static(path.join(__dirname, 'data')));

// Routes
app.use('/api', pricingRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Dream of Oludeniz API is running!',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🏨 Dream of Oludeniz API ready!`);
});

module.exports = app;
