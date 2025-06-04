// script.js
// ئەم فایلە لۆجیکی سەرەکی و فەنکشنەکانی ئەپلیکەیشنەکە لەخۆدەگرێت.
// داتای فەرهەنگەکە لە data.js وەردەگرێت.

const HISTORY_KEY = 'history';
const FAVORITES_KEY = 'favorites';
const DEFAULT_TRANSLATION_TEXT = 'N/A'; // بۆ کاتێک وەرگێڕانێک بەردەست نییە

let currentLanguage = 'english'; // زمانی بنەڕەتی کاتێک وێب پەیجەکە دەکرێتەوە
let historyData = []; // داتای مێژووی گەڕان
let favoritesData = []; // داتای وشە دڵخوازەکان
let currentDetailWord = null; // ئەو وشەیەی لە ئێستادا وردەکارییەکانی پیشان دەدرێت
let translationSource = 'search'; // سەرچاوەی داواکاریی وەرگێڕان: 'search', 'history', یان 'favorites'

// داتای dictionaryData لە فایلی data.js بار دەکرێت
// (assume dictionaryData is globally available from data.js)

// گەڕان بەسەر توخمەکانی HTML
const htmlElement = document.documentElement;
const languageMenu = document.getElementById('languageMenu');
const searchInput = document.getElementById('searchInput');
const searchResultsDiv = document.getElementById('searchResults');
const translationDetailsModal = document.getElementById('translationDetails');
const historyDetailsModal = document.getElementById('historyDetails');
const favoritesDetailsModal = document.getElementById('favoritesDetails');
const developerDetailsModal = document.getElementById('developerDetails'); // New developer modal
const overlay = document.getElementById('overlay');
const customAlert = document.getElementById('customAlert');
const confirmationModal = document.getElementById('confirmationModal'); // New: Confirmation modal
const confirmationMessage = document.getElementById('confirmationMessage');
const confirmYesBtn = document.getElementById('confirmYesBtn');
const confirmNoBtn = document.getElementById('confirmNoBtn');

// چوونەژوورەوە بۆ گوێگرتن لە ڕووداوەکان
menuButton.addEventListener('click', toggleMenu);
historyButton.addEventListener('click', showHistoryDetails);
overlay.addEventListener('click', hideAllModalsAndSidebars);

/**
 * هەموو مۆداڵ و سایدبار و ئۆڤەرلەیەکە دەشارێتەوە.
 * ئەمە زۆر گرنگە بۆ کۆنترۆڵکردنی باری UI بە دروستی.
 */
function hideAllModalsAndSidebars() {
    // داخستنی سایدباری زمان (LTR & RTL)
    languageMenu.classList.add('-translate-x-full'); // بۆ LTR (بنەڕەتی)
    languageMenu.classList.remove('translate-x-full'); // دڵنیابوونەوە لە لابردنی RTL translate
    languageMenu.classList.remove('right-0'); // لابردنی پێگەی ڕاست
    languageMenu.classList.add('left-0'); // گەڕاندنەوە بۆ پێگەی چەپ (بۆ دۆخی شاراوە)

    translationDetailsModal.classList.add('hidden'); // مۆداڵی وەرگێڕان دەشارێتەوە
    historyDetailsModal.classList.add('hidden'); // مۆداڵی مێژوو دەشارێتەوە
    favoritesDetailsModal.classList.add('hidden'); // مۆداڵی دڵخوازەکان دەشارێتەوە
    developerDetailsModal.classList.add('hidden'); // New: Hide developer modal
    confirmationModal.classList.add('hidden'); // New: Hide confirmation modal

    // گواستنەوەی تێپەڕبوونەکان بۆ دڵنیابوون لەوەی بە تەواوی شاراونەتەوە
    translationDetailsModal.classList.remove('opacity-100', 'visibility-visible');
    historyDetailsModal.classList.remove('opacity-100', 'visibility-visible');
    favoritesDetailsModal.classList.remove('opacity-100', 'visibility-visible');
    developerDetailsModal.classList.remove('opacity-100', 'visibility-visible'); // New: Transition for developer modal
    confirmationModal.classList.remove('opacity-100', 'visibility-visible'); // New: Transition for confirmation modal


    overlay.classList.add('hidden'); // ئۆڤەرلەیەکە دەشارێتەوە
    overlay.classList.remove('opacity-100'); // گواستنەوەی ئۆڤەرلەی

    // دڵنیابوون لەوەی بەشی سەرەکی ئەنجامەکانی گەڕان پیشان دەدرێتەوە
    searchResultsDiv.parentElement.classList.remove('hidden');

    // دووبارە ڕێگەدان بە سکڕۆڵی body
    document.body.style.overflow = '';
}

