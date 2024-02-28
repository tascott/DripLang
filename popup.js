// popup.js
document.addEventListener('DOMContentLoaded',function() {
    const languageSelector = document.getElementById('language-select');
    console.log(languageSelector.value)

    // Load saved settings and update the languageSelector state
    chrome.storage.sync.get('language',function(data) {
        console.log('data.language',data.language)
        if(data.language !== undefined) {
            language.value = data.language;
        }
    });

    // Save settings when the languageSelector is changed
    languageSelector.addEventListener('change',function() {
        // get the language from the dropdown
        const language = languageSelector.value;
        chrome.storage.sync.set({language: language});
    });
});
