// popup.js
document.addEventListener('DOMContentLoaded',function() {
    const languageSelector = document.getElementById('language-select');
    const color1 = document.getElementById('color1');
    const color2 = document.getElementById('color2');

    // Load saved settings and update the languageSelector state
    chrome.storage.sync.get('language',function(data) {
        if(data.language !== undefined) {
            languageSelector.value = data.language;
        }
    });

    // Load saved settings and update the color1 state
    chrome.storage.sync.get('color1',function(data) {
        if(data.color1 !== undefined) {
            color1.value = data.color1;
        }
    });

    // Load saved settings and update the color2 state
    chrome.storage.sync.get('color2',function(data) {
        if(data.color2 !== undefined) {
            color2.value = data.color2;
        }
    });

    // Save settings when the languageSelector is changed
    languageSelector.addEventListener('change',function() {
        const language = languageSelector.value;
        chrome.storage.sync.set({language: language});
    });

    // Save settings when the color1 is changed
    color1.addEventListener('change',function() {
        const color = color1.value;
        chrome.storage.sync.set({color1: color});
    });

    // Save settings when the color2 is changed
    color2.addEventListener('change',function() {
        const color = color2.value;
        chrome.storage.sync.set({color2: color});
    });
});
