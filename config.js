// =================================================================================
//  ملف الإعدادات (config.js)
//  يحتوي على كل الثوابت والإعدادات الخاصة بالتطبيق
// =================================================================================

/**
 * رابط تطبيق الويب المنشور على Google Apps Script
 * !!! مهم: استبدل هذا الرابط بالرابط الذي حصلت عليه بعد النشر !!!
 */
export const GOOGLE_SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbxKOq659JArM9wiTDFh0duQ6CydkYt5lYKHYpHxAsZX-b2LTr3tSbYpve4KV9eEc1RG/exec';

/**
 * نقاط النهاية للواجهات البرمجية (APIs )
 */
// ... (بقية الكود يبقى كما هو)
// =================================================================================
//  ملف الإعدادات (config.js)
//  يحتوي على كل الثوابت والإعدادات الخاصة بالتطبيق
// =================================================================================

/**
 * نقاط النهاية للواجهات البرمجية (APIs)
 */
export const API_ENDPOINTS = {
    pageText: (page) => `https://api.alquran.cloud/v1/page/${page}/quran-uthmani`,
    pageAudio: (page) => `https://api.alquran.cloud/v1/page/${page}/ar.alafasy`,
    tafsir: (surah, ayah) => `https://api.quran.com/api/v4/quran/tafsirs/1?verse_key=${surah}:${ayah}`
};