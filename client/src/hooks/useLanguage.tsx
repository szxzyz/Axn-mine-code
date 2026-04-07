import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

type Language = 'en' | 'hi' | 'ru' | 'fa' | 'ar' | 'tr' | 'es' | 'pt' | 'id' | 'ur' | 'bn' | 'fr' | 'de' | 'it' | 'zh' | 'ja' | 'ko';

export const SUPPORTED_LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ur', label: 'اردو', flag: '🇵🇰' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'id', label: 'Indonesia', flag: '🇮🇩' },
  { code: 'bn', label: 'বাংলা', flag: '🇧🇩' },
  { code: 'fa', label: 'فارسی', flag: '🇮🇷' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
];

// All visible strings in the app that should be translated
export const APP_STRINGS = [
  // Home page
  'Mining Power', 'Watch Ads to Boost Mining', 'Complete Tasks to Earn More',
  '24 HOURS OF VALIDITY', 'Daily Tasks', 'Open', 'Invite', 'Withdraw', 'Menu',
  'Mining Paused', 'You were inactive for 48 hours.', 'Open the app to resume mining.',
  'Resume Mining', 'Claim', 'Member since', 'Mining Paused',
  'You were inactive for 2 days. Mining has resumed now that you\'re back.',
  // Tasks
  'Tasks', 'Promoted Tasks', 'No promoted tasks', 'Completed', 'Back',
  'Start', 'Share', 'Locked', 'Watching...', 'Check-in', 'Claim',
  // Withdrawal
  'SAT Withdrawal', 'Available Balance', 'Destination address',
  "Don't have an address yet?", 'Amount (SAT)', 'Max', 'Withdraw Fee',
  'Min. Withdrawal', 'You Receive', 'Withdraw SAT', 'Close',
  'Almost There!', 'Watch ads to unlock your withdrawal.',
  'Ads keep this platform free for everyone. Thank you for your support!',
  'Progress',
  // Invite
  'Invite Friends', 'Earn', 'per friend', 'Total referrals', 'Active',
  'Copy Link', 'Referrals', 'Copied!', 'Refresh', 'No referrals yet',
  'Your referral link', 'Share Link',
  // Menu / Wallet
  'Wallet', 'Balance', 'History', 'Withdrawal History', 'No withdrawals yet',
  'Pending', 'Approved', 'Rejected', 'Mining Stats', 'Total Mined',
  'Rate', 'Check for Updates', 'Daily Check-in', 'Share with Friends',
  'Reward', 'Settings', 'Boosts', 'Active Boosts', 'No active boosts',
  // Settings
  'My UID', 'Contact Support', 'Legal Information', 'Terms & Conditions',
  'Privacy Policy', 'Acceptable Use Policy', 'Admin Panel',
  // Misc
  'Loading...', 'Error', 'Success', 'Copied to clipboard!',
  'Select Language', 'App Language', 'Watch', 'Wait', 'Check',
];

