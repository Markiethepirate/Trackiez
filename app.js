const videoUpload = document.getElementById('videoUpload');
const video = document.getElementById('videoElement');
const canvas = document.getElementById('canvasElement');
const ctx = canvas.getContext('2d');
const recordStatus = document.getElementById('recordStatus');
const uploadZone = document.getElementById('uploadZone');
const fileName = document.getElementById('fileName');
const resolutionLabel = document.getElementById('resolutionLabel');
const replaceVideoButton = document.getElementById('replaceVideoButton');
const demoBadge = document.getElementById('demoBadge');
const seekSlider = document.getElementById('seekSlider');
const currentTimeText = document.getElementById('currentTime');
const durationText = document.getElementById('duration');

let videoObjectUrl = null;
let activeDemoId = null;

const LANGUAGE_STORAGE_KEY = 'trackiez-language';
const LANGUAGE_MANUAL_KEY = 'trackiez-language-manual';
const RUSSIAN_INTERFACE_LANGUAGES = new Set(['ru', 'be']);

function getBrowserInterfaceLanguage() {
    const browserLanguages = typeof navigator !== 'undefined'
        ? (Array.isArray(navigator.languages) && navigator.languages.length ? navigator.languages : [navigator.language])
        : [];

    for (const locale of browserLanguages) {
        const language = String(locale || '').toLowerCase().split(/[-_]/)[0];
        if (RUSSIAN_INTERFACE_LANGUAGES.has(language)) return 'ru';
        if (language === 'en') return 'en';
    }

    return 'en';
}

function getInitialInterfaceLanguage() {
    try {
        const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) || localStorage.getItem('trace-language');
        const wasChosenManually = localStorage.getItem(LANGUAGE_MANUAL_KEY) === 'true';

        // English could only have been selected manually in the previous version,
        // whose automatic default was Russian. Preserve that existing choice.
        if ((wasChosenManually || savedLanguage === 'en') && (savedLanguage === 'ru' || savedLanguage === 'en')) {
            return savedLanguage;
        }
    } catch (e) {
        // Local storage may be unavailable when the page is opened from a restricted context.
    }

    return getBrowserInterfaceLanguage();
}

let currentLanguage = getInitialInterfaceLanguage();

const translations = {
    ru: {
        title: 'Trackiez — Digital Art Tool', languageLabel: 'Язык интерфейса',
        uploadVideo: 'Загрузить видео', replaceVideo: 'Другое видео', workspace: 'РАБОЧАЯ ОБЛАСТЬ', noSource: 'НЕТ ИСТОЧНИКА',
        drop: 'ПЕРЕТАЩИТЬ', dropVideo: 'ПЕРЕТАЩИТЕ ВИДЕО', chooseFile: 'или нажмите, чтобы выбрать файл',
        pause: 'Пауза', play: 'Плей', frame: 'Кадр', record: 'Записать', stop: 'Остановить',
        controlSurface: 'ПАНЕЛЬ УПРАВЛЕНИЯ', parameters: 'ПАРАМЕТРЫ', live: 'АКТИВНО', tracking: 'Трекинг',
        detectionMethod: 'Метод обнаружения', colorSearch: 'Поиск по цвету', aiNetwork: 'AI / Нейросеть',
        targetColor: 'Искомый цвет', red: 'Красный', green: 'Зелёный', blue: 'Синий', yellow: 'Жёлтый',
        white: 'Белый', black: 'Чёрный', sensitivity: 'Чувствительность', minSize: 'Мин. размер',
        aiTarget: 'AI-цель', face: 'Лицо человека', eyes: 'Глаза / зрачки', body: 'Фигура человека',
        customObject: 'Класс объекта', objectClass: 'Объект для отслеживания', objectSearchPlaceholder: 'Начните вводить: собака или dog', noObjectMatches: 'Нет подходящих объектов', overlay: 'Оверлей',
        shape: 'Форма', rectangle: 'Прямоугольник', circle: 'Круг', color: 'Цвет', orange: 'Оранжевый',
        cyan: 'Циан', pink: 'Розовый', acid: 'Фуксия', noBorder: 'Без рамки', lineWidth: 'Толщина линии',
        smoothness: 'Плавность', labelText: 'Текст метки', hideLabelText: 'Скрыть подпись', matchLabelColor: 'Цвет как у обводки', objectName: 'Название объекта', effects: 'Эффекты',
        grayscale: 'Чёрно-белое', invert: 'Инверсия', posterize: 'Постеризация', pixelate: 'Пикселизация',
        radialBlur: 'Радиальное размытие', defaultObject: 'Объект',
        invalidVideo: 'ВЫБЕРИТЕ ВИДЕОФАЙЛ MP4, WEBM ИЛИ MOV', demoLoadError: 'НЕ УДАЛОСЬ ЗАГРУЗИТЬ ДЕМО-ВИДЕО', aiLoading: 'ЗАГРУЗКА AI-МОДЕЛИ...',
        aiReady: 'AI-МОДЕЛЬ ГОТОВА', aiError: 'ОШИБКА ЗАГРУЗКИ AI · ПРОВЕРЬТЕ ИНТЕРНЕТ',
        frameSaved: 'КАДР СОХРАНЁН', recording: 'ИДЁТ ЗАПИСЬ', videoSaved: 'ВИДЕО СОХРАНЕНО',
        uploadFirst: 'Сначала загрузите видео!', closeDialog: 'Закрыть', demoLabel: 'ДЕМО',
        demoEditorTitle: 'РЕДАКТОР ДЕМО', demoEditorHelp: 'Настройте выбранное видео обычными параметрами, затем сохраните его пресет.',
        demoEditorVideoChoice: 'Выбор демо-видео', demoOne: 'ВИДЕО 1', demoTwo: 'ВИДЕО 2',
        saveDemoPreset: 'СОХРАНИТЬ ПРЕСЕТ', copyDemoPresets: 'СКОПИРОВАТЬ ОБА', resetDemoPresets: 'СБРОСИТЬ',
        demoPresetSaved: 'ПРЕСЕТ СОХРАНЁН', demoPresetsCopied: 'ОБА ПРЕСЕТА СКОПИРОВАНЫ', demoPresetsCopyFailed: 'НЕ УДАЛОСЬ СКОПИРОВАТЬ', demoPresetsReset: 'ПРЕСЕТЫ СБРОШЕНЫ',
        aboutCopy: 'Trackiez — инструмент для цифрового творчества в браузере. Добавляйте в видео трекинг-графику и визуальные эффекты, настраивайте результат и экспортируйте готовый клип. Всё работает локально — ваше видео не загружается на сервер.',
        contactsCopy: 'Trackiez создал Марк Мазин. Присылайте отзывы или отмечайте меня, когда публикуете свои работы:',
        webmOnlyTitle: 'Этот браузер записывает только WebM',
        webmOnlyBody: 'Вы можете скачать готовый WebM или конвертировать его в совместимый MP4 прямо на этом устройстве.',
        localConversionNote: 'Конвертация выполняется в браузере. Видео не отправляется на сервер.',
        downloadWebm: 'Скачать WebM', convertMp4: 'Конвертировать в MP4',
        conversionPreparing: 'Подготовка конвертации…', conversionLoading: 'ЗАГРУЗКА МОДУЛЯ КОНВЕРТАЦИИ…',
        conversionRunning: 'КОНВЕРТАЦИЯ В MP4…', conversionDone: 'MP4 СОХРАНЁН',
        conversionError: 'НЕ УДАЛОСЬ КОНВЕРТИРОВАТЬ · СКАЧАЙТЕ WEBM',
        exportChoice: 'ВЫБЕРИТЕ ФОРМАТ ЭКСПОРТА', mp4Saved: 'MP4 СОХРАНЁН',
        recorderUnsupported: 'ЗАПИСЬ ВИДЕО НЕ ПОДДЕРЖИВАЕТСЯ ЭТИМ БРАУЗЕРОМ',
        recorderError: 'НЕ УДАЛОСЬ НАЧАТЬ ЗАПИСЬ',
        howItWorks: 'КАК ЭТО РАБОТАЕТ', about: 'О ПРОЕКТЕ', contacts: 'КОНТАКТЫ', mainNavigation: 'Основная навигация', guideTitle: 'КАК ЭТО РАБОТАЕТ',
        guideIntro: 'Пять шагов от исходного видео до готовой работы. Все вычисления происходят на вашем устройстве.',
        guideUploadTitle: 'Добавьте видео', guideUploadBody: 'Загрузите MP4, WebM или MOV. Видео начнёт проигрываться автоматически; его можно поставить на паузу и продолжить настройку на выбранном кадре.',
        guideTrackingTitle: 'Выберите, что отслеживать', guideTrackingBody: 'Поиск по цвету подходит для яркого однотонного объекта. Режим нейросети умеет находить лица, глаза, фигуры людей и поддерживаемые классы объектов.',
        guideSensitivity: 'Чем выше значение, тем больше похожих оттенков попадёт в область трекинга.', guideMinSize: 'Отсекает маленькие пятна и случайный визуальный шум.',
        guideAiTarget: 'Выберите тип цели. Для «Класса объекта» начните вводить название и выберите вариант из списка.',
        guideOverlayTitle: 'Настройте графику', guideOverlayBody: 'Выберите прямоугольник или круг, цвет рамки и подпись. Изменения сразу видны и во время воспроизведения, и на паузе.',
        guideLineWidth: 'Значение 0 полностью скрывает рамку, оставляя эффект или подпись.', guideSmoothness: 'Малое значение быстрее следует за целью; большое делает движение мягче, но добавляет задержку.',
        guideLabel: 'Подпись можно изменить, скрыть или окрасить в цвет рамки.',
        guideEffectsTitle: 'Добавьте эффекты', guideEffectsBody: 'Эффекты применяются внутри отслеживаемой области. Можно сочетать чёрно-белый режим, инверсию, постеризацию, пикселизацию и радиальное размытие.',
        guideExportTitle: 'Сохраните результат', guideExportBody: '«Кадр» сохраняет текущий кадр как PNG. «Записать» захватывает обработанное видео; повторное нажатие завершает экспорт. Если MP4 недоступен, Trackiez предложит WebM или локальную конвертацию.',
        restartTour: 'ПОВТОРИТЬ ТУР', restartTips: 'ПОКАЗАТЬ ПОДСКАЗКИ', skipTour: 'ПРОПУСТИТЬ', skipTips: 'ПРОПУСТИТЬ',
        back: 'НАЗАД', next: 'ДАЛЕЕ', finish: 'ГОТОВО', firstProject: 'ПЕРВЫЙ ПРОЕКТ',
        tourUploadTitle: 'Посмотрите готовый пример', tourUploadBody: 'При входе Trackiez запускает демо с готовым пресетом. Посмотрите результат или нажмите «Загрузить видео», чтобы начать со своим MP4, WebM или MOV.',
        tourTrackingTitle: 'Скажите, что искать', tourTrackingBody: 'Выберите поиск по цвету или нейросеть, а затем уточните цвет, лицо, глаза, фигуру человека или класс объекта.',
        tourOverlayTitle: 'Создайте графику', tourOverlayBody: 'Здесь настраиваются форма, цвет и толщина рамки, плавность движения и текст подписи.',
        tourEffectsTitle: 'Измените изображение', tourEffectsBody: 'Эффекты работают внутри отслеживаемой области. Их можно включать по одному или сочетать.',
        tourExportTitle: 'Сохраните работу', tourExportBody: '«Кадр» сохраняет PNG, а «Записать» создаёт обработанное видео. Теперь можно начать первый проект.',
        coachUploadTitle: 'Загрузите первое видео', coachUploadBody: 'Выберите короткий клип с хорошо заметным цветом, лицом или объектом. Подсказка продолжится после загрузки.',
        coachTrackingTitle: 'Настройте трекинг', coachTrackingBody: 'Выберите метод обнаружения и цель. Для цветового режима проверьте цвет, чувствительность и минимальный размер.',
        coachOverlayTitle: 'Настройте оверлей', coachOverlayBody: 'Попробуйте изменить форму, цвет или толщину линии. Любое изменение сразу появится в превью.',
        coachEffectsTitle: 'Добавьте эффект — если хотите', coachEffectsBody: 'Эффекты необязательны. Включите один из них или переходите дальше без изменений.',
        coachExportTitle: 'Экспортируйте результат', coachExportBody: 'Нажмите «Записать», проиграйте нужный фрагмент и нажмите ещё раз, чтобы сохранить видео.'
    },
    en: {
        title: 'Trackiez — Digital Art Tool', languageLabel: 'Interface language',
        uploadVideo: 'Upload video', replaceVideo: 'Replace video', workspace: 'WORKSPACE', noSource: 'NO SOURCE',
        drop: 'DROP', dropVideo: 'DROP YOUR VIDEO', chooseFile: 'or click to choose a file',
        pause: 'Pause', play: 'Play', frame: 'Frame', record: 'Record', stop: 'Stop',
        controlSurface: 'CONTROL SURFACE', parameters: 'PARAMETERS', live: 'LIVE', tracking: 'Tracking',
        detectionMethod: 'Detection method', colorSearch: 'Color search', aiNetwork: 'AI / Neural network',
        targetColor: 'Target color', red: 'Red', green: 'Green', blue: 'Blue', yellow: 'Yellow',
        white: 'White', black: 'Black', sensitivity: 'Sensitivity', minSize: 'Min. size',
        aiTarget: 'AI target', face: 'Human face', eyes: 'Eyes / pupils', body: 'Human body',
        customObject: 'Object class', objectClass: 'Object to track', objectSearchPlaceholder: 'Start typing: dog or car', noObjectMatches: 'No matching objects', overlay: 'Overlay',
        shape: 'Shape', rectangle: 'Rectangle', circle: 'Circle', color: 'Color', orange: 'Orange',
        cyan: 'Cyan', pink: 'Pink', acid: 'Magenta', noBorder: 'No border', lineWidth: 'Line width',
        smoothness: 'Smoothness', labelText: 'Label text', hideLabelText: 'Hide label', matchLabelColor: 'Match outline color', objectName: 'Object name', effects: 'Effects',
        grayscale: 'Grayscale', invert: 'Invert', posterize: 'Posterize', pixelate: 'Pixelate',
        radialBlur: 'Radial blur', defaultObject: 'Object',
        invalidVideo: 'SELECT AN MP4, WEBM OR MOV VIDEO FILE', demoLoadError: 'COULD NOT LOAD THE DEMO VIDEO', aiLoading: 'LOADING AI MODEL...',
        aiReady: 'AI MODEL READY', aiError: 'AI LOAD ERROR · CHECK YOUR CONNECTION',
        frameSaved: 'FRAME SAVED', recording: 'RECORDING', videoSaved: 'VIDEO SAVED',
        uploadFirst: 'Upload a video first!', closeDialog: 'Close', demoLabel: 'DEMO',
        demoEditorTitle: 'DEMO EDITOR', demoEditorHelp: 'Adjust the selected video with the regular controls, then save its preset.',
        demoEditorVideoChoice: 'Demo video choice', demoOne: 'VIDEO 1', demoTwo: 'VIDEO 2',
        saveDemoPreset: 'SAVE PRESET', copyDemoPresets: 'COPY BOTH', resetDemoPresets: 'RESET',
        demoPresetSaved: 'PRESET SAVED', demoPresetsCopied: 'BOTH PRESETS COPIED', demoPresetsCopyFailed: 'COPY FAILED', demoPresetsReset: 'PRESETS RESET',
        aboutCopy: 'Trackiez is a digital art tool for adding tracking graphics and visual effects to video. Upload a clip, choose what to track, customize the result, and export the finished video. Everything runs locally in your browser — your video is never uploaded to a server.',
        contactsCopy: 'Trackiez was made by Mark Mazin. Please send me your feedback or tag me when you share your creations:',
        webmOnlyTitle: 'This browser can only record WebM',
        webmOnlyBody: 'Download the finished WebM or convert it to a compatible MP4 directly on this device.',
        localConversionNote: 'Conversion runs in your browser. Your video is never uploaded to a server.',
        downloadWebm: 'Download WebM', convertMp4: 'Convert to MP4',
        conversionPreparing: 'Preparing conversion…', conversionLoading: 'LOADING CONVERSION ENGINE…',
        conversionRunning: 'CONVERTING TO MP4…', conversionDone: 'MP4 SAVED',
        conversionError: 'CONVERSION FAILED · DOWNLOAD THE WEBM INSTEAD',
        exportChoice: 'CHOOSE AN EXPORT FORMAT', mp4Saved: 'MP4 SAVED',
        recorderUnsupported: 'VIDEO RECORDING IS NOT SUPPORTED BY THIS BROWSER',
        recorderError: 'COULD NOT START RECORDING',
        howItWorks: 'HOW IT WORKS', about: 'ABOUT', contacts: 'CONTACTS', mainNavigation: 'Main navigation', guideTitle: 'HOW IT WORKS',
        guideIntro: 'Five steps from your source video to a finished piece. All processing happens on your device.',
        guideUploadTitle: 'Add a video', guideUploadBody: 'Upload an MP4, WebM or MOV. The video starts automatically; pause it at any frame and keep adjusting the look.',
        guideTrackingTitle: 'Choose what to track', guideTrackingBody: 'Color search works well for a bright, solid-colored subject. Neural tracking can find faces, eyes, people and supported object classes.',
        guideSensitivity: 'Higher values include a wider range of similar colors in the tracked area.', guideMinSize: 'Ignores small color patches and accidental visual noise.',
        guideAiTarget: 'Choose a target type. For Object class, start typing a name and select one of the supported options.',
        guideOverlayTitle: 'Style the graphic', guideOverlayBody: 'Choose a rectangle or circle, an outline color and a label. Changes appear during playback and while paused.',
        guideLineWidth: 'Set it to 0 to hide the outline while keeping the effect or label.', guideSmoothness: 'Low values react faster; high values move more softly but add some delay.',
        guideLabel: 'Change the label, hide it, or match its color to the outline.',
        guideEffectsTitle: 'Add effects', guideEffectsBody: 'Effects are applied inside the tracked area. Combine grayscale, invert, posterize, pixelate and radial blur.',
        guideExportTitle: 'Save the result', guideExportBody: 'Frame saves the current image as a PNG. Record captures the processed video; press it again to finish. If MP4 is unavailable, Trackiez offers WebM or local conversion.',
        restartTour: 'REPLAY INTERFACE TOUR', restartTips: 'SHOW PROJECT TIPS', skipTour: 'SKIP TOUR', skipTips: 'SKIP TIPS',
        back: 'BACK', next: 'NEXT', finish: 'FINISH', firstProject: 'FIRST PROJECT',
        tourUploadTitle: 'Explore a finished example', tourUploadBody: 'Trackiez opens with a demo and a ready-made preset. Explore the result or select Upload video to start with your own MP4, WebM or MOV.',
        tourTrackingTitle: 'Tell Trackiez what to find', tourTrackingBody: 'Choose color search or neural tracking, then select a color, face, eyes, person or supported object class.',
        tourOverlayTitle: 'Create the graphic', tourOverlayBody: 'Set the shape, outline color and width, motion smoothness and label text here.',
        tourEffectsTitle: 'Transform the image', tourEffectsBody: 'Effects work inside the tracked area. Use one effect or combine several.',
        tourExportTitle: 'Save your work', tourExportBody: 'Frame saves a PNG; Record creates a processed video. You are ready to begin your first project.',
        coachUploadTitle: 'Upload your first video', coachUploadBody: 'Choose a short clip with a clear color, face or object. The guide continues after your video loads.',
        coachTrackingTitle: 'Set up tracking', coachTrackingBody: 'Choose a detection method and target. For color tracking, check the color, sensitivity and minimum size.',
        coachOverlayTitle: 'Style the overlay', coachOverlayBody: 'Try changing the shape, color or line width. Every change appears immediately in the preview.',
        coachEffectsTitle: 'Add an effect — if you want', coachEffectsBody: 'Effects are optional. Switch one on or continue without changing anything.',
        coachExportTitle: 'Export the result', coachExportBody: 'Press Record, play the section you need, then press it again to save the processed video.'
    }
};

