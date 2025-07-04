const ExcelReader = require('../lib/excelReader');
const PriceCalculator = require('../lib/priceCalculator');

export default function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ 
            error: 'Method not allowed',
            allowedMethods: ['POST']
        });
    }

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

        // Excel verilerini yükle
        const excelReader = new ExcelReader();
        const standardMultipliers = excelReader.getStandardMultipliers();
        const familyMultipliers = excelReader.getFamilyMultipliers();

        // Fiyat hesaplama
        const priceCalculator = new PriceCalculator(standardMultipliers, familyMultipliers);
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
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
}