/**
 * پیشاندانی یان شارانەوەی سایدباری هەڵبژاردنی زمان.
 */
function toggleMenu() {
    // پشکنین ئەگەر سایدبار یان هەر مۆداڵێکی تر کرابێتەوە.
    const isMenuOpen = !languageMenu.classList.contains('-translate-x-full') && languageMenu.classList.contains('left-0'); // LTR menu open
    const isMenuOpenRTL = !languageMenu.classList.contains('translate-x-full') && languageMenu.classList.contains('right-0');
    
    if (isMenuOpen || isMenuOpenRTL || !overlay.classList.contains('hidden')) {
        hideAllModalsAndSidebars();
    } else {
        const isRTLPage = htmlElement.dir === 'rtl';
        
        // دیاریکردنی پێگەی سایدبار و کردنەوەی بەپێی ئاڕاستە
        if (isRTLPage) {
            languageMenu.classList.remove('left-0', '-translate-x-full'); // لای چەپ و شاردنەوەی LTR لادەبات
            languageMenu.classList.add('right-0'); // بۆ لای ڕاست دەیبات
            languageMenu.classList.remove('translate-x-full'); // کردنەوەی سایدبار لە ڕاستەوە
        } else {
            languageMenu.classList.remove('right-0', 'translate-x-full'); // لای ڕاست و شاردنەوەی RTL لادەبات
            languageMenu.classList.add('left-0'); // بۆ لای چەپ دەیبات
            languageMenu.classList.remove('-translate-x-full'); // کردنەوەی سایدبار لە چەپەوە
        }

        overlay.classList.remove('hidden');
        setTimeout(() => {
            overlay.classList.add('opacity-100');
        }, 50); // دواکەوتنێکی کەم بۆ گواستنەوەی ڕووناکی ئۆڤەرلەی

        // بێکارکردنی سکڕۆڵی body
        document.body.style.overflow = 'hidden';
    }
}


/**
 * زمانی گەڕانی ئێستا دیاری دەکات و UIـەکە نوێ دەکاتەوە.
 * @param {string} language - زمانی دیاریکراو (بۆ نموونە: 'english', 'sorani').
 */
function setLanguage(language) {
    currentLanguage = language;
    hideAllModalsAndSidebars(); // داخستنی مێنیو پاش هەڵبژاردن

    let placeholderText = "";
    let isRTL = false;

    // دیاریکردنی نووسینی placeholder و ئاڕاستەی نووسین بەپێی زمان
    switch (language) {
        case 'english':
            placeholderText = "Search in English...";
            isRTL = false;
            break;
        case 'sorani':
            placeholderText = "گەڕان بە کوردی سۆرانی...";
            isRTL = true;
            break;
        case 'hawrami':
            placeholderText = "گەڕان بە کوردی هەورامی...";
            isRTL = true;
            break;
        case 'arabic':
            placeholderText = "البحث باللغة العربية...";
            isRTL = true;
            break;
        default:
            placeholderText = "Search...";
            isRTL = false;
    }

    searchInput.placeholder = placeholderText;
    searchInput.classList.toggle('rtl', isRTL);
    searchInput.classList.toggle('ltr', !isRTL);
    htmlElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr'); // گۆڕینی ئاڕاستەی گشتی پەیج

    searchResultsDiv.classList.toggle('rtl', isRTL);
    searchResultsDiv.classList.toggle('ltr', !isRTL);

    // پاککردنەوەی شوێنی گەڕان و دووبارە گەڕان بۆ پیشاندانی هەموو وشەکانی زمانی نوێ
    searchInput.value = '';
    searchWords();
}

let searchTimeout;
/**
 * دواخستنی گەڕان بۆ کەمکردنەوەی کارایی لە کاتی نووسین.
 */
