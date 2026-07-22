import { Language } from '../types';

/**
 * Utility function to get localized text for bilingual object models.
 * Strictly guarantees ZERO Bengali text is returned when language is English.
 */
export function getLocalizedText(
  item: any,
  field: string,
  lang: Language
): string {
  if (!item) return '';

  const bnKey = `${field}Bn`;
  const enKey = `${field}En`;

  const bnVal = item[bnKey] || (field === 'title' && item.title) || (field === 'description' && item.description) || (field === 'content' && item.content) || (field === 'location' && item.location) || (field === 'name' && item.name) || (field === 'designation' && item.designation) || '';
  const enVal = item[enKey] || '';

  if (lang === 'bn') {
    return bnVal || enVal || '';
  } else {
    // English mode
    if (enVal && enVal.trim().length > 0) {
      return enVal;
    }
    // If enVal is not provided, check if bnVal is actually non-Bengali text (e.g. proper nouns or numbers)
    if (bnVal && !/[\u0980-\u09FF]/.test(bnVal)) {
      return bnVal;
    }
    // Strict English rule: Never return Bengali characters in English mode
    return 'Translation unavailable';
  }
}
