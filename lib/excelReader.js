const XLSX = require('xlsx');
const path = require('path');

class ExcelReader {
    constructor() {
        // Vercel'de dosya yolu - birkaç farklı yolu deneyelim
        this.excelPath = this.findExcelFile();
        this.workbook = null;
        this.loadExcel();
    }

    findExcelFile() {
        const possiblePaths = [
            path.join(process.cwd(), 'Fiyat Listesi.xlsx'),
            path.join(process.cwd(), 'public', 'Fiyat Listesi.xlsx'),
            path.join(__dirname, '..', 'Fiyat Listesi.xlsx'),
            path.join(__dirname, '..', '..', 'Fiyat Listesi.xlsx')
        ];
        
        const fs = require('fs');
        for (let filePath of possiblePaths) {
            try {
                if (fs.existsSync(filePath)) {
                    console.log('Excel dosyası bulundu:', filePath);
                    return filePath;
                }
            } catch (error) {
                // Dosya bulunamadı, devam et
            }
        }
        
        console.error('Excel dosyası bulunamadı!');
        return possiblePaths[0]; // Default olarak ilkini döndür
    }

    loadExcel() {
        try {
            console.log('Excel dosyası yükleniyor:', this.excelPath);
            this.workbook = XLSX.readFile(this.excelPath);
            console.log('✅ Excel dosyası başarıyla yüklendi');
        } catch (error) {
            console.error('❌ Excel dosyası yüklenemedi:', error.message);
            console.error('Denenen dosya yolu:', this.excelPath);
        }
    }

    // Diğer metodlar aynı kalacak...
    getSta
