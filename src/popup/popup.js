class PopupManager {
    constructor() {
        this.elements = {
            enabled: document.getElementById('enabled'),
            targetLang: document.getElementById('targetLang'),
            translateNouns: document.getElementById('translateNouns'),
            translateAdjectives: document.getElementById('translateAdjectives'),
            progressBar: document.getElementById('progressBar'),
            learnedWords: document.getElementById('learnedWords'),
            reviewBtn: document.getElementById('reviewBtn')
        };

        this.init();
    }

    async init() {
        // Load saved settings
        const settings = await this.loadSettings();
        this.applySettings(settings);

        // Load vocabulary stats
        await this.updateStats();

        // Add event listeners
        this.setupEventListeners();
    }

    async loadSettings() {
        return new Promise((resolve) => {
            chrome.storage.sync.get({
                // Default settings
                enabled: true,
                targetLang: 'es',
                translateNouns: true,
                translateAdjectives: true
            },resolve);
        });
    }

    applySettings(settings) {
        this.elements.enabled.checked = settings.enabled;
        this.elements.targetLang.value = settings.targetLang;
        this.elements.translateNouns.checked = settings.translateNouns;
        this.elements.translateAdjectives.checked = settings.translateAdjectives;
    }

    async updateStats() {
        try {
            const stats = await this.getVocabularyStats();

            // Update progress bar
            const progressPercent = (stats.learned / stats.total) * 100;
            this.elements.progressBar.style.width = `${progressPercent}%`;

            // Update learned words count
            this.elements.learnedWords.textContent = stats.learned;

            // Enable/disable review button based on whether there are words to review
            this.elements.reviewBtn.disabled = stats.toReview === 0;
            this.elements.reviewBtn.textContent =
                `Review Vocabulary (${stats.toReview} words due)`;
        } catch(error) {
            console.error('Failed to update stats:',error);
        }
    }

    async getVocabularyStats() {
        return new Promise((resolve) => {
            chrome.storage.local.get({
                vocabulary: {}
            },(result) => {
                const vocab = result.vocabulary;
                const now = Date.now();

                const stats = {
                    total: Object.keys(vocab).length,
                    learned: 0,
                    toReview: 0
                };

                for(const word in vocab) {
                    if(vocab[word].learned) {
                        stats.learned++;
                        if(vocab[word].nextReview <= now) {
                            stats.toReview++;
                        }
                    }
                }

                resolve(stats);
            });
        });
    }

    setupEventListeners() {
        // Main toggle
        this.elements.enabled.addEventListener('change',async (e) => {
            await this.saveSetting('enabled',e.target.checked);
            this.updateActiveTab();
        });

        // Target language
        this.elements.targetLang.addEventListener('change',async (e) => {
            await this.saveSetting('targetLang',e.target.value);
            this.updateActiveTab();
        });

        // Word type toggles
        this.elements.translateNouns.addEventListener('change',async (e) => {
            await this.saveSetting('translateNouns',e.target.checked);
            this.updateActiveTab();
        });

        this.elements.translateAdjectives.addEventListener('change',async (e) => {
            await this.saveSetting('translateAdjectives',e.target.checked);
            this.updateActiveTab();
        });

        // Review button
        this.elements.reviewBtn.addEventListener('click',() => {
            // Open the review page in a new tab
            chrome.tabs.create({
                url: chrome.runtime.getURL('src/options/options.html#review')
            });
        });
    }

    async saveSetting(key,value) {
        return new Promise((resolve) => {
            chrome.storage.sync.set({
                [key]: value
            },resolve);
        });
    }

    updateActiveTab() {
        // Send message to content script to update the page
        chrome.tabs.query({active: true,currentWindow: true},(tabs) => {
            if(tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id,{
                    action: 'updateSettings'
                });
            }
        });
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded',() => {
    new PopupManager();
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message,sender,sendResponse) => {
    if(message.action === 'statsUpdated') {
        // Refresh stats when vocabulary changes
        popupManager.updateStats();
    }
});