function searchWordsDebounced() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(searchWords, 300); // 300ms دواکەوتن
}

/**
 * گەڕان ئەنجام دەدات بەپێی نووسین و زمانی ئێستا.
 */
function searchWords() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    let results = [];

    // وەرگرتنی هەموو وشەکانی زمانی ئێستا
    const allWords = Object.keys(dictionaryData[currentLanguage] || {});

    // فلتەرکردنی ئەنجامەکان بەپێی وشەی گەڕان (حەساس نییە بە گەورە و بچووکی پیت، تەنها سەرەتای وشە)
    if (searchTerm === '') {
        results = allWords; // پیشاندانی هەموو وشەکان ئەگەر شوێنی گەڕان بەتاڵ بێت
    } else {
        results = allWords.filter(word => word.toLowerCase().startsWith(searchTerm));
    }

    // ڕێکخستنی ئەنجامەکان بە شێوەی ئەلفوبێ بەپێی یاساکانی ڕیزبەندی زمانی ئێستا
    results.sort((a, b) => a.localeCompare(b, currentLanguage, { sensitivity: 'base' }));

    displayResults(results);
}

/**
 * ئەنجامەکانی گەڕان لە UIـەکەدا پیشان دەدات.
 * @param {Array<string>} results - ریزبەندی وشەکان بۆ پیشاندان.
 */
function displayResults(results) {
    const ul = document.createElement('ul');
    ul.className = 'list-none p-0'; // ستایلەکانی Tailwind

    if (results.length === 0) {
        const noResultsLi = document.createElement('li');
        noResultsLi.textContent = `هیچ ئەنجامێک نەدۆزرایەوە بە ${currentLanguage}ـی.`;
        noResultsLi.className = 'text-gray-400 py-3 text-center';
        ul.appendChild(noResultsLi);
    } else {
        results.forEach(word => {
            const li = document.createElement('li');
            const wordSpan = document.createElement('span'); // وشەکە لە ناو spanێک دادەنرێت بۆ کۆنترۆڵکردنی ئاڕاستەی نووسین
            wordSpan.textContent = word;
            // گۆڕینی ئاڕاستەی نووسینی وشەکە
            wordSpan.classList.toggle('rtl', ['sorani', 'hawrami', 'arabic'].includes(currentLanguage));
            wordSpan.classList.toggle('ltr', currentLanguage === 'english');
            // لابرا: wordSpan.style.textAlign - ئێستا لە CSS دا دیاریکراوە و هەمیشە لای چەپ دەبێت.
            
            li.appendChild(wordSpan); // وشەکە دەخەینە ناو li

            li.onclick = () => showTranslation(word, 'search');
            ul.appendChild(li);
        });
    }
    searchResultsDiv.innerHTML = '';
    searchResultsDiv.appendChild(ul);
}

/**
 * وردەکارییەکانی وەرگێڕان بۆ وشەیەکی دیاریکراو پیشان دەدات.
 * @param {string} word - ئەو وشەیەی وەرگێڕانەکەی پیشان دەدرێت.
 * @param {string} source - سەرچاوەی داواکاریی وەرگێڕان ('search', 'history', یان 'favorites').
 */
