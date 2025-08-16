// =================================================================================
//  رفيق الحفظ المتقدم - ملف الجافاسكريبت الرئيسي (نسخة مطورة مع Google Sheets)
// =================================================================================

// --- استيراد الإعدادات من ملف config.js ---
import { API_ENDPOINTS, QUIZ_CONFIG, MOTIVATION_CONFIG, GOOGLE_SHEET_API_URL } from './config.js';

// --- 1. DOM Element Variables ---
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
    lastUsedName: localStorage.getItem('lastUserName'),
    theme: localStorage.getItem('theme') || 'light',
    userData: null,
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
meaningBtn.addEventListener('click', showMeaning);
closeMeaningModal.onclick = () => meaningModal.style.display = "none";
closeDailyModal.onclick = () => dailyRewardModal.style.display = "none";
shareCardBtn.addEventListener('click', generateAndShareCard);
showFinalResultButton.addEventListener('click', () => {
    errorReviewScreen.classList.add('hidden');
    showResults();
});
userNameInput.addEventListener('change', async () => {
    await handleUserLogin(userNameInput.value);
});
backToStartBtn.addEventListener('click', showStartScreen);
copyChallengeBtn.addEventListener('click', copyChallengeLink);


// --- 5. Core User Data & UI Management ---
async function handleUserLogin(userName) {
    if (!userName) {
        AppState.currentUser = null;
        AppState.userData = null;
        updateAllUI();
        return;
    }
    
    loader.classList.remove('hidden');
    AppState.currentUser = userName;
    localStorage.setItem('lastUserName', userName);

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

async function getUserData(userName) {
    const response = await fetch(GOOGLE_SHEET_API_URL, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'getUserData',
            userName: userName
        })
    });

    if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const data = await response.json();
    if (data.error) {
        throw new Error(`API Error: ${data.error}`);
    }
    if (data.lastTestDate) data.lastTestDate = new Date(data.lastTestDate).toDateString();
    if (data.lastRewardDate) data.lastRewardDate = new Date(data.lastRewardDate).toDateString();
    return data;
}


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
    startScreen.classList.add('hidden');
    quizScreen.classList.add('hidden');
    profileScreen.classList.remove('hidden');
    profileName.textContent = AppState.currentUser;
    
    const userData = AppState.userData;
    const masteredCount = Object.values(userData.pageScores || {}).filter(s => s === 10).length;
    masteredPagesCount.textContent = masteredCount;
    const treeEmojis = ['🌱', '🌿', '🌳', '🌳✨', '🌳🌟'];
    const treeIndex = Math.min(Math.floor(masteredCount / 50), treeEmojis.length - 1);
    progressTree.textContent = treeEmojis[treeIndex];

    achievementsContainer.innerHTML = '';
    for (const key in userData.achievements) {
        const ach = userData.achievements[key];
        const card = document.createElement('div');
        card.className = `achievement-card ${ach.unlocked ? 'unlocked' : ''}`;
        card.innerHTML = `<div class="icon">${ach.unlocked ? '✅' : '🔒'}</div><h5>${ach.title}</h5>`;
        achievementsContainer.appendChild(card);
    }

    buildHeatmap();
    showAdvancedStats();
}

function showStartScreen() {
    profileScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    updateAllUI();
}

// --- 6. هياكل التحميل (Loading Skeletons) ---
function showQuestionSkeleton() {
    questionArea.innerHTML = `
        <h3>السؤال ${AppState.currentQuiz.questionIndex + 1}</h3>
        <div class="skeleton skeleton-audio"></div>
        <div class="skeleton skeleton-option"></div>
        <div class="skeleton skeleton-option"></div>
        <div class="skeleton skeleton-option"></div>
    `;
}

