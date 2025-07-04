const XLSX = require('xlsx');
const path = require('path');

class ExcelReader {
    constructor() {
        // Vercel'de dosya yolu
        this.excelPath = path.join(process.cwd(), 'Fiyat Listesi.xlsx');
        this.workbook = null;
        this.loadExcel();
    }

    loadExcel() {
        try {
            this.workbook = XLSX.readFile(this.excelPath);
        } catch (error) {
            console.error('Excel dosyası yüklenemedi:', error.message);
        }
    }

    getStandardMultipliers() {
        if (!this.workbook) return [];
        
        const standartSheet = this.workbook.Sheets['Standart Oda Çarpanlar'];
        const rawData = XLSX.utils.sheet_to_json(standartSheet, { header: 1 });
        
        const multipliers = [];
        rawData.slice(1).forEach(row => {
            if (row.length > 0 && row[0] !== undefined) {
                const childAges = [];
                if (row[2] !== undefined && row[3] !== undefined) {
                    childAges.push([row[2], row[3]]);
                }
                if (row[4] !== undefined && row[5] !== undefined) {
                    childAges.push([row[4], row[5]]);
                }
                
                multipliers.push({
                    adults: row[0],
                    children: row[1] || 0,
                    childAges,
                    multiplier: row[6]
                });
            }
        });
        
        return multipliers;
    }

    getFamilyMultipliers() {
        if (!this.workbook) return [];
        
        const aileSheet = this.workbook.Sheets['Aile Odası Çarpanlar'];
        const rawData = XLSX.utils.sheet_to_json(aileSheet, { header: 1 });
        
        const multipliers = [];
        rawData.slice(1).forEach(row => {
            if (row.length > 0 && row[0] !== undefined) {
                const childAges = [];
                if (row[2] !== undefined && row[3] !== undefined) {
                    childAges.push([row[2], row[3]]);
                }
                if (row[4] !== undefined && row[5] !== undefined) {
                    childAges.push([ro
