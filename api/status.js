const ExcelReader = require('../lib/excelReader');

export default function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ 
            error: 'Method not allowed',
            allowedMethods: ['GET']
        });
    }

    try {
        // Excel dosyasının yüklenip yüklenmediğini test et
        const excelReader = new ExcelReader();
        const standardMultipliers = excelReader.getStandardMultipliers();
        const familyMultipliers = excelReader.getFamilyMultipliers();

        res.json({
            success: true,
            message: 'Dream of Oludeniz Pricing API',
            version: '1.0.0',
            status: 'online',
            data: {
    excelLoaded: standardMultipliers.length > 0, // Sadece standart odaya bak
    standardMultipliersCount: standardMultipliers.length,
    familyMultipliersCount: familyMultipliers.length
},
            endpoints: [
                'GET /api/status',
                'POST /api/calculate-price'
            ],
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'API status kontrolü başarısız',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
}