let refreshObjectComboboxLanguage = () => {};
let refreshOnboardingLanguage = () => {};

function t(key) {
    return translations[currentLanguage][key] || translations.ru[key] || key;
}

function applyLanguage(language, persistSelection = true) {
    currentLanguage = language;
    document.documentElement.lang = language;
    document.title = t('title');

    document.querySelectorAll('[data-i18n]').forEach(element => {
        element.textContent = t(element.dataset.i18n);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        element.placeholder = t(element.dataset.i18nPlaceholder);
    });

    document.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
        element.setAttribute('aria-label', t(element.dataset.i18nAriaLabel));
    });

    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        element.title = t(element.dataset.i18nTitle);
    });

    const labelInput = document.getElementById('labelText');
    if (labelInput.value === translations.ru.defaultObject || labelInput.value === translations.en.defaultObject) {
        labelInput.value = t('defaultObject');
    }

    document.querySelectorAll('.language-option').forEach(button => {
        const isActive = button.dataset.language === language;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
    });

    if (typeof setPlayButtonState === 'function' && typeof playPauseBtn !== 'undefined') {
        setPlayButtonState(!video.paused && !video.ended);
    }
    if (typeof isRecording !== 'undefined') {
        const recordLabel = document.querySelector('#recordBtn span');
        recordLabel.dataset.i18n = isRecording ? 'stop' : 'record';
        recordLabel.textContent = t(recordLabel.dataset.i18n);
    }
    if (typeof syncColorPickerLabels === 'function') syncColorPickerLabels();
    if (typeof refreshObjectComboboxLanguage === 'function') refreshObjectComboboxLanguage();
    if (typeof refreshOnboardingLanguage === 'function') refreshOnboardingLanguage();
    if (typeof updateDemoBadge === 'function') updateDemoBadge();

    if (persistSelection) {
        try {
            localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
            localStorage.setItem(LANGUAGE_MANUAL_KEY, 'true');
        } catch (e) {}
    }
}

document.querySelectorAll('.language-option').forEach(button => {
    button.addEventListener('click', () => applyLanguage(button.dataset.language));
});

const aboutDialog = document.getElementById('aboutDialog');
const contactsDialog = document.getElementById('contactsDialog');
const howItWorksDialog = document.getElementById('howItWorksDialog');
const exportDialog = document.getElementById('exportDialog');

function openSiteDialog(dialog) {
    if (!dialog || dialog.open) return;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
}

function closeSiteDialog(dialog) {
    if (!dialog || !dialog.open || dialog.classList.contains('is-busy')) return;
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
}

document.getElementById('aboutBtn').addEventListener('click', () => openSiteDialog(aboutDialog));
document.getElementById('contactsBtn').addEventListener('click', () => openSiteDialog(contactsDialog));
document.getElementById('howItWorksBtn').addEventListener('click', () => openSiteDialog(howItWorksDialog));

document.querySelectorAll('[data-dialog-close]').forEach(button => {
    button.addEventListener('click', () => closeSiteDialog(button.closest('dialog')));
});

document.querySelectorAll('.site-dialog').forEach(dialog => {
    dialog.addEventListener('click', event => {
        if (event.target === dialog) closeSiteDialog(dialog);
    });
    dialog.addEventListener('cancel', event => {
        if (dialog.classList.contains('is-busy')) event.preventDefault();
    });
});

