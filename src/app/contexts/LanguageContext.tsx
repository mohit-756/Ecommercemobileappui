import React, { createContext, useContext, useState, useEffect } from 'react';

export const translations = {
  'English (US)': {
    // Settings Page
    settings: 'Settings',
    preferences: 'Preferences',
    notifications: 'Notifications',
    darkMode: 'Dark Mode',
    language: 'Language',
    security: 'Security',
    privacySecurity: 'Privacy & Security',
    system: 'System',
    clearCache: 'Clear Cache',
    version: 'Version',
    build: 'Build',
    account: 'Account',
    editProfile: 'Edit Profile',
    
    // Support Page
    helpSupport: 'Help & Support',
    howCanWeHelp: 'How can we help?',
    howCanWeHelpDesc: 'Our support team is available to assist you with any questions or issues.',
    liveChat: 'Live Chat',
    liveChatDesc: 'Typical response time: 2 mins',
    callSupport: 'Call Support',
    callSupportDesc: 'Mon-Fri, 9am - 6pm',
    emailUs: 'Email Us',
    emailUsDesc: 'support@dryfruithub.com',
    commonTopics: 'Common Topics',
    refundPolicy: 'Refund Policy',
    shippingInfo: 'Shipping Information',
    termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy Policy',

    // Cart Page
    myCart: 'My Cart',
    items: 'items',
    cartEmpty: 'Your cart is empty',
    cartEmptyDesc: "Looks like you haven't added anything yet.",
    shopNow: 'Shop Now',
    promoCode: 'Enter promo code',
    apply: 'Apply',
    deliveryInstructions: 'Delivery Instructions',
    dontRingBell: "Don't ring bell",
    leaveAtGate: 'Leave at gate',
    leaveWithGuard: 'Leave with guard',
    avoidCalling: 'Avoid calling',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    tax: 'Tax (Estimated)',
    total: 'Total',
    proceedToCheckout: 'Proceed to Checkout',

    // Wishlist Page
    myWishlist: 'My Wishlist',
    wishlistEmpty: 'Your wishlist is empty',
    wishlistEmptyDesc: 'Save items you love to find them later!',
    exploreProducts: 'Explore Products',

    // Profile Page
    profile: 'Profile',
    orders: 'Orders',
    reviews: 'Reviews',
    saved: 'Saved',
    myOrders: 'My Orders',
    shippingAddresses: 'Shipping Addresses',
    paymentMethods: 'Payment Methods',
    logout: 'Logout',
  },
  'Hindi (हिन्दी)': {
    // Settings Page
    settings: 'सेटिंग्स',
    preferences: 'पसंद',
    notifications: 'सूचनाएं',
    darkMode: 'डार्क मोड',
    language: 'भाषा',
    security: 'सुरक्षा',
    privacySecurity: 'गोपनीयता और सुरक्षा',
    system: 'सिस्टम',
    clearCache: 'कैश साफ करें',
    version: 'संस्करण',
    build: 'बिल्ड',
    account: 'खाता',
    editProfile: 'प्रोफ़ाइल संपादित करें',

    // Support Page
    helpSupport: 'मदद और सहायता',
    howCanWeHelp: 'हम आपकी कैसे मदद कर सकते हैं?',
    howCanWeHelpDesc: 'हमारा सहायता दल किसी भी प्रश्न या समस्या के लिए आपकी सहायता के लिए उपलब्ध है।',
    liveChat: 'लाइव चैट',
    liveChatDesc: 'सामान्य प्रतिक्रिया समय: 2 मिनट',
    callSupport: 'कॉल सहायता',
    callSupportDesc: 'सोम-शुक्र, सुबह 9 - शाम 6 बजे',
    emailUs: 'हमें ईमेल करें',
    emailUsDesc: 'support@dryfruithub.com',
    commonTopics: 'सामान्य विषय',
    refundPolicy: 'वापसी नीति',
    shippingInfo: 'शिपिंग की जानकारी',
    termsOfService: 'सेवा की शर्तें',
    privacyPolicy: 'गोपनीयता नीति',

    // Cart Page
    myCart: 'मेरा कार्ट',
    items: 'सामान',
    cartEmpty: 'आपका कार्ट खाली है',
    cartEmptyDesc: 'ऐसा लगता है कि आपने अभी तक कुछ नहीं जोड़ा है।',
    shopNow: 'अभी खरीदें',
    promoCode: 'प्रोमो कोड दर्ज करें',
    apply: 'लागू करें',
    deliveryInstructions: 'डिलिवरी निर्देश',
    dontRingBell: 'घंटी न बजाएं',
    leaveAtGate: 'गेट पर छोड़ दें',
    leaveWithGuard: 'गार्ड के पास छोड़ दें',
    avoidCalling: 'कॉल करने से बचें',
    subtotal: 'उप-योग',
    shipping: 'शिपिंग',
    tax: 'कर (अनुमानित)',
    total: 'कुल योग',
    proceedToCheckout: 'चेकआउट के लिए आगे बढ़ें',

    // Wishlist Page
    myWishlist: 'मेरी विशलिस्ट',
    wishlistEmpty: 'आपकी विशलिस्ट खाली है',
    wishlistEmptyDesc: 'अपनी पसंद के सामान को बाद में खोजने के लिए सहेजें!',
    exploreProducts: 'उत्पादों का अन्वेषण करें',

    // Profile Page
    profile: 'प्रोफाइल',
    orders: 'ऑर्डर',
    reviews: 'समीक्षाएं',
    saved: 'सहेजे गए',
    myOrders: 'मेरे ऑर्डर',
    shippingAddresses: 'शिपिंग पते',
    paymentMethods: 'भुगतान के तरीके',
    logout: 'लॉगआउट',
  }
};

export type Language = 'English (US)' | 'Hindi (हिन्दी)';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['English (US)']) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('settings_lang') as Language) || 'English (US)';
  });

  const setLanguage = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('settings_lang', newLang);
  };

  // Keep state in sync if localStorage changes externally
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'settings_lang') {
        const val = e.newValue as Language;
        if (val === 'English (US)' || val === 'Hindi (हिन्दी)') {
          setLang(val);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const t = (key: keyof typeof translations['English (US)']) => {
    const currentLang = translations[lang] || translations['English (US)'];
    return currentLang[key] || translations['English (US)'][key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language: lang, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
