class TranslationService {
    constructor() {
        this.cache = new Map();
        this.targetLanguage = 'es';
        this.loadSettings();
    }

    async loadSettings() {
        const settings = await chrome.storage.sync.get({
            targetLanguage: 'es'
        });
        this.targetLanguage = settings.targetLanguage;
    }

    async translate(text) {
        try {
            // Check cache first
            const cacheKey = `${text}:${this.targetLanguage}`;
            if (this.cache.has(cacheKey)) {
                console.log('Using cached translation for:', text);
                return this.cache.get(cacheKey);
            }

            // Google Translate API URL
            const url = new URL('https://translate.googleapis.com/translate_a/single');
            url.searchParams.append('client', 'gtx');
            url.searchParams.append('sl', 'en');  // source language
            url.searchParams.append('tl', this.targetLanguage);  // target language
            url.searchParams.append('dt', 't');  // return type
            url.searchParams.append('q', text);

            console.log('Fetching translation for:', text);
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Translation failed: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Translation API response:', data);

            // Google Translate returns an array with the translation in the first position
            if (!data || !data[0] || !data[0][0] || !data[0][0][0]) {
                throw new Error('Invalid translation response format');
            }

            const translation = data[0][0][0];

            // Cache the result
            this.cache.set(cacheKey, translation);

            console.log('Translation result:', {
                original: text,
                translated: translation,
                targetLang: this.targetLanguage
            });

            return translation;

        } catch (error) {
            console.error('Translation error for word:', text, error);
            // Return original text if translation fails
            return text;
        }
    }

    // Add delay between translations to avoid rate limiting
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

window.TranslationService = TranslationService;
