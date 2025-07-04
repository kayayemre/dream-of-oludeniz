const XLSX = require('xlsx');
const path = require('path');

class ExcelReader {
    constructor() {
        this.excelPath = path.join(__dirname, '../data/Fiyat Listesi.xlsx');
        this.workbook = null;
        this.loadExcel();
    }

    loadExcel() {
        try {
            this.workbook = XLSX.readFile(this.excelPath);
            console.log('✅ Excel dosyası yüklendi');
        } catch (error) {
            console.error('❌ Excel dosyası yüklenemedi:', error.message);
        }
    }

    // Fiyat verilerini al
    getPrices() {
        if (!this.workbook) return [];
        
        const fiyatlarSheet = this.workbook.Sheets['Fiyatlar'];
        const fiyatlarData = XLSX.utils.sheet_to_json(fiyatlarSheet);
        
        return fiyatlarData.map(row => ({
            date: row['Tarih'],
            roomType: row['Oda Tipi'],
            concept: row['Konsept'],
            price: row['Fiyat']
        }));
    }

    // Standart oda çarpanlarını al
    getStandardMultipliers() {
        if (!this.workbook) return [];
        
        const standartSheet = this.workbook.Sheets['Standart Oda Çarpanlar'];
        const rawData = XLSX.utils.sheet_to_json(standartSheet, { header: 1 });
        
        const multipliers = [];
        rawData.slice(1).forEach(row => {
            if (row.length > 0 && row[0] !== undefined) {
                const adults = row[0];
                const children = row[1] || 0;
                const child1AgeMin = row[2];
                const child1AgeMax = row[3];
                const child2AgeMin = row[4];
                const child2AgeMax = row[5];
                const multiplier = row[6];
                
                const childAges = [];
                if (child1AgeMin !== undefined && child1AgeMax !== undefined) {
                    childAges.push([child1AgeMin, child1AgeMax]);
                }
                if (child2AgeMin !== undefined && child2AgeMax !== undefined) {
                    childAges.push([child2AgeMin, child2AgeMax]);
                }
                
                multipliers.push({
                    adults,
                    children,
                    childAges,
                    multiplier
                });
            }
        });
        
        return multipliers;
    }

    // Aile odası çarpanlarını al
    getFamilyMultipliers() {
        if (!this.workbook) return [];
        
        const aileSheet = this.workbook.Sheets['Aile Odası Çarpanlar'];
        const rawData = XLSX.utils.sheet_to_json(aileSheet, { header: 1 });
        
        const multipliers = [];
        rawData.slice(1).forEach(row => {
            if (row.length > 0 && row[0] !== undefined) {
                const adults = row[0];
                const children = row[1] || 0;
                const child1AgeMin = row[2];
                const child1AgeMax = row[3];
                const child2AgeMin = row[4];
                const child2AgeMax = row[5];
                const child3AgeMin = row[6];
                const child3AgeMax = row[7];
                const multiplier = row[8];
                
                const childAges = [];
                if (child1AgeMin !== undefined && child1AgeMax !== undefined) {
                    childAges.push([child1AgeMin, child1AgeMax]);
                }
                if (child2AgeMin !== undefined && child2AgeMax !== undefined) {
                    childAges.push([child2AgeMin, child2AgeMax]);
                }
                if (child3AgeMin !== undefined && child3AgeMax !== undefined) {
                    childAges.push([child3AgeMin, child3AgeMax]);
                }
                
                multipliers.push({
                    adults,
                    children,
                    childAges,
                    multiplier
                });
            }
        });
        
        return multipliers;
    }

    // Tüm verileri al
    getAllData() {
        return {
            prices: this.getPrices(),
            standardMultipliers: this.getStandardMultipliers(),
            familyMultipliers: this.getFamilyMultipliers()
        };
    }
}

module.exports = ExcelReader;
