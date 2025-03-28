import * as Localization from 'expo-localization';
import { useEffect, useState } from 'react';
export const isCroatian = () => {
  const [isCroatian, setIsCroatian] = useState<boolean>(false);

  useEffect(() => {
    const systemLocales = Localization.getLocales();
    const targetLanguageCodes = ['hr', 'bs', 'sr', 'me'];

    // Ensure that languageCode is not null
    const languageCode = systemLocales[0]?.languageCode;

    if (languageCode) {
      const hasCroatianLocale = targetLanguageCodes.includes(languageCode);
      setIsCroatian(hasCroatianLocale);
    }
  }, []);

  return isCroatian;
};