function showTranslation(word, source = 'search') {
    currentDetailWord = word;
    translationSource = source; // سەرچاوەکە هەڵدەگیرێت

    hideAllModalsAndSidebars(); // هەموو مۆداڵەکانی تر دەشارێتەوە

    // بێکارکردنی سکڕۆڵی body
    document.body.style.overflow = 'hidden';

    // پیشاندانی مۆداڵی وردەکارییەکانی وەرگێڕان
    translationDetailsModal.classList.remove('hidden');
    translationDetailsModal.classList.add('opacity-100', 'visibility-visible');
    overlay.classList.remove('hidden'); // ئۆڤەرلەیەکە پیشان دەدات
    overlay.classList.add('opacity-100');


    let englishWord, soraniWord, hawramiWord, arabicWord;

    const wordData = dictionaryData[currentLanguage]?.[word];

    // وەرگرتنی وەرگێڕانەکان بۆ وشەی ئێستا
    if (wordData) {
        englishWord = wordData.english || DEFAULT_TRANSLATION_TEXT;
        soraniWord = wordData.sorani || DEFAULT_TRANSLATION_TEXT;
        hawramiWord = wordData.hawrami || DEFAULT_TRANSLATION_TEXT;
        arabicWord = wordData.arabic || DEFAULT_TRANSLATION_TEXT;
    } else {
        // ئەگەر وشەکە لە فەرهەنگی زمانی ئێستادا نەدۆزرایەوە (نابێت ڕووبدات بە گەڕانی فلتەرکراو)
        englishWord = DEFAULT_TRANSLATION_TEXT;
        soraniWord = DEFAULT_TRANSLATION_TEXT;
        hawramiWord = DEFAULT_TRANSLATION_TEXT;
        arabicWord = DEFAULT_TRANSLATION_TEXT;
    }

    // چارەسەری تایبەت بۆ وشەکە خۆی ئەگەر زمانی گەڕان بێت
    switch (currentLanguage) {
        case 'english': englishWord = word; break;
        case 'sorani': soraniWord = word; break;
        case 'hawrami': hawramiWord = word; break;
        case 'arabic': arabicWord = word; break;
    }

    // دیاریکردنی ئاڕاستەی نووسین بۆ detailWord (وشەی سەرەکی لە هێدەری مۆداڵەکە)
    const detailWordElement = document.getElementById('detailWord');
    detailWordElement.textContent = word;
    const isDetailWordRTL = ['sorani', 'hawrami', 'arabic'].includes(currentLanguage);
    detailWordElement.classList.toggle('rtl', isDetailWordRTL);
    detailWordElement.classList.toggle('ltr', !isDetailWordRTL);
    detailWordElement.style.textAlign = 'center'; // وشەی سەرەکی هەمیشە ناوەندی دەبێت لەناو هێدەردا

    // نوێکردنەوەی وەرگێڕانەکان لەناو translation-itemـەکاندا
    document.getElementById('englishTranslation').textContent = englishWord;
    document.getElementById('soraniTranslation').textContent = soraniWord;
    document.getElementById('hawramiTranslation').textContent = hawramiWord;
    document.getElementById('arabicTranslation').textContent = arabicWord;

    addToHistory(word); // زیادکردنی بۆ مێژوو هەموو جارێک وەرگێڕانێک سەیر دەکرێت
    updatePinIcon(); // نوێکردنەوەی ئایکۆنی پین بەپێی باری دڵخواز
}

/**
 * گەڕانەوە لە مۆداڵی وردەکارییەکانی وەرگێڕان بۆ شاشەی پێشوو.
 */
function goBack() {
    translationDetailsModal.classList.add('hidden');
    translationDetailsModal.classList.remove('opacity-100', 'visibility-visible');

    // گەڕانەوە بۆ شاشەی سەرچاوە
    if (translationSource === 'history') {
        showHistoryDetails(); // ئەمە مێژوو دەکاتەوە و displayHistoryDetailed() بانگ دەکات
    } else if (translationSource === 'favorites') {
        showFavoritesDetails(); // ئەمە دڵخوازەکان دەکاتەوە و displayFavoritesDetailed() بانگ دەکات
    } else {
        // گەڕانەوە بۆ ئەنجامەکانی گەڕان ئەگەر سەرچاوەکە نەزانراو یان 'search' بێت
        searchResultsDiv.parentElement.classList.remove('hidden'); // پیشاندانی ناوەڕۆکی سەرەکی
        overlay.classList.add('hidden'); // دڵنیابوون لەوەی ئۆڤەرلەیەکە شاراوەتەوە
        document.body.style.overflow = ''; // گەڕانەوەی سکڕۆڵی body
    }
}

// --- کردارەکانی مێژوو ---

/**
 * وشەیەک بۆ مێژووی گەڕان زیاد دەکات.
 * @param {string} word - وشەکە بۆ زیادکردن.
 */