// --- 7. Core Quiz Functions ---
async function startStandardTest() {
    if (!AppState.currentUser || !AppState.userData) {
        alert('الرجاء إدخال اسمك أولاً.');
        return;
    }
    const pageNumber = pageNumberInput.value;
    if (!pageNumber) {
        alert('الرجاء إدخال رقم صفحة.');
        return;
    }
    
    startScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    loader.classList.remove('hidden');

    const success = await fetchPageText(pageNumber);
    loader.classList.add('hidden');
    if (success) {
        AppState.currentQuiz = {
            isActive: true, score: 0, questionIndex: 0, errorLog: [], currentAyahForMeaning: null
        };
        displayQuestion();
    } else {
        showStartScreen();
    }
}

async function fetchPageText(pageNumber) {
    try {
        const response = await fetch(API_ENDPOINTS.pageText(pageNumber));
        const data = await response.json();
        if (data.code === 200 && data.data.ayahs.length > 0) {
            AppState.pageData = {
                number: pageNumber,
                ayahs: data.data.ayahs,
                audioData: {}
            };
            return true;
        } else {
            alert('حدث خطأ في جلب بيانات الصفحة.');
            return false;
        }
    } catch (error) {
        console.error("Error fetching page text:", error);
        alert('لا يمكن الوصول إلى الخادم. تحقق من اتصالك بالإنترنت.');
        return false;
    }
}

async function getAyahAudio(ayah) {
    if (AppState.pageData.audioData[ayah.numberInSurah]) {
        return AppState.pageData.audioData[ayah.numberInSurah];
    }
    try {
        const response = await fetch(API_ENDPOINTS.pageAudio(AppState.pageData.number));
        const data = await response.json();
        if (data.code === 200) {
            data.data.ayahs.forEach(a => {
                AppState.pageData.audioData[a.numberInSurah] = a.audio;
            });
            return AppState.pageData.audioData[ayah.numberInSurah];
        }
        return null;
    } catch (error) {
        console.error("Error fetching audio:", error);
        return null;
    }
}

function displayQuestion() {
    if (AppState.currentQuiz.questionIndex >= QUIZ_CONFIG.defaultQuestionsCount) {
        endQuiz();
        return;
    }
    updateProgress();
    feedbackArea.classList.add('hidden');
    meaningBtn.classList.add('hidden');
    showQuestionSkeleton();

    setTimeout(() => {
        const randomType = shuffleArray([...QUIZ_CONFIG.questionTypes])[0];
        try {
            const questionGenerators = {
                'chooseNext': generateChooseNextQuestion,
                'choosePrevious': generateChoosePreviousQuestion,
                'locateAyah': generateLocateAyahQuestion,
                'completeAyah': generateCompleteAyahQuestion,
                'completeLastWord': generateCompleteLastWordQuestion,
                'linkStartEnd': generateLinkStartEndQuestion
            };
            questionGenerators[randomType]();
        } catch (e) {
            console.error("Failed to generate question:", e);
            generateChooseNextQuestion();
        }
    }, 500);
}

function handleResult(isCorrect, correctAnswerText, questionAyah) {
    const interactiveElements = questionArea.querySelectorAll('.choice-box, .option-div, button');
    interactiveElements.forEach(el => el.style.pointerEvents = 'none');
    
    if (isCorrect) {
        AppState.currentQuiz.score++;
        feedbackArea.textContent = 'إجابة صحيحة! أحسنت.';
        feedbackArea.className = 'correct-feedback';
        AppState.currentQuiz.currentAyahForMeaning = questionAyah;
        meaningBtn.classList.remove('hidden');
    } else {
        feedbackArea.textContent = `إجابة خاطئة.`;
        feedbackArea.className = 'wrong-feedback';
        const questionData = {
            type: 'unknown',
            correctAnswer: correctAnswerText,
            questionHTML: questionArea.innerHTML
        };
        AppState.currentQuiz.errorLog.push(questionData);
        
        AppState.userData.errorTypes[questionData.type] = (AppState.userData.errorTypes[questionData.type] || 0) + 1;
    }
    feedbackArea.classList.remove('hidden');
    setTimeout(() => {
        AppState.currentQuiz.questionIndex++;
        displayQuestion();
    }, 3000);
}