function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function updateRangeProgress(input) {
    const min = parseFloat(input.min) || 0;
    const max = parseFloat(input.max) || 100;
    const value = parseFloat(input.value) || 0;
    const progress = ((value - min) / (max - min)) * 100;
    input.style.setProperty('--range-progress', `${progress}%`);
}

document.querySelectorAll('input[type="range"]').forEach(input => {
    updateRangeProgress(input);
    input.addEventListener('input', () => updateRangeProgress(input));
});

// --- ЛОГИКА ПЕРЕКЛЮЧЕНИЯ ИНТЕРФЕЙСА ---
const trackingMode = document.getElementById('trackingMode');
const colorSettingsBlock = document.getElementById('colorSettingsBlock');
const aiSettingsBlock = document.getElementById('aiSettingsBlock');
const aiTargetSelect = document.getElementById('aiTargetSelect');
const aiObjectInputBlock = document.getElementById('aiObjectInputBlock');
const aiObjectName = document.getElementById('aiObjectName');
const aiObjectSearch = document.getElementById('aiObjectSearch');
const aiObjectList = document.getElementById('aiObjectList');
const objectCombobox = document.getElementById('objectCombobox');

const objectClasses = [
    ['person', 'человек'], ['bicycle', 'велосипед'], ['car', 'автомобиль'], ['motorcycle', 'мотоцикл'],
    ['airplane', 'самолёт'], ['bus', 'автобус'], ['train', 'поезд'], ['truck', 'грузовик'], ['boat', 'лодка'],
    ['traffic light', 'светофор'], ['fire hydrant', 'пожарный гидрант'], ['stop sign', 'знак стоп'],
    ['parking meter', 'паркомат'], ['bench', 'скамейка'], ['bird', 'птица'], ['cat', 'кошка'], ['dog', 'собака'],
    ['horse', 'лошадь'], ['sheep', 'овца'], ['cow', 'корова'], ['elephant', 'слон'], ['bear', 'медведь'],
    ['zebra', 'зебра'], ['giraffe', 'жираф'], ['backpack', 'рюкзак'], ['umbrella', 'зонт'], ['handbag', 'сумка'],
    ['tie', 'галстук'], ['suitcase', 'чемодан'], ['frisbee', 'фрисби'], ['skis', 'лыжи'], ['snowboard', 'сноуборд'],
    ['sports ball', 'мяч'], ['kite', 'воздушный змей'], ['baseball bat', 'бейсбольная бита'],
    ['baseball glove', 'бейсбольная перчатка'], ['skateboard', 'скейтборд'], ['surfboard', 'доска для сёрфинга'],
    ['tennis racket', 'теннисная ракетка'], ['bottle', 'бутылка'], ['wine glass', 'бокал'], ['cup', 'чашка'],
    ['fork', 'вилка'], ['knife', 'нож'], ['spoon', 'ложка'], ['bowl', 'миска'], ['banana', 'банан'], ['apple', 'яблоко'],
    ['sandwich', 'сэндвич'], ['orange', 'апельсин'], ['broccoli', 'брокколи'], ['carrot', 'морковь'],
    ['hot dog', 'хот-дог'], ['pizza', 'пицца'], ['donut', 'пончик'], ['cake', 'торт'], ['chair', 'стул'],
    ['couch', 'диван'], ['potted plant', 'растение в горшке'], ['bed', 'кровать'], ['dining table', 'обеденный стол'],
    ['toilet', 'унитаз'], ['tv', 'телевизор'], ['laptop', 'ноутбук'], ['mouse', 'компьютерная мышь'],
    ['remote', 'пульт'], ['keyboard', 'клавиатура'], ['cell phone', 'мобильный телефон'], ['microwave', 'микроволновка'],
    ['oven', 'духовка'], ['toaster', 'тостер'], ['sink', 'раковина'], ['refrigerator', 'холодильник'],
    ['book', 'книга'], ['clock', 'часы'], ['vase', 'ваза'], ['scissors', 'ножницы'], ['teddy bear', 'плюшевый медведь'],
    ['hair drier', 'фен'], ['toothbrush', 'зубная щётка']
].map(([key, ru]) => ({ key, ru }));

let selectedObjectKey = 'airplane';
let visibleObjectClasses = [];
let activeObjectIndex = -1;

function englishObjectName(key) {
    return key.replace(/\b\w/g, character => character.toUpperCase());
}

function objectInputValue(item) {
    return currentLanguage === 'ru' ? `${item.ru} — ${item.key}` : englishObjectName(item.key);
}

function setObjectListOpen(isOpen) {
    aiObjectList.hidden = !isOpen;
    objectCombobox.classList.toggle('is-open', isOpen);
    aiObjectSearch.setAttribute('aria-expanded', String(isOpen));
    if (!isOpen) {
        activeObjectIndex = -1;
        aiObjectSearch.removeAttribute('aria-activedescendant');
    }
}

function renderObjectOptions(query = '') {
    const normalizedQuery = query.toLocaleLowerCase('ru').trim();
    visibleObjectClasses = objectClasses.filter(item =>
        !normalizedQuery || item.key.includes(normalizedQuery) || item.ru.includes(normalizedQuery)
    );
    activeObjectIndex = -1;
    aiObjectList.replaceChildren();

    if (!visibleObjectClasses.length) {
        const empty = document.createElement('div');
        empty.className = 'object-empty';
        empty.textContent = t('noObjectMatches');
        aiObjectList.appendChild(empty);
        setObjectListOpen(true);
        return;
    }

    visibleObjectClasses.forEach((item, index) => {
        const option = document.createElement('button');
        option.type = 'button';
        option.className = 'object-option';
        option.id = `object-option-${index}`;
        option.setAttribute('role', 'option');
        option.setAttribute('aria-selected', String(item.key === selectedObjectKey));
        const primary = document.createElement('span');
        const secondary = document.createElement('small');
        primary.textContent = currentLanguage === 'ru' ? item.ru : englishObjectName(item.key);
        secondary.textContent = currentLanguage === 'ru' ? item.key : item.ru;
        option.append(primary, secondary);
        option.addEventListener('mousedown', event => event.preventDefault());
        option.addEventListener('click', () => selectObjectClass(item));
        aiObjectList.appendChild(option);
    });
    setObjectListOpen(true);
}

function selectObjectClass(item) {
    selectedObjectKey = item.key;
    aiObjectName.value = item.key;
    aiObjectSearch.value = objectInputValue(item);
    aiObjectName.dispatchEvent(new Event('change', { bubbles: true }));
    setObjectListOpen(false);
}

function updateActiveObjectOption(nextIndex) {
    const options = Array.from(aiObjectList.querySelectorAll('.object-option'));
    if (!options.length) return;
    activeObjectIndex = (nextIndex + options.length) % options.length;
    options.forEach((option, index) => option.classList.toggle('is-active', index === activeObjectIndex));
    const activeOption = options[activeObjectIndex];
    aiObjectSearch.setAttribute('aria-activedescendant', activeOption.id);
    activeOption.scrollIntoView({ block: 'nearest' });
}

aiObjectSearch.addEventListener('focus', () => {
    aiObjectSearch.select();
    renderObjectOptions();
});

aiObjectSearch.addEventListener('input', () => {
    aiObjectName.value = '';
    aiObjectName.dispatchEvent(new Event('change', { bubbles: true }));
    renderObjectOptions(aiObjectSearch.value);
});

aiObjectSearch.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (aiObjectList.hidden) renderObjectOptions(aiObjectSearch.value);
        updateActiveObjectOption(activeObjectIndex + 1);
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (aiObjectList.hidden) renderObjectOptions(aiObjectSearch.value);
        updateActiveObjectOption(activeObjectIndex - 1);
    } else if (event.key === 'Enter') {
        const normalizedQuery = aiObjectSearch.value.toLocaleLowerCase('ru').trim();
        const exactMatch = visibleObjectClasses.find(item => item.key === normalizedQuery || item.ru === normalizedQuery);
        const itemToSelect = activeObjectIndex >= 0
            ? visibleObjectClasses[activeObjectIndex]
            : exactMatch || (visibleObjectClasses.length === 1 ? visibleObjectClasses[0] : null);
        if (itemToSelect) {
            event.preventDefault();
            selectObjectClass(itemToSelect);
        }
    } else if (event.key === 'Escape') {
        aiObjectSearch.value = objectInputValue(objectClasses.find(item => item.key === selectedObjectKey));
        aiObjectName.value = selectedObjectKey;
        setObjectListOpen(false);
    }
});

document.addEventListener('pointerdown', event => {
    if (objectCombobox.contains(event.target)) return;
    aiObjectSearch.value = objectInputValue(objectClasses.find(item => item.key === selectedObjectKey));
    aiObjectName.value = selectedObjectKey;
    setObjectListOpen(false);
});

refreshObjectComboboxLanguage = () => {
    const selectedItem = objectClasses.find(item => item.key === selectedObjectKey);
    if (selectedItem) aiObjectSearch.value = objectInputValue(selectedItem);
    setObjectListOpen(false);
};

trackingMode.addEventListener('change', (e) => {
    previousBlobs = [];
    lastVideoTime = -1;
    lastAiResults = null;
    if (e.target.value === 'color') {
        colorSettingsBlock.style.display = 'flex';
        aiSettingsBlock.style.display = 'none';
    } else {
        colorSettingsBlock.style.display = 'none';
        aiSettingsBlock.style.display = 'flex';
        initializeAI(); 
    }
});

aiTargetSelect.addEventListener('change', (e) => {
    previousBlobs = [];
    lastVideoTime = -1;
    lastAiResults = null;
    if (e.target.value === 'object') {
        aiObjectInputBlock.style.display = 'flex';
    } else {
        aiObjectInputBlock.style.display = 'none';
    }
    initializeAI(); 
});


// --- БЕЗОПАСНАЯ ЗАГРУЗКА 3-Х РАЗНЫХ НЕЙРОСЕТЕЙ ---
let faceDetector = null;    
let faceLandmarker = null;  
let objectDetector = null;  
let isAiLoading = false;
let pendingAiTarget = null;

async function initializeAI() {
    const target = aiTargetSelect.value;
    
    if (target === 'face' && faceDetector) return;
    if (target === 'eyes' && faceLandmarker) return;
    if ((target === 'body' || target === 'object') && objectDetector) return;

    if (isAiLoading) {
        pendingAiTarget = target;
        return;
    }
    isAiLoading = true;
    recordStatus.textContent = t('aiLoading');
    recordStatus.style.color = "#f0f2ee";

    try {
        const mediapipe = await import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/+esm");
        const vision = await mediapipe.FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );

        if (target === 'face') {
            faceDetector = await mediapipe.FaceDetector.createFromOptions(vision, {
                baseOptions: { modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite", delegate: "GPU" },
                runningMode: "VIDEO"
            });
        } else if (target === 'eyes') {
            faceLandmarker = await mediapipe.FaceLandmarker.createFromOptions(vision, {
                baseOptions: { modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task", delegate: "GPU" },
                runningMode: "VIDEO", numFaces: 3
            });
        } else if (target === 'body' || target === 'object') {
            objectDetector = await mediapipe.ObjectDetector.createFromOptions(vision, {
                baseOptions: { modelAssetPath: "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite", delegate: "GPU" },
                runningMode: "VIDEO", scoreThreshold: 0.3, maxResults: 10
            });
        }
        
        recordStatus.textContent = t('aiReady');
        recordStatus.style.color = "#d129a1";
        setTimeout(() => recordStatus.textContent = "", 3000);
    } catch (e) {
        recordStatus.textContent = t('aiError');
        recordStatus.style.color = "#ff4e52";
        console.error(e);
    }
    isAiLoading = false;
    schedulePausedPreview();

    const nextTarget = pendingAiTarget;
    pendingAiTarget = null;
    if (nextTarget && nextTarget !== target && trackingMode.value === 'ai') initializeAI();
}

// --- ИНИЦИАЛИЗАЦИЯ ИНТЕРФЕЙСА ---
const colorSelect = document.getElementById('colorSelect');
const toleranceSlider = document.getElementById('toleranceSlider');
const toleranceValueText = document.getElementById('toleranceValue');
const minSizeSlider = document.getElementById('minSizeSlider');
const minSizeValueText = document.getElementById('minSizeValue');

const vizShape = document.getElementById('vizShape');
const vizColor = document.getElementById('vizColor');
const overlayColors = {
    orange: '#FFA500', cyan: '#00FFFF', white: '#FFFFFF', black: '#000000',
    red: '#FF0000', blue: '#0000FF', pink: '#FF1493', lime: '#d129a1'
};
const lineWidthSlider = document.getElementById('lineWidthSlider'); 
const lineWidthValueText = document.getElementById('lineWidthValue');
const labelText = document.getElementById('labelText');
const hideLabelText = document.getElementById('hideLabelText');
const matchLabelColor = document.getElementById('matchLabelColor');
const smoothSlider = document.getElementById('smoothSlider');
const smoothValueText = document.getElementById('smoothValue');

// НОВОЕ: Подключаем чекбокс Ч/Б
const effGrayscale = document.getElementById('effGrayscale');
const effInvert = document.getElementById('effInvert');
const effPosterize = document.getElementById('effPosterize');
const valPosterize = document.getElementById('valPosterize');
const effPixelate = document.getElementById('effPixelate');
const valPixelate = document.getElementById('valPixelate');
const effBlur = document.getElementById('effBlur');
const valBlur = document.getElementById('valBlur');

let syncColorPickerLabels = () => {};
const colorPickerSyncCallbacks = [];

document.querySelectorAll('.color-picker').forEach(picker => {
    const group = picker.querySelector('.color-swatches');
    const select = document.getElementById(group.dataset.colorSelect);
    const swatches = Array.from(group.querySelectorAll('.color-swatch'));
    const trigger = picker.querySelector('.color-picker-trigger');
    const currentColor = trigger.querySelector('.color-current');

    const closePicker = () => {
        group.hidden = true;
        picker.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
    };

    const syncSwatches = () => {
        const activeSwatch = swatches.find(swatch => swatch.dataset.value === select.value);
        swatches.forEach(swatch => {
            const isActive = swatch.dataset.value === select.value;
            swatch.classList.toggle('active', isActive);
            swatch.setAttribute('aria-checked', String(isActive));
        });
        if (activeSwatch) {
            currentColor.style.setProperty('--selected-color', activeSwatch.style.getPropertyValue('--swatch'));
            currentColor.classList.toggle('light-swatch', activeSwatch.classList.contains('light-swatch'));
            currentColor.classList.toggle('dark-swatch', activeSwatch.classList.contains('dark-swatch'));
            currentColor.classList.toggle('transparent-swatch', activeSwatch.classList.contains('transparent-swatch'));
        }
        trigger.setAttribute('aria-label', `${t(trigger.dataset.labelKey)}: ${t(select.value === 'lime' ? 'acid' : select.value)}`);
    };

    trigger.addEventListener('click', () => {
        const willOpen = group.hidden;
        document.querySelectorAll('.color-picker.is-open').forEach(openPicker => {
            if (openPicker !== picker) {
                openPicker.classList.remove('is-open');
                openPicker.querySelector('.color-swatches').hidden = true;
                openPicker.querySelector('.color-picker-trigger').setAttribute('aria-expanded', 'false');
            }
        });
        group.hidden = !willOpen;
        picker.classList.toggle('is-open', willOpen);
        trigger.setAttribute('aria-expanded', String(willOpen));
    });

    swatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            select.value = swatch.dataset.value;
            syncSwatches();
            select.dispatchEvent(new Event('change', { bubbles: true }));
            closePicker();
            trigger.focus();
        });
    });

    select.addEventListener('change', syncSwatches);
    colorPickerSyncCallbacks.push(syncSwatches);
    syncSwatches();
});

syncColorPickerLabels = () => colorPickerSyncCallbacks.forEach(sync => sync());

document.addEventListener('click', (event) => {
    document.querySelectorAll('.color-picker.is-open').forEach(picker => {
        if (!picker.contains(event.target)) {
            picker.classList.remove('is-open');
            picker.querySelector('.color-swatches').hidden = true;
            picker.querySelector('.color-picker-trigger').setAttribute('aria-expanded', 'false');
        }
    });
});

document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    document.querySelectorAll('.color-picker.is-open').forEach(picker => {
        picker.classList.remove('is-open');
        picker.querySelector('.color-swatches').hidden = true;
        const trigger = picker.querySelector('.color-picker-trigger');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.focus();
    });
});

toleranceSlider.addEventListener('input', () => toleranceValueText.textContent = toleranceSlider.value);
minSizeSlider.addEventListener('input', () => minSizeValueText.textContent = minSizeSlider.value);
smoothSlider.addEventListener('input', () => smoothValueText.textContent = smoothSlider.value);
lineWidthSlider.addEventListener('input', () => lineWidthValueText.textContent = lineWidthSlider.value);

const USER_DEFAULT_PRESET = {
    tracking: { mode: 'color', color: 'red', tolerance: 50, minSize: 100, target: 'face', object: 'airplane' },
    overlay: { shape: 'rect', color: 'lime', lineWidth: 4, smoothness: 0.2, label: null, hideLabel: false, matchLabelColor: false },
    effects: { grayscale: false, invert: false, posterize: false, posterizeLevels: 5, pixelate: false, pixelSize: 10, blur: false, blurStrength: 10 }
};

const DEMO_PRESET_STORAGE_KEY = 'trackiez-demo-preset-overrides-v2';
const DEMO_VIDEOS = [
    {
        id: 'trackin-1',
        number: '01',
        src: 'assets/demo/trackin-1.mp4',
        fileName: 'TRACKIN-1.MP4',
        preset: {
            tracking: { mode: 'color', color: 'black', tolerance: 43, minSize: 517, target: 'body', object: 'person' },
            overlay: { shape: 'circle', color: 'orange', lineWidth: 4, smoothness: 0.12, label: 'BXLLE+', hideLabel: false, matchLabelColor: true },
            effects: { grayscale: false, invert: false, posterize: false, posterizeLevels: 6, pixelate: true, pixelSize: 8, blur: true, blurStrength: 9 }
        }
    },
    {
        id: 'trackin-2',
        number: '02',
        src: 'assets/demo/trackin-2.mp4',
        fileName: 'TRACKIN-2.MP4',
        preset: {
            tracking: { mode: 'color', color: 'white', tolerance: 20, minSize: 276, target: 'object', object: 'person' },
            overlay: { shape: 'rect', color: 'lime', lineWidth: 4, smoothness: 0.22, label: 'TRACKIEZ / FACE', hideLabel: false, matchLabelColor: true },
            effects: { grayscale: true, invert: false, posterize: true, posterizeLevels: 6, pixelate: true, pixelSize: 4, blur: false, blurStrength: 4 }
        }
    }
];

function clonePreset(preset) {
    return JSON.parse(JSON.stringify(preset));
}

function readDemoPresetOverrides() {
    try {
        const value = JSON.parse(localStorage.getItem(DEMO_PRESET_STORAGE_KEY) || '{}');
        return value && typeof value === 'object' ? value : {};
    } catch (error) {
        return {};
    }
}

function writeDemoPresetOverrides(overrides) {
    try { localStorage.setItem(DEMO_PRESET_STORAGE_KEY, JSON.stringify(overrides)); } catch (error) {}
}

function getDemoConfig(id) {
    return DEMO_VIDEOS.find(demo => demo.id === id) || DEMO_VIDEOS[0];
}

function getDemoPreset(demo) {
    const override = readDemoPresetOverrides()[demo.id];
    return clonePreset(override && override.tracking && override.overlay && override.effects ? override : demo.preset);
}

function applyPreset(preset) {
    if (!preset) return;

    const tracking = preset.tracking || {};
    const overlay = preset.overlay || {};
    const effects = preset.effects || {};

    trackingMode.value = tracking.mode === 'ai' ? 'ai' : 'color';
    colorSelect.value = tracking.color || 'red';
    toleranceSlider.value = String(tracking.tolerance ?? 50);
    minSizeSlider.value = String(tracking.minSize ?? 100);
    aiTargetSelect.value = ['face', 'eyes', 'body', 'object'].includes(tracking.target) ? tracking.target : 'face';

    const requestedObject = objectClasses.find(item => item.key === tracking.object) || objectClasses[0];
    selectedObjectKey = requestedObject.key;
    aiObjectName.value = requestedObject.key;
    aiObjectSearch.value = objectInputValue(requestedObject);

    vizShape.value = overlay.shape === 'circle' ? 'circle' : 'rect';
    vizColor.value = Array.from(vizColor.options).some(option => option.value === overlay.color) ? overlay.color : 'lime';
    lineWidthSlider.value = String(overlay.lineWidth ?? 4);
    smoothSlider.value = String(overlay.smoothness ?? 0.2);
    labelText.value = overlay.label === null || overlay.label === undefined ? t('defaultObject') : String(overlay.label);
    hideLabelText.checked = Boolean(overlay.hideLabel);
    matchLabelColor.checked = Boolean(overlay.matchLabelColor);

    effGrayscale.checked = Boolean(effects.grayscale);
    effInvert.checked = Boolean(effects.invert);
    effPosterize.checked = Boolean(effects.posterize);
    valPosterize.value = String(effects.posterizeLevels ?? 5);
    effPixelate.checked = Boolean(effects.pixelate);
    valPixelate.value = String(effects.pixelSize ?? 10);
    effBlur.checked = Boolean(effects.blur);
    valBlur.value = String(effects.blurStrength ?? 10);

    colorSettingsBlock.style.display = trackingMode.value === 'color' ? 'flex' : 'none';
    aiSettingsBlock.style.display = trackingMode.value === 'ai' ? 'flex' : 'none';
    aiObjectInputBlock.style.display = aiTargetSelect.value === 'object' ? 'flex' : 'none';

    toleranceValueText.textContent = toleranceSlider.value;
    minSizeValueText.textContent = minSizeSlider.value;
    lineWidthValueText.textContent = lineWidthSlider.value;
    smoothValueText.textContent = smoothSlider.value;
    [toleranceSlider, minSizeSlider, lineWidthSlider, smoothSlider, valPosterize, valPixelate, valBlur].forEach(updateRangeProgress);
    syncColorPickerLabels();

    previousBlobs = [];
    lastVideoTime = -1;
    lastAiResults = null;
    if (trackingMode.value === 'ai') initializeAI();
    schedulePausedPreview();
}

function readPresetFromControls() {
    return {
        tracking: {
            mode: trackingMode.value,
            color: colorSelect.value,
            tolerance: Number(toleranceSlider.value),
            minSize: Number(minSizeSlider.value),
            target: aiTargetSelect.value,
            object: aiObjectName.value || selectedObjectKey
        },
        overlay: {
            shape: vizShape.value,
            color: vizColor.value,
            lineWidth: Number(lineWidthSlider.value),
            smoothness: Number(smoothSlider.value),
            label: labelText.value,
            hideLabel: hideLabelText.checked,
            matchLabelColor: matchLabelColor.checked
        },
        effects: {
            grayscale: effGrayscale.checked,
            invert: effInvert.checked,
            posterize: effPosterize.checked,
            posterizeLevels: Number(valPosterize.value),
            pixelate: effPixelate.checked,
            pixelSize: Number(valPixelate.value),
            blur: effBlur.checked,
            blurStrength: Number(valBlur.value)
        }
    };
}

const fxCanvas = document.createElement('canvas');
const fxCtx = fxCanvas.getContext('2d', { willReadFrequently: true });
const tmpCanvas = document.createElement('canvas');
const tmpCtx = tmpCanvas.getContext('2d');

