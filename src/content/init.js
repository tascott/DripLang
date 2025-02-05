console.log('DripLang: Content script loaded');

function initializeDripLang() {
    try {
        console.log('DripLang: Creating services');

        if (typeof TextParser === 'undefined') {
            throw new Error('TextParser not loaded');
        }
        const parser = new TextParser();
        console.log('DripLang: Parser created');

        if (typeof TranslationService === 'undefined') {
            throw new Error('TranslationService not loaded');
        }
        const translator = new TranslationService();
        console.log('DripLang: Translator created');

        if (typeof VocabularyService === 'undefined') {
            throw new Error('VocabularyService not loaded');
        }
        const vocabulary = new VocabularyService();
        console.log('DripLang: Vocabulary service created');

        if (typeof DOMHandler === 'undefined') {
            throw new Error('DOMHandler not loaded');
        }
        const domHandler = new DOMHandler(parser, translator, vocabulary);
        console.log('DripLang: DOM Handler created');

        chrome.storage.sync.get({
            enabled: true,
            translateNouns: true,
            translateAdjectives: true
        }, (settings) => {
            console.log('DripLang: Settings loaded', settings);

            if (settings.enabled) {
                console.log('DripLang: Processing page');
                domHandler.processPage();
            }
        });
    } catch (error) {
        console.error('DripLang: Initialization error:', error);
        console.error('Error details:', error.message);
    }
}

// Try both immediate execution and DOMContentLoaded
initializeDripLang();

document.addEventListener('DOMContentLoaded', () => {
    console.log('DripLang: DOMContentLoaded fired');
    initializeDripLang();
});