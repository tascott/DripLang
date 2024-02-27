// popup.js
document.addEventListener('DOMContentLoaded',function() {
    const checkbox = document.getElementById('toggleFeature');

    // Load saved settings and update the checkbox state
    chrome.storage.sync.get('featureEnabled',function(data) {
        checkbox.checked = data.featureEnabled;
    });

    // Save settings when the checkbox is toggled
    checkbox.addEventListener('change',function() {
        chrome.storage.sync.set({featureEnabled: checkbox.checked});
    });
});