function addToHistory(word) {
    // پشکنین ئەگەر وشەکە لە مێژوودا هەبێت بۆ زمانی ئێستا
    const existingEntryIndex = historyData.findIndex(entry => entry.word === word && entry.language === currentLanguage);

    if (existingEntryIndex !== -1) {
        // ئەگەر هەبوو، بیسڕەوە و دووبارە زیاد بکەرەوە بۆ سەرەوە (وەکو "تازەترین بینراو")
        historyData.splice(existingEntryIndex, 1);
    }
    // زیادکردنی بۆ سەرەتای ڕیزبەندییەکە
    historyData.unshift({ word: word, language: currentLanguage });

    // مێژووەکە سنووردار دەکرێت بۆ ژمارەیەکی گونجاو (بۆ نموونە 50 چوونەژوورەوە)
    if (historyData.length > 50) {
        historyData.pop();
    }

    saveDataToStorage(HISTORY_KEY, historyData);
    // تەنها ئەگەر مۆداڵی مێژوو کرابێتەوە، لیستەکە نوێ بکەرەوە
    if (!historyDetailsModal.classList.contains('hidden')) {
        displayHistoryDetailed();
    }
}

/**
 * لیستی وردەکارییەکانی مێژوو لە مۆداڵی مێژوودا پیشان دەدات.
 */
function displayHistoryDetailed() {
    const historyListDetailed = document.getElementById('historyListDetailed');
    historyListDetailed.innerHTML = ''; // پاککردنەوەی چوونەژوورەوەکانی پێشوو

    if (historyData.length === 0) {
        historyListDetailed.innerHTML = '<li class="text-gray-400 py-3 text-center">مێژوو بەتاڵە.</li>';
        return;
    }

    historyData.forEach((item, index) => {
        const li = document.createElement('li');
        const wordSpan = document.createElement('span'); // وشەکە لە ناو spanێک دادەنرێت
        wordSpan.textContent = item.word;
        // گۆڕینی ئاڕاستەی نووسینی وشەکە
        wordSpan.classList.toggle('rtl', ['sorani', 'hawrami', 'arabic'].includes(item.language));
        wordSpan.classList.toggle('ltr', item.language === 'english');
        // لابرا: wordSpan.style.textAlign - ئێستا لە CSS دا دیاریکراوە و هەمیشە لای چەپ دەبێت.
        
        li.appendChild(wordSpan); // وشەکە دەخەینە ناو li

        // ڕەفتاری دەست لێدان (تاپ): پیشاندانی وەرگێڕان
        li.onclick = () => showTranslation(item.word, 'history');

        // ڕەفتاری دەست ڕاگرتن لە مۆبایل / ڕاست کلیک لەسەر دێسکتۆپ بۆ سڕینەوە
        let pressTimer;
        const longPressDuration = 800; // milliseconds

        li.addEventListener('touchstart', (e) => {
            e.preventDefault(); // ڕێگریکردن لە ڕەفتاری بنەڕەتی وێبگەڕ (بۆ نموونە، دیاریکردنی نووسین)
            pressTimer = setTimeout(() => {
                showConfirmation("دڵنیایت دەتەوێت وشەی \"" + item.word + "\" بسڕیتەوە؟", () => {
                    deleteHistoryItem(index);
                });
            }, longPressDuration);
        }, { passive: false }); // { passive: false } بۆ ئەوەی e.preventDefault کاربکات

        li.addEventListener('touchend', () => {
            clearTimeout(pressTimer);
        });

        li.addEventListener('touchmove', () => {
            clearTimeout(pressTimer); // هەڵوەشاندنەوەی دەست ڕاگرتن ئەگەر پەنجە بجوڵێت
        });

        li.addEventListener('contextmenu', (e) => { // بۆ ڕاست کلیک لەسەر دێسکتۆپ
            e.preventDefault();
            showConfirmation("دڵنیایت دەتەوێت وشەی \"" + item.word + "\" بسڕیتەوە؟", () => {
                deleteHistoryItem(index);
            });
        });

        // دوگمەی سڕینەوە (ئایکۆنی تەنەکەی خۆڵ)
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>'; // گۆڕینی بۆ ئایکۆن
        deleteButton.onclick = (event) => {
            event.stopPropagation(); // ڕێگریکردن لە گڕگرتنی onclickـی li
            showConfirmation("دڵنیایت دەتەوێت وشەی \"" + item.word + "\" بسڕیتەوە؟", () => {
                deleteHistoryItem(index);
            });
        };

        li.appendChild(deleteButton);
        historyListDetailed.appendChild(li);
    });
}

