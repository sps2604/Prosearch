import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Language = "en" | "hi" | "bn" | "te" | "mr" | "ta" | "gu" | "kn" | "ml" | "pa";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const STRINGS: Record<Language, Record<string, string>> = {
  en: {
    settings: "Settings",
    account: "Account",
    viewProfile: "View Profile",
    editProfile: "Edit Profile",
    deleteProfile: "Delete Profile",
    additional: "Additional Settings",
    theme: "Theme",
    language: "Language",
    light: "Light",
    dark: "Dark",
    system: "System",
    confirmDelete: "Are you sure you want to delete your profile? This cannot be undone.",
  },
  hi: {
    settings: "सेटिंग्स",
    account: "खाता",
    viewProfile: "प्रोफ़ाइल देखें",
    editProfile: "प्रोफ़ाइल संपादित करें",
    deleteProfile: "प्रोफ़ाइल हटाएँ",
    additional: "अतिरिक्त सेटिंग्स",
    theme: "थीम",
    language: "भाषा",
    light: "लाइट",
    dark: "डार्क",
    system: "सिस्टम",
    confirmDelete: "क्या आप वाकई अपनी प्रोफ़ाइल हटाना चाहते हैं? यह वापस नहीं किया जा सकता।",
  },
  bn: { settings: "সেটিংস", account: "অ্যাকাউন্ট", viewProfile: "প্রোফাইল দেখুন", editProfile: "প্রোফাইল সম্পাদনা", deleteProfile: "প্রোফাইল মুছুন", additional: "অতিরিক্ত সেটিংস", theme: "থিম", language: "ভাষা", light: "লাইট", dark: "ডার্ক", system: "সিস্টেম", confirmDelete: "আপনি কি নিশ্চিত প্রোফাইল মুছতে চান?" },
  te: { settings: "సెట్టింగ్స్", account: "ఖాతా", viewProfile: "ప్రొఫైల్ చూడండి", editProfile: "ప్రొఫైల్ సవరించండి", deleteProfile: "ప్రొఫైల్ తొలగించండి", additional: "అదనపు సెట్టింగ్స్", theme: "థీమ్", language: "భాష", light: "లైట్", dark: "డార్క్", system: "సిస్టమ్", confirmDelete: "మీ ప్రొఫైల్ తొలగించాలా?" },
  mr: { settings: "सेटिंग्स", account: "खाते", viewProfile: "प्रोफाइल पाहा", editProfile: "प्रोफाइल संपादा", deleteProfile: "प्रोफाइल हटवा", additional: "अतिरिक्त सेटिंग्स", theme: "थीम", language: "भाषा", light: "लाइट", dark: "डार्क", system: "सिस्टम", confirmDelete: "प्रोफाइल हटवायचे का?" },
  ta: { settings: "அமைப்புகள்", account: "கணக்கு", viewProfile: "சுயவிவரம் பார்க்க", editProfile: "சுயவிவரம் திருத்த", deleteProfile: "சுயவிவரம் நீக்கு", additional: "கூடுதல் அமைப்புகள்", theme: "தீம்", language: "மொழி", light: "லைட்", dark: "டார்க்", system: "சிஸ்டம்", confirmDelete: "சுயவிவரத்தை நீக்கவா?" },
  gu: { settings: "સેટિંગ્સ", account: "એકાઉન્ટ", viewProfile: "પ્રોફાઇલ જુઓ", editProfile: "પ્રોફાઇલ સંપાદિત કરો", deleteProfile: "પ્રોફાઇલ કાઢી નાખો", additional: "વધારાની સેટિંગ્સ", theme: "થીમ", language: "ભાષા", light: "લાઇટ", dark: "ડાર્ક", system: "સિસ્ટમ", confirmDelete: "પ્રોફાઇલ દૂર કરવી છે?" },
  kn: { settings: "ಸೆಟ್ಟಿಂಗ್ಸ್", account: "ಖಾತೆ", viewProfile: "ಪ್ರೊಫೈಲ್ ನೋಡಿ", editProfile: "ಪ್ರೊಫೈಲ್ ಸಂಪಾದಿಸಿ", deleteProfile: "ಪ್ರೊಫೈಲ್ ಅಳಿಸಿ", additional: "ಹೆಚ್ಚುವರಿ ಸೆಟ್ಟಿಂಗ್ಸ್", theme: "ಥೀಮ್", language: "ಭಾಷೆ", light: "ಲೈಟ್", dark: "ಡಾರ್ಕ್", system: "ಸಿಸ್ಟಮ್", confirmDelete: "ಪ್ರೊಫೈಲ್ ಅಳಿಸಬೇಕೆ?" },
  ml: { settings: "ക്രമീകരണങ്ങൾ", account: "അക്കൗണ്ട്", viewProfile: "പ്രൊഫൈൽ കാണുക", editProfile: "പ്രൊഫൈൽ തിരുത്തുക", deleteProfile: "പ്രൊഫൈൽ ഇല്ലാതാക്കുക", additional: "അധിക ക്രമീകരണങ്ങൾ", theme: "തീം", language: "ഭാഷ", light: "ലൈറ്റ്", dark: "ഡാർക്ക്", system: "സിസ്റ്റം", confirmDelete: "പ്രൊഫൈൽ ഇല്ലാതാക്കണോ?" },
  pa: { settings: "ਸੈਟਿੰਗਾਂ", account: "ਖਾਤਾ", viewProfile: "ਪ੍ਰੋਫਾਈਲ ਵੇਖੋ", editProfile: "ਪ੍ਰੋਫਾਈਲ ਸੋਧੋ", deleteProfile: "ਪ੍ਰੋਫਾਈਲ ਮਿਟਾਓ", additional: "ਵਾਧੂ ਸੈਟਿੰਗਾਂ", theme: "ਥੀਮ", language: "ਭਾਸ਼ਾ", light: "ਲਾਈਟ", dark: "ਡਾਰਕ", system: "ਸਿਸਟਮ", confirmDelete: "ਪ੍ਰੋਫਾਈਲ ਮਿਟਾਉਣੀ ਹੈ?" },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem("ps-language");
    const allowed = ["en","hi","bn","te","mr","ta","gu","kn","ml","pa"];
    return (allowed.includes(stored || "") ? (stored as Language) : "en");
  });

  useEffect(() => {
    localStorage.setItem("ps-language", language);
    try { document.documentElement.lang = language; } catch {}
  }, [language]);

  const t = useMemo(() => {
    const dict = STRINGS[language];
    return (key: string) => dict[key] ?? key;
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, t }), [language, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextType {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}


