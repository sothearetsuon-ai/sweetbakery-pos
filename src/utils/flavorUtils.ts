/**
 * Flavor Utilities for Bakery POS & Customer Ordering
 */

export interface CakeFlavorItem {
  id: string;
  nameKh: string;
  nameEn: string;
  icon: string;
  label: string;
  isAvailable?: boolean;
}

export interface UnifiedCakeFlavor extends CakeFlavorItem {
  isCustom?: boolean;
  isOutOfStock?: boolean;
}

export const PRESET_CAKE_FLAVORS: CakeFlavorItem[] = [
  { id: 'chocolate', nameKh: 'សូកូឡា', nameEn: 'Chocolate Cake', icon: '🍫', label: 'សូកូឡា (Chocolate Cake)' },
  { id: 'vanilla', nameKh: 'វ៉ានីឡា', nameEn: 'Vanilla Cake', icon: '🍦', label: 'វ៉ានីឡា (Vanilla Cake)' },
  { id: 'strawberry', nameKh: 'ស្ត្រប៊ែរី', nameEn: 'Strawberry Cake', icon: '🍓', label: 'ស្ត្រប៊ែរី (Strawberry Cake)' },
  { id: 'blueberry', nameKh: 'ប៊្លូប៊ែរី', nameEn: 'Blueberry Cake', icon: '🫐', label: 'ប៊្លូប៊ែរី (Blueberry Cake)' },
  { id: 'red_velvet', nameKh: 'រ៉េដវ៉េលវែត', nameEn: 'Red Velvet', icon: '❤️', label: 'រ៉េដវ៉េលវែត (Red Velvet)' },
  { id: 'matcha', nameKh: 'តែបៃតង', nameEn: 'Matcha Green Tea', icon: '🍵', label: 'តែបៃតង (Matcha Green Tea)' },
  { id: 'taro_coconut', nameKh: 'ត្រាវដូង', nameEn: 'Taro Coconut', icon: '🍠', label: 'ត្រាវដូង (Taro Coconut)' },
  { id: 'durian', nameKh: 'ទុរេន', nameEn: 'Durian Cake', icon: '🍈', label: 'ទុរេន (Durian Cake)' },
  { id: 'pandan_coconut', nameKh: 'តយដូង', nameEn: 'Pandan Coconut', icon: '🥥', label: 'តយដូង (Pandan Coconut)' },
  { id: 'coffee_mocha', nameKh: 'កាហ្វេម៉ូកា', nameEn: 'Coffee Mocha', icon: '☕', label: 'កាហ្វេម៉ូកា (Coffee Mocha)' },
  { id: 'lotus_biscoff', nameKh: 'ខារ៉ាមែល ប៊ីស្គូហ្វ', nameEn: 'Lotus Biscoff Caramel', icon: '🍯', label: 'ខារ៉ាមែល ប៊ីស្គូហ្វ (Lotus Biscoff Caramel)' },
  { id: 'mango_passion', nameKh: 'ស្វាយ & ផាសិន', nameEn: 'Mango Passionfruit', icon: '🥭', label: 'ស្វាយ & ផាសិន (Mango Passionfruit)' },
  { id: 'other', nameKh: 'ផ្សេងៗ', nameEn: 'Other...', icon: '✨', label: 'ផ្សេងៗ (Other)' },
];

