// =================================================================================
//  رفيق الحفظ المتقدم - ملف الجافاسكريبت الرئيسي (نسخة مطورة مع Google Sheets)
// =================================================================================

// --- استيراد الإعدادات من ملف config.js ---
import { API_ENDPOINTS, QUIZ_CONFIG, MOTIVATION_CONFIG, GOOGLE_SHEET_API_URL } from './config.js';

// --- 1. DOM Element Variables (هذا هو الجزء المفقود) ---
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const errorReviewScreen = document.getElementById('error-review-screen');
const resultScreen = document.getElementById('result-screen');
const profileScreen = document.getElementById('profile-screen');
const loader = document.getElementById('loader');
const userNameInput = document.getElementById('userName');
const pageNumberInput = document.getElementById('pageNumber');
const startButton = document.getElementById('startButton');
const profileButton = document.getElementById('profileButton');
const questionArea = document.getElementById('question-area');
const feedbackArea = document.getElementById('feedback-area');
const progressCounter = document.getElementById('progress-counter');
const progressBar = document.getElementById('progress-bar');
const errorList = document.getElementById('error-list');
const showFinalResultButton = document.getElementById('show-final-result-button');
const challengeLinkInput = document.getElementById('challenge-link');
const welcomeName = document.getElementById('welcome-name');
const userTitle = document.getElementById('user-title');
const profileName = document.getElementById('profileName');
const resultName = document.getElementById('resultName');
const finalScore = document.getElementById('finalScore');
const xpGainedText = document.getElementById('xp-gained-text');
const smartReviewBtn = document.getElementById('smart-review-btn');
const hifzHeatmap = document.getElementById('hifz-heatmap');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const meaningBtn = document.getElementById('meaning-btn');
const meaningModal = document.getElementById('meaning-modal');
const closeMeaningModal = document.getElementById('close-meaning-modal');
const meaningContent = document.getElementById('meaning-content');
const advancedStatsContainer = document.getElementById('advanced-stats-container');
const shareCardBtn = document.getElementById('share-card-btn');
const hafizCard = document.getElementById('hafiz-card');
const motivationFeatures = document.getElementById('motivation-features');
const streakCounter = document.getElementById('streak-counter');
const xpText = document.getElementById('xp-text');
const xpBar = document.getElementById('xp-bar');
const achievementsCounter = document.getElementById('achievements-counter');
const dailyRewardModal = document.getElementById('daily-reward-modal');
const closeDailyModal = document.getElementById('close-daily-modal');
const rewardText = document.getElementById('reward-text');
const progressTreeContainer = document.getElementById('progress-tree-container');
const progressTree = document.getElementById('progress-tree');
const masteredPagesCount = document.getElementById('mastered-pages-count');
const achievementsContainer = document.getElementById('achievements-container');
const backToStartBtn = document.getElementById('back-to-start-btn');
const copyChallengeBtn = document.getElementById('copy-challenge-btn');


// --- 2. كائن الحالة الموحد (Single State Object) ---
let AppState = {
    currentUser: null,
    lastUsedName: localStorage.getItem('lastUserName'), // سنبقي هذا فقط لراحة المستخدم
    theme: localStorage.getItem('theme') || 'light',
    userData: null, // سيتم تخزين بيانات المستخدم هنا بعد جلبها
    pageData: {
        number: null,
        ayahs: [],
        audioData: {}
    },
    currentQuiz: {
        isActive: false,
        score: 0,
        questionIndex: 0,
        errorLog: [],
        currentAyahForMeaning: null
    }
};

// --- 3. Initialization ---
window.onload = async () => {
    if (AppState.lastUsedName) {
        userNameInput.value = AppState.lastUsedName;
        await handleUserLogin(AppState.lastUsedName);
    }
    if (AppState.theme === 'dark') {
        document.body.classList.add('dark-mode');
    }
    updateAllUI();
};

// --- 4. Event Listeners ---
startButton.addEventListener('click', startStandardTest);
profileButton.addEventListener('click', () => showProfileScreen());
themeToggleBtn.addEventListener('click', toggleTheme);
smartReviewBtn.addEventListener('click', startSmartReview);
// ... (بقية المستمعين تبقى كما هي)
userNameInput.addEventListener('change', async () => { // نستخدم change بدلاً من input لتجنب كثرة الطلبات
    await handleUserLogin(userNameInput.value);
});
backToStartBtn.addEventListener('click', showStartScreen);
copyChallengeBtn.addEventListener('click', copyChallengeLink);


