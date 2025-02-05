class DOMHandler {
    constructor(parser, translator, vocabulary) {
        this.parser = parser;
        this.translator = translator;
        this.vocabulary = vocabulary;
        this.activeTooltip = null;
        this.hoverTimeout = null;
    }

    async processTextNode(node) {
        if (!node.textContent.trim()) return;

        const originalText = node.textContent;
        const words = this.parser.findWordsToTranslate(originalText);

        if (words.nouns.length === 0 && words.adjectives.length === 0) return;

        try {
            const fragment = document.createDocumentFragment();
            let currentPosition = 0;

            const allWords = [...words.nouns, ...words.adjectives]
                .sort((a, b) => a.position - b.position);

            for (const word of allWords) {
                if (word.position > currentPosition) {
                    const beforeText = originalText.substring(currentPosition, word.position);
                    fragment.appendChild(document.createTextNode(beforeText));
                }

                const wrapper = document.createElement('span');
                wrapper.textContent = word.text;
                wrapper.className = `driplang-word ${word.type}`;

                const shouldAutoTranslate = await this.vocabulary.shouldAutoTranslate(
                    word.text,
                    this.translator.targetLanguage
                );

                if (shouldAutoTranslate) {
                    const cached = await this.vocabulary.getWord(word.text, this.translator.targetLanguage);
                    wrapper.textContent = cached.translation;
                    wrapper.setAttribute('data-original', word.text);
                    wrapper.classList.add('translated', 'auto-translated');
                }

                wrapper.addEventListener('mouseenter', () => this.handleWordHover(wrapper, word));
                wrapper.addEventListener('mouseleave', () => this.handleWordLeave());
                wrapper.addEventListener('click', () => this.handleWordClick(wrapper, word));

                fragment.appendChild(wrapper);
                currentPosition = word.position + word.text.length;
            }

            node.parentNode.replaceChild(fragment, node);

        } catch (error) {
            console.error('Error processing node:', error);
        }
    }

    removeOverlappingWords(words) {
        return words.filter((word, index) => {
            // Check if this word overlaps with any previous words
            const previousWords = words.slice(0, index);
            return !previousWords.some(prev =>
                (word.position >= prev.position &&
                 word.position < prev.position + prev.text.length) ||
                (prev.position >= word.position &&
                 prev.position < word.position + word.text.length)
            );
        });
    }

    processPage() {
        console.log('DripLang: Starting page processing');
        const textNodes = this.getTextNodes(document.body);
        textNodes.forEach(node => this.processTextNode(node));
    }

    getTextNodes(element) {
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    const parent = node.parentElement;
                    if (!parent ||
                        ['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'OPTION'].includes(parent.tagName) ||
                        parent.classList.contains('driplang-word')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        const nodes = [];
        let node;
        while (node = walker.nextNode()) {
            nodes.push(node);
        }
        return nodes;
    }

    createWordWrapper(word) {
        const wrapper = document.createElement('span');
        wrapper.textContent = word.text;
        wrapper.className = `driplang-word ${word.type}`;

        // Add hover listeners
        wrapper.addEventListener('mouseenter', () => this.handleWordHover(wrapper, word));
        wrapper.addEventListener('mouseleave', () => this.handleWordLeave());

        // Add click listener for persistent translation
        wrapper.addEventListener('click', () => this.handleWordClick(wrapper, word));

        return wrapper;
    }

    async handleWordHover(element, word) {
        if (this.hoverTimeout) {
            clearTimeout(this.hoverTimeout);
        }

        this.hoverTimeout = setTimeout(async () => {
            try {
                const translation = await this.translator.translate(word.text);
                if (!element.matches(':hover')) {
                    return; // Don't show tooltip if user already moved mouse away
                }
                this.showTooltip(element, `${word.text} → ${translation}`);
            } catch (error) {
                console.error('Translation error:', error);
                this.showTooltip(element, 'Translation error');
            }
        }, 300);
    }

    handleWordLeave() {
        if (this.hoverTimeout) {
            clearTimeout(this.hoverTimeout);
        }
        this.hideTooltip();
    }

    showTooltip(element, content) {
        this.hideTooltip();

        const tooltip = document.createElement('div');
        tooltip.className = 'driplang-tooltip';
        tooltip.textContent = content;

        // Position the tooltip
        const rect = element.getBoundingClientRect();
        const tooltipHeight = 28; // Approximate height
        const spacing = 5; // Space between word and tooltip

        tooltip.style.left = `${rect.left + window.scrollX}px`;
        tooltip.style.top = `${rect.top + window.scrollY - tooltipHeight - spacing}px`;

        document.body.appendChild(tooltip);
        this.activeTooltip = tooltip;
    }

    hideTooltip() {
        if (this.activeTooltip) {
            this.activeTooltip.remove();
            this.activeTooltip = null;
        }
    }

    async handleWordClick(element, word) {
        try {
            // Get translation
            const translation = await this.translator.translate(word.text);

            // Save to vocabulary
            await this.vocabulary.saveWord({
                text: word.text,
                translation: translation,
                type: word.type,
                language: this.translator.targetLanguage
            });

            // Log current vocabulary
            await this.vocabulary.logVocabulary();

            // Store original text as data attribute if not already stored
            if (!element.hasAttribute('data-original')) {
                element.setAttribute('data-original', element.textContent);
            }

            // Update text to show translation
            element.textContent = translation;
            element.classList.add('translated');

            // Add click handler to toggle back to original text
            element.addEventListener('click', () => this.handleTranslatedWordClick(element), { once: true });

            // Show brief confirmation tooltip
            this.showTooltip(element, '✓ Saved');
            setTimeout(() => this.hideTooltip(), 1000);

        } catch (error) {
            console.error('Error handling word click:', error);
            this.showTooltip(element, 'Error saving word');
        }
    }

    handleTranslatedWordClick(element) {
        // Toggle back to original text
        const originalText = element.getAttribute('data-original');
        element.textContent = originalText;
        element.classList.remove('translated');

        // Add click handler to show translation again
        element.addEventListener('click', () => {
            element.textContent = element.getAttribute('data-translation');
            element.classList.add('translated');
            element.addEventListener('click', () => this.handleTranslatedWordClick(element), { once: true });
        }, { once: true });
    }
}

window.DOMHandler = DOMHandler;