export const getFlavorEmoji = (flavorName: string): string => {
  const clean = (flavorName || '').trim().toLowerCase();

  if (clean.includes('choco') || clean.includes('សូកូឡា') || clean.includes('fudge') || clean.includes('brownie')) return '🍫';
  if (clean.includes('straw') || clean.includes('ស្ត្រប៊ែរី') || clean.includes('ស្ត្របឺរី') || clean.includes('berry') || clean.includes('ប៊ឺរី')) return '🍓';
  if (clean.includes('blue') || clean.includes('ប៊្លូ')) return '🫐';
  if (clean.includes('vanil') || clean.includes('វ៉ានីឡា') || clean.includes('custard')) return '🍦';
  if (clean.includes('velvet') || clean.includes('រ៉េដ') || clean.includes('cheese') || clean.includes('ឈីស')) return '❤️';
  if (clean.includes('matcha') || clean.includes('green tea') || clean.includes('តែបៃតង') || clean.includes('ម៉ាត់ឆា')) return '🍵';
  if (clean.includes('coffee') || clean.includes('កាហ្វេ') || clean.includes('tiramisu') || clean.includes('mocha') || clean.includes('ម៉ូកា')) return '☕';
  if (clean.includes('durian') || clean.includes('ទុរេន') || clean.includes('ធុរេន')) return '🍈';
  if (clean.includes('taro') || clean.includes('ត្រាវ')) return '🍠';
  if (clean.includes('coconut') || clean.includes('ដូង') || clean.includes('pandan') || clean.includes('តយ') || clean.includes('ស្លឹកតយ')) return '🥥';
  if (clean.includes('mango') || clean.includes('ស្វាយ')) return '🥭';
  if (clean.includes('passion') || clean.includes('ផាសិន')) return '🍹';
  if (clean.includes('orange') || clean.includes('ក្រូច') || clean.includes('lemon')) return '🍊';
  if (clean.includes('caramel') || clean.includes('ខារ៉ាមែល') || clean.includes('ការ៉ាមែល') || clean.includes('biscoff')) return '🍯';
  return '🧁';
};

/**
 * Single source of truth for cake flavors across POS, Custom Orders, and Customer Portal.
 */
