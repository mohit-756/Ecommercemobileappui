import { useLanguage } from '../contexts/LanguageContext';

export function useTranslation() {
  const { t, language, setLanguage } = useLanguage();
  return { t, currentLanguage: language, setLanguage };
}
