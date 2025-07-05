class PriceCalculator {
    constructor(standardMultipliers, familyMultipliers, excelReader) {
        this.standardMultipliers = standardMultipliers;
        this.familyMultipliers = familyMultipliers;
        this.excelReader = excelReader; // Excel okuyucu referansı
    }

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
        
        const candidates = multipliers.filter(m => 
            m.adults === actualAdults && m.children === actualChildren
        );
        
        if (candidates.length === 0) {
            return null;
        }
        
        if (actualChildren === 0) {
            return candidates[0].multiplier;
        }
        
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
        
        const basicMatch = candidates.find(c => c.childAges.length === 0);
        return basicMatch ? basicMatch.multiplier : candidates[0].multiplier;
    }

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
        
        // 3 oda kombinasyonları
        if (totalAdults >= 3) {
            for (let adults1 = 1; adults1 <= totalAdults - 2; adults1++) {
                for (let adults2 = 1; adults2 <= totalAdults - adults1 - 1; adults2++) {
                    const adults3 = totalAdults - adults1 - adults2;
                    if (adults3 >= 1) {
                        for (let children1 = 0; children1 <= totalChildren; children1++) {
                            for (let children2 = 0; children2 <= totalChildren - children1; children2++) {
                                const children3 = totalChildren - children1 - children2;
                                
                                const childAges1 = childAges.slice(0, children1);
                                const childAges2 = childAges.slice(children1, children1 + children2);
                                const childAges3 = childAges.slice(children1 + children2);
                                
                                combinations.push([
                                    {adults: adults1, children: children1, childAges: childAges1},
                                    {adults: adults2, children: children2, childAges: childAges2},
                                    {adults: adults3, children: children3, childAges: childAges3}
                                ]);
                            }
                        }
                    }
                }
            }
        }
        
        // 4 oda kombinasyonları
        if (totalAdults >= 4) {
            for (let adults1 = 1; adults1 <= totalAdults - 3; adults1++) {
                for (let adults2 = 1; adults2 <= totalAdults - adults1 - 2; adults2++) {
                    for (let adults3 = 1; adults3 <= totalAdults - adults1 - adults2 - 1; adults3++) {
                        const adults4 = totalAdults - adults1 - adults2 - adults3;
                        if (adults4 >= 1) {
                            // Basit dağılım - çocukları ilk odalara dağıt
                            const childrenDistribution = [
                                Math.floor(totalChildren / 4),
                                Math.floor(totalChildren / 4),
                                Math.floor(totalChildren / 4),
                                totalChildren - (3 * Math.floor(totalChildren / 4))
                            ];
                            
                            let childAgeIndex = 0;
                            const rooms = [
                                {
                                    adults: adults1, 
                                    children: childrenDistribution[0],
                                    childAges: childAges.slice(childAgeIndex, childAgeIndex + childrenDistribution[0])
                                },
                                {
                                    adults: adults2,
                                    children: childrenDistribution[1], 
                                    childAges: childAges.slice(childAgeIndex += childrenDistribution[0], childAgeIndex + childrenDistribution[1])
                                },
                                {
                                    adults: adults3,
                                    children: childrenDistribution[2],
                                    childAges: childAges.slice(childAgeIndex += childrenDistribution[1], childAgeIndex + childrenDistribution[2])
                                },
                                {
                                    adults: adults4,
                                    children: childrenDistribution[3],
                                    childAges: childAges.slice(childAgeIndex + childrenDistribution[2])
                                }
                            ];
                            
                            combinations.push(rooms);
                        }
                    }
                }
            }
        }
        
        // 5 oda kombinasyonları
        if (totalAdults >= 5) {
            // Basit dağılım: Her odaya 1 yetişkin, çocukları eşit dağıt
            const adultsPerRoom = Math.floor(totalAdults / 5);
            const extraAdults = totalAdults % 5;
            const childrenPerRoom = Math.floor(totalChildren / 5);
            const extraChildren = totalChildren % 5;
            
            const rooms = [];
            let childAgeIndex = 0;
            
            for (let i = 0; i < 5; i++) {
                const roomAdults = adultsPerRoom + (i < extraAdults ? 1 : 0);
                const roomChildren = childrenPerRoom + (i < extraChildren ? 1 : 0);
                const roomChildAges = childAges.slice(childAgeIndex, childAgeIndex + roomChildren);
                childAgeIndex += roomChildren;
                
                rooms.push({
                    adults: roomAdults,
                    children: roomChildren,
                    childAges: roomChildAges
                });
            }
            
            if (rooms.every(room => room.adults >= 1)) {
                combinations.push(rooms);
            }
        }
        
        return combinations;
    }

    calculateOptimalPrices(totalAdults, totalChildren, childAges, nights, checkinDate) {
        const results = [];
        const roomTypes = ['Standart Oda', 'Ara Kapılı Aile Odası'];

        for (let roomType of roomTypes) {
            const singleMultiplier = this.findMultiplier(roomType, totalAdults, totalChildren, childAges);
            if (singleMultiplier) {
                // Gerçek Excel fiyatını kullan
                const totalBasePrice = this.excelReader.calculateTotalPriceForPeriod(
                    checkinDate, 
                    nights, 
                    roomType
                );
                
                results.push({
                    solution: 'Tek Oda',
                    roomType: roomType,
                    rooms: [{
                        adults: totalAdults,
                        children: totalChildren,
                        childAges: childAges,
                        multiplier: singleMultiplier,
                        price: totalBasePrice * singleMultiplier
                    }],
                    totalPrice: totalBasePrice * singleMultiplier
                });
            }

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
                    
                    // Her oda için gerçek Excel fiyatını kullan
                    const totalBasePrice = this.excelReader.calculateTotalPriceForPeriod(
                        checkinDate, 
                        nights, 
                        roomType
                    );
                    
                    const roomPrice = totalBasePrice * multiplier;
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

        results.sort((a, b) => a.totalPrice - b.totalPrice);
        return results.slice(0, 8);
    }
}

module.exports = PriceCalculator;
