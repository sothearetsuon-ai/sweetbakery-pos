export interface AppTheme {
  id: string;
  nameKh: string;
  nameEn: string;
  emoji: string;
  bgClass: string;
  bgStyle?: React.CSSProperties;
  previewBg: string;
  accentColor: string;
  badgeClass: string;
  descriptionKh: string;
  dark?: boolean;
}

export const APP_THEMES: AppTheme[] = [
  {
    id: 'warm-cream',
    nameKh: 'ក្រែមនំបុ័ងកក់ក្តៅ (Bakery Cream)',
    nameEn: 'Warm Bakery Cream (Default)',
    emoji: '🧁',
    bgClass: 'bg-[#FAF8F5]',
    bgStyle: { backgroundColor: '#FAF8F5' },
    previewBg: 'bg-[#FAF8F5] border-amber-200',
    accentColor: '#E11D48',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-200',
    descriptionKh: 'ពណ៌ក្រែមបែបហាងនំអឺរ៉ុបបុរាណ កក់ក្តៅ ស្រទន់ភ្នែក និងមានផាសុកភាព',
  },
  {
    id: 'sakura-pink',
    nameKh: 'ផ្កាសាគូរ៉ាផ្កាឈូក (Sakura Pink)',
    nameEn: 'Sakura Blossom Pink',
    emoji: '🌸',
    bgClass: 'bg-gradient-to-br from-[#FFF0F5] via-[#FFF5F8] to-[#FCE7F3]/40',
    bgStyle: { background: 'linear-gradient(135deg, #FFF0F5 0%, #FFF5F8 50%, #FCE7F3 100%)' },
    previewBg: 'bg-gradient-to-r from-pink-100 to-rose-100 border-pink-300',
    accentColor: '#EC4899',
    badgeClass: 'bg-pink-100 text-pink-800 border-pink-200',
    descriptionKh: 'ផ្អែមល្ហែមបែបនំខេកខួបកំណើត និងផ្កាសាគូរ៉ារីកស្គុះស្គាយ',
  },
  {
    id: 'cafe-latte',
    nameKh: 'កាហ្វេឡាតេបារាំង (French Latte)',
    nameEn: 'French Cafe Latte',
    emoji: '☕',
    bgClass: 'bg-[#F5EFEB]',
    bgStyle: { backgroundColor: '#F5EFEB' },
    previewBg: 'bg-[#F5EFEB] border-amber-300',
    accentColor: '#92400E',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    descriptionKh: 'រសជាតិកាហ្វេឡាតេ និងវ៉ានីឡាស្ងប់ស្ងាត់បែបហាងកាហ្វេបារាំងទំនើប',
  },
  {
    id: 'matcha-green',
    nameKh: 'តែបៃតងម៉ាត់ឆា (Matcha Green)',
    nameEn: 'Matcha Green Tea',
    emoji: '🍵',
    bgClass: 'bg-gradient-to-br from-[#F0FDF4] via-[#F4FBF7] to-[#DCFCE7]/40',
    bgStyle: { background: 'linear-gradient(135deg, #F0FDF4 0%, #F4FBF7 60%, #DCFCE7 100%)' },
    previewBg: 'bg-gradient-to-r from-emerald-100 to-teal-100 border-emerald-300',
    accentColor: '#059669',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    descriptionKh: 'ពណ៌បៃតងធម្មជាតិស្រស់បំព្រង ជួយបន្ធូរភ្នែក និងផ្តល់អារម្មណ៍ស្រស់ស្រាយ',
  },
  {
    id: 'ocean-blue',
    nameKh: 'ខ្យល់សមុទ្រខៀវស្រាល (Ocean Sky)',
    nameEn: 'Ocean Breeze Sky Blue',
    emoji: '🌊',
    bgClass: 'bg-gradient-to-br from-[#F0F9FF] via-[#F5FAFF] to-[#E0F2FE]/40',
    bgStyle: { background: 'linear-gradient(135deg, #F0F9FF 0%, #F5FAFF 50%, #E0F2FE 100%)' },
    previewBg: 'bg-gradient-to-r from-sky-100 to-blue-100 border-sky-300',
    accentColor: '#0284C7',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
    descriptionKh: 'ពណ៌ផ្ទៃមេឃស្រឡះស្រទន់ ត្រជាក់ភ្នែក និងផ្តល់ថាមពលវិជ្ជមាន',
  },
  {
    id: 'royal-lavender',
    nameKh: 'ផ្កាឡាវេនឌ័រស្វាយខ្ចី (Royal Lavender)',
    nameEn: 'Royal Lavender Lilac',
    emoji: '💜',
    bgClass: 'bg-gradient-to-br from-[#FAF5FF] via-[#FBF7FF] to-[#F3E8FF]/40',
    bgStyle: { background: 'linear-gradient(135deg, #FAF5FF 0%, #FBF7FF 50%, #F3E8FF 100%)' },
    previewBg: 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-300',
    accentColor: '#9333EA',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
    descriptionKh: 'រចនាប័ទ្មផ្កាឡាវេនឌ័រទន់ភ្លន់ ថ្លៃថ្នូរ និងទាក់ទាញខ្លាំង',
  },
  {
    id: 'sunset-peach',
    nameKh: 'ផ្លែប៉េសថ្ងៃលិច (Sunset Peach)',
    nameEn: 'Sunset Peach & Orange',
    emoji: '🍑',
    bgClass: 'bg-gradient-to-br from-[#FFF7ED] via-[#FFFBF5] to-[#FFEDD5]/40',
    bgStyle: { background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFBF5 50%, #FFEDD5 100%)' },
    previewBg: 'bg-gradient-to-r from-orange-100 to-amber-100 border-orange-300',
    accentColor: '#EA580C',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-200',
    descriptionKh: 'ពណ៌ទឹកក្រូចស្រាលផ្អែមល្ហែម និងផ្លែប៉េសទុំ នាំសំណាង និងភាពរស់រវើក',
  },
  {
    id: 'luxury-gold',
    nameKh: 'មាសកុលាបប្រណិត (Champagne Gold)',
    nameEn: 'Luxury Champagne & Rose Gold',
    emoji: '✨',
    bgClass: 'bg-gradient-to-br from-[#FFFDF9] via-[#FAF6F0] to-[#F5EBE1]',
    bgStyle: { background: 'linear-gradient(135deg, #FFFDF9 0%, #FAF6F0 50%, #F5EBE1 100%)' },
    previewBg: 'bg-gradient-to-r from-amber-100 via-rose-100 to-amber-100 border-amber-300',
    accentColor: '#D97706',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    descriptionKh: 'ពណ៌មាសសំបូរទ្រព្យ និងស្រាសំប៉ាញលំដាប់ខ្ពស់ សាកសមបំផុតសម្រាប់ហាងនំទំនើប',
  },
  {
    id: 'midnight-dark',
    nameKh: 'រាត្រីរលោងប្រណិត (Midnight Noir)',
    nameEn: 'Midnight Noir Velvet Dark',
    emoji: '🌙',
    bgClass: 'bg-[#0B0F19] text-slate-100',
    bgStyle: { backgroundColor: '#0B0F19' },
    previewBg: 'bg-gradient-to-r from-slate-900 to-slate-950 border-slate-700',
    accentColor: '#F43F5E',
    badgeClass: 'bg-slate-800 text-rose-400 border-slate-700',
    descriptionKh: 'Dark Mode ប្រណិត មិនចាំងភ្នែកពេលយប់ និងសន្សំថ្មទូរសព្ទ OLED បានយ៉ាងល្អ',
    dark: true,
  },
];

export const THEME_STORAGE_KEY = 'bakery_pos_theme';

export function getSavedTheme(): AppTheme {
  try {
    const savedId = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedId) {
      const found = APP_THEMES.find((t) => t.id === savedId);
      if (found) return found;
    }
  } catch {}
  return APP_THEMES[0];
}

export function saveTheme(themeId: string): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
  } catch {}
}
