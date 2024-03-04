document.addEventListener('DOMContentLoaded',function() {
    const languageSelector = document.getElementById('language-select');
    const color1 = document.getElementById('color1');
    const color2 = document.getElementById('color2');
    const onCheckbox = document.getElementById('on');
    const commas = document.getElementById('cb1');
    const questionExcl = document.getElementById('cb2');
    const lis = document.getElementById('cb3');
    const colons = document.getElementById('cb4');
    const andOr = document.getElementById('cb5');
    const dashes = document.getElementById('cb6');

    chrome.storage.sync.get(['commas','questionExcl','lis','colons','andOr', 'dashes'],function(data) {
        if(data.commas !== undefined) {
            commas.checked = data.commas;
            chrome.storage.sync.set({commas: data.commas});
        } else {
            chrome.storage.sync.set({commas: true});
            commas.checked = true;
        }
        if(data.questionExcl !== undefined) {
            questionExcl.checked = data.questionExcl;
            chrome.storage.sync.set({questionExcl: data.questionExcl});
        } else {
            chrome.storage.sync.set({questionExcl: true});
            questionExcl.checked = true;
        }

        if(data.lis !== undefined) {
            lis.checked = data.lis;
            chrome.storage.sync.set({lis: data.lis});
        } else {
            chrome.storage.sync.set({lis: true});
            lis.checked = true;
        }

        if(data.colons !== undefined) {
            colons.checked = data.colons;
            chrome.storage.sync.set({colons: data.colons});
        } else {
            chrome.storage.sync.set({colons: true});
            colons.checked = true;
        }

        if(data.andOr !== undefined) {
            andOr.checked = data.andOr;
            chrome.storage.sync.set({andOr: data.andOr});
        } else {
            chrome.storage.sync.set({andOr: true});
            andOr.checked = true;
        }

        if(data.dashes !== undefined) {
            dashes.checked = data.dashes;
            chrome.storage.sync.set({dashes: data.dashes});
        } else {
            chrome.storage.sync.set({dashes: true});
            dashes.checked = true;
        }

    });

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
        } else {
            color1.value = 'rgba(0,0,0,0.03)';
        }
    });

    // Load saved settings and update the color2 state
    chrome.storage.sync.get('color2',function(data) {
        if(data.color2 !== undefined) {
            color2.value = data.color2;
        } else {
            color2.value = 'rgba(255,255,255,0.2)';
        }
    });

    // Load saved settings and update the onOff state
    chrome.storage.sync.get('on',function(data) {
        if(data.on !== undefined) {
            on.value = true;
            onCheckbox.checked = data.on;
        } else {
            on.value = false;
            onCheckbox.checked = false;
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

    // Turn on or off the extension
    onCheckbox.addEventListener('change',function() {
        const onValue = onCheckbox.checked;
        chrome.storage.sync.set({on: onValue});
    });

    // Save settings when the checkboxes are changed
    commas.addEventListener('change',function() {
        const value = commas.checked;
        chrome.storage.sync.set({commas: value});
    });

    questionExcl.addEventListener('change',function() {
        const value = questionExcl.checked;
        chrome.storage.sync.set({questionExcl: value});
    });

    lis.addEventListener('change',function() {
        const value = lis.checked;
        chrome.storage.sync.set({lis: value});
    });

    colons.addEventListener('change',function() {
        const value = colons.checked;
        chrome.storage.sync.set({colons: value});
    });

    andOr.addEventListener('change',function() {
        const value = andOr.checked;
        chrome.storage.sync.set({andOr: value});
    });

    dashes.addEventListener('change',function() {
        const value = dashes.checked;
        chrome.storage.sync.set({dashes: value});
    });

});