function loadVideoSource(source, { name, demo = null, objectUrl = null } = {}) {
    video.pause();
    stopRenderLoop();
    if (videoObjectUrl) URL.revokeObjectURL(videoObjectUrl);
    videoObjectUrl = objectUrl;
    activeDemoId = demo ? demo.id : null;
    video.src = source;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    fileName.textContent = String(name || 'VIDEO').toUpperCase();
    fileName.removeAttribute('data-i18n');
    uploadZone.classList.add('has-video');
    replaceVideoButton.hidden = false;
    demoBadge.hidden = !demo;
    updateDemoBadge();
    updateDemoEditorSelection();
    currentTimeText.textContent = '00:00';
    seekSlider.value = 0;
    updateRangeProgress(seekSlider);

    video.onloadeddata = function() {
        const MAX_SIZE = 1280;
        let w = video.videoWidth;
        let h = video.videoHeight;
        if (w > h && w > MAX_SIZE) { h = Math.floor(h * (MAX_SIZE / w)); w = MAX_SIZE; }
        else if (h > w && h > MAX_SIZE) { w = Math.floor(w * (MAX_SIZE / h)); h = MAX_SIZE; }
        canvas.width = w; canvas.height = h;
        resolutionLabel.textContent = `${w} × ${h}`;
        durationText.textContent = formatTime(video.duration);
        previousBlobs = [];
        lastVideoTime = -1;
        lastAiResults = null;
        
        video.play().then(() => {
            setPlayButtonState(true);
            startRenderLoop();
        }).catch(() => {
            setPlayButtonState(false);
            schedulePausedPreview();
        });
        advanceProjectCoach('video');
    };

    video.onerror = function() {
        recordStatus.textContent = t(demo ? 'demoLoadError' : 'invalidVideo');
        recordStatus.style.color = '#ff4e52';
    };

    video.load();
}

function loadDemoVideo(demoOrId) {
    const demo = typeof demoOrId === 'string' ? getDemoConfig(demoOrId) : demoOrId;
    applyPreset(getDemoPreset(demo));
    loadVideoSource(demo.src, { name: demo.fileName, demo });
}

function loadVideoFile(file) {
    if (!file) return;

    const isVideo = file.type.startsWith('video/') || file.name.toLowerCase().endsWith('.mov');
    if (!isVideo) {
        recordStatus.textContent = t('invalidVideo');
        recordStatus.style.color = '#ff4e52';
        return;
    }

    applyPreset(USER_DEFAULT_PRESET);
    const objectUrl = URL.createObjectURL(file);
    loadVideoSource(objectUrl, { name: file.name, objectUrl });
}

const demoEditorPanel = document.getElementById('demoEditorPanel');
const demoEditorStatus = document.getElementById('demoEditorStatus');
const demoEditorSelectButtons = Array.from(document.querySelectorAll('[data-demo-editor-select]'));
const demoEditorEnabled = new URLSearchParams(window.location.search).get('demo-editor') === '1';

function updateDemoBadge() {
    if (!activeDemoId) {
        demoBadge.hidden = true;
        return;
    }
    const demo = getDemoConfig(activeDemoId);
    demoBadge.hidden = false;
    demoBadge.textContent = `${t('demoLabel')} ${demo.number}`;
}

function updateDemoEditorSelection() {
    demoEditorSelectButtons.forEach(button => {
        const isActive = button.dataset.demoEditorSelect === activeDemoId;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
    });
}

function setDemoEditorStatus(key, isError = false) {
    demoEditorStatus.textContent = t(key);
    demoEditorStatus.classList.toggle('is-error', isError);
}

function saveCurrentDemoPreset() {
    if (!activeDemoId) return false;
    const overrides = readDemoPresetOverrides();
    overrides[activeDemoId] = readPresetFromControls();
    writeDemoPresetOverrides(overrides);
    setDemoEditorStatus('demoPresetSaved');
    return true;
}

async function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return;
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    if (!copied) throw new Error('Clipboard unavailable');
}

async function copyAllDemoPresets() {
    saveCurrentDemoPreset();
    const presets = Object.fromEntries(DEMO_VIDEOS.map(demo => [demo.id, getDemoPreset(demo)]));
    try {
        await copyTextToClipboard(JSON.stringify(presets, null, 2));
        setDemoEditorStatus('demoPresetsCopied');
    } catch (error) {
        setDemoEditorStatus('demoPresetsCopyFailed', true);
    }
}

function resetDemoPresets() {
    try { localStorage.removeItem(DEMO_PRESET_STORAGE_KEY); } catch (error) {}
    const selectedDemo = getDemoConfig(activeDemoId);
    loadDemoVideo(selectedDemo);
    setDemoEditorStatus('demoPresetsReset');
}

function chooseRandomDemo() {
    if (window.crypto && typeof window.crypto.getRandomValues === 'function') {
        const randomValue = new Uint32Array(1);
        window.crypto.getRandomValues(randomValue);
        return DEMO_VIDEOS[randomValue[0] % DEMO_VIDEOS.length];
    }
    return DEMO_VIDEOS[Math.floor(Math.random() * DEMO_VIDEOS.length)];
}

function initializeDemoExperience() {
    let selectedDemo = chooseRandomDemo();

    if (demoEditorEnabled) {
        demoEditorPanel.hidden = false;
        const requestedDemoId = new URLSearchParams(window.location.search).get('demo');
        if (requestedDemoId) selectedDemo = getDemoConfig(requestedDemoId);

        demoEditorSelectButtons.forEach(button => {
            button.addEventListener('click', () => {
                saveCurrentDemoPreset();
                loadDemoVideo(button.dataset.demoEditorSelect);
            });
        });
        document.getElementById('saveDemoPresetBtn').addEventListener('click', saveCurrentDemoPreset);
        document.getElementById('copyDemoPresetsBtn').addEventListener('click', copyAllDemoPresets);
        document.getElementById('resetDemoPresetsBtn').addEventListener('click', resetDemoPresets);
    }

    loadDemoVideo(selectedDemo);
}

videoUpload.addEventListener('click', () => { videoUpload.value = ''; });
videoUpload.addEventListener('change', (e) => loadVideoFile(e.target.files[0]));

['dragenter', 'dragover'].forEach(eventName => {
    uploadZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        uploadZone.classList.add('is-dragging');
    });
});

['dragleave', 'drop'].forEach(eventName => {
    uploadZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        uploadZone.classList.remove('is-dragging');
    });
});

uploadZone.addEventListener('drop', (e) => loadVideoFile(e.dataTransfer.files[0]));

video.addEventListener('timeupdate', () => {
    currentTimeText.textContent = formatTime(video.currentTime);
    if (Number.isFinite(video.duration) && video.duration > 0) {
        seekSlider.value = Math.round((video.currentTime / video.duration) * 1000);
        updateRangeProgress(seekSlider);
    }
});

seekSlider.addEventListener('input', () => {
    if (Number.isFinite(video.duration) && video.duration > 0) {
        video.currentTime = (parseInt(seekSlider.value) / 1000) * video.duration;
        currentTimeText.textContent = formatTime(video.currentTime);
    }
});

let previousBlobs = []; 
let lastVideoTime = -1;
let lastAiResults = null;
let previewRenderQueued = false;
let renderFrameId = null;

function stopRenderLoop() {
    if (renderFrameId === null) return;
    cancelAnimationFrame(renderFrameId);
    renderFrameId = null;
}

function startRenderLoop() {
    if (renderFrameId !== null || video.paused) return;
    renderFrameId = requestAnimationFrame(processVideo);
}

function schedulePausedPreview() {
    if (!video.paused || video.readyState < 2 || previewRenderQueued) return;
    previewRenderQueued = true;
    requestAnimationFrame(() => {
        previewRenderQueued = false;
        processVideo();
    });
}

[
    trackingMode, aiTargetSelect, aiObjectName, colorSelect, toleranceSlider, minSizeSlider,
    vizShape, vizColor, lineWidthSlider, labelText, hideLabelText, matchLabelColor, smoothSlider,
    effGrayscale, effInvert, effPosterize, valPosterize,
    effPixelate, valPixelate, effBlur, valBlur
].forEach(control => {
    control.addEventListener('input', schedulePausedPreview);
    control.addEventListener('change', schedulePausedPreview);
});

video.addEventListener('playing', () => {
    setPlayButtonState(true);
    startRenderLoop();
});
video.addEventListener('pause', () => {
    stopRenderLoop();
    setPlayButtonState(false);
    schedulePausedPreview();
});
video.addEventListener('seeked', schedulePausedPreview);
video.addEventListener('ended', () => {
    if (!video.loop) return;
    video.currentTime = 0;
    video.play().then(startRenderLoop).catch(() => setPlayButtonState(false));
});

