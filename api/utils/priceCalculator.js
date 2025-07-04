class PriceCalculator {
    constructor(excelData) {
        this.standardMultipliers = excelData.standardMultipliers;
        this.familyMultipliers = excelData.familyMultipliers;
        this.prices = excelData.prices;
    }

    // Çarpan bulma (yaş aralıklarını da kontrol eder)
    findMultiplier(roomType, adults, children, childAges = []) {
        const multipliers = roomType === 'Standart Oda' ? 
            this.standardMultipliers : this.familyMultipliers;
        
        // 12+ yaş çocukları yetişkin olarak say
        let actualChildren = 0;
        let actualAdults = adults;
        const actualChildAges = [];
        
        for (let age of childAges) {
            if (age >= 12) {
                actualAdults++;
            } else {
                actualChildren++;
                actualChildAges.push(age);
            }
        }
        
        // Önce yetişkin ve çocuk sayısına göre filtrele
        const candidates = multipliers.filter(m => 
            m.adults === actualAdults && m.children === actualChildren
        );
        
        if (candidates.length === 0) {
            return null;
        }
        
        // Eğer çocuk yoksa ilk eşleşeni döndür
        if (actualChildren === 0) {
            return candidates[0].multiplier;
        }
        
        // Çocuk yaş aralıklarını kontrol et
        for (let candidate of candidates) {
            if (candidate.childAges.length === 0) {
                return candidate.multiplier;
            }
            
            let isMatch = true;
            for (let i = 0; i < actualChildren && i < candidate.childAges.length; i++) {
                const childAge = actualChildAges[i] || 0;
                const ageRange = candidate.childAges[i];
                
                if (ageRange && ageRange.length === 2) {
                    const [minAge, maxAge] = ageRange;
                    if (childAge < minAge || childAge > maxAge) {
                        isMatch = false;
                        break;
                    }
                }
            }
            
            if (isMatch) {
                return candidate.multiplier;
            }
        }
        
        // En basit eşleşmeyi döndür
        const basicMatch = candidates.find(c => c.childAges.length === 0);
        return basicMatch ? basicMatch.multiplier : candidates[0].multiplier;
    }

    // Oda kombinasyonları üret
    generateRoomCombinations(totalAdults, totalChildren, childAges) {
        const combinations = [];
        
        // 1 oda
        combinations.push([{
            adults: totalAdults, 
            children: totalChildren,
            childAges: childAges
        }]);
        
        // 2 oda kombinasyonları
        for (let adults1 = 1; adults1 <= totalAdults - 1; adults1++) {
            const adults2 = totalAdults - adults1;
            for (let children1 = 0; children1 <= totalChildren; children1++) {
                const children2 = totalChildren - children1;
                
                const childAges1 = childAges.slice(0, children1);
                const childAges2 = childAges.slice(children1);
                
                combinations.push([
                    {adults: adults1, children: children1, childAges: childAges1},
                    {adults: adults2, children: children2, childAges: childAges2}
                ]);
            }
        }
        
        return combinations;
    }

    // Ana fiyat hesaplama
    calculateOptimalPrices(totalAdults, totalChildren, childAges, nights) {
        const results = [];
        const roomTypes = ['Standart Oda', 'Ara Kapılı Aile Odası'];
        const basePrice = 4160; // Excel'den alınan sabit fiyat

        for (let roomType of roomTypes) {
            // Tek oda ile çözüm dene
            const singleMultiplier = this.findMultiplier(roomType, totalAdults, totalChildren, childAges);
            if (singleMultiplier) {
                results.push({
                    solution: 'Tek Oda',
                    roomType: roomType,
                    rooms: [{
                        adults: totalAdults,
                        children: totalChildren,
                        childAges: childAges,
                        multiplier: singleMultiplier,
                        price: basePrice * singleMultiplier * nights
                    }],
                    totalPrice: basePrice * singleMultiplier * nights
                });
            }

            // Çoklu oda kombinasyonları
            const combinations = this.generateRoomCombinations(totalAdults, totalChildren, childAges);
            
            for (let combo of combinations.slice(1)) {
                let totalPrice = 0;
                const roomPrices = [];
                let isValid = true;

                for (let room of combo) {
                    const multiplier = this.findMultiplier(roomType, room.adults, room.children, room.childAges || []);
                    if (!multiplier) {
                        isValid = false;
                        break;
                    }
                    const roomPrice = basePrice * multiplier * nights;
                    roomPrices.push({
                        adults: room.adults,
                        children: room.children,
                        childAges: room.childAges || [],
                        multiplier: multiplier,
                        price: roomPrice
                    });
                    totalPrice += roomPrice;
                }

                if (isValid) {
                    results.push({
                        solution: `${combo.length} Oda`,
                        roomType: roomType,
                        rooms: roomPrices,
                        totalPrice: totalPrice
                    });
                }
            }
        }

        // En ekonomik seçeneği bul ve sırala
        results.sort((a, b) => a.totalPrice - b.totalPrice);
        return results.slice(0, 8);
    }
}

module.exports = PriceCalculator;