// --- 5. Core User Data & UI Management (تمت إعادة كتابة هذا الجزء بالكامل) ---

/**
 * دالة جديدة للتعامل مع تسجيل دخول المستخدم وجلب بياناته
 */
async function handleUserLogin(userName) {
    if (!userName) {
        AppState.currentUser = null;
        AppState.userData = null;
        updateAllUI();
        return;
    }
    
    loader.classList.remove('hidden');
    AppState.currentUser = userName;
    localStorage.setItem('lastUserName', userName); // نحفظ آخر اسم تم استخدامه

    try {
        const data = await getUserData(userName);
        AppState.userData = data;
    } catch (error) {
        console.error("Failed to fetch user data:", error);
        alert("حدث خطأ أثناء جلب بياناتك من Google Sheets. الرجاء المحاولة مرة أخرى.");
        AppState.currentUser = null;
        AppState.userData = null;
    } finally {
        loader.classList.add('hidden');
        updateAllUI();
    }
}

/**
 * دالة جديدة لجلب بيانات المستخدم من Google Sheet
 */
async function getUserData(userName) {
    const response = await fetch(`${GOOGLE_SHEET_API_URL}?action=getUserData&userName=${encodeURIComponent(userName)}`);
    if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const data = await response.json();
    if (data.error) {
        throw new Error(`API Error: ${data.error}`);
    }
    // تحويل التواريخ النصية إلى كائنات Date إذا لزم الأمر
    if (data.lastTestDate) data.lastTestDate = new Date(data.lastTestDate).toDateString();
    if (data.lastRewardDate) data.lastRewardDate = new Date(data.lastRewardDate).toDateString();
    return data;
}

/**
 * دالة جديدة لحفظ بيانات المستخدم في Google Sheet
 */
async function saveUserData(userData) {
    if (!AppState.currentUser) return;
    try {
        const response = await fetch(GOOGLE_SHEET_API_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'saveUserData',
                userName: AppState.currentUser,
                data: userData
            })
        });
        const result = await response.json();
        if (result.error) {
            throw new Error(result.error);
        }
        console.log("User data saved successfully to Google Sheets.");
    } catch (error) {
        console.error("Failed to save user data:", error);
        // تنبيه المستخدم بأن الحفظ قد فشل
        alert("عفواً، لم نتمكن من حفظ تقدمك الأخير. سيتم المحاولة مرة أخرى لاحقاً.");
    }
}

function updateAllUI() {
    if (!AppState.currentUser || !AppState.userData) {
        welcomeName.textContent = '';
        userTitle.textContent = '';
        motivationFeatures.classList.add('hidden');
        smartReviewBtn.disabled = true;
        profileButton.disabled = true;
        return;
    }
    
    motivationFeatures.classList.remove('hidden');
    smartReviewBtn.disabled = false;
    profileButton.disabled = false;

    const userData = AppState.userData;
    welcomeName.textContent = AppState.currentUser;
    userTitle.textContent = MOTIVATION_CONFIG.titles[userData.level - 1] || MOTIVATION_CONFIG.titles[MOTIVATION_CONFIG.titles.length - 1];
    
    streakCounter.textContent = userData.streak;
    achievementsCounter.textContent = Object.values(userData.achievements).filter(a => a.unlocked).length;

    const currentLevelXP = MOTIVATION_CONFIG.levels[userData.level - 1];
    const nextLevelXP = MOTIVATION_CONFIG.levels[userData.level] || (currentLevelXP * 2);
    const xpInLevel = userData.xp - currentLevelXP;
    const xpForLevel = nextLevelXP - currentLevelXP;
    const xpPercentage = Math.min(100, (xpInLevel / xpForLevel) * 100);
    xpBar.style.width = `${xpPercentage}%`;
    xpText.textContent = `المستوى ${userData.level} (${xpInLevel}/${xpForLevel})`;

    themeToggleBtn.textContent = document.body.classList.contains('dark-mode') ? "الوضع النهاري" : "الوضع الليلي";
}

