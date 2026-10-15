import { en } from './en';
import { am } from './am';
const overrides: Record<string,string> = {
  'Pitches & Courts':'ሜዳዎችና ኮርቶች', 'Verified':'የተረጋገጠ',
  '50+ Verified Sports Venues in Ethiopia':'በኢትዮጵያ ከ50 በላይ የተረጋገጡ የስፖርት ማዕከላት',
  'Find & Book':'ያግኙ እና ያስይዙ', 'Sports Fields':'የስፖርት ሜዳዎች', 'in Ethiopia':'በኢትዮጵያ',
  'Real-time slot synchronization, certified AI camera tracking, and instant mobile payment via Telebirr or CBE Birr.':'ወቅታዊ የሰዓት ማመሳሰል፣ የተረጋገጠ የኤአይ ካሜራ ክትትል እና በቴሌብር ወይም ሲቢኢ ብር ፈጣን ክፍያ።',
  'Clear':'አጽዳ', 'All Cities':'ሁሉም ከተሞች', 'All Sports':'ሁሉም ስፖርቶች', 'Features:':'አገልግሎቶች፦', 'Reset Filters':'ማጣሪያዎችን አጥፋ', 'Showing':'የሚታዩ', 'venues':'ማዕከላት', 'Sort:':'ደርድር፦',
  'Recommended (Best Match)':'የሚመከሩ (ተስማሚ)', 'Highest Rated (5.0 → 1.0)':'ከፍተኛ ደረጃ (5.0 → 1.0)', 'Most Popular (Reviews)':'ተወዳጅ (በግምገማ)', 'Most Available Fields':'ብዙ ሜዳዎች ያሏቸው',
  'ULS Verified':'በULS የተረጋገጠ', 'AI Camera (Veo)':'የኤአይ ካሜራ (Veo)', 'ETB':'ብር', '/ hour':'/ ሰዓት', 'reviews)':'ግምገማዎች)', 'Available Fields':'ያሉ ሜዳዎች', 'AI Replay':'የኤአይ ድጋሚ እይታ', 'Referee':'ዳኛ', 'Floodlights':'መብራቶች', 'Lockers':'መቀየሪያዎች', 'Telebirr':'ቴሌብር',
  'No Stadiums Match Your Filter Criteria':'ከማጣሪያዎቹ ጋር የሚስማማ ማዕከል የለም',
  "We couldn't find any venues matching your selected sport, city, and feature combinations. Try resetting filters to see all available fields.":'ከመረጡት ስፖርት፣ ከተማና አገልግሎቶች ጋር የሚስማማ ማዕከል አልተገኘም። ሁሉንም ለማየት ማጣሪያዎችን ያጥፉ።',
  'Reset All Filters':'ሁሉንም ማጣሪያዎች አጥፋ', 'Are You a Stadium or Field Owner?':'የስታዲየም ወይም የሜዳ ባለቤት ነዎት?',
  "Join Ethiopia's smart sports infrastructure network. Increase your bookings by 40% with real-time scheduling and an official microsite.":'የኢትዮጵያን ዘመናዊ የስፖርት አውታረ መረብ ይቀላቀሉ። በወቅታዊ መርሃ ግብርና በይፋዊ ድረ ገጽ ማስያዣዎችን በ40% ያሳድጉ።',
  'Register Your Stadium Free':'ማዕከልዎን በነፃ ያስመዝግቡ', 'View Owner Plans':'የባለቤት ዕቅዶችን ይመልከቱ',
  'ULS Certified Facility':'በULS የተረጋገጠ ማዕከል', 'Reserve a Pitch':'ሜዳ ያስይዙ', 'Total Bookings':'ጠቅላላ ማስያዣዎች', 'Multi-Sport Courts':'የተለያዩ ስፖርቶች ሜዳዎች', 'Active Players':'ንቁ ተጫዋቾች', 'Autonomous Stream':'ራስ-ሰር ስርጭት', 'Field Selection':'የሜዳ ምርጫ',
  'All fields include free access to locker rooms, fresh water stations, and automated match recording.':'ሁሉም ሜዳዎች ነፃ መቀየሪያዎችን፣ ውሃና ራስ-ሰር የጨዋታ ቀረጻን ያካትታሉ።',
  'Surface:':'ወለል፦', 'Night Game Floodlights':'የሌሊት ጨዋታ መብራቶች', '4K AI Camera Recording':'የ4K ኤአይ ካሜራ ቀረጻ', 'Autonomous 4K Broadcasting':'ራስ-ሰር የ4K ስርጭት', 'Sign In to View Your Match Video':'የጨዋታ ቪዲዮዎን ለማየት ይግቡ', '4K Replay':'የ4K ድጋሚ እይታ', 'views':'እይታዎች', 'Community Leagues':'የማህበረሰብ ሊጎች',
  'Register your team or corporate group for organized weekend cups.':'ቡድንዎን ወይም የድርጅት ቡድንዎን ለሳምንት መጨረሻ ውድድሮች ያስመዝግቡ።', 'Register Team':'ቡድን ያስመዝግቡ', 'ET Smart Fields ·':'ET Smart Fields ·',
  '100% Guaranteed Slot Sync':'100% የተረጋገጠ የሰዓት ማመሳሰል',
  'Our real-time database locks your booked time slot the millisecond payment is confirmed. Zero double-booking risk.':'ክፍያ ሲረጋገጥ የውሂብ ማከማቻችን ያስያዙትን ሰዓት ይቆልፋል። ድርብ ማስያዝ አይኖርም።',
  'Certified AI Cameras':'የተረጋገጡ የኤአይ ካሜራዎች',
  'Look for the camera badge on stadiums equipped with 4K autonomous match tracking and automatic highlight reels.':'የ4K ራስ-ሰር ጨዋታ ክትትልና የትዕይንት ቀረጻ ያላቸውን ማዕከላት በካሜራ ምልክት ይለዩ።',
  'Native Ethiopian Payments':'የኢትዮጵያ የክፍያ አማራጮች',
  'Pay instantly with Telebirr, CBE Birr, or Chapa. Automated digital receipts sent via SMS and WhatsApp.':'በቴሌብር፣ ሲቢኢ ብር ወይም ቻፓ ይክፈሉ። ዲጂታል ደረሰኞች በኤስኤምኤስና በዋትስአፕ ይላካሉ።',
  'Search stadium name, Bole, Kirkos, Hawassa...':'የማዕከል ስም፣ ቦሌ፣ ቂርቆስ፣ ሐዋሳ ይፈልጉ...',
};
const existing = Object.fromEntries(Object.entries(en).map(([key,value])=>[value,am[key as keyof typeof en]]));
export const originalAm: Record<string,string> = {...existing,...overrides};
export function originalCopy(locale: string, english: string) { return locale === 'am' ? originalAm[english] || english : english; }