/**
 * بابەتێکی دیاریکراو لە مێژوودا دەسڕێتەوە.
 * @param {number} index - پێڕست (index)ـی ئەو بابەتەی دەسڕدرێتەوە.
 */
function deleteHistoryItem(index) {
    historyData.splice(index, 1);
    saveDataToStorage(HISTORY_KEY, historyData);
    displayHistoryDetailed(); // نوێکردنەوەی لیستەکە
}

/**
 * پشتڕاستکردنەوە و پاککردنەوەی هەموو داتای مێژوو.
 */
function confirmClearHistory() {
    showConfirmation("دڵنیایت دەتەوێت هەموو مێژووی گەڕان پاک بکەیتەوە؟", () => {
        clearHistory();
    });
}

/**
 * هەموو داتای مێژوو پاک دەکاتەوە.
 */
function clearHistory() {
    historyData = [];
    localStorage.removeItem(HISTORY_KEY);
    displayHistoryDetailed(); // نوێکردنەوەی لیستەکە
}

/**
 * مۆداڵی وردەکارییەکانی مێژوو پیشان دەدات.
 */
function showHistoryDetails() {
    hideAllModalsAndSidebars(); // مۆداڵەکانی تر دەشارێتەوە
    historyDetailsModal.classList.remove('hidden');
    historyDetailsModal.classList.add('opacity-100', 'visibility-visible');
    overlay.classList.remove('hidden');
    overlay.classList.add('opacity-100');
    displayHistoryDetailed(); // دڵنیابوون لەوەی مێژووەکە نوێیە

    // بێکارکردنی سکڕۆڵی body
    document.body.style.overflow = 'hidden';
}


// --- کردارەکانی وشە دڵخوازەکان ---

/**
 * باری دڵخوازی وشەیەک دەگۆڕێت.
 */
function toggleFavorite() {
    if (!currentDetailWord) return; // ناتوانرێت بکرێتە دڵخواز ئەگەر هیچ وشەیەک پیشان نەدرابێت

    const isFavorite = favoritesData.some(fav => fav.word === currentDetailWord && fav.language === currentLanguage);

    if (isFavorite) {
        // لە دڵخوازەکان لای دەبات
        favoritesData = favoritesData.filter(fav => !(fav.word === currentDetailWord && fav.language === currentLanguage));
        showAlert("وشەکە لە دڵخوازەکان لادرا!");
    } else {
        // زیادکردنی بۆ دڵخوازەکان
        favoritesData.push({ word: currentDetailWord, language: currentLanguage });
        showAlert("وشەکە دڵخواز کرا!");
    }
    saveDataToStorage(FAVORITES_KEY, favoritesData);
    updatePinIcon(); // نوێکردنەوەی شێوەی ئایکۆنی پین
    // تەنها ئەگەر مۆداڵی دڵخوازەکان کرابێتەوە، لیستەکە نوێ بکەرەوە
    if (!favoritesDetailsModal.classList.contains('hidden')) {
        displayFavoritesDetailed(); // نوێکردنەوەی لیستی وردەکارییەکانی دڵخواز
    }
}

/**
 * باری شێوەی ئایکۆنی پین نوێ دەکاتەوە بەپێی باری دڵخوازی وشەی ئێستا.
 */
function updatePinIcon() {
    const pinIcon = document.getElementById('pinIcon');
    const isFavorite = favoritesData.some(fav => fav.word === currentDetailWord && fav.language === currentLanguage);
    pinIcon.classList.toggle('active', isFavorite);
}

/**
 * لیستی وردەکارییەکانی دڵخواز لە مۆداڵی دڵخوازەکاندا پیشان دەدات.
 */