function showProfileScreen() {
    if (!AppState.currentUser || !AppState.userData) {
        alert('الرجاء إدخال اسمك أولاً.');
        return;
    }
    // ... بقية الدالة تعمل كما هي لأنها تعتمد على AppState.userData
    const userData = AppState.userData;
    // ...
}

// --- 6. هياكل التحميل (Loading Skeletons) ---
// ... (لا تغيير هنا)

// --- 7. Core Quiz Functions ---

async function startStandardTest() {
    // تم تعديل التحقق
    if (!AppState.currentUser || !AppState.userData) {
        alert('الرجاء إدخال اسمك أولاً.');
        return;
    }
    const pageNumber = pageNumberInput.value;
    if (!pageNumber) {
        alert('الرجاء إدخال رقم صفحة.');
        return;
    }
    
    // ... بقية الدالة كما هي
}

// ... (دوال جلب الأسئلة وعرضها تبقى كما هي)

async function showResults() { // جعلناها async للتعامل مع الحفظ
    quizScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    const page = AppState.pageData.number;
    const score = AppState.currentQuiz.score;
    
    resultName.textContent = AppState.currentUser;
    finalScore.textContent = `${score} من ${QUIZ_CONFIG.defaultQuestionsCount}`;
    
    const xpGained = 10 + (score * 2);
    xpGainedText.textContent = xpGained;
    
    // هنا التغيير الكبير: نعدل على كائن الحالة ثم نحفظه
    let userData = AppState.userData;
    userData.xp += xpGained;
    userData.totalCorrect += score;
    userData.testsCompleted++;

    const oldBestScore = userData.pageScores?.[page] || 0;
    if (score > oldBestScore) {
        showMotivationalMessage('newBest');
        userData.pageScores[page] = score; // تحديث مباشر
    }
    // ... (بقية منطق حساب النقاط والمستويات كما هو)
    
    // ... (منطق السلسلة اليومية والمكافآت كما هو)

    checkAndGrantAchievements(score); // هذه الدالة ستعدل userData مباشرة
    
    // *** الخطوة الأهم: حفظ كل التغييرات دفعة واحدة ***
    await saveUserData(userData); 
    
    generateChallengeLink();
    updateAllUI();
}

function grantDailyReward() {
    const reward = shuffleArray(MOTIVATION_CONFIG.dailyRewards)[0];
    rewardText.textContent = reward.text;
    if (reward.type === 'xp') {
        // نعدل على الحالة مباشرة
        AppState.userData.xp += reward.value;
    }
    dailyRewardModal.style.display = 'block';
}

function checkAndGrantAchievements(score) {
    // لا حاجة لـ let userData = getUserData() بعد الآن
    let newAchievement = false;
    
    if (!AppState.userData.achievements.firstTest.unlocked) {
        AppState.userData.achievements.firstTest.unlocked = true; newAchievement = true;
    }
    // ... (بقية الشروط تعدل AppState.userData.achievements مباشرة)
    
    if (newAchievement) {
        alert("🎉 لقد حصلت على إنجاز جديد! تفحصه في ملفك الشخصي.");
        // الحفظ سيتم في نهاية دالة showResults
    }
}

// ... (بقية الدوال مثل copyChallengeLink, updateProgress, generateChallengeLink تبقى كما هي)

// --- 8. Advanced Feature Functions ---
// ... (toggleTheme, buildHeatmap, showMeaning, generateAndShareCard, showAdvancedStats)
// هذه الدوال ستعمل بشكل صحيح لأنها تقرأ من AppState.userData المحدث

async function startSmartReview() { // أصبحت async
    if (!AppState.currentUser || !AppState.userData) {
        alert('الرجاء إدخال اسمك أولاً.');
        return;
    }
    const userData = AppState.userData;
    // ... (بقية المنطق كما هو)
    
    pageNumberInput.value = pageToReview;
    await startStandardTest();
}

// --- 9. All Question Generators ---
// ... (لا تغيير في هذا الجزء بالكامل)

// --- 10. Helper Functions ---
// ... (لا تغيير في هذا الجزء)

