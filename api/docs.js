export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    res.json({
        title: "Dream of Oludeniz Pricing API Documentation",
        version: "1.0.0",
        endpoints: {
            calculate_price: {
                url: "/api/calculate-price",
                method: "POST",
                description: "Otel fiyat hesaplama",
                required_fields: {
                    checkin: "string (YYYY-MM-DD format)",
                    checkout: "string (YYYY-MM-DD format)", 
                    adults: "number (min: 1, max: 8)"
                },
                optional_fields: {
                    children: "number (default: 0)",
                    childAges: "array of numbers (0-17)"
                },
                example_request: {
                    checkin: "2025-08-01",
                    checkout: "2025-08-06",
                    adults: 3,
                    children: 1,
                    childAges: [8]
                },
                example_response: {
                    success: true,
                    data: {
                        priceOptions: [
                            {
                                solution1: "Tek Oda",
                                roomType1: "Standart Oda",
                                totalPrice1: 57200
                            }
                        ]
                    }
                }
            }
        }
    });
}