function displayFavoritesDetailed() {
    const favoritesListDetailed = document.getElementById('favoritesListDetailed');
    favoritesListDetailed.innerHTML = ''; // پاککردنەوەی چوونەژوورەوەکانی پێشوو

    if (favoritesData.length === 0) {
        favoritesListDetailed.innerHTML = '<li class="text-gray-400 py-3 text-center">هیچ وشەیەکی دڵخواز نییە.</li>';
        return;
    }

    favoritesData.forEach((item, index) => {
        const li = document.createElement('li');
        const wordSpan = document.createElement('span'); // وشەکە لە ناو spanێک دادەنرێت
        wordSpan.textContent = item.word;
        // گۆڕینی ئاڕاستەی نووسینی وشەکە
        wordSpan.classList.toggle('rtl', ['sorani', 'hawrami', 'arabic'].includes(item.language));
        wordSpan.classList.toggle('ltr', item.language === 'english');
        // لابرا: wordSpan.style.textAlign - ئێستا لە CSS دا دیاریکراوە و هەمیشە لای چەپ دەبێت.
        
        li.appendChild(wordSpan); // وشەکە دەخەینە ناو li

        li.onclick = () => showTranslation(item.word, 'favorites');

        // دوگمەی سڕینەوە (ئایکۆنی تەنەکەی خۆڵ)
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>'; // گۆڕینی بۆ ئایکۆن
        deleteButton.onclick = (event) => {
            event.stopPropagation();
            showConfirmation("دڵنیایت دەتەوێت وشەی \"" + item.word + "\" بسڕیتەوە؟", () => {
                deleteFavoritesItem(index);
            });
        };

        li.appendChild(deleteButton);
        favoritesListDetailed.appendChild(li);
    });
}

/**
 * بابەتێکی دیاریکراو لە دڵخوازەکان دەسڕێتەوە.
 * @param {number} index - پێڕست (index)ـی ئەو بابەتەی دەسڕدرێتەوە.
 */
function deleteFavoritesItem(index) {
    favoritesData.splice(index, 1);
    saveDataToStorage(FAVORITES_KEY, favoritesData);
    displayFavoritesDetailed(); // نوێکردنەوەی لیستەکە
    updatePinIcon(); // پشکنینەوەی باری ئایکۆنی پین ئەگەر وشەی ئێستا سڕدرابێتەوە
}

/**
 * پشتڕاستکردنەوە و پاککردنەوەی هەموو داتای دڵخوازەکان.
 */
function confirmClearFavorites() {
    showConfirmation("دڵنیایت دەتەوێت هەموو وشە دڵخوازەکان پاک بکەیتەوە؟", () => {
        clearFavorites();
    });
}

/**
 * هەموو داتای دڵخوازەکان پاک دەکاتەوە.
 */
function clearFavorites() {
    favoritesData = [];
    localStorage.removeItem(FAVORITES_KEY);
    displayFavoritesDetailed(); // نوێکردنەوەی لیستەکە
    updatePinIcon(); // نوێکردنەوەی ئایکۆنی پین ئەگەر وشەی دڵخواز بوو
}

/**
 * مۆداڵی وردەکارییەکانی دڵخوازەکان پیشان دەدات.
 */
function showFavoritesDetails() {
    hideAllModalsAndSidebars(); // مۆداڵەکانی تر دەشارێتەوە
    favoritesDetailsModal.classList.remove('hidden');
    favoritesDetailsModal.classList.add('opacity-100', 'visibility-visible');
    overlay.classList.remove('hidden');
    overlay.classList.add('opacity-100');
    displayFavoritesDetailed(); // دڵنیابوون لەوەی دڵخوازەکان نوێن

    // بێکارکردنی سکڕۆڵی body
    document.body.style.overflow = 'hidden';
}

/**
 * مۆداڵی گەشەپدەر پیشان دەدات.
 */
function showDeveloperDetails() {
    hideAllModalsAndSidebars(); // مۆداڵەکانی تر دەشارێتەوە
    developerDetailsModal.classList.remove('hidden');
    developerDetailsModal.classList.add('opacity-100', 'visibility-visible');
    overlay.classList.remove('hidden');
    overlay.classList.add('opacity-100');

    // بێکارکردنی سکڕۆڵی body
    document.body.style.overflow = 'hidden';
}

// --- Custom Confirmation Modal Logic ---
let onConfirmCallback = null;
let onCancelCallback = null;

/**
 * Displays a custom confirmation modal.
 * @param {string} message - The message to display in the confirmation modal.
 * @param {function} onConfirm - Callback function to execute if user confirms.
 * @param {function} [onCancel] - Optional callback function to execute if user cancels.
 */
