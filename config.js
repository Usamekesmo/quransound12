// =================================================================================
//  ملف الإعدادات (config.js)
//  يحتوي على كل الثوابت والإعدادات الخاصة بالتطبيق
// =================================================================================

/**
 * رابط تطبيق الويب المنشور على Google Apps Script
 * !!! مهم: استبدل هذا الرابط بالرابط الذي حصلت عليه بعد النشر !!!
 */
export const GOOGLE_SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbxsr5byAG0z8zXKHxKXEM9s4v9YnpTL0C_Xf2daJfRJLD1pFZq36c8wB6WNp8K6LSsR/exec'; // <--- استبدل هذا

/**
 * نقاط النهاية للواجهات البرمجية (APIs ) لجلب بيانات القرآن
 */
export const API_ENDPOINTS = {
    pageText: (page) => `https://api.alquran.cloud/v1/page/${page}/quran-uthmani`,
    pageAudio: (page ) => `https://api.alquran.cloud/v1/page/${page}/ar.alafasy`,
    tafsir: (surah, ayah ) => `https://api.quran.com/api/v4/quran/tafsirs/1?verse_key=${surah}:${ayah}`
};

/**
 * إعدادات الاختبار
 */
export const QUIZ_CONFIG = {
    defaultQuestionsCount: 10,
    questionTypes: [
        'chooseNext', 
        'choosePrevious', 
        'locateAyah', 
        'completeAyah', 
        'completeLastWord', 
        'linkStartEnd'
    ]
};

/**
 * إعدادات نظام التحفيز (نقاط الخبرة، المستويات، الإنجازات )
 */
export const MOTIVATION_CONFIG = {
    levels: [0, 100, 250, 500, 1000, 2000, 4000, 8000, 16000, 32000], // نقاط الخبرة المطلوبة لكل مستوى
    titles: [
        "مبتدئ", "سالك في الدرب", "مجتهد", "صاحب همة", "رفيق القرآن", 
        "متقن", "حافظ", "خبير", "حجة", "شيخ القراء"
    ],
    achievements: {
        firstTest: { unlocked: false, title: "أول خطوة" },
        tenTests: { unlocked: false, title: "مثابر" },
        perfectScore: { unlocked: false, title: "متقن" },
        fivePerfect: { unlocked: false, title: "خبير" },
        sendChallenge: { unlocked: false, title: "المتحدي" }
    },
    dailyRewards: [
        { type: 'xp', value: 50, text: "مكافأة المثابرة! +50 نقطة خبرة." },
        { type: 'xp', value: 75, text: "هدية اليوم! +75 نقطة خبرة." }
    ],
    motivationalMessages: {
        newBest: "ما شاء الله! لقد حققت أفضل درجة لك في هذه الصفحة!",
        perfectScore: "تبارك الله! درجة كاملة، إتقان تام!"
    }
};