export const getUnifiedCakeFlavors = (
  flavors: string[] = [],
  unavailableFlavors: string[] = [],
  deletedFlavorIds: string[] = [],
  flavorOverrides: Record<string, { nameKh: string; nameEn?: string }> = {}
): UnifiedCakeFlavor[] => {
  const deletedSet = new Set((deletedFlavorIds || []).map((d) => d.toLowerCase().trim()));

  // 1. Process PRESET_CAKE_FLAVORS (filtering out 'other' and deleted items)
  const list: UnifiedCakeFlavor[] = PRESET_CAKE_FLAVORS
    .filter((f) => {
      if (f.id === 'other') return false;
      const idLower = f.id.toLowerCase().trim();
      const khLower = f.nameKh.toLowerCase().trim();
      const lblLower = f.label.toLowerCase().trim();
      return !deletedSet.has(idLower) && !deletedSet.has(khLower) && !deletedSet.has(lblLower);
    })
    .map((f) => {
      const idLower = f.id.toLowerCase().trim();
      const khLower = f.nameKh.toLowerCase().trim();
      const lblLower = f.label.toLowerCase().trim();
      const override =
        flavorOverrides[idLower] ||
        flavorOverrides[khLower] ||
        flavorOverrides[lblLower];

      const nameKh = override?.nameKh || f.nameKh;
      const nameEn = override?.nameEn !== undefined ? override.nameEn : f.nameEn;
      const label = nameEn ? `${nameKh} (${nameEn})` : nameKh;

      return {
        id: f.id,
        nameKh,
        nameEn,
        label,
        icon: f.icon || getFlavorEmoji(nameKh),
        isCustom: false,
      };
    });

  // 2. Process custom store flavors from flavors array
  if (flavors && flavors.length > 0) {
    flavors.forEach((fl, idx) => {
      const clean = fl.trim();
      if (!clean) return;
      const cleanLower = clean.toLowerCase();
      if (deletedSet.has(cleanLower)) return;

      // Check if this flavor matches any preset by label, kh, en, id, or keywords
      const exists = list.some((item) => {
        const itemLbl = item.label.toLowerCase();
        const itemKh = item.nameKh.toLowerCase();
        const itemEn = (item.nameEn || '').toLowerCase();
        const itemId = item.id.toLowerCase().replace('_', ' ');

        return (
          itemLbl === cleanLower ||
          itemKh === cleanLower ||
          cleanLower.includes(itemKh) ||
          (itemEn && cleanLower.includes(itemEn)) ||
          cleanLower.includes(itemId) ||
          (item.id === 'durian' && (cleanLower.includes('durian') || cleanLower.includes('ទុរេន') || cleanLower.includes('ធុរេន'))) ||
          (item.id === 'red_velvet' && (cleanLower.includes('velvet') || cleanLower.includes('រ៉េដ'))) ||
          (item.id === 'matcha' && (cleanLower.includes('matcha') || cleanLower.includes('តែបៃតង') || cleanLower.includes('green tea'))) ||
          (item.id === 'taro_coconut' && (cleanLower.includes('taro') || cleanLower.includes('ត្រាវ'))) ||
          (item.id === 'lotus_biscoff' && (cleanLower.includes('biscoff') || cleanLower.includes('ខារ៉ាមែល'))) ||
          (item.id === 'mango_passion' && (cleanLower.includes('mango') || cleanLower.includes('passion') || cleanLower.includes('ស្វាយ')))
        );
      });

      if (!exists) {
        // Parse Khmer and English parts if formatted as "ខ្មែរ (English)" or "English (ខ្មែរ)"
        let parsedKh = clean;
        let parsedEn = 'រសជាតិហាងថែម';

        const match = clean.match(/^([^(]+)\(([^)]+)\)$/);
        if (match) {
          const part1 = match[1].trim();
          const part2 = match[2].trim();
          // Check if part1 has Khmer characters (\u1780-\u17FF)
          if (/[\u1780-\u17FF]/.test(part1)) {
            parsedKh = part1;
            parsedEn = part2;
          } else if (/[\u1780-\u17FF]/.test(part2)) {
            parsedKh = part2;
            parsedEn = part1;
          } else {
            parsedKh = part1;
            parsedEn = part2;
          }
        }

        list.push({
          id: `store-fl-${idx}-${clean}`,
          nameKh: parsedKh,
          nameEn: parsedEn,
          icon: getFlavorEmoji(parsedKh),
          label: clean,
          isCustom: true,
        });
      }
    });
  }

  // 3. Mark out of stock based on unavailableFlavors list
  return list.map((item) => {
    const lbl = item.label.toLowerCase().trim();
    const id = item.id.toLowerCase().trim();
    const kh = item.nameKh.toLowerCase().trim();
    const en = (item.nameEn || '').toLowerCase().trim();

    const isOut = unavailableFlavors.some((u) => {
      const uClean = u.toLowerCase().trim();
      return (
        uClean === lbl ||
        uClean === id ||
        uClean === kh ||
        (en && uClean === en) ||
        lbl.includes(uClean) ||
        uClean.includes(lbl) ||
        uClean.includes(kh) ||
        (en && uClean.includes(en)) ||
        (item.id === 'durian' && (uClean.includes('durian') || uClean.includes('ទុរេន') || uClean.includes('ធុរេន'))) ||
        (item.id === 'red_velvet' && (uClean.includes('velvet') || uClean.includes('រ៉េដ'))) ||
        (item.id === 'matcha' && (uClean.includes('matcha') || uClean.includes('តែបៃតង') || uClean.includes('green tea'))) ||
        (item.id === 'taro_coconut' && (uClean.includes('taro') || uClean.includes('ត្រាវ'))) ||
        (item.id === 'lotus_biscoff' && (uClean.includes('biscoff') || uClean.includes('caramel') || uClean.includes('ខារ៉ាមែល'))) ||
        (item.id === 'mango_passion' && (uClean.includes('mango') || uClean.includes('passion') || uClean.includes('ស្វាយ') || uClean.includes('ផាសិន')))
      );
    });

    return {
      ...item,
      isAvailable: !isOut,
      isOutOfStock: isOut,
    };
  });
};