function endQuiz() {
    progressBar.style.width = '100%';
    if (AppState.currentQuiz.errorLog.length > 0) {
        quizScreen.classList.add('hidden');
        errorReviewScreen.classList.remove('hidden');
        displayErrorReview();
    } else {
        showResults();
    }
}

function displayErrorReview() {
    errorList.innerHTML = '';
    AppState.currentQuiz.errorLog.forEach(error => {
        const item = document.createElement('div');
        item.className = 'error-review-item';
        item.innerHTML = `<h4>سؤال خاطئ</h4>
                          <div>${error.questionHTML.replace(/<button.*<\/button>/g, '')}</div>
                          <p>الإجابة الصحيحة: <span class="correct-text">${error.correctAnswer}</span></p>`;
        item.querySelectorAll('.choice-box, .option-div, .number-box').forEach(el => {
            el.style.pointerEvents = 'none';
            if (el.dataset.correct !== 'true') {
                el.style.opacity = '0.5';
            } else {
                el.classList.add('correct-answer');
            }
        });
        errorList.appendChild(item);
    });
}

async function showResults() {
    quizScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    const page = AppState.pageData.number;
    const score = AppState.currentQuiz.score;
    
    resultName.textContent = AppState.currentUser;
    finalScore.textContent = `${score} من ${QUIZ_CONFIG.defaultQuestionsCount}`;
    
    const xpGained = 10 + (score * 2);
    xpGainedText.textContent = xpGained;
    
    let userData = AppState.userData;
    userData.xp += xpGained;
    userData.totalCorrect += score;
    userData.testsCompleted++;

    const oldBestScore = userData.pageScores?.[page] || 0;
    if (score > oldBestScore) {
        showMotivationalMessage('newBest');
        userData.pageScores[page] = score;
    }
    if (score === QUIZ_CONFIG.defaultQuestionsCount) {
        showMotivationalMessage('perfectScore');
    }

    const currentLevel = userData.level;
    while (userData.xp >= (MOTIVATION_CONFIG.levels[userData.level] || Infinity)) {
        userData.level++;
    }
    if (userData.level > currentLevel) {
        alert(`🎉 تهانينا! لقد وصلت إلى المستوى ${userData.level}!`);
    }

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (userData.lastTestDate === yesterday) {
        userData.streak++;
    } else if (userData.lastTestDate !== today) {
        userData.streak = 1;
    }
    if (userData.lastRewardDate !== today) {
        grantDailyReward();
        userData.lastRewardDate = today;
    }
    userData.lastTestDate = today;

    checkAndGrantAchievements(score);
    await saveUserData(userData);
    
    generateChallengeLink();
    updateAllUI();
}

function grantDailyReward() {
    const reward = shuffleArray([...MOTIVATION_CONFIG.dailyRewards])[0];
    rewardText.textContent = reward.text;
    if (reward.type === 'xp') {
        AppState.userData.xp += reward.value;
    }
    dailyRewardModal.style.display = 'block';
}

function checkAndGrantAchievements(score) {
    let newAchievement = false;
    
    if (!AppState.userData.achievements.firstTest.unlocked) {
        AppState.userData.achievements.firstTest.unlocked = true; newAchievement = true;
    }
    if (AppState.userData.testsCompleted >= 10 && !AppState.userData.achievements.tenTests.unlocked) {
        AppState.userData.achievements.tenTests.unlocked = true; newAchievement = true;
    }
    if (score === QUIZ_CONFIG.defaultQuestionsCount && !AppState.userData.achievements.perfectScore.unlocked) {
        AppState.userData.achievements.perfectScore.unlocked = true; newAchievement = true;
    }
    const perfectScoresCount = Object.values(AppState.userData.pageScores).filter(s => s === 10).length;
    if (perfectScoresCount >= 5 && !AppState.userData.achievements.fivePerfect.unlocked) {
        AppState.userData.achievements.fivePerfect.unlocked = true; newAchievement = true;
    }
    
    if (newAchievement) {
        alert("🎉 لقد حصلت على إنجاز جديد! تفحصه في ملفك الشخصي.");
    }
}

