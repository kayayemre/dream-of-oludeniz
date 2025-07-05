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
            allowedMethods: ['POST'],
            documentation: 'https://dream-of-oludeniz.vercel.app/api/docs'
        });
    }

    try {
        const { checkin, checkout, adults, children, childAges } = req.body;

        // Temel validasyonlar
        if (!checkin || !checkout) {
            return res.status(400).json({
                error: 'Giriş ve çıkış tarihleri gerekli (YYYY-MM-DD formatında)',
                code: 'MISSING_DATES',
                example: {
                    checkin: "2025-08-01",
                    checkout: "2025-08-06"
                }
            });
        }

        if (!adults || adults < 1) {
            return res.status(400).json({
                error: 'En az 1 yetişkin gerekli',
                code: 'INVALID_ADULTS',
                received: adults
            });
        }

        // Tarih format kontrolü
        const checkinDate = new Date(checkin);
        const checkoutDate = new Date(checkout);
        
        if (isNaN(checkinDate.getTime()) || isNaN(checkoutDate.getTime())) {
            return res.status(400).json({
                error: 'Geçersiz tarih formatı. YYYY-MM-DD formatında olmalı',
                code: 'INVALID_DATE_FORMAT',
                received: { checkin, checkout },
                example: {
                    checkin: "2025-08-01",
                    checkout: "2025-08-06"
                }
            });
        }

        const nights = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));

        if (nights <= 0) {
            return res.status(400).json({
                error: 'Çıkış tarihi giriş tarihinden sonra olmalıdır',
                code: 'INVALID_DATES',
                received: { checkin, checkout, calculatedNights: nights }
            });
        }

        // Çocuk yaşları validasyonu - DAHA NET
        const validChildAges = childAges || [];
        const childrenCount = parseInt(children) || 0;
        
        if (childrenCount > 0 && validChildAges.length !== childrenCount) {
            return res.status(400).json({
                error: `${childrenCount} çocuk için ${childrenCount} yaş bilgisi gerekli`,
                code: 'MISSING_CHILD_AGES',
                received: {
                    children: childrenCount,
                    childAges: validChildAges,
                    childAgesCount: validChildAges.length
                },
                example: {
                    children: 2,
                    childAges: [8, 10]
                }
            });
        }

        // Çocuk yaşları geçerlilik kontrolü
        for (let i = 0; i < validChildAges.length; i++) {
            const age = parseInt(validChildAges[i]);
            if (isNaN(age) || age < 0 || age > 17) {
                return res.status(400).json({
                    error: `Çocuk yaşı 0-17 arasında olmalı`,
                    code: 'INVALID_CHILD_AGE',
                    received: validChildAges[i],
                    position: i + 1
                });
            }
        }

        // Excel verilerini yükle
        const excelReader = new ExcelReader();
        const standardMultipliers = excelReader.getStandardMultipliers();
        const familyMultipliers = excelReader.getFamilyMultipliers();

        // Fiyat hesaplama - Excel reader'ı da geç
        const priceCalculator = new PriceCalculator(standardMultipliers, familyMultipliers, excelReader);
        const allPriceOptions = priceCalculator.calculateOptimalPrices(
            parseInt(adults),
            parseInt(children) || 0,
            validChildAges.map(age => parseInt(age)),
            nights,
            checkinDate // Tarih bilgisini de gönder
        );

        // 🎯 SADECE STANDART ODA + EN UCUZ SEÇENEK FİLTRESİ
        const standardRoomOptions = allPriceOptions.filter(option => 
            option.roomType === 'Standart Oda'
        );

        // En ucuz standart oda seçeneğini al (sadece 1 tane)
        const priceOptions = standardRoomOptions.length > 0 ? [standardRoomOptions[0]] : [];

        // Her seçeneğe numaralı field'lar ekle
        const numberedPriceOptions = priceOptions.map((option, index) => {
            const solutionNum = index + 1;
            
            // Rooms array'ini numaralı field'larla güncelle
            const numberedRooms = option.rooms.map((room, roomIndex) => {
                const roomNum = roomIndex + 1;
                return {
                    [`adults${solutionNum}_${roomNum}`]: room.adults,
                    [`children${solutionNum}_${roomNum}`]: room.children,
                    [`childAges${solutionNum}_${roomNum}`]: room.childAges,
                    [`multiplier${solutionNum}_${roomNum}`]: room.multiplier,
                    [`price${solutionNum}_${roomNum}`]: room.price
                };
            });

            return {
                [`solution${solutionNum}`]: option.solution,
                [`roomType${solutionNum}`]: option.roomType,
                [`totalPrice${solutionNum}`]: option.totalPrice,
                [`rank${solutionNum}`]: solutionNum,
                [`isCheapest${solutionNum}`]: index === 0,
                [`roomCount${solutionNum}`]: option.rooms.length,
                
                rooms: numberedRooms,
                
                // Original data (backward compatibility için)
                solution: option.solution,
                roomType: option.roomType,
                totalPrice: option.totalPrice
            };
        });

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
                
                // Numaralı seçenekler
                priceOptions: numberedPriceOptions,
                
                // Kolay erişim için en ucuz seçenek
                recommended: numberedPriceOptions.length > 0 ? {
                    [`solution1`]: numberedPriceOptions[0][`solution1`],
                    [`roomType1`]: numberedPriceOptions[0][`roomType1`],
                    [`totalPrice1`]: numberedPriceOptions[0][`totalPrice1`],
                    [`roomCount1`]: numberedPriceOptions[0][`roomCount1`]
                } : null,
                
                meta: {
                    optionCount: numberedPriceOptions.length,
                    cheapestPrice: numberedPriceOptions.length > 0 ? numberedPriceOptions[0][`totalPrice1`] : null,
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
