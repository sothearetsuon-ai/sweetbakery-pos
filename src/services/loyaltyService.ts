import { CompletedSale, CustomCakeOrder } from '../types';

export type LoyaltyTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND';

export interface CustomerLoyaltyProfile {
  phone: string;
  name: string;
  totalSpentUsd: number;
  totalSpentKhr: number;
  totalOrders: number;
  totalPointsEarned: number;
  pointsRedeemed: number;
  currentPoints: number;
  tier: LoyaltyTier;
  tierNameKh: string;
  tierBadgeColor: string;
  discountPercent: number; // Regular discount privilege for this tier
  lastVisitDate: string;
}

export const TIER_CONFIG: Record<
  LoyaltyTier,
  { nameKh: string; minPoints: number; color: string; discountPercent: number; perkKh: string }
> = {
  BRONZE: {
    nameKh: 'សំរឹទ្ធ (Bronze)',
    minPoints: 0,
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    discountPercent: 0,
    perkKh: 'សន្សំពិន្ទុរាល់ការទិញ',
  },
  SILVER: {
    nameKh: 'ប្រាក់ (Silver)',
    minPoints: 50,
    color: 'bg-slate-200 text-slate-800 border-slate-300',
    discountPercent: 5,
    perkKh: 'បញ្ចុះតម្លៃ 5% នៅថ្ងៃកំណើត',
  },
  GOLD: {
    nameKh: 'មាស (Gold)',
    minPoints: 200,
    color: 'bg-amber-400/20 text-amber-900 border-amber-400 font-bold',
    discountPercent: 8,
    perkKh: 'បញ្ចុះតម្លៃ 8% គ្រប់ការទិញ',
  },
  DIAMOND: {
    nameKh: 'ពេជ្រ (VIP Diamond)',
    minPoints: 500,
    color: 'bg-gradient-to-r from-cyan-100 to-blue-100 text-blue-900 border-cyan-300 font-black',
    discountPercent: 12,
    perkKh: 'បញ្ចុះតម្លៃ 12% + ថែមនំខួបកំណើតឥតគិតថ្លៃ',
  },
};

/**
 * Extract all unique customer loyalty profiles from sales & custom orders
 */
export function calculateCustomerLoyaltyProfiles(
  sales: CompletedSale[],
  customOrders: CustomCakeOrder[]
): CustomerLoyaltyProfile[] {
  const customerMap = new Map<string, {
    name: string;
    phone: string;
    totalSpentUsd: number;
    totalSpentKhr: number;
    totalOrders: number;
    lastVisitDate: string;
  }>();

  // Aggregate from sales
  for (const s of sales) {
    const rawPhone = (s.customerPhone || '').trim();
    if (!rawPhone || rawPhone.length < 6) continue;

    const existing = customerMap.get(rawPhone) || {
      name: s.customerName?.trim() || 'ភ្ញៀវទូទៅ',
      phone: rawPhone,
      totalSpentUsd: 0,
      totalSpentKhr: 0,
      totalOrders: 0,
      lastVisitDate: s.createdAt?.slice(0, 10) || '',
    };

    if (s.customerName?.trim()) {
      existing.name = s.customerName.trim();
    }
    existing.totalSpentUsd += s.totalUsd || 0;
    existing.totalSpentKhr += s.totalKhr || 0;
    existing.totalOrders += 1;
    if (s.createdAt && s.createdAt > existing.lastVisitDate) {
      existing.lastVisitDate = s.createdAt.slice(0, 10);
    }
    customerMap.set(rawPhone, existing);
  }

  // Aggregate from custom orders
  for (const o of customOrders) {
    const rawPhone = (o.phone || '').trim();
    if (!rawPhone || rawPhone.length < 6) continue;

    const existing = customerMap.get(rawPhone) || {
      name: o.customerName?.trim() || 'ភ្ញៀវកុម្ម៉ង់នំ',
      phone: rawPhone,
      totalSpentUsd: 0,
      totalSpentKhr: 0,
      totalOrders: 0,
      lastVisitDate: o.pickupDate || '',
    };

    if (o.customerName?.trim()) {
      existing.name = o.customerName.trim();
    }
    existing.totalSpentUsd += o.totalUsd || 0;
    existing.totalSpentKhr += o.totalKhr || (o.totalUsd * 4000);
    existing.totalOrders += 1;
    if (o.pickupDate && o.pickupDate > existing.lastVisitDate) {
      existing.lastVisitDate = o.pickupDate;
    }
    customerMap.set(rawPhone, existing);
  }

  // Calculate points: 1 USD = 1 Point
  const profiles: CustomerLoyaltyProfile[] = [];
  customerMap.forEach((cust) => {
    const totalPointsEarned = Math.floor(cust.totalSpentUsd);
    
    // Read redeemed points from localStorage
    let pointsRedeemed = 0;
    try {
      const redeemedMap = JSON.parse(localStorage.getItem('bakery_loyalty_redeemed_points') || '{}');
      pointsRedeemed = Number(redeemedMap[cust.phone] || 0);
    } catch (e) {}

    const currentPoints = Math.max(0, totalPointsEarned - pointsRedeemed);

    // Determine Tier
    let tier: LoyaltyTier = 'BRONZE';
    if (totalPointsEarned >= TIER_CONFIG.DIAMOND.minPoints) {
      tier = 'DIAMOND';
    } else if (totalPointsEarned >= TIER_CONFIG.GOLD.minPoints) {
      tier = 'GOLD';
    } else if (totalPointsEarned >= TIER_CONFIG.SILVER.minPoints) {
      tier = 'SILVER';
    }

    const tierMeta = TIER_CONFIG[tier];

    profiles.push({
      phone: cust.phone,
      name: cust.name,
      totalSpentUsd: Math.round(cust.totalSpentUsd * 100) / 100,
      totalSpentKhr: cust.totalSpentKhr,
      totalOrders: cust.totalOrders,
      totalPointsEarned,
      pointsRedeemed,
      currentPoints,
      tier,
      tierNameKh: tierMeta.nameKh,
      tierBadgeColor: tierMeta.color,
      discountPercent: tierMeta.discountPercent,
      lastVisitDate: cust.lastVisitDate || new Date().toISOString().slice(0, 10),
    });
  });

  // Sort by highest points first
  return profiles.sort((a, b) => b.currentPoints - a.currentPoints);
}

/**
 * Redeem loyalty points for a customer
 */
export function redeemCustomerPoints(phone: string, pointsToRedeem: number): boolean {
  if (!phone || pointsToRedeem <= 0) return false;
  try {
    const redeemedMap = JSON.parse(localStorage.getItem('bakery_loyalty_redeemed_points') || '{}');
    const existing = Number(redeemedMap[phone] || 0);
    redeemedMap[phone] = existing + pointsToRedeem;
    localStorage.setItem('bakery_loyalty_redeemed_points', JSON.stringify(redeemedMap));
    return true;
  } catch (e) {
    return false;
  }
}

