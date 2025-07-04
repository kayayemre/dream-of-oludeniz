// Geçici olarak hard-coded data kullanıyoruz
class ExcelReader {
    constructor() {
        console.log('ExcelReader başlatılıyor...');
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
        return [
            {adults: 2, children: 2, childAges: [[0, 11.99], [0, 11.99]], multiplier: 3},
            {adults: 3, children: 0, childAges: [], multiplier: 3},
            {adults: 3, children: 1, childAges: [[0, 11.99]], multiplier: 3},
            {adults: 3, children: 2, childAges: [[0, 11.99], [0, 2.99]], multiplier: 3},
            {adults: 3, children: 2, childAges: [[0, 11.99], [3, 11.99]], multiplier: 3.7},
            {adults: 2, children: 3, childAges: [[0, 11.99], [0, 11.99], [0, 11.99]], multiplier: 3.7},
            {adults: 4, children: 0, childAges: [], multiplier: 4},
            {adults: 4, children: 1, childAges: [[0, 11.99]], multiplier: 4},
            {adults: 4, children: 2, childAges: [[0, 11.99], [0, 2.99]], multiplier: 4},
            {adults: 5, children: 0, childAges: [], multiplier: 4.75}
        ];
    }
}

module.exports = ExcelReader;
