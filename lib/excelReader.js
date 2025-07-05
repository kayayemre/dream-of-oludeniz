const XLSX = require('xlsx');
const path = require('path');

class ExcelReader {
    constructor() {
        console.log('ExcelReader başlatılıyor...');
        this.pricesData = [];
        this.loadExcelData();
    }

    loadExcelData() {
        try {
            // Vercel'de dosya yolu - birkaç farklı yol deneyelim
            const possiblePaths = [
                path.join(process.cwd(), 'Fiyat Listesi.xlsx'),
                path.join(process.cwd(), 'api', 'data', 'Fiyat Listesi.xlsx'),
                path.join(__dirname, '..', 'Fiyat Listesi.xlsx'),
                path.join(__dirname, '..', '..', 'Fiyat Listesi.xlsx')
            ];
            
            let workbook = null;
            let usedPath = null;
            
            for (let excelPath of possiblePaths) {
                try {
                    console.log('Excel dosyası deneniyor:', excelPath);
                    workbook = XLSX.readFile(excelPath);
                    usedPath = excelPath;
                    console.log('✅ Excel dosyası bulundu:', excelPath);
                    break;
                } catch (error) {
                    console.log('❌ Bu yolda bulunamadı:', excelPath);
                    continue;
                }
            }
            
            if (!workbook) {
                throw new Error('Excel dosyası hiçbir yolda bulunamadı');
            }
            
            // Fiyatlar sheet'ini oku
            const fiyatlarSheet = workbook.Sheets['Fiyatlar'];
            if (!fiyatlarSheet) {
                throw new Error('Fiyatlar sheet\'i bulunamadı');
            }
            
            const fiyatlarData = XLSX.utils.sheet_to_json(fiyatlarSheet);
            
            // JSON formatına çevir
            this.pricesData = fiyatlarData.map(row => {
                const tarih = new Date(row['Tarih']);
                return {
                    date: tarih.toISOString().split('T')[0],
                    roomType: row['Oda Tipi'],
                    concept: row['Konsept'],
                    price: row['Fiyat']
                };
            });
            
            console.log(`✅ Excel'den ${this.pricesData.length} fiyat kaydı yüklendi`);
            
            // İlk birkaç kaydı göster
            console.log('Örnek fiyat kayıtları:');
            this.pricesData.slice(0, 5).forEach(record => {
                console.log(`${record.date} - ${record.roomType} - ${record.price}₺`);
            });
            
        } catch (error) {
            console.error('❌ Excel okuma hatası:', error.message);
            console.log('🔄 Fallback: Hard-coded fiyatlar kullanılacak');
            
            // Fallback: Hard-coded veriler
            this.pricesData = [
                {"date": "2025-07-04", "roomType": "Standart Oda", "concept": "Alkollü Herşey Dahil", "price": 4160},
                {"date": "2025-07-05", "roomType": "Standart Oda", "concept": "Alkollü Herşey Dahil", "price": 4160},
                {"date": "2025-07-31", "roomType": "Standart Oda", "concept": "Alkollü Herşey Dahil", "price": 4480},
                {"date": "2025-08-01", "roomType": "Standart Oda", "concept": "Alkollü Herşey Dahil", "price": 4480},
                {"date": "2025-09-01", "roomType": "Standart Oda", "concept": "Alkollü Herşey Dahil", "price": 3600},
                {"date": "2025-10-01", "roomType": "Standart Oda", "concept": "Alkollü Herşey Dahil", "price": 3040},
                {"date": "2025-11-01", "roomType": "Standart Oda", "concept": "Alkollü Herşey Dahil", "price": 2080}
            ];
        }
    }

    // Belirli tarih için fiyat bul
    getPriceForDate(date, roomType, concept = "Alkollü Herşey Dahil") {
        const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
        
        const priceRecord = this.pricesData.find(record => 
            record.date === dateStr && 
            record.roomType === roomType && 
            record.concept === concept
        );
        
        if (priceRecord) {
            return priceRecord.price;
        }
        
        // Eğer o tarih bulunamazsa, en yakın önceki tarihi bul
        const availableDates = this.pricesData
            .filter(record => record.roomType === roomType && record.concept === concept)
            .map(record => record.date)
            .sort();
            
        const targetDate = new Date(dateStr);
        let closestPrice = null;
        
        for (let availableDate of availableDates) {
            if (new Date(availableDate) <= targetDate) {
                const record = this.pricesData.find(r => 
                    r.date === availableDate && 
                    r.roomType === roomType && 
                    r.concept === concept
                );
                if (record) {
                    closestPrice = record.price;
                }
            } else {
                break;
            }
        }
        
        // Hiç bulamazsa default fiyat döndür
        return closestPrice || (roomType === 'Standart Oda' ? 4160 : 3840);
    }

    // Tarih aralığı için toplam fiyat hesapla
    calculateTotalPriceForPeriod(checkinDate, nights, roomType, concept = "Alkollü Herşey Dahil") {
        let totalPrice = 0;
        const currentDate = new Date(checkinDate);
        
        console.log(`💰 Fiyat hesaplama: ${checkinDate} tarihinden ${nights} gece için ${roomType}`);
        
        for (let i = 0; i < nights; i++) {
            const dayPrice = this.getPriceForDate(currentDate, roomType, concept);
            totalPrice += dayPrice;
            
            const dateStr = currentDate.toISOString().split('T')[0];
            console.log(`${dateStr}: ${dayPrice}₺`);
            
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        console.log(`Toplam ${nights} gece: ${totalPrice}₺`);
        return totalPrice;
    }

    // Tüm fiyat verilerini getir
    getAllPrices() {
        return this.pricesData;
    }

    getStandardMultipliers() {
        return [
            {adults: 1, children: 0, childAges: [], multiplier: 1.5},
            {adults: 1, children: 1, childAges: [[0, 11.99]], multiplier: 1.5},
            {adults: 1, children: 2, childAges: [[0, 11.99], [0, 2.99]], multiplier: 1.5},
            {adults: 1, children: 2, childAges: [[0, 11.99], [3, 11.99]], multiplier: 2},
            {adults: 2, children: 0, childAges: [], multiplier: 2},
            {adults: 2, children: 1, childAges: [[0, 11.99]], multiplier: 2},
            {adults: 2, children: 2, childAges: [[0, 11.99], [0, 2.99]], multiplier: 2},
            {adults: 2, children: 2, childAges: [[0, 11.99], [3, 11.99]], multiplier: 2.75},
            {adults: 3, children: 0, childAges: [], multiplier: 2.75},
            {adults: 3, children: 1, childAges: [[0, 11.99]], multiplier: 2.75}
        ];
    }

    getFamilyMultipliers() {
        // 🚫 AİLE ODALARI MÜSAIT DEĞİL - GEÇİCİ OLARAK KAPALI
        return [];
    }
}

module.exports = ExcelReader;
