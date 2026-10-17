import { CustomCakeOrder } from '../types';

export interface BirthdayCustomer {
  customerId: string;
  customerName: string;
  customerPhone: string;
  originalOrderDate: string; // YYYY-MM-DD
  originalPickupDate: string; // YYYY-MM-DD
  inscription?: string;
  cakeName?: string;
  flavor?: string;
  birthdayDateThisYear: string; // YYYY-MM-DD
  daysUntilBirthday: number; // e.g. 0 = today, 3 = in 3 days, -2 = 2 days ago
  isUpcoming: boolean;
  isToday: boolean;
  suggestedGreetingKh: string;
  suggestedPromoCode: string;
}

/**
 * Scan all historical custom cake orders and extract customer birthday profiles
 */
export function extractUpcomingBirthdays(
  orders: CustomCakeOrder[],
  windowDays = 14
): BirthdayCustomer[] {
  const customerMap = new Map<string, BirthdayCustomer>();
  const today = new Date();
  const currentYear = today.getFullYear();

  for (const order of orders) {
    if (!order.phone || !order.customerName) continue;
    // Check if order was likely a birthday order
    const isBirthdayOrder =
      (order.cakeName || '').toLowerCase().includes('birthday') ||
      (order.cakeName || '').includes('ខួប') ||
      (order.inscription || '').toLowerCase().includes('birthday') ||
      (order.inscription || '').includes('ខួប') ||
      (order.inscription || '').includes('កំណើត') ||
      order.orderType === 'CAKE';

    if (!isBirthdayOrder || !order.pickupDate) continue;

    // The pickup date of the cake is typically the birthday celebration date
    const pickupParts = order.pickupDate.split('-');
    if (pickupParts.length < 3) continue;

    const bMonth = parseInt(pickupParts[1], 10) - 1; // 0-indexed
    const bDay = parseInt(pickupParts[2], 10);

    // Calculate birthday date in current year
    const bdayThisYear = new Date(currentYear, bMonth, bDay);
    const diffTime = bdayThisYear.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // If within window (e.g. from -1 to windowDays in future)
    if (diffDays >= -2 && diffDays <= windowDays) {
      const isToday = diffDays === 0;
      const isUpcoming = diffDays > 0;

      const suggestedPromoCode = `BDAY${currentYear}`;
      const suggestedGreetingKh = `🎂 **សួស្តីបង ${order.customerName}!**\n\n` +
        `ហាង Sweet Bakery សូមជូនពរថ្ងៃខួបកំណើតឱ្យបង (និងមនុស្សជាទីស្រឡាញ់) ជួបតែសេចក្តីសុខ សុខភាពល្អ និងជោគជ័យគ្រប់ភារកិច្ច! 🎉✨\n\n` +
        `🎁 ពិសេសសម្រាប់ខួបកំណើតឆ្នាំនេះ ហាងយើងខ្ញុំសូមជូនកាដូប័ណ្ណបញ្ចុះតម្លៃពិសេស **10%** (កូដ៖ \`${suggestedPromoCode}\`) លើគ្រប់ការកុម្ម៉ង់នំខេកខួបកំណើតទាំងអស់!\n\n` +
        `📍 បងអាចកុម្ម៉ង់ទុកជាមុនបានតាមរយៈ Link នេះ៖ https://sothearetsuon-ai.github.io/sweetbakery-pos/?order=true\n` +
        `សូមអរគុណច្រើនបាទ/ចាស! ❤️`;

      customerMap.set(order.phone, {
        customerId: order.phone,
        customerName: order.customerName,
        customerPhone: order.phone,
        originalOrderDate: order.createdAt || order.pickupDate || '',
        originalPickupDate: order.pickupDate,
        inscription: order.inscription,
        cakeName: order.cakeName,
        flavor: order.flavor,
        birthdayDateThisYear: bdayThisYear.toISOString().slice(0, 10),
        daysUntilBirthday: diffDays,
        isUpcoming,
        isToday,
        suggestedGreetingKh,
        suggestedPromoCode,
      });
    }
  }

  return Array.from(customerMap.values()).sort(
    (a, b) => a.daysUntilBirthday - b.daysUntilBirthday
  );
}
