class VocabularyService {
    constructor() {
        this.storage = chrome.storage.sync;
        this.intervals = [1, 3, 7, 14, 30, 90, 180];
    }

    async saveWord(word) {
        try {
            const timestamp = Date.now();
            const wordData = {
                original: word.text,
                translation: word.translation,
                type: word.type,
                language: word.language,
                learned: timestamp,
                nextReview: timestamp + (24 * 60 * 60 * 1000),
                reviewCount: 1,
                interval: 0,
                confidence: 0,
                autoTranslate: false
            };

            const data = await this.storage.get('vocabulary');
            const vocabulary = data.vocabulary || {};

            const wordKey = `${word.text}-${word.language}`;
            if (vocabulary[wordKey]) {
                const existingWord = vocabulary[wordKey];
                wordData.reviewCount = existingWord.reviewCount + 1;
                wordData.interval = Math.min(existingWord.interval + 1, this.intervals.length - 1);
                wordData.confidence = this.calculateConfidence(wordData.reviewCount);
                wordData.autoTranslate = wordData.confidence >= 0.8;
                wordData.nextReview = timestamp + (this.intervals[wordData.interval] * 24 * 60 * 60 * 1000);
            }

            vocabulary[wordKey] = wordData;
            await this.storage.set({ vocabulary });
            console.log('Word saved:', wordData);

            return wordData;
        } catch (error) {
            console.error('Error saving word:', error);
            throw error;
        }
    }

    calculateConfidence(reviewCount) {
        return Math.min(reviewCount * 0.2, 1);
    }

    async shouldAutoTranslate(text, language) {
        try {
            const wordKey = `${text}-${language}`;
            const data = await this.storage.get('vocabulary');
            const vocabulary = data.vocabulary || {};
            const word = vocabulary[wordKey];

            return word && word.autoTranslate;
        } catch (error) {
            console.error('Error checking auto-translate:', error);
            return false;
        }
    }

    async getWord(text, language) {
        try {
            const data = await this.storage.get('vocabulary');
            const vocabulary = data.vocabulary || {};
            const wordKey = `${text}-${language}`;
            return vocabulary[wordKey];
        } catch (error) {
            console.error('Error getting word:', error);
            throw error;
        }
    }

    async getAllWords() {
        try {
            const data = await this.storage.get('vocabulary');
            return Object.values(data.vocabulary || {});
        } catch (error) {
            console.error('Error getting vocabulary:', error);
            throw error;
        }
    }

    async exportData() {
        try {
            const data = await this.storage.get('vocabulary');
            return data.vocabulary || {};
        } catch (error) {
            console.error('Error exporting data:', error);
            throw error;
        }
    }

    async logVocabulary() {
        try {
            const data = await this.storage.get('vocabulary');
            const vocabulary = data.vocabulary || {};

            console.group('Saved Vocabulary');
            console.table(vocabulary);
            console.log('Raw data:', vocabulary);
            console.groupEnd();

            return vocabulary;
        } catch (error) {
            console.error('Error getting vocabulary:', error);
            throw error;
        }
    }

    async getWordDetails(text, language) {
        try {
            const wordKey = `${text}-${language}`;
            const data = await this.storage.get('vocabulary');
            const vocabulary = data.vocabulary || {};
            const word = vocabulary[wordKey];

            if (word) {
                // Add human-readable dates and time remaining
                const now = Date.now();
                word.learnedDate = new Date(word.learned).toLocaleString();
                word.nextReviewDate = new Date(word.nextReview).toLocaleString();
                word.daysUntilReview = Math.round((word.nextReview - now) / (1000 * 60 * 60 * 24));
                word.isReviewDue = now > word.nextReview;
            }

            return word;
        } catch (error) {
            console.error('Error getting word details:', error);
            throw error;
        }
    }
}

window.VocabularyService = VocabularyService;
