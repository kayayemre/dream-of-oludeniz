const express = require('express');
const ExcelReader = require('../utils/excelReader');
const PriceCalculator = require('../utils/priceCalculator');

const router = express.Router();

// Excel verilerini yükle
const excelReader = new ExcelReader();
const excelData = excelReader.getAllData();
const priceCalculator = new PriceCalculator(excelData);

// Ana fiyat hesaplama endpoint'i
router.post('/calculate-price', (req, res) => {
    try {
        const { checkin, checkout, adults, children, childAges } = req.body;

        // Validasyon
        if (!checkin || !checkout) {
            return res.status(400).json({
                error: 'Giriş ve çıkış tarihleri gerekli',
                code: 'MISSING_DATES'
            });
        }

        if (!adults || adults < 1) {
            return res.status(400).json({
                error: 'En az 1 yetişkin gerekli',
                code: 'INVALID_ADULTS'
            });
        }

        // Tarih hesaplama
        const checkinDate = new Date(checkin);
        const checkoutDate = new Date(checkout);
        const nights = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));

        if (nights <= 0) {
            return res.status(400).json({
                error: 'Çıkış tarihi giriş tarihinden sonra olmalıdır',
                code: 'INVALID_DATES'
            });
        }

        // Çocuk yaşları validasyonu
        const validChildAges = childAges || [];
        if (children > 0 && validChildAges.length !== children) {
            return res.status(400).json({
                error: 'Tüm çocukların yaşları belirtilmelidir',
                code: 'MISSING_CHILD_AGES'
            });
        }

        // Fiyat hesaplama
        const priceOptions = priceCalculator.calculateOptimalPrices(
            parseInt(adults),
            parseInt(children) || 0,
            validChildAges.map(age => parseInt(age)),
            nights
        );

        // Response
        res.json({
            success: true,
            data: {
                request: {
                    checkin,
                    checkout,
                    nights,
                    adults: parseInt(adults),
                    children: parseInt(children) || 0,
                    childAges: validChildAges.map(age => parseInt(age))
                },
                priceOptions,
                meta: {
                    optionCount: priceOptions.length,
                    cheapestPrice: priceOptions.length > 0 ? priceOptions[0].totalPrice : null,
                    concept: 'Alkollü Herşey Dahil',
                    currency: 'TRY'
                }
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Fiyat hesaplama hatası:', error);
        res.status(500).json({
            error: 'Fiyat hesaplanırken bir hata oluştu',
            code: 'CALCULATION_ERROR',
            timestamp: new Date().toISOString()
        });
    }
});

// Mevcut fiyat verilerini getir
router.get('/prices', (req, res) => {
    try {
        const prices = excelReader.getPrices();
        res.json({
            success: true,
            data: prices,
            count: prices.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Fiyat verileri alınamadı',
            code: 'DATA_ERROR'
        });
    }
});

// Çarpan tablolarını getir
router.get('/multipliers', (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                standardMultipliers: excelReader.getStandardMultipliers(),
                familyMultipliers: excelReader.getFamilyMultipliers()
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Çarpan verileri alınamadı',
            code: 'DATA_ERROR'
        });
    }
});

// API durumu
router.get('/status', (req, res) => {
    res.json({
        success: true,
        message: 'Dream of Oludeniz Pricing API',
        version: '1.0.0',
        endpoints: [
            'POST /api/calculate-price',
            'GET /api/prices',
            'GET /api/multipliers',
            'GET /api/status'
        ],
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