function showConfirmation(message, onConfirm, onCancel = null) {
    // گرنگ: چیتر hideAllModalsAndSidebars() لێرە بانگ ناکرێت.
    // مۆداڵێک کە ئەم پشتڕاستکردنەوەیەی بانگ کردووە (مێژوو/دڵخوازەکان/وەرگێڕان) دەبێت لە ژێرەوەدا کراوە بێت.

    confirmationMessage.textContent = message;
    onConfirmCallback = onConfirm;
    onCancelCallback = onCancel;

    confirmationModal.classList.remove('hidden');
    confirmationModal.classList.add('opacity-100', 'visibility-visible');
    // ڕووناکی سەر شاشە (overlay) و سکڕۆڵی body دەبێت لە لایەن مۆداڵە کراوەکەی ژێرەوەوە بەڕێوە ببرێن.
}

// Event listeners for confirmation buttons
confirmYesBtn.addEventListener('click', () => {
    if (onConfirmCallback) {
        onConfirmCallback();
    }
    // تەنها مۆداڵی پشتڕاستکردنەوە بشارەوە، نەک ڕووناکی سەر شاشە یان مۆداڵەکانی تر.
    confirmationModal.classList.add('hidden');
    confirmationModal.classList.remove('opacity-100', 'visibility-visible');
    // بەڕێوەبردنی ڕووناکی سەر شاشە و سکڕۆڵی body دەمێنێتەوە بۆ ئەو مۆداڵەی کە هێشتا کراوەیە (ئەگەر هەبێت).
});

confirmNoBtn.addEventListener('click', () => {
    if (onCancelCallback) {
        onCancelCallback();
    }
    // تەنها مۆداڵی پشتڕاستکردنەوە بشارەوە، نەک ڕووناکی سەر شاشە یان مۆداڵەکانی تر.
    confirmationModal.classList.add('hidden');
    confirmationModal.classList.remove('opacity-100', 'visibility-visible');
    // بەڕێوەبردنی ڕووناکی سەر شاشە و سکڕۆڵی body دەمێنێتەوە بۆ ئەو مۆداڵەی کە هێشتا کراوەیە (ئەگەر هەبێت).
});


// --- بەڕێوەبردنی Local Storage ---

/**
 * داتا لە localStorage بار دەکات.
 * @param {string} key - کلیل بۆ داتا لە localStorage.
 * @returns {Array} داتای شیکراوە یان ڕیزبەندییەکی بەتاڵ ئەگەر نەدۆزرایەوە.
 */
function loadDataFromStorage(key) {
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : [];
}

/**
 * داتا لە localStorage پاشەکەوت دەکات.
 * @param {string} key - کلیل بۆ داتا لە localStorage.
 * @param {Array} data - ڕیزبەندی بۆ پاشەکەوتکردن.
 */
function saveDataToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// --- فیدباکی UI ---
let alertTimeoutId = null;
/**
 * پەیامێکی ئاگادارکەرەوەی کاتی پیشان دەدات.
 * @param {string} message - پەیامەکە بۆ پیشاندان.
 */
function showAlert(message) {
    // Clear any existing alert timeout to prevent overlapping alerts
    if (alertTimeoutId) {
        clearTimeout(alertTimeoutId);
        customAlert.classList.remove('show');
        // Small delay to allow the removal class to apply before adding again
        setTimeout(() => {
            displayNewAlert(message);
        }, 50);
    } else {
        displayNewAlert(message);
    }
}

function displayNewAlert(message) {
    customAlert.textContent = message;
    customAlert.classList.add('show');

    alertTimeoutId = setTimeout(() => {
        customAlert.classList.remove('show');
        alertTimeoutId = null; // Reset timeout ID
    }, 4000); // Alert disappears after 4 seconds
}


// --- باری سەرەتایی پەیج ---
document.addEventListener('DOMContentLoaded', () => {
    historyData = loadDataFromStorage(HISTORY_KEY);
    favoritesData = loadDataFromStorage(FAVORITES_KEY);

    // دیاریکردنی زمانی سەرەتایی و ئەنجامدانی گەڕانی سەرەتایی
    setLanguage('english'); // ئەمە دەبێتە هۆی گڕگرتنی searchWords() و نوێکردنەوەی UI
});