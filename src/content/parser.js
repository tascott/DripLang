class TextParser {
    constructor() {
        if (typeof nlp === 'undefined') {
            console.error('DripLang: Compromise not loaded!');
            return;
        }
        this.nlp = nlp;
    }

    findWordsToTranslate(text) {
        if (!this.nlp) return { nouns: [], adjectives: [] };

        const doc = this.nlp(text);

        return {
            nouns: this.extractNouns(doc),
            adjectives: this.extractAdjectives(doc)
        };
    }

    cleanWord(word) {
        // Remove punctuation, quotes, and extra spaces
        return word.replace(/[.,!?;:"']/g, '')  // remove punctuation
                   .replace(/^['"]|['"]$/g, '') // remove quotes
                   .trim();                     // remove extra spaces
    }

    extractNouns(doc) {
        return doc.nouns()
            .not('#Pronoun')
            .out('offsets')
            .map(word => {
                const cleanedText = this.cleanWord(word.text);
                // Split into individual words
                const words = cleanedText.split(/\s+/);

                // Get the main noun (usually the last word in a compound noun)
                const mainNoun = words[words.length - 1];

                if (this.isValidWord(mainNoun)) {
                    return {
                        type: 'noun',
                        text: mainNoun.toLowerCase(),
                        position: word.offset.start + word.text.indexOf(mainNoun)
                    };
                }
                return null;
            })
            .filter(word => word !== null); // Remove null entries
    }

    extractAdjectives(doc) {
        return doc.adjectives()
            .out('offsets')
            .map(word => {
                const cleanedText = this.cleanWord(word.text);
                if (this.isValidWord(cleanedText)) {
                    return {
                        type: 'adjective',
                        text: cleanedText.toLowerCase(),
                        position: word.offset.start
                    };
                }
                return null;
            })
            .filter(word => word !== null); // Remove null entries
    }

    isValidWord(text) {
        if (!text) return false;

        // Convert to lowercase for checking
        const word = text.toLowerCase();

        // Skip if less than 3 letters
        if (word.length < 3) {
            return false;
        }

        // Skip pronouns and common words
        const skipWords = [
            // Common words
            'the', 'a', 'an', 'this', 'that', 'these', 'those',
            'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
            // Pronouns
            'his', 'her', 'its', 'their', 'our', 'your', 'mine',
            'yours', 'hers', 'ours', 'theirs', 'them', 'they',
            'who', 'whom', 'whose', 'which', 'what'
        ];

        if (skipWords.includes(word)) {
            return false;
        }

        // Skip if it's a proper noun (starts with capital)
        if (/^[A-Z]/.test(text) && text !== text.toUpperCase()) {
            return false;
        }

        return true;
    }
}

window.TextParser = TextParser;  // Make it globally available