function copyChallengeLink() {
    challengeLinkInput.select();
    document.execCommand('copy');
    alert('تم نسخ رابط التحدي!');
    
    if (!AppState.userData.achievements.sendChallenge.unlocked) {
        AppState.userData.achievements.sendChallenge.unlocked = true;
        alert("🎉 لقد حصلت على إنجاز 'المتحدي'!");
        saveUserData(AppState.userData);
    }
}

function updateProgress() {
    progressCounter.textContent = `السؤال ${AppState.currentQuiz.questionIndex + 1} من ${QUIZ_CONFIG.defaultQuestionsCount}`;
    progressBar.style.width = `${((AppState.currentQuiz.questionIndex) / QUIZ_CONFIG.defaultQuestionsCount) * 100}%`;
}

function generateChallengeLink() {
    const params = {
        page: AppState.pageData.number,
        count: QUIZ_CONFIG.defaultQuestionsCount
    };
    const encodedParams = btoa(JSON.stringify(params));
    const link = `${window.location.origin}${window.location.pathname}?challenge=${encodedParams}`;
    challengeLinkInput.value = link;
}

// --- 8. Advanced Feature Functions ---
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    AppState.theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', AppState.theme);
    updateAllUI();
}

async function startSmartReview() {
    if (!AppState.currentUser || !AppState.userData) {
        alert('الرجاء إدخال اسمك أولاً.');
        return;
    }
    const userData = AppState.userData;
    let pageToReview = 1;
    const weakPages = Object.entries(userData.pageScores || {})
        .filter(([, score]) => score < 8)
        .map(([page]) => parseInt(page));
    
    if (weakPages.length > 0) {
        pageToReview = shuffleArray(weakPages)[0];
        alert(`المراجعة الذكية: سنراجع اليوم صفحة ${pageToReview} لأنها تحتاج لبعض التركيز.`);
    } else {
        pageToReview = Math.floor(Math.random() * 604) + 1;
        alert(`المراجعة الذكية: تم اختيار صفحة ${pageToReview} عشوائياً لتنشيط الذاكرة.`);
    }
    
    pageNumberInput.value = pageToReview;
    await startStandardTest();
}

function buildHeatmap() {
    const userData = AppState.userData;
    hifzHeatmap.innerHTML = '';
    for (let i = 1; i <= 604; i++) {
        const cell = document.createElement('div');
        cell.className = 'heatmap-cell';
        const score = userData.pageScores?.[i];
        let level = 0;
        if (score === 10) level = 4;
        else if (score >= 8) level = 3;
        else if (score >= 5) level = 2;
        else if (score > 0) level = 1;
        cell.dataset.level = level;
        cell.innerHTML = `<span class="tooltip">صفحة ${i}  
أفضل درجة: ${score || 'لم تختبر'}</span>`;
        hifzHeatmap.appendChild(cell);
    }
}

async function showMeaning() {
    const ayah = AppState.currentQuiz.currentAyahForMeaning;
    if (!ayah) return;
    meaningModal.style.display = 'block';
    meaningContent.innerHTML = '<div class="loader"></div>';
    
    try {
        const response = await fetch(API_ENDPOINTS.tafsir(ayah.surah.number, ayah.numberInSurah));
        const data = await response.json();
        if (data.tafsir) {
            meaningContent.innerHTML = `
                <h4>تفسير ميسر للآية:</h4>
                <p>${ayah.text} [${ayah.surah.name}: ${ayah.numberInSurah}]</p>
                <p>${data.tafsir.text.replace(/<[^>]*>/g, '')}</p>
            `;
        } else { throw new Error('Tafsir not found'); }
    } catch (error) {
        meaningContent.innerHTML = '<p>عفواً، لم نتمكن من جلب التفسير حالياً.</p>';
        console.error("Tafsir API error:", error);
    }
}

function showMotivationalMessage(type) {
    const message = MOTIVATION_CONFIG.motivationalMessages[type];
    if (message) {
        if (feedbackArea.classList.contains('hidden')) {
            feedbackArea.textContent = message;
            feedbackArea.className = 'motivational-feedback';
            feedbackArea.classList.remove('hidden');
        }
    }
}

function generateAndShareCard() {
    if (!AppState.currentUser) return;
    const userData = AppState.userData;
    const masteredCount = Object.values(userData.pageScores || {}).filter(s => s === 10).length;
    const unlockedAchievements = Object.values(userData.achievements).filter(a => a.unlocked).length;
    
    document.getElementById('card-name').textContent = AppState.currentUser;
    document.getElementById('card-title').textContent = MOTIVATION_CONFIG.titles[userData.level - 1] || '';
    document.getElementById('card-level').textContent = userData.level;
    document.getElementById('card-mastered').textContent = masteredCount;
    document.getElementById('card-achievements').textContent = unlockedAchievements;
    const treeEmojis = ['🌱', '🌿', '🌳', '🌳✨', '🌳🌟'];
    const treeIndex = Math.min(Math.floor(masteredCount / 50), treeEmojis.length - 1);
    document.getElementById('card-tree').textContent = treeEmojis[treeIndex];

    hafizCard.style.display = 'block';
    html2canvas(hafizCard, { backgroundColor: null, scale: 2 }).then(canvas => {
        hafizCard.style.display = 'none';
        const image = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.href = image;
        link.download = `بطاقة-الحافظ-${AppState.currentUser}.png`;
        link.click();
    });
}

function showAdvancedStats() {
    const userData = AppState.userData;
    const totalQuestionsAnswered = userData.testsCompleted * QUIZ_CONFIG.defaultQuestionsCount;
    const accuracy = totalQuestionsAnswered > 0 ? Math.round((userData.totalCorrect / totalQuestionsAnswered) * 100) : 0;
    
    const weakPoint = Object.entries(userData.errorTypes)
                        .sort((a, b) => b[1] - a[1])[0]?.[0] || "لا يوجد";

    advancedStatsContainer.innerHTML = `
        <div class="stat-card"><h5>معدل الدقة</h5><p>${accuracy}%</p></div>
        <div class="stat-card"><h5>نقطة للتحسين</h5><p>${weakPoint}</p></div>
        <div class="stat-card"><h5>إجمالي الاختبارات</h5><p>${userData.testsCompleted}</p></div>
    `;
}

// --- 9. All Question Generators ---
function addChoiceListeners(correctAnswerText, questionAyah) {
    questionArea.querySelectorAll('.choice-box, .option-div').forEach(el => {
        if (el.dataset.listenerAttached) return;
        el.dataset.listenerAttached = 'true';
        el.addEventListener('click', () => {
            const isCorrect = el.dataset.correct === 'true';
            handleResult(isCorrect, correctAnswerText, questionAyah);
            el.classList.add(isCorrect ? 'correct-answer' : 'wrong-answer');
            if (!isCorrect) {
                const correctEl = questionArea.querySelector('[data-correct="true"]');
                if (correctEl) correctEl.classList.add('correct-answer');
            }
        });
    });
}

async function generateChooseNextQuestion() {
    const pageAyahs = AppState.pageData.ayahs;
    if (pageAyahs.length < 2) return generateCompleteLastWordQuestion();
    const startIndex = Math.floor(Math.random() * (pageAyahs.length - 1));
    const questionAyah = pageAyahs[startIndex];
    const correctNextAyah = pageAyahs[startIndex + 1];
    const audioSrc = await getAyahAudio(questionAyah);
    let wrongOptions = pageAyahs.filter(a => a.number !== correctNextAyah.number && a.number !== questionAyah.number);
    wrongOptions = shuffleArray([...wrongOptions]).slice(0, 2);
    const options = shuffleArray([correctNextAyah, ...wrongOptions]);
    questionArea.innerHTML = `<h3>السؤال ${AppState.currentQuiz.questionIndex + 1}: اختر الآية التالية</h3>
        <p style="font-family: 'Amiri', serif; font-size: 22px; border: 1px solid var(--border-color); padding: 10px; border-radius: 5px;">${questionAyah.text}</p>
        ${audioSrc ? `<audio controls src="${audioSrc}"></audio>` : '<p>عفواً، تعذر تحميل الصوت.</p>'}
        ${options.map(opt => `<div class="option-div" data-correct="${opt.number === correctNextAyah.number}">${opt.text}</div>`).join('')}`;
    addChoiceListeners(correctNextAyah.text, questionAyah);
}

