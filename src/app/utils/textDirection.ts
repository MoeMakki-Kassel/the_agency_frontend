/** First strong letter/script decides block direction (for prose + drop cap in RTL UI). */
export function textDirectionForContent(text: string | undefined | null): 'ltr' | 'rtl' {
  const trimmed = text?.trim();
  if (!trimmed) return 'ltr';

  for (const ch of trimmed) {
    if (/[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(ch)) {
      return 'rtl';
    }
    if (/[A-Za-z\u00C0-\u024F0-9]/.test(ch)) {
      return 'ltr';
    }
  }
  return 'ltr';
}