function processVideo() {
    renderFrameId = null;
    if (video.readyState < 2 || !canvas.width || !canvas.height) {
        if (!video.paused) startRenderLoop();
        return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const frameData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = frameData.data;

    let rawBlobs = [];

    // ==========================================
    // ЛОГИКА ПОИСКА
    // ==========================================
    if (trackingMode.value === 'color') {
        const selectedColor = colorSelect.value;
        const tolerance = parseInt(toleranceSlider.value);
        let tR = 0, tG = 0, tB = 0;
        switch (selectedColor) {
            case 'red': tR = 255; break; case 'green': tG = 255; break; case 'blue': tB = 255; break;
            case 'yellow': tR = 255; tG = 255; break; case 'white': tR = 255; tG = 255; tB = 255; break;
            case 'black': tR = 0; tG = 0; tB = 0; break;
        }

        const step = 4; const mergeDistance = 30; 
        for (let y = 0; y < canvas.height; y += step) {
            for (let x = 0; x < canvas.width; x += step) {
                let i = (y * canvas.width + x) * 4;
                let diff = (Math.abs(data[i] - tR) + Math.abs(data[i+1] - tG) + Math.abs(data[i+2] - tB)) / 3;
                if (diff <= tolerance) {
                    let addedToBlob = false;
                    for (let j = 0; j < rawBlobs.length; j++) {
                        let blob = rawBlobs[j];
                        if (x >= blob.minX - mergeDistance && x <= blob.maxX + mergeDistance &&
                            y >= blob.minY - mergeDistance && y <= blob.maxY + mergeDistance) {
                            blob.minX = Math.min(blob.minX, x); blob.maxX = Math.max(blob.maxX, x);
                            blob.minY = Math.min(blob.minY, y); blob.maxY = Math.max(blob.maxY, y);
                            blob.pixelCount++; addedToBlob = true; break;
                        }
                    }
                    if (!addedToBlob) rawBlobs.push({ minX: x, maxX: x, minY: y, maxY: y, pixelCount: 1 });
                }
            }
        }
    } else if (trackingMode.value === 'ai') {
        let scaleX = canvas.width / video.videoWidth;
        let scaleY = canvas.height / video.videoHeight;
        const target = aiTargetSelect.value;

        if (target === 'face' && faceDetector && video.readyState >= 2) {
            if (video.currentTime !== lastVideoTime) {
                lastAiResults = faceDetector.detectForVideo(video, performance.now());
                lastVideoTime = video.currentTime;
            }
            if (lastAiResults && lastAiResults.detections) {
                for (let det of lastAiResults.detections) {
                    let bb = det.boundingBox;
                    rawBlobs.push({
                        minX: bb.originX * scaleX, maxX: (bb.originX + bb.width) * scaleX,
                        minY: bb.originY * scaleY, maxY: (bb.originY + bb.height) * scaleY, pixelCount: 99999
                    });
                }
            }
        } 
        else if (target === 'eyes' && faceLandmarker && video.readyState >= 2) {
            if (video.currentTime !== lastVideoTime) {
                lastAiResults = faceLandmarker.detectForVideo(video, performance.now());
                lastVideoTime = video.currentTime;
            }
            if (lastAiResults && lastAiResults.faceLandmarks) {
                for (let landmarks of lastAiResults.faceLandmarks) {
                    let leftEye = landmarks[468]; 
                    let rightEye = landmarks[473];
                    let eyeDist = Math.abs((leftEye.x - rightEye.x) * video.videoWidth);
                    let boxSize = (eyeDist * 0.4) * scaleX; 
                    
                    if (leftEye) {
                        let cx = leftEye.x * canvas.width; let cy = leftEye.y * canvas.height;
                        rawBlobs.push({ minX: cx - boxSize, maxX: cx + boxSize, minY: cy - boxSize, maxY: cy + boxSize, pixelCount: 99999 });
                    }
                    if (rightEye) {
                        let cx = rightEye.x * canvas.width; let cy = rightEye.y * canvas.height;
                        rawBlobs.push({ minX: cx - boxSize, maxX: cx + boxSize, minY: cy - boxSize, maxY: cy + boxSize, pixelCount: 99999 });
                    }
                }
            }
        }
        else if ((target === 'body' || target === 'object') && objectDetector && video.readyState >= 2) {
            if (video.currentTime !== lastVideoTime) {
                lastAiResults = objectDetector.detectForVideo(video, performance.now());
                lastVideoTime = video.currentTime;
            }
            if (lastAiResults && lastAiResults.detections) {
                let classNameToFind = target === 'body' ? 'person' : aiObjectName.value.toLowerCase().trim();
                for (let det of lastAiResults.detections) {
                    let cat = det.categories[0].categoryName;
                    if (cat === classNameToFind) {
                        let bb = det.boundingBox;
                        rawBlobs.push({
                            minX: bb.originX * scaleX, maxX: (bb.originX + bb.width) * scaleX,
                            minY: bb.originY * scaleY, maxY: (bb.originY + bb.height) * scaleY, pixelCount: 99999
                        });
                    }
                }
            }
        }
    }


    // --- СГЛАЖИВАНИЕ ДВИЖЕНИЯ И ОТСЕВ МУСОРА ---
    const minSize = parseInt(minSizeSlider.value);
    const smoothFactor = parseFloat(smoothSlider.value);
    
    let validBlobs = trackingMode.value === 'color' ? rawBlobs.filter(blob => (blob.pixelCount * 16) >= minSize) : rawBlobs;
    let smoothedBlobs = [];

    for (let curr of validBlobs) {
        let closest = null, minDist = Infinity;
        for (let prev of previousBlobs) {
            let cx = curr.minX + (curr.maxX - curr.minX) / 2, cy = curr.minY + (curr.maxY - curr.minY) / 2;
            let px = prev.minX + (prev.maxX - prev.minX) / 2, py = prev.minY + (prev.maxY - prev.minY) / 2;
            let dist = Math.hypot(cx - px, cy - py);
            if (dist < minDist) { minDist = dist; closest = prev; }
        }
        if (closest && minDist < 150) {
            smoothedBlobs.push({
                minX: closest.minX + (curr.minX - closest.minX) * smoothFactor,
                minY: closest.minY + (curr.minY - closest.minY) * smoothFactor,
                maxX: closest.maxX + (curr.maxX - closest.maxX) * smoothFactor,
                maxY: closest.maxY + (curr.maxY - closest.maxY) * smoothFactor
            });
        } else {
            smoothedBlobs.push({ minX: curr.minX, minY: curr.minY, maxX: curr.maxX, maxY: curr.maxY });
        }
    }
    previousBlobs = smoothedBlobs; 

    // --- ПРИМЕНЕНИЕ ЭФФЕКТОВ И ОТРИСОВКА ---
    const customLabel = labelText.value.trim();
    const overlayColor = overlayColors[vizColor.value] || null;
    const overlayLineWidth = parseInt(lineWidthSlider.value);

    for (let blob of smoothedBlobs) {
        let w = Math.max(1, blob.maxX - blob.minX);
        let h = Math.max(1, blob.maxY - blob.minY);

        // Для круга область эффекта должна покрывать весь его диаметр.
        // Раньше fxCanvas оставался размером w x h, поэтому части круга,
        // выходящие за прямоугольную рамку объекта, не обрабатывались.
        let effectX = blob.minX;
        let effectY = blob.minY;
        let effectW = w;
        let effectH = h;

        if (vizShape.value === 'circle') {
            const radius = Math.max(w, h) / 2;
            const centerX = blob.minX + w / 2;
            const centerY = blob.minY + h / 2;
            effectX = centerX - radius;
            effectY = centerY - radius;
            effectW = radius * 2;
            effectH = radius * 2;
        }

        // Добавили проверку на effGrayscale
        let hasEffects = effGrayscale.checked || effInvert.checked || effPosterize.checked || effPixelate.checked || effBlur.checked;
        
        if (hasEffects) {
            fxCanvas.width = Math.ceil(effectW); fxCanvas.height = Math.ceil(effectH);
            // Смещение всей исходной сцены безопасно обрабатывает область круга,
            // даже если она частично выходит за границы основного canvas.
            fxCtx.drawImage(canvas, -effectX, -effectY);

            if (effPixelate.checked) {
                let pSize = parseInt(valPixelate.value);
                tmpCanvas.width = Math.max(1, Math.ceil(effectW / pSize));
                tmpCanvas.height = Math.max(1, Math.ceil(effectH / pSize));
                tmpCtx.drawImage(fxCanvas, 0, 0, tmpCanvas.width, tmpCanvas.height);
                fxCtx.imageSmoothingEnabled = false; fxCtx.drawImage(tmpCanvas, 0, 0, effectW, effectH); fxCtx.imageSmoothingEnabled = true; 
            }

            // Математика для пикселей (Ч/Б, Инверсия, Постеризация)
            if (effGrayscale.checked || effInvert.checked || effPosterize.checked) {
                let imgD = fxCtx.getImageData(0, 0, fxCanvas.width, fxCanvas.height); let d = imgD.data;
                let levels = parseInt(valPosterize.value); let factor = 255 / (levels - 1);
                
                for (let i = 0; i < d.length; i += 4) {
                    let r = d[i], g = d[i+1], b = d[i+2];
                    
                    // 1. Черно-белое (Яркость)
                    if (effGrayscale.checked) {
                        let gray = 0.299 * r + 0.587 * g + 0.114 * b;
                        r = gray; g = gray; b = gray;
                    }
                    // 2. Инверсия
                    if (effInvert.checked) { 
                        r = 255-r; g = 255-g; b = 255-b; 
                    }
                    // 3. Постеризация
                    if (effPosterize.checked) {
                        r = Math.round(r / factor) * factor; 
                        g = Math.round(g / factor) * factor; 
                        b = Math.round(b / factor) * factor;
                    }
                    
                    d[i]=r; d[i+1]=g; d[i+2]=b;
                }
                fxCtx.putImageData(imgD, 0, 0);
            }

            if (effBlur.checked) {
                let strength = parseInt(valBlur.value);
                tmpCanvas.width = fxCanvas.width; tmpCanvas.height = fxCanvas.height; tmpCtx.drawImage(fxCanvas, 0, 0);
                fxCtx.globalAlpha = 1 / (strength * 0.5);
                for (let i = 1; i <= strength; i++) {
                    let scale = 1 + (i * 0.02);
                    fxCtx.save(); fxCtx.translate(effectW/2, effectH/2); fxCtx.scale(scale, scale); fxCtx.translate(-effectW/2, -effectH/2);
                    fxCtx.drawImage(tmpCanvas, 0, 0); fxCtx.restore();
                }
                fxCtx.globalAlpha = 1.0;
            }

            ctx.save(); ctx.beginPath();
            if (vizShape.value === 'circle') { ctx.arc(blob.minX + w/2, blob.minY + h/2, Math.max(w, h)/2, 0, Math.PI * 2); } 
            else { ctx.rect(blob.minX, blob.minY, w, h); }
            ctx.clip(); ctx.drawImage(fxCanvas, effectX, effectY); ctx.restore();
        }

        if (overlayColor && overlayLineWidth > 0) {
            ctx.lineWidth = overlayLineWidth;
            ctx.strokeStyle = overlayColor;
            ctx.beginPath();
            if (vizShape.value === 'rect') { ctx.strokeRect(blob.minX, blob.minY, w, h); } 
            else { ctx.arc(blob.minX + w/2, blob.minY + h/2, Math.max(w, h)/2, 0, Math.PI * 2); ctx.stroke(); }
        }

        if (!hideLabelText.checked && customLabel !== "") {
            ctx.font = "bold 16px sans-serif";
            ctx.shadowColor = "black"; ctx.shadowBlur = 4; ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1;
            ctx.fillStyle = matchLabelColor.checked && overlayColor ? overlayColor : "white"; ctx.textAlign = "right"; 
            ctx.fillText(customLabel, blob.maxX, blob.minY - 5);
            ctx.textAlign = "left"; ctx.shadowColor = "transparent";
        }
    }

    if (!video.paused) startRenderLoop();
}

// ==========================================
// КНОПКИ (ПЛЕЙ, СКРИНШОТ, ЗАПИСЬ)
// ==========================================
const playPauseBtn = document.getElementById('playPauseBtn');

function setPlayButtonState(isPlaying) {
    const label = playPauseBtn.querySelector('span');
    const icon = playPauseBtn.querySelector('svg');
    label.dataset.i18n = isPlaying ? 'pause' : 'play';
    label.textContent = t(label.dataset.i18n);
    playPauseBtn.setAttribute('aria-label', label.textContent);
    icon.innerHTML = isPlaying ? '<path d="M8 6v12M16 6v12"/>' : '<path d="m8 5 11 7-11 7V5Z"/>';
}

playPauseBtn.addEventListener('click', () => {
    if (!video.src) { alert(t('uploadFirst')); return; }
    if (video.paused) {
        if (video.ended) video.currentTime = 0;
        video.play().then(() => { setPlayButtonState(true); startRenderLoop(); });
    } else { video.pause(); setPlayButtonState(false); }
});

const screenshotBtn = document.getElementById('screenshotBtn');
screenshotBtn.addEventListener('click', () => {
    if (!video.src) { alert(t('uploadFirst')); return; }
    const a = document.createElement('a'); a.style.display = 'none'; a.href = canvas.toDataURL('image/png'); a.download = 'trackiez_frame.png'; 
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    if (!isRecording) {
        recordStatus.textContent = t('frameSaved'); recordStatus.style.color = '#d129a1';
        setTimeout(() => { if (!isRecording) recordStatus.textContent = ''; }, 3000);
    }
});

const recordBtn = document.getElementById('recordBtn');
const downloadWebmBtn = document.getElementById('downloadWebmBtn');
const convertMp4Btn = document.getElementById('convertMp4Btn');
const exportDialogClose = document.getElementById('exportDialogClose');
const conversionStatus = document.getElementById('conversionStatus');
const conversionStatusText = document.getElementById('conversionStatusText');
const conversionProgressBar = document.getElementById('conversionProgressBar');

const MP4_RECORDING_TYPES = [
    'video/mp4;codecs=avc1.42E01E',
    'video/mp4;codecs=avc1',
    'video/mp4'
];
const WEBM_RECORDING_TYPES = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm'
];
const FFMPEG_SCRIPT_URL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.11.6/dist/ffmpeg.min.js';
const FFMPEG_CORE_URL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js';

let mediaRecorder;
let recordingStream;
let recordingMimeType = '';
let recordedChunks = [];
let pendingWebmBlob = null;
let ffmpegInstance = null;
let ffmpegScriptPromise = null;
let isRecording = false;
let isConverting = false;

exportDialog.addEventListener('close', () => {
    if (isConverting) return;
    pendingWebmBlob = null;
    resetConversionUi();
    if (recordStatus.textContent === t('exportChoice')) recordStatus.textContent = '';
});

