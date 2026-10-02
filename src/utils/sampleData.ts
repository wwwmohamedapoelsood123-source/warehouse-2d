import { WarehouseLocation, decomposeLocationCode } from '../types/warehouse';

const PRODUCTS = [
  { itemCode: '10025', description: 'زيت محرك 5W-30 تخليقي 4L' },
  { itemCode: '10030', description: 'فلتر هواء محرك أصلي' },
  { itemCode: '10040', description: 'بواجي شمعات إشعال إيريديوم' },
  { itemCode: '10055', description: 'سائل فرامل DOT 4 عالي الأداء' },
  { itemCode: '10060', description: 'أقمشة فرامل أمامية سيراميك' },
  { itemCode: '10070', description: 'حزام سير محرك دينامو 6PK' },
  { itemCode: '10080', description: 'مساعدين صدمات أمامي غاز' },
  { itemCode: '10090', description: 'طرمبة بنزين كهربائية 12V' },
  { itemCode: '10100', description: 'بطارية جافة 70 أمبير 12V' },
  { itemCode: '10110', description: 'فلتر زيت كرتيري هيدروليك' },
  { itemCode: '10120', description: 'مصباح أمامي LED H4 أبيض' },
  { itemCode: '10130', description: 'مياه ردياتير حمراء 33% تركيز' },
  { itemCode: '10140', description: 'مساحات زجاج سيليكون 24 بوصة' },
  { itemCode: '10150', description: 'طقم جوان غطاء صبابات كوري' },
  { itemCode: '10160', description: 'مقص أمامي سفلي يمين مع جلب' },
  { itemCode: '10170', description: 'مساعد كبوت هيدروليك زوج' },
  { itemCode: '10180', description: 'دينامو شحن أصلي 90A' },
  { itemCode: '10190', description: 'ردياتير ماء ألومنيوم تبريد فائق' },
  { itemCode: '10200', description: 'كومبريسور مكيف ياباني أصلي' },
];

function generateWarehouseLocations(): WarehouseLocation[] {
  const list: WarehouseLocation[] = [];
  const wh = 'G14';
  const levels = ['A', 'B', 'C', 'D'];
  const sides = ['1', '2'];

  let productIdx = 0;

  // 4 Streets, each street has 5 bays in its own row:
  // Street 01: bays 001..005
  // Street 02: bays 006..010
  // Street 03: bays 011..015
  // Street 04: bays 016..020
  for (let streetIdx = 1; streetIdx <= 4; streetIdx++) {
    const streetCode = String(streetIdx).padStart(2, '0');
    const startBay = (streetIdx - 1) * 5 + 1;
    const endBay = streetIdx * 5;

    for (let b = startBay; b <= endBay; b++) {
      const bayCode = String(b).padStart(3, '0');

      levels.forEach((level) => {
        sides.forEach((side) => {
          // Format requested: G + 2 digits (G14) + 3 digits bay (001) + level (A) + side (1 or 2)
          // Example: G14001A1, G14001A2
          const locCode = `${wh}${bayCode}${level}${side}`;

          // Empty slots pattern for variety
          const isSlotEmpty = 
            (b === 3 && level === 'A') ||
            (b === 5 && level === 'C' && side === '1') ||
            (b === 8 && level === 'A') ||
            (b === 10 && level === 'D' && side === '2') ||
            (b === 14 && level === 'B' && side === '1') ||
            (b === 18 && level === 'A') ||
            (b === 20 && level === 'C' && side === '2');

          if (isSlotEmpty) {
            list.push({
              location: locCode,
              itemCode: '',
              description: '',
              zone: streetCode,
              street: streetCode,
              bay: bayCode,
              level: level,
              side: side,
            });
          } else {
            // Bay's primary item
            let prod = PRODUCTS[(b - 1) % PRODUCTS.length];
            
            // Intentionally place a different product in a few bays to demonstrate "صنف مختلف في الباكية"
            const isDifferentProductInBay = 
              (b === 2 && level === 'D' && side === '2') ||
              (b === 7 && level === 'C' && side === '1') ||
              (b === 11 && level === 'B' && side === '2') ||
              (b === 16 && level === 'D' && side === '1');

            if (isDifferentProductInBay) {
              prod = PRODUCTS[(b + 4) % PRODUCTS.length];
            }

            list.push({
              location: locCode,
              itemCode: prod.itemCode,
              description: prod.description,
              zone: streetCode,
              street: streetCode,
              bay: bayCode,
              level: level,
              side: side,
            });
          }
        });
      });
    }
  }

  return list;
}

export const SAMPLE_LOCATIONS: WarehouseLocation[] = generateWarehouseLocations();