async function generateChoosePreviousQuestion() {
    const pageAyahs = AppState.pageData.ayahs;
    if (pageAyahs.length < 2) return generateChooseNextQuestion();
    const startIndex = Math.floor(Math.random() * (pageAyahs.length - 1)) + 1;
    const questionAyah = pageAyahs[startIndex];
    const correctPreviousAyah = pageAyahs[startIndex - 1];
    const audioSrc = await getAyahAudio(questionAyah);
    let wrongOptions = pageAyahs.filter(a => a.number !== correctPreviousAyah.number && a.number !== questionAyah.number);
    wrongOptions = shuffleArray([...wrongOptions]).slice(0, 2);
    const options = shuffleArray([correctPreviousAyah, ...wrongOptions]);
    questionArea.innerHTML = `<h3>السؤال ${AppState.currentQuiz.questionIndex + 1}: اختر الآية السابقة</h3>
        <p style="font-family: 'Amiri', serif; font-size: 22px; border: 1px solid var(--border-color); padding: 10px; border-radius: 5px;">${questionAyah.text}</p>
        ${audioSrc ? `<audio controls src="${audioSrc}"></audio>` : '<p>عفواً، تعذر تحميل الصوت.</p>'}
        ${options.map(opt => `<div class="option-div" data-correct="${opt.number === correctPreviousAyah.number}">${opt.text}</div>`).join('')}`;
    addChoiceListeners(correctPreviousAyah.text, questionAyah);
}

async function generateLocateAyahQuestion() {
    const pageAyahs = AppState.pageData.ayahs;
    const ayahIndex = Math.floor(Math.random() * pageAyahs.length);
    const questionAyah = pageAyahs[ayahIndex];
    const audioSrc = await getAyahAudio(questionAyah);
    const totalAyahs = pageAyahs.length;
    let correctLocation;
    if (ayahIndex < totalAyahs / 3) correctLocation = 'بداية';
    else if (ayahIndex < (totalAyahs * 2) / 3) correctLocation = 'وسط';
    else correctLocation = 'نهاية';
    questionArea.innerHTML = `<h3>السؤال ${AppState.currentQuiz.questionIndex + 1}: أين يقع موضع هذه الآية؟</h3>
        <p style="font-family: 'Amiri', serif; font-size: 22px; border: 1px solid var(--border-color); padding: 10px; border-radius: 5px;">${questionAyah.text}</p>
        ${audioSrc ? `<audio controls src="${audioSrc}"></audio>` : ''}
        <div class="interactive-area">${['بداية', 'وسط', 'نهاية'].map(loc => `<div class="choice-box" data-correct="${loc === correctLocation}">${loc} الصفحة</div>`).join('')}</div>`;
    addChoiceListeners(`${correctLocation} الصفحة`, questionAyah);
}