function isRecorderTypeSupported(mimeType) {
    return typeof MediaRecorder.isTypeSupported !== 'function' || MediaRecorder.isTypeSupported(mimeType);
}

function createSupportedRecorder(stream) {
    const candidates = [...MP4_RECORDING_TYPES, ...WEBM_RECORDING_TYPES];
    for (const mimeType of candidates) {
        if (!isRecorderTypeSupported(mimeType)) continue;
        try {
            return { recorder: new MediaRecorder(stream, { mimeType }), mimeType };
        } catch (error) {
            // A browser can report support while rejecting a specific stream/codec combination.
        }
    }

    try {
        const recorder = new MediaRecorder(stream);
        return { recorder, mimeType: recorder.mimeType || '' };
    } catch (error) {
        return null;
    }
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function setRecordStatus(key, color = '#d129a1') {
    recordStatus.textContent = t(key);
    recordStatus.style.color = color;
}

function resetConversionUi() {
    isConverting = false;
    exportDialog.classList.remove('is-busy');
    downloadWebmBtn.disabled = false;
    convertMp4Btn.disabled = false;
    exportDialogClose.disabled = false;
    conversionStatus.hidden = true;
    conversionProgressBar.style.width = '4%';
    conversionStatusText.dataset.i18n = 'conversionPreparing';
    conversionStatusText.textContent = t('conversionPreparing');
    conversionStatusText.style.color = '';
}

function openWebmExportDialog(blob) {
    pendingWebmBlob = blob;
    resetConversionUi();
    setRecordStatus('exportChoice');
    openSiteDialog(exportDialog);
}

function setConversionProgress(key, percent, color = '') {
    conversionStatus.hidden = false;
    conversionStatusText.dataset.i18n = key;
    conversionStatusText.textContent = t(key);
    conversionStatusText.style.color = color;
    conversionProgressBar.style.width = `${Math.max(4, Math.min(100, percent))}%`;
}

function loadFfmpegScript() {
    if (window.FFmpeg) return Promise.resolve();
    if (ffmpegScriptPromise) return ffmpegScriptPromise;

    ffmpegScriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = FFMPEG_SCRIPT_URL;
        script.crossOrigin = 'anonymous';
        script.onload = resolve;
        script.onerror = () => reject(new Error('Could not load the browser conversion engine.'));
        document.head.appendChild(script);
    }).catch(error => {
        ffmpegScriptPromise = null;
        throw error;
    });

    return ffmpegScriptPromise;
}

async function getFfmpeg() {
    if (ffmpegInstance && ffmpegInstance.isLoaded()) return ffmpegInstance;

    await loadFfmpegScript();
    const { createFFmpeg } = window.FFmpeg;
    ffmpegInstance = createFFmpeg({ corePath: FFMPEG_CORE_URL, log: false });
    ffmpegInstance.setProgress(({ ratio }) => {
        if (!Number.isFinite(ratio)) return;
        conversionProgressBar.style.width = `${Math.max(22, Math.min(98, 22 + ratio * 76))}%`;
    });
    await ffmpegInstance.load();
    return ffmpegInstance;
}

function removeFfmpegFile(ffmpeg, filename) {
    try { ffmpeg.FS('unlink', filename); } catch (error) {}
}

async function convertPendingWebmToMp4() {
    if (!pendingWebmBlob || isConverting) return;

    isConverting = true;
    exportDialog.classList.add('is-busy');
    downloadWebmBtn.disabled = true;
    convertMp4Btn.disabled = true;
    exportDialogClose.disabled = true;
    setConversionProgress('conversionLoading', 8);

    const inputName = 'trackiez-input.webm';
    const outputName = 'trackiez-output.mp4';
    let ffmpeg;

    try {
        ffmpeg = await getFfmpeg();
        removeFfmpegFile(ffmpeg, inputName);
        removeFfmpegFile(ffmpeg, outputName);
        const inputBytes = await window.FFmpeg.fetchFile(pendingWebmBlob);
        ffmpeg.FS('writeFile', inputName, inputBytes);
        setConversionProgress('conversionRunning', 22);
        await ffmpeg.run(
            '-i', inputName,
            '-an',
            '-c:v', 'libx264',
            '-preset', 'ultrafast',
            '-crf', '20',
            '-pix_fmt', 'yuv420p',
            '-movflags', 'faststart',
            outputName
        );
        const outputBytes = ffmpeg.FS('readFile', outputName);
        downloadBlob(new Blob([outputBytes], { type: 'video/mp4' }), 'trackiez_render.mp4');
        removeFfmpegFile(ffmpeg, inputName);
        removeFfmpegFile(ffmpeg, outputName);
        pendingWebmBlob = null;
        setConversionProgress('conversionDone', 100, '#d129a1');
        setRecordStatus('mp4Saved');
        isConverting = false;
        exportDialog.classList.remove('is-busy');
        setTimeout(() => {
            exportDialogClose.disabled = false;
            closeSiteDialog(exportDialog);
            resetConversionUi();
            if (!isRecording) recordStatus.textContent = '';
        }, 900);
    } catch (error) {
        console.error(error);
        if (ffmpeg) {
            removeFfmpegFile(ffmpeg, inputName);
            removeFfmpegFile(ffmpeg, outputName);
        }
        isConverting = false;
        exportDialog.classList.remove('is-busy');
        downloadWebmBtn.disabled = false;
        convertMp4Btn.disabled = false;
        exportDialogClose.disabled = false;
        setConversionProgress('conversionError', 100, '#ff4e52');
    }
}

downloadWebmBtn.addEventListener('click', () => {
    if (!pendingWebmBlob || isConverting) return;
    downloadBlob(pendingWebmBlob, 'trackiez_render.webm');
    pendingWebmBlob = null;
    setRecordStatus('videoSaved');
    closeSiteDialog(exportDialog);
    resetConversionUi();
    setTimeout(() => { if (!isRecording) recordStatus.textContent = ''; }, 4000);
});

convertMp4Btn.addEventListener('click', convertPendingWebmToMp4);

recordBtn.addEventListener('click', () => {
    if (!video.src) { alert(t('uploadFirst')); return; }
    if (!isRecording) {
        if (typeof MediaRecorder === 'undefined' || typeof canvas.captureStream !== 'function') {
            setRecordStatus('recorderUnsupported', '#ff4e52');
            return;
        }

        recordedChunks = [];
        recordingStream = canvas.captureStream(30);
        const recorderConfig = createSupportedRecorder(recordingStream);
        if (!recorderConfig) {
            recordingStream.getTracks().forEach(track => track.stop());
            recordingStream = null;
            setRecordStatus('recorderError', '#ff4e52');
            return;
        }

        mediaRecorder = recorderConfig.recorder;
        recordingMimeType = recorderConfig.mimeType;
        mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunks.push(e.data); };
        mediaRecorder.onstop = () => {
            const finalMimeType = mediaRecorder.mimeType || recordingMimeType || 'video/webm';
            const recordingBlob = new Blob(recordedChunks, { type: finalMimeType });
            if (recordingStream) recordingStream.getTracks().forEach(track => track.stop());
            recordingStream = null;

            if (finalMimeType.toLowerCase().includes('mp4')) {
                downloadBlob(recordingBlob, 'trackiez_render.mp4');
                setRecordStatus('mp4Saved');
                setTimeout(() => { if (!isRecording) recordStatus.textContent = ''; }, 4000);
            } else {
                openWebmExportDialog(recordingBlob);
            }
        };
        try {
            mediaRecorder.start();
        } catch (error) {
            recordingStream.getTracks().forEach(track => track.stop());
            recordingStream = null;
            setRecordStatus('recorderError', '#ff4e52');
            return;
        }
        isRecording = true;
        recordBtn.querySelector('span').dataset.i18n = 'stop';
        recordBtn.querySelector('span').textContent = t('stop'); recordBtn.classList.add('recording'); 
        recordStatus.textContent = t('recording'); recordStatus.style.color = '#ff4e52';
    } else {
        mediaRecorder.stop(); isRecording = false;
        recordBtn.querySelector('span').dataset.i18n = 'record';
        recordBtn.querySelector('span').textContent = t('record'); recordBtn.classList.remove('recording');
        recordStatus.textContent = '';
    }
});

// ==========================================
// ПЕРВЫЙ ЗАПУСК И ОБУЧЕНИЕ
// ==========================================
const TOUR_STORAGE_KEY = 'trackiez-interface-tour-v1';
const PROJECT_GUIDE_STORAGE_KEY = 'trackiez-first-project-guide-v1';

const tourLayer = document.getElementById('tourLayer');
const tourSpotlight = document.getElementById('tourSpotlight');
const tourCard = tourLayer.querySelector('.tour-card');
const tourProgress = document.getElementById('tourProgress');
const tourTitle = document.getElementById('tourTitle');
const tourBody = document.getElementById('tourBody');
const tourBackBtn = document.getElementById('tourBackBtn');
const tourNextBtn = document.getElementById('tourNextBtn');
const tourSkipBtn = document.getElementById('tourSkipBtn');

const projectCoach = document.getElementById('projectCoach');
const coachSpotlight = document.getElementById('coachSpotlight');
const coachProgress = document.getElementById('coachProgress');
const coachTitle = document.getElementById('coachTitle');
const coachBody = document.getElementById('coachBody');
const coachNextBtn = document.getElementById('coachNextBtn');
const coachSkipBtn = document.getElementById('coachSkipBtn');

const tourSteps = [
    { target: '#uploadZone', title: 'tourUploadTitle', body: 'tourUploadBody' },
    { target: '#trackingPanel > summary', title: 'tourTrackingTitle', body: 'tourTrackingBody' },
    { target: '#overlayPanel > summary', title: 'tourOverlayTitle', body: 'tourOverlayBody' },
    { target: '#effectsPanel > summary', title: 'tourEffectsTitle', body: 'tourEffectsBody' },
    { target: '#recordBtn', title: 'tourExportTitle', body: 'tourExportBody' }
];

const projectGuideSteps = [
    { target: '#uploadZone', action: 'video', title: 'coachUploadTitle', body: 'coachUploadBody' },
    { target: '#trackingPanel > summary', action: 'tracking', title: 'coachTrackingTitle', body: 'coachTrackingBody' },
    { target: '#overlayPanel > summary', action: 'overlay', title: 'coachOverlayTitle', body: 'coachOverlayBody' },
    { target: '#effectsPanel > summary', action: 'effects', title: 'coachEffectsTitle', body: 'coachEffectsBody' },
    { target: '#recordBtn', action: 'export', title: 'coachExportTitle', body: 'coachExportBody' }
];

let tourStepIndex = 0;
let coachStepIndex = 0;
let tourReturnFocus = null;

function onboardingFlagIsSet(key) {
    try { return localStorage.getItem(key) === 'complete'; } catch (error) { return false; }
}

function setOnboardingFlag(key) {
    try { localStorage.setItem(key, 'complete'); } catch (error) {}
}

function onboardingTarget(selector) {
    return selector ? document.querySelector(selector) : null;
}

function revealOnboardingTarget(target) {
    if (!target) return;
    const details = target.closest('details');
    if (details) details.open = true;

    const rect = target.getBoundingClientRect();
    const headerOffset = window.innerWidth <= 620 ? 116 : 78;
    if (rect.top < headerOffset || rect.bottom > window.innerHeight - 24) {
        target.scrollIntoView({
            block: window.innerWidth <= 620 ? 'center' : 'nearest',
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
        });
    }
}

