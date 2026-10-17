/**
 * Flavor Utilities for Bakery POS & Customer Ordering
 */

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