const BASE_TRANSLATIONS: Record<string, string> = {
  home: 'Home', shop: 'Shop', menu: 'Menu', settings: 'Settings',
  my_uid: 'My UID', language: 'Language', contact_support: 'Contact Support',
  legal_info: 'Legal Information', terms_conditions: 'Terms & Conditions',
  privacy_policy: 'Privacy Policy', acceptable_use: 'Acceptable Use Policy',
  copied: 'Copied to clipboard!', close: 'Close', axn_balance: 'AXN Balance',
  user_account: 'User Account', active: 'Active', user_uid: 'User UID',
  account_localization: 'Account & Localization', support_legal: 'Support & Legal',
  app_language: 'App Language', invite_friends: 'Invite Friends',
  earn_commissions: 'Earn Commissions', watch_ads: 'Watch Ads',
  daily_reward: 'Daily Reward', mining_status: 'Mining Status', rank: 'Rank',
  total_axn: 'Total AXN', total_usd: 'Total USD', mining_power: 'Mining Power',
  earn: 'Earn', referrals: 'Referrals', invite_friends_earn: 'Invite friends and earn',
  referral_desc_prefix: '10% of their AXN and When your friend buys a plan you get',
  referral_desc_suffix: 'instantly', user_referred: 'User referred',
  successful: 'Successful', copy_link: 'Copy Link', total_axn_mined: 'Total AXN Mined',
  total_ton_earned: 'Total TON Earned', mined_axn: 'MINED AXN', upgrade: 'UPGRADE',
  claim: 'CLAIM', convert: 'Convert', promo: 'Promo', back: 'Back',
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  tText: (text: string) => string;
  translateText: (text: string) => Promise<string>;
  isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

async function googleTranslateBulk(texts: string[], targetLang: string): Promise<string[]> {
  if (targetLang === 'en' || texts.length === 0) return texts;
  try {
    // Join with a unique separator that Google won't translate
    const SEPARATOR = ' ||||| ';
    const joined = texts.join(SEPARATOR);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(joined)}`;
    const res = await fetch(url);
    if (!res.ok) return texts;
    const data = await res.json();
    if (!data || !data[0]) return texts;
    // Reconstruct the full translated string from segments
    const fullTranslated = data[0].map((seg: any[]) => seg[0] || '').join('');
    const parts = fullTranslated.split(/\s*\|\|\|\|\|\s*/);
    // Align lengths
    return texts.map((orig, i) => parts[i]?.trim() || orig);
  } catch {
    return texts;
  }
}

async function googleTranslateSingle(text: string, targetLang: string): Promise<string> {
  if (targetLang === 'en' || !text.trim()) return text;
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) return text;
    const data = await res.json();
    return data?.[0]?.[0]?.[0] || text;
  } catch {
    return text;
  }
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try { return (localStorage.getItem('app_language') as Language) || 'en'; } catch { return 'en'; }
  });

  // Key-based cache: { lang -> { key -> translatedValue } }
  const keyCache = useRef<Record<string, Record<string, string>>>({ en: BASE_TRANSLATIONS });
  // Text-based cache: { lang -> { originalEnglish -> translated } }
  const textCache = useRef<Record<string, Record<string, string>>>({ en: {} });

  const [activeLang, setActiveLang] = useState<Language>(language);
  const [isTranslating, setIsTranslating] = useState(false);

  const loadAllTranslations = useCallback(async (lang: Language) => {
    if (lang === 'en') {
      keyCache.current['en'] = BASE_TRANSLATIONS;
      textCache.current['en'] = {};
      setActiveLang('en');
      return;
    }

    setIsTranslating(true);
    try {
      // ── 1. Key-based translations (for t()) ──
      if (!keyCache.current[lang]) {
        const stored = localStorage.getItem(`translations_${lang}`);
        if (stored) {
          keyCache.current[lang] = JSON.parse(stored);
        } else {
          const values = Object.values(BASE_TRANSLATIONS);
          const translated = await googleTranslateBulk(values, lang);
          const result: Record<string, string> = {};
          Object.keys(BASE_TRANSLATIONS).forEach((key, i) => {
            result[key] = translated[i] || values[i];
          });
          keyCache.current[lang] = result;
          try { localStorage.setItem(`translations_${lang}`, JSON.stringify(result)); } catch {}
        }
      }

      // ── 2. Text-based translations (for tText()) ──
      if (!textCache.current[lang]) {
        const stored = localStorage.getItem(`ttext_${lang}`);
        if (stored) {
          textCache.current[lang] = JSON.parse(stored);
        } else {
          const translated = await googleTranslateBulk(APP_STRINGS, lang);
          const result: Record<string, string> = {};
          APP_STRINGS.forEach((str, i) => {
            result[str] = translated[i] || str;
          });
          textCache.current[lang] = result;
          try { localStorage.setItem(`ttext_${lang}`, JSON.stringify(result)); } catch {}
        }
      }

      setActiveLang(lang);
    } catch {
      setActiveLang(lang);
    } finally {
      setIsTranslating(false);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try { localStorage.setItem('app_language', lang); } catch {}
    loadAllTranslations(lang);
  }, [loadAllTranslations]);

  React.useEffect(() => {
    loadAllTranslations(language);
  }, []);

  // Key-based lookup (for Settings keys)
  const t = useCallback((key: string): string => {
    const cache = keyCache.current[activeLang] || keyCache.current['en'] || {};
    return cache[key] || BASE_TRANSLATIONS[key] || key;
  }, [activeLang]);

  // Text-based lookup (for any hardcoded string)
  const tText = useCallback((text: string): string => {
    if (activeLang === 'en') return text;
    const cache = textCache.current[activeLang];
    return cache?.[text] || text;
  }, [activeLang]);

  const translateText = useCallback(async (text: string): Promise<string> => {
    if (language === 'en') return text;
    // Check text cache first
    const cache = textCache.current[language];
    if (cache?.[text]) return cache[text];
    const result = await googleTranslateSingle(text, language);
    if (!textCache.current[language]) textCache.current[language] = {};
    textCache.current[language][text] = result;
    return result;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tText, translateText, isTranslating }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
