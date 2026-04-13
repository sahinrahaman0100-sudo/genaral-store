import { useLanguage } from '@/store';
import { translations, type TranslationKey } from '@/i18n/translations';

export function useTranslation() {
  const language = useLanguage();
  const t = (key: TranslationKey): string => translations[language][key];
  return { t, language };
}