function placeSpotlight(spotlight, target, padding) {
    if (!target) {
        spotlight.hidden = true;
        return;
    }

    const rect = target.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0 || rect.bottom < 0 || rect.top > window.innerHeight) {
        spotlight.hidden = true;
        return;
    }

    const left = Math.max(6, rect.left - padding);
    const top = Math.max(6, rect.top - padding);
    const right = Math.min(window.innerWidth - 6, rect.right + padding);
    const bottom = Math.min(window.innerHeight - 6, rect.bottom + padding);

    spotlight.hidden = false;
    spotlight.style.left = `${left}px`;
    spotlight.style.top = `${top}px`;
    spotlight.style.width = `${Math.max(1, right - left)}px`;
    spotlight.style.height = `${Math.max(1, bottom - top)}px`;
}

function positionTourCard(target) {
    if (window.innerWidth <= 620 || !target) {
        tourCard.style.left = '';
        tourCard.style.right = '';
        tourCard.style.top = '';
        tourCard.style.bottom = '';
        return;
    }

    const rect = target.getBoundingClientRect();
    const cardRect = tourCard.getBoundingClientRect();
    const gap = 18;
    const edge = 16;
    let left;
    let top;

    if (window.innerWidth - rect.right >= cardRect.width + gap + edge) {
        left = rect.right + gap;
        top = rect.top;
    } else if (rect.left >= cardRect.width + gap + edge) {
        left = rect.left - cardRect.width - gap;
        top = rect.top;
    } else {
        left = Math.min(Math.max(edge, rect.left), window.innerWidth - cardRect.width - edge);
        top = rect.bottom + gap;
        if (top + cardRect.height > window.innerHeight - edge) top = rect.top - cardRect.height - gap;
    }

    tourCard.style.left = `${Math.min(Math.max(edge, left), window.innerWidth - cardRect.width - edge)}px`;
    tourCard.style.top = `${Math.min(Math.max(edge, top), window.innerHeight - cardRect.height - edge)}px`;
    tourCard.style.right = 'auto';
    tourCard.style.bottom = 'auto';
}

function positionProjectCoach(target) {
    if (window.innerWidth <= 900 || !target) {
        projectCoach.style.left = '';
        projectCoach.style.right = '';
        return;
    }

    const rect = target.getBoundingClientRect();
    if (rect.left + rect.width / 2 < window.innerWidth / 2) {
        projectCoach.style.left = 'auto';
        projectCoach.style.right = '18px';
    } else {
        projectCoach.style.left = '18px';
        projectCoach.style.right = 'auto';
    }
}

function updateOnboardingGeometry() {
    if (!tourLayer.hidden) {
        const target = onboardingTarget(tourSteps[tourStepIndex].target);
        placeSpotlight(tourSpotlight, target, 8);
        positionTourCard(target);
    }
    if (!projectCoach.hidden) {
        const target = onboardingTarget(projectGuideSteps[coachStepIndex].target);
        placeSpotlight(coachSpotlight, target, 6);
        positionProjectCoach(target);
    }
}

function renderTourStep(shouldScroll = true) {
    const step = tourSteps[tourStepIndex];
    const target = onboardingTarget(step.target);
    const isLast = tourStepIndex === tourSteps.length - 1;

    tourProgress.textContent = `${String(tourStepIndex + 1).padStart(2, '0')} / ${String(tourSteps.length).padStart(2, '0')}`;
    tourTitle.textContent = t(step.title);
    tourBody.textContent = t(step.body);
    tourBackBtn.disabled = tourStepIndex === 0;
    tourNextBtn.dataset.i18n = isLast ? 'finish' : 'next';
    tourNextBtn.textContent = t(tourNextBtn.dataset.i18n);

    if (shouldScroll) revealOnboardingTarget(target);
    requestAnimationFrame(() => {
        updateOnboardingGeometry();
        tourNextBtn.focus({ preventScroll: true });
    });
}

function startInterfaceTour() {
    tourReturnFocus = document.activeElement;
    projectCoach.hidden = true;
    coachSpotlight.hidden = true;
    tourStepIndex = 0;
    tourLayer.hidden = false;
    renderTourStep();
}

function finishInterfaceTour() {
    tourLayer.hidden = true;
    tourSpotlight.hidden = true;
    setOnboardingFlag(TOUR_STORAGE_KEY);

    if (tourReturnFocus && typeof tourReturnFocus.focus === 'function' && document.contains(tourReturnFocus)) {
        tourReturnFocus.focus({ preventScroll: true });
    }
}

function renderProjectCoachStep(shouldScroll = true) {
    const step = projectGuideSteps[coachStepIndex];
    const target = onboardingTarget(step.target);
    const isLast = coachStepIndex === projectGuideSteps.length - 1;

    coachProgress.textContent = `${t('firstProject')} · ${String(coachStepIndex + 1).padStart(2, '0')} / ${String(projectGuideSteps.length).padStart(2, '0')}`;
    coachTitle.textContent = t(step.title);
    coachBody.textContent = t(step.body);
    coachNextBtn.dataset.i18n = isLast ? 'finish' : 'next';
    coachNextBtn.textContent = t(coachNextBtn.dataset.i18n);

    if (shouldScroll) revealOnboardingTarget(target);
    requestAnimationFrame(updateOnboardingGeometry);
}

function startProjectCoach(force = false) {
    if (!force && onboardingFlagIsSet(PROJECT_GUIDE_STORAGE_KEY)) return;
    if (!tourLayer.hidden) return;
    coachStepIndex = video.src ? 1 : 0;
    projectCoach.hidden = false;
    coachSpotlight.hidden = false;
    renderProjectCoachStep();
}

function finishProjectCoach() {
    projectCoach.hidden = true;
    coachSpotlight.hidden = true;
    setOnboardingFlag(PROJECT_GUIDE_STORAGE_KEY);
}

function advanceProjectCoach(action) {
    if (projectCoach.hidden) return;
    const step = projectGuideSteps[coachStepIndex];
    if (step.action !== action) return;
    if (coachStepIndex >= projectGuideSteps.length - 1) {
        finishProjectCoach();
        return;
    }
    coachStepIndex += 1;
    renderProjectCoachStep();
}

tourBackBtn.addEventListener('click', () => {
    if (tourStepIndex === 0) return;
    tourStepIndex -= 1;
    renderTourStep();
});

tourNextBtn.addEventListener('click', () => {
    if (tourStepIndex >= tourSteps.length - 1) {
        finishInterfaceTour();
        return;
    }
    tourStepIndex += 1;
    renderTourStep();
});

tourSkipBtn.addEventListener('click', finishInterfaceTour);
coachSkipBtn.addEventListener('click', finishProjectCoach);
coachNextBtn.addEventListener('click', () => {
    if (coachStepIndex >= projectGuideSteps.length - 1) finishProjectCoach();
    else {
        coachStepIndex += 1;
        renderProjectCoachStep();
    }
});

document.getElementById('restartTourBtn').addEventListener('click', () => {
    closeSiteDialog(howItWorksDialog);
    setTimeout(startInterfaceTour, 120);
});

document.getElementById('restartTipsBtn').addEventListener('click', () => {
    closeSiteDialog(howItWorksDialog);
    setTimeout(() => startProjectCoach(true), 120);
});

[trackingMode, colorSelect, toleranceSlider, minSizeSlider, aiTargetSelect, aiObjectName].forEach(control => {
    control.addEventListener('input', () => advanceProjectCoach('tracking'));
    control.addEventListener('change', () => advanceProjectCoach('tracking'));
});

[vizShape, vizColor, lineWidthSlider, smoothSlider, labelText, hideLabelText, matchLabelColor].forEach(control => {
    control.addEventListener('input', () => advanceProjectCoach('overlay'));
    control.addEventListener('change', () => advanceProjectCoach('overlay'));
});

[effGrayscale, effInvert, effPosterize, valPosterize, effPixelate, valPixelate, effBlur, valBlur].forEach(control => {
    control.addEventListener('input', () => advanceProjectCoach('effects'));
    control.addEventListener('change', () => advanceProjectCoach('effects'));
});

recordBtn.addEventListener('click', () => {
    if (video.src) advanceProjectCoach('export');
});

document.addEventListener('keydown', event => {
    if (!tourLayer.hidden) {
        if (event.key === 'Escape') {
            event.preventDefault();
            finishInterfaceTour();
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            tourNextBtn.click();
        } else if (event.key === 'ArrowLeft' && tourStepIndex > 0) {
            event.preventDefault();
            tourBackBtn.click();
        } else if (event.key === 'Tab') {
            const focusable = [tourSkipBtn, tourBackBtn, tourNextBtn].filter(button => !button.disabled);
            const currentIndex = focusable.indexOf(document.activeElement);
            const nextIndex = event.shiftKey
                ? (currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1)
                : (currentIndex + 1) % focusable.length;
            event.preventDefault();
            focusable[nextIndex].focus();
        }
        return;
    }

    if (event.key === 'Escape' && !projectCoach.hidden && !document.querySelector('dialog[open]')) finishProjectCoach();
});

window.addEventListener('resize', updateOnboardingGeometry);
window.addEventListener('scroll', updateOnboardingGeometry, { passive: true, capture: true });

refreshOnboardingLanguage = () => {
    if (!tourLayer.hidden) renderTourStep(false);
    if (!projectCoach.hidden) renderProjectCoachStep(false);
};

function initializeOnboarding() {
    if (demoEditorEnabled) return;
    if (!onboardingFlagIsSet(TOUR_STORAGE_KEY)) setTimeout(startInterfaceTour, 480);
}

applyLanguage(currentLanguage, false);
initializeDemoExperience();
window.addEventListener('load', initializeOnboarding, { once: true });

function initializeCursorTrail() {
    const desktopPointer = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 901px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!desktopPointer.matches || reducedMotion.matches) return;

    let lastX = null;
    let lastY = null;
    let lastTime = 0;
    const activePixels = new Set();
    const colors = ['#d129a1', '#e76bc2', '#f3f4f2'];

    window.addEventListener('pointermove', (event) => {
        if (event.pointerType && event.pointerType !== 'mouse') return;

        const now = performance.now();
        if (lastX === null) {
            lastX = event.clientX;
            lastY = event.clientY;
            lastTime = now;
            return;
        }

        const deltaX = event.clientX - lastX;
        const deltaY = event.clientY - lastY;
        const distance = Math.hypot(deltaX, deltaY);
        if (distance < 7 || now - lastTime < 14) return;

        const pieces = Math.min(4, Math.max(1, Math.floor(distance / 18)));
        for (let i = 0; i < pieces; i++) {
            const progress = (i + 1) / (pieces + 1);
            const pixel = document.createElement('i');
            const size = Math.round(2 + Math.random() * 4);
            const x = event.clientX - deltaX * progress + (Math.random() - 0.5) * 5;
            const y = event.clientY - deltaY * progress + (Math.random() - 0.5) * 5;
            const scatterX = (Math.random() - 0.5) * 24 - deltaX * 0.08;
            const scatterY = (Math.random() - 0.5) * 24 - deltaY * 0.08;

            pixel.className = 'cursor-pixel';
            pixel.style.left = `${x}px`;
            pixel.style.top = `${y}px`;
            pixel.style.width = `${size}px`;
            pixel.style.height = `${size}px`;
            pixel.style.background = colors[Math.floor(Math.random() * colors.length)];
            document.body.appendChild(pixel);
            activePixels.add(pixel);

            const animation = pixel.animate([
                { transform: 'translate3d(0, 0, 0) scale(1)', opacity: 0.75 },
                { transform: `translate3d(${scatterX}px, ${scatterY}px, 0) scale(0.35)`, opacity: 0 }
            ], {
                duration: 380 + Math.random() * 260,
                easing: 'cubic-bezier(.2,.7,.2,1)'
            });

            animation.finished.finally(() => {
                activePixels.delete(pixel);
                pixel.remove();
            });
        }

        while (activePixels.size > 80) {
            const oldestPixel = activePixels.values().next().value;
            activePixels.delete(oldestPixel);
            oldestPixel.remove();
        }

        lastX = event.clientX;
        lastY = event.clientY;
        lastTime = now;
    }, { passive: true });
}

initializeCursorTrail();
