export type ThemeCategory = 'all' | 'festival' | 'bakery' | 'pastel' | 'dark';

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
  category?: 'festival' | 'bakery' | 'pastel' | 'dark';
  seasonTagKh?: string;
  festiveBannerKh?: string;
  confettiColors?: string[];
  ambientMotif?: string;
}

export const APP_THEMES: AppTheme[] = [
  // ─── ✨ រដូវកាលពិធីបុណ្យជាតិ & ប្រពៃណី (Festival Seasons) ───
  {
    id: 'khmer-new-year',
    nameKh: 'ចូលឆ្នាំខ្មែរ មហាសង្ក្រាន្ត (Khmer New Year)',
    nameEn: 'Angkor Maha Sankranta Festive Gold',
    emoji: '🇰🇭',
    category: 'festival',
    seasonTagKh: '🎉 រដូវកាលសង្ក្រាន្តខ្មែរ',
    festiveBannerKh: '🎉 សួស្តីឆ្នាំថ្មីប្រពៃណីជាតិខ្មែរ! មហាសង្ក្រាន្តត្រជាក់ត្រជុំ សិរីសួស្តី ជ័យមង្គល និងសុភមង្គលគ្រប់ក្រុមគ្រួសារ',
    bgClass: 'bg-[#FFFDF3]',
    bgStyle: {
      background:
        'radial-gradient(circle at 12% 18%, rgba(245, 158, 11, 0.15) 0%, transparent 45%), radial-gradient(circle at 88% 82%, rgba(225, 29, 72, 0.08) 0%, transparent 48%), radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.07) 0%, transparent 60%), #FFFDF3',
    },
    previewBg: 'bg-gradient-to-br from-amber-400 via-orange-400 to-rose-500 border-amber-400 text-white',
    accentColor: '#D97706',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
    descriptionKh: 'បរិយាកាសចូលឆ្នាំថ្មីប្រពៃណីជាតិខ្មែរ ពណ៌មាសអង្គរចែងចាំង ផ្កាឈូក សិរីសួស្តី និងភាពសប្បាយរីករាយនៃមហាសង្ក្រាន្ត',
    confettiColors: ['#F59E0B', '#E11D48', '#10B981', '#3B82F6', '#FBBF24'],
    ambientMotif: '🎋',
  },
  {
    id: 'pchum-ben',
    nameKh: 'បុណ្យភ្ជុំបិណ្ឌ ផ្កាឈូកសួគ៌ា (Pchum Ben)',
    nameEn: 'Sacred Lotus & Jasmine Temple Blessings',
    emoji: '🪷',
    category: 'festival',
    seasonTagKh: '🪷 រដូវកាលកាន់បិណ្ឌ & ភ្ជុំបិណ្ឌ',
    festiveBannerKh: '🪷 រីករាយពិធីបុណ្យកាន់បិណ្ឌ និងភ្ជុំបិណ្ឌ សូមជួបតែបុណ្យកុសល សេចក្តីសុខសាន្ត នំអន្សមខ្មែរ និងសេចក្តីចម្រើន',
    bgClass: 'bg-[#FFFBF8]',
    bgStyle: {
      background:
        'radial-gradient(circle at 15% 15%, rgba(244, 114, 182, 0.12) 0%, transparent 42%), radial-gradient(circle at 85% 85%, rgba(245, 158, 11, 0.08) 0%, transparent 45%), radial-gradient(circle at 50% 25%, rgba(253, 242, 248, 0.6) 0%, transparent 65%), #FFFBF8',
    },
    previewBg: 'bg-gradient-to-br from-rose-300 via-pink-200 to-amber-100 border-rose-300',
    accentColor: '#DB2777',
    badgeClass: 'bg-rose-100 text-rose-900 border-rose-200 font-bold',
    descriptionKh: 'បរិយាកាសបុណ្យកុសល ស្ងប់ស្ងាត់ ពណ៌ផ្កាឈូកទន់ភ្លន់ ផ្កាម្លិះក្រអូប នំអន្សមខ្មែរ និងសេចក្តីសុខសាន្តផ្លូវចិត្ត',
    confettiColors: ['#F472B6', '#FBBF24', '#F43F5E', '#EDE9FE', '#FDE047'],
    ambientMotif: '🪷',
  },
  {
    id: 'chinese-new-year',
    nameKh: 'ចូលឆ្នាំចិន ហេង ហេង (Chinese New Year)',
    nameEn: 'Lunar New Year Fortune Red & Gold',
    emoji: '🧧',
    category: 'festival',
    seasonTagKh: '🧧 រដូវកាលចូលឆ្នាំចិន ហេង ហេង',
    festiveBannerKh: '🧧 រីករាយពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីចិន ហេង ហេង សំណាងល្អ ជោគជ័យ និងទ្រព្យសម្បត្តិហូរចូលពេញផ្ទះ!',
    bgClass: 'bg-[#FFF8F6]',
    bgStyle: {
      background:
        'radial-gradient(circle at 12% 18%, rgba(239, 68, 68, 0.13) 0%, transparent 42%), radial-gradient(circle at 88% 82%, rgba(245, 158, 11, 0.14) 0%, transparent 45%), radial-gradient(circle at 50% 50%, rgba(220, 38, 38, 0.05) 0%, transparent 60%), #FFF8F6',
    },
    previewBg: 'bg-gradient-to-br from-red-600 via-rose-500 to-amber-400 border-red-500 text-white',
    accentColor: '#DC2626',
    badgeClass: 'bg-red-100 text-red-950 border-red-300 font-bold',
    descriptionKh: 'ពណ៌ក្រហមអាំងប៉ាវនាំសំណាង គោមក្រហម និងមាសហុងស៊ុយ រកស៊ីមានបាន ហេងហេង ទ្រព្យសម្បត្តិហូរចូល',
    confettiColors: ['#EF4444', '#F59E0B', '#DC2626', '#FBBF24', '#B91C1C'],
    ambientMotif: '🏮',
  },
  {
    id: 'water-festival',
    nameKh: 'បុណ្យអុំទូក បណ្តែតប្រទីប (Water Festival)',
    nameEn: 'Cambodian Water & Moon Festival',
    emoji: '🚣',
    category: 'festival',
    seasonTagKh: '🚣 រដូវកាលបុណ្យអុំទូក',
    festiveBannerKh: '🚣 អបអរព្រះរាជពិធីបុណ្យអុំទូក បណ្តែតប្រទីប សំពះព្រះខែ និងអកអំបុក រីករាយគ្រប់ទិសទី',
    bgClass: 'bg-[#F0FDFB]',
    bgStyle: {
      background:
        'radial-gradient(circle at 18% 22%, rgba(6, 182, 212, 0.12) 0%, transparent 45%), radial-gradient(circle at 82% 78%, rgba(245, 158, 11, 0.10) 0%, transparent 45%), radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.06) 0%, transparent 60%), #F0FDFB',
    },
    previewBg: 'bg-gradient-to-br from-cyan-500 via-sky-500 to-amber-300 border-cyan-400 text-white',
    accentColor: '#0284C7',
    badgeClass: 'bg-cyan-100 text-cyan-950 border-cyan-300 font-bold',
    descriptionKh: 'ព្រះរាជពិធីបុណ្យអុំទូក បណ្តែតប្រទីប អកអំបុក និងសំពះព្រះខែ ពណ៌ទឹកទន្លេមេគង្គស្រស់ថ្លា និងពន្លឺប្រទីបចែងចាំងរាត្រី',
    confettiColors: ['#06B6D4', '#3B82F6', '#F59E0B', '#10B981', '#38BDF8'],
    ambientMotif: '🌕',
  },
  {
    id: 'international-new-year',
    nameKh: 'ឆ្លងឆ្នាំសកល & ជប់លៀង (Global New Year)',
    nameEn: 'Happy New Year Countdown & Fireworks',
    emoji: '🎉',
    category: 'festival',
    seasonTagKh: '🥂 រដូវកាលឆ្លងឆ្នាំ Countdown',
    festiveBannerKh: '🎉 រីករាយឆ្នាំថ្មីសកល Happy New Year! សុខភាពល្អ សំណាងល្អ និងជោគជ័យគ្រប់ភារកិច្ច',
    bgClass: 'bg-[#F8F7FF]',
    bgStyle: {
      background:
        'radial-gradient(circle at 15% 15%, rgba(124, 58, 237, 0.10) 0%, transparent 42%), radial-gradient(circle at 85% 85%, rgba(245, 158, 11, 0.12) 0%, transparent 45%), #F8F7FF',
    },
    previewBg: 'bg-gradient-to-br from-indigo-500 via-purple-500 to-amber-400 border-indigo-400 text-white',
    accentColor: '#7C3AED',
    badgeClass: 'bg-purple-100 text-purple-950 border-purple-200 font-bold',
    descriptionKh: 'បរិយាកាសឆ្លងឆ្នាំសកល រាត្រីកាំជ្រួច ស្រាសំប៉ាញ និងការជួបជុំអបអរសាទរឆ្នាំថ្មីយ៉ាងសប្បាយរីករាយ',
    confettiColors: ['#8B5CF6', '#F59E0B', '#EC4899', '#3B82F6', '#10B981'],
    ambientMotif: '✨',
  },

  // ─── 🧁 រចនាប័ទ្មបែបហាងនំ (Bakery Classic) ───
  {
    id: 'renahs-cake',
    nameKh: 'រ៉េណាហ៍ សូកូឡា & ស្ត្រប៊ែរី (Renah’s Cake)',
    nameEn: 'Renah’s Coral & Royal Chocolate (Pinterest)',
    emoji: '🎂',
    category: 'bakery',
    bgClass: 'bg-[#FFF7F4]',
    bgStyle: {
      background:
        'radial-gradient(circle at 10% 10%, rgba(230, 81, 77, 0.05) 0%, transparent 40%), radial-gradient(circle at 90% 90%, rgba(62, 32, 22, 0.04) 0%, transparent 40%), #FFF8F5',
    },
    previewBg: 'bg-gradient-to-br from-[#E6514D] via-[#FA6B67] to-[#361B14] border-[#E6514D]',
    accentColor: '#E6514D',
    badgeClass: 'bg-[#FFE8E6] text-[#8C1E1B] border-[#FFB3AF]',
    descriptionKh: 'រចនាបថតាម Pinterest: ពណ៌ក្រហមផ្កាឈូកស្ត្រប៊ែរី គួបផ្សំសូកូឡាប្រណិត និងស្លាកសេវាកម្មដ៏ស្រស់ស្អាត',
    confettiColors: ['#E6514D', '#FA6B67', '#FDE047', '#FDA4AF'],
  },
  {
    id: 'warm-cream',
    nameKh: 'ក្រែមនំបុ័ងកក់ក្តៅ (Bakery Cream)',
    nameEn: 'Warm Bakery Cream',
    emoji: '🧁',
    category: 'bakery',
    bgClass: 'bg-[#FAF8F5]',
    bgStyle: { backgroundColor: '#FAF8F5' },
    previewBg: 'bg-[#FAF8F5] border-amber-200',
    accentColor: '#E11D48',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-200',
    descriptionKh: 'ពណ៌ក្រែមបែបហាងនំអឺរ៉ុបបុរាណ កក់ក្តៅ ស្រទន់ភ្នែក និងមានផាសុកភាព',
    confettiColors: ['#F59E0B', '#FDE68A', '#E11D48'],
  },
  {
    id: 'cafe-latte',
    nameKh: 'កាហ្វេឡាតេបារាំង (French Latte)',
    nameEn: 'French Cafe Latte',
    emoji: '☕',
    category: 'bakery',
    bgClass: 'bg-[#F5EFEB]',
    bgStyle: { backgroundColor: '#F5EFEB' },
    previewBg: 'bg-[#F5EFEB] border-amber-300',
    accentColor: '#92400E',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    descriptionKh: 'រសជាតិកាហ្វេឡាតេ និងវ៉ានីឡាស្ងប់ស្ងាត់បែបហាងកាហ្វេបារាំងទំនើប',
    confettiColors: ['#92400E', '#D97706', '#FEF3C7'],
  },
  {
    id: 'luxury-gold',
    nameKh: 'មាសកុលាបប្រណិត (Champagne Gold)',
    nameEn: 'Luxury Champagne & Rose Gold',
    emoji: '✨',
    category: 'bakery',
    bgClass: 'bg-gradient-to-br from-[#FFFDF9] via-[#FAF6F0] to-[#F5EBE1]',
    bgStyle: { background: 'linear-gradient(135deg, #FFFDF9 0%, #FAF6F0 50%, #F5EBE1 100%)' },
    previewBg: 'bg-gradient-to-r from-amber-100 via-rose-100 to-amber-100 border-amber-300',
    accentColor: '#D97706',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    descriptionKh: 'ពណ៌មាសសំបូរទ្រព្យ និងស្រាសំប៉ាញលំដាប់ខ្ពស់ សាកសមបំផុតសម្រាប់ហាងនំទំនើប',
    confettiColors: ['#D97706', '#F59E0B', '#FDE68A', '#F43F5E'],
  },

  // ─── 🌸 ពណ៌ស្រស់ស្រាយធម្មជាតិ (Pastel Colors) ───
  {
    id: 'sakura-pink',
    nameKh: 'ផ្កាសាគូរ៉ាផ្កាឈូក (Sakura Pink)',
    nameEn: 'Sakura Blossom Pink',
    emoji: '🌸',
    category: 'pastel',
    bgClass: 'bg-gradient-to-br from-[#FFF0F5] via-[#FFF5F8] to-[#FCE7F3]/40',
    bgStyle: { background: 'linear-gradient(135deg, #FFF0F5 0%, #FFF5F8 50%, #FCE7F3 100%)' },
    previewBg: 'bg-gradient-to-r from-pink-100 to-rose-100 border-pink-300',
    accentColor: '#EC4899',
    badgeClass: 'bg-pink-100 text-pink-800 border-pink-200',
    descriptionKh: 'ផ្អែមល្ហែមបែបនំខេកខួបកំណើត និងផ្កាសាគូរ៉ារីកស្គុះស្គាយ',
    confettiColors: ['#EC4899', '#F472B6', '#FBCFE8'],
  },
  {
    id: 'matcha-green',
    nameKh: 'តែបៃតងម៉ាត់ឆា (Matcha Green)',
    nameEn: 'Matcha Green Tea',
    emoji: '🍵',
    category: 'pastel',
    bgClass: 'bg-gradient-to-br from-[#F0FDF4] via-[#F4FBF7] to-[#DCFCE7]/40',
    bgStyle: { background: 'linear-gradient(135deg, #F0FDF4 0%, #F4FBF7 60%, #DCFCE7 100%)' },
    previewBg: 'bg-gradient-to-r from-emerald-100 to-teal-100 border-emerald-300',
    accentColor: '#059669',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    descriptionKh: 'ពណ៌បៃតងធម្មជាតិស្រស់បំព្រង ជួយបន្ធូរភ្នែក និងផ្តល់អារម្មណ៍ស្រស់ស្រាយ',
    confettiColors: ['#059669', '#10B981', '#6EE7B7'],
  },
  {
    id: 'ocean-blue',
    nameKh: 'ខ្យល់សមុទ្រខៀវស្រាល (Ocean Sky)',
    nameEn: 'Ocean Breeze Sky Blue',
    emoji: '🌊',
    category: 'pastel',
    bgClass: 'bg-gradient-to-br from-[#F0F9FF] via-[#F5FAFF] to-[#E0F2FE]/40',
    bgStyle: { background: 'linear-gradient(135deg, #F0F9FF 0%, #F5FAFF 50%, #E0F2FE 100%)' },
    previewBg: 'bg-gradient-to-r from-sky-100 to-blue-100 border-sky-300',
    accentColor: '#0284C7',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
    descriptionKh: 'ពណ៌ផ្ទៃមេឃស្រឡះស្រទន់ ត្រជាក់ភ្នែក និងផ្តល់ថាមពលវិជ្ជមាន',
    confettiColors: ['#0284C7', '#38BDF8', '#BAE6FD'],
  },
  {
    id: 'royal-lavender',
    nameKh: 'ផ្កាឡាវេនឌ័រស្វាយខ្ចី (Royal Lavender)',
    nameEn: 'Royal Lavender Lilac',
    emoji: '💜',
    category: 'pastel',
    bgClass: 'bg-gradient-to-br from-[#FAF5FF] via-[#FBF7FF] to-[#F3E8FF]/40',
    bgStyle: { background: 'linear-gradient(135deg, #FAF5FF 0%, #FBF7FF 50%, #F3E8FF 100%)' },
    previewBg: 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-300',
    accentColor: '#9333EA',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
    descriptionKh: 'រចនាប័ទ្មផ្កាឡាវេនឌ័រទន់ភ្លន់ ថ្លៃថ្នូរ និងទាក់ទាញខ្លាំង',
    confettiColors: ['#9333EA', '#A855F7', '#E9D5FF'],
  },
  {
    id: 'sunset-peach',
    nameKh: 'ផ្លែប៉េសថ្ងៃលិច (Sunset Peach)',
    nameEn: 'Sunset Peach & Orange',
    emoji: '🍑',
    category: 'pastel',
    bgClass: 'bg-gradient-to-br from-[#FFF7ED] via-[#FFFBF5] to-[#FFEDD5]/40',
    bgStyle: { background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFBF5 50%, #FFEDD5 100%)' },
    previewBg: 'bg-gradient-to-r from-orange-100 to-amber-100 border-orange-300',
    accentColor: '#EA580C',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-200',
    descriptionKh: 'ពណ៌ទឹកក្រូចស្រាលផ្អែមល្ហែម និងផ្លែប៉េសទុំ នាំសំណាង និងភាពរស់រវើក',
    confettiColors: ['#EA580C', '#FB923C', '#FED7AA'],
  },

  // ─── 🌙 ពេលយប់ & OLED (Dark Mode) ───
  {
    id: 'midnight-dark',
    nameKh: 'រាត្រីរលោងប្រណិត (Midnight Noir)',
    nameEn: 'Midnight Noir Velvet Dark',
    emoji: '🌙',
    category: 'dark',
    bgClass: 'bg-[#0B0F19] text-slate-100',
    bgStyle: { backgroundColor: '#0B0F19' },
    previewBg: 'bg-gradient-to-r from-slate-900 to-slate-950 border-slate-700',
    accentColor: '#F43F5E',
    badgeClass: 'bg-slate-800 text-rose-400 border-slate-700',
    descriptionKh: 'Dark Mode ប្រណិត មិនចាំងភ្នែកពេលយប់ និងសន្សំថ្មទូរសព្ទ OLED បានយ៉ាងល្អ',
    dark: true,
    confettiColors: ['#F43F5E', '#818CF8', '#38BDF8'],
  },
];

export const THEME_STORAGE_KEY = 'bakery_pos_theme';

export function getSavedTheme(): AppTheme {
  try {
    const savedId = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedId && savedId !== 'warm-cream') {
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
