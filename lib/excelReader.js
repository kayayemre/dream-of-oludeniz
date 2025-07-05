class ExcelReader {
    constructor() {
        console.log('ExcelReader başlatılıyor...');
    }

    getPriceForDate(date, roomType, concept = "Alkollü Herşey Dahil") {
        const dateObj = new Date(date);
        const month = dateObj.getMonth() + 1; // 1-12
        const day = dateObj.getDate();
        
        // SEZONSAL FİYATLAR
        let basePrice = 4160; // Default
        
        if (month === 7) { // Temmuz
            if (day >= 21) basePrice = 4480; // Son 10 gün yüksek
            else basePrice = 4160;
        } else if (month === 8) { // Ağustos
            basePrice = 4480;
        } else if (month === 9) { // Eylül  
            basePrice = 3600;
        } else if (month === 10) { // Ekim
            basePrice = 3040;
        } else if (month === 11) { // Kasım
            basePrice = 2080;
        }
        
        // Aile odası %92
        return roomType === 'Standart Oda' ? basePrice : Math.round(basePrice * 0.92);
    }

    calculateTotalPriceForPeriod(checkinDate, nights, roomType, concept = "Alkollü Herşey Dahil") {
        let totalPrice = 0;
        const currentDate = new Date(checkinDate);
        
        for (let i = 0; i < nights; i++) {
            const dayPrice = this.getPriceForDate(currentDate, roomType, concept);
            totalPrice += dayPrice;
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return totalPrice;
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
        return [];
    }
}

module.exports = ExcelReader;