async function generateCompleteAyahQuestion() {
    const pageAyahs = AppState.pageData.ayahs;
    const longAyahs = pageAyahs.filter(a => a.text.split(' ').length > 8);
    if (longAyahs.length < 3) return generateChooseNextQuestion();
    const questionAyah = shuffleArray([...longAyahs])[0];
    const audioSrc = await getAyahAudio(questionAyah);
    const words = questionAyah.text.split(' ');
    const splitPoint = Math.floor(words.length / 2);
    const firstHalfText = words.slice(0, splitPoint).join(' ');
    const correctSecondHalf = words.slice(splitPoint).join(' ');
    const wrongAyahs = pageAyahs.filter(a => a.number !== questionAyah.number);
    const wrongOptions = shuffleArray([...wrongAyahs]).slice(0, 2).map(a => {
        const wrongWords = a.text.split(' ');
        return wrongWords.slice(Math.floor(wrongWords.length / 2)).join(' ');
    });
    const options = shuffleArray([correctSecondHalf, ...wrongOptions]);
    questionArea.innerHTML = `<h3>السؤال ${AppState.currentQuiz.questionIndex + 1}: أكمل الآية</h3>
        <p style="font-family: 'Amiri', serif; font-size: 22px;">"${firstHalfText}..."</p>
        ${audioSrc ? `<audio controls src="${audioSrc}"></audio>` : ''}
        ${options.map(opt => `<div class="option-div" data-correct="${opt.replace(/'/g, "\\'") === correctSecondHalf.replace(/'/g, "\\'")}">${opt}</div>`).join('')}`;
    addChoiceListeners(correctSecondHalf, questionAyah);
}

async function generateCompleteLastWordQuestion() {
    const pageAyahs = AppState.pageData.ayahs;
    const suitableAyahs = pageAyahs.filter(a => a.text.split(' ').length > 3);
    if (suitableAyahs.length < 4) return generateChooseNextQuestion();
    const questionAyah = shuffleArray([...suitableAyahs])[0];
    const audioSrc = await getAyahAudio(questionAyah);
    const words = questionAyah.text.split(' ');
    const correctLastWord = words.pop();
    const incompleteAyahText = words.join(' ');
    const wrongOptions = shuffleArray([...suitableAyahs.filter(a => a.number !== questionAyah.number)]).slice(0, 3).map(a => a.text.split(' ').pop());
    const options = shuffleArray([correctLastWord, ...wrongOptions]);
    questionArea.innerHTML = `<h3>السؤال ${AppState.currentQuiz.questionIndex + 1}: أكمل الكلمة الأخيرة</h3>
        <p style="font-family: 'Amiri', serif; font-size: 22px;">${incompleteAyahText} (...)</p>
        ${audioSrc ? `<audio controls src="${audioSrc}"></audio>` : ''}
        <div class="interactive-area">${options.map(opt => `<div class="choice-box" data-correct="${opt === correctLastWord}">${opt}</div>`).join('')}</div>`;
    addChoiceListeners(correctLastWord, questionAyah);
}

async function generateLinkStartEndQuestion() {
    const pageAyahs = AppState.pageData.ayahs;
    const suitableAyahs = pageAyahs.filter(a => a.text.split(' ').length > 5);
    if (suitableAyahs.length < 4) return generateChooseNextQuestion();
    const questionAyah = shuffleArray([...suitableAyahs])[0];
    const words = questionAyah.text.split(' ');
    const startText = words.slice(0, 3).join(' ') + '...';
    const correctEnding = '...' + words.slice(-3).join(' ');
    const wrongOptions = shuffleArray([...suitableAyahs.filter(a => a.number !== questionAyah.number)])
        .slice(0, 3)
        .map(a => '...' + a.text.split(' ').slice(-3).join(' '));
    const options = shuffleArray([correctEnding, ...wrongOptions]);
    questionArea.innerHTML = `<h3>السؤال ${AppState.currentQuiz.questionIndex + 1}: اربط بداية الآية بنهايتها</h3>
        <p style="font-family: 'Amiri', serif; font-size: 22px; border: 1px solid var(--border-color); padding: 10px; border-radius: 5px;">"${startText}"</p>
        ${options.map(opt => `<div class="option-div" data-correct="${opt === correctEnding}">${opt}</div>`).join('')}`;
    addChoiceListeners(correctEnding, questionAyah);
}

// --- 10. Helper Functions ---
const shuffleArray = array => {
    // نسخة حديثة من دالة الخلط لضمان العشوائية (Fisher-Yates shuffle)
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

