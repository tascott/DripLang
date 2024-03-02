let enabled = true;
let offColor= 'rgba(0,0,0,0.0)';
let targetLanguage;
let color1 = '#f7f7f7';
let color2 = '#fff9f0';
let translatedColor = 'rgba(255,216,184,0.7)';

function splitElementsIntoSpans(element) {
    // Iterate through all child nodes of the element
    Array.from(element.childNodes).forEach((node) => {
        if(node.nodeType === Node.TEXT_NODE) {
            // This is a text node, apply regex and wrap parts in <span>
            const parts = node.nodeValue.match(/[^,;:.\\-]+[,;:.\\-]?|\s+/g); //TODO: Add more punctuation + words
            if(parts) {
                const spanWrapper = document.createDocumentFragment();
                parts.forEach(part => {
                    if(part.trim() !== '') {
                        const span = document.createElement('span');
                        span.textContent = part;
                        spanWrapper.appendChild(span);
                    } else {
                        spanWrapper.appendChild(document.createTextNode(part));
                    }
                });
                node.parentNode.replaceChild(spanWrapper,node);
            }
        } else if(node.nodeType === Node.ELEMENT_NODE && node.nodeName !== 'A') {
            // This is an element node that is not an <a> tag, like <span> or <strong>, so we take this inner node and re apply the function to it
            splitElementsIntoSpans(node);
        }
        // If it's an <a> tag or other non-text element, do nothing and leave it intact
    });
    styleSpansAndAddListeners(element);
}

function translate(span) {
    var sourceLang = 'en';
    var targetLang = targetLanguage || 'es';
    var sourceText = span.textContent;
    var url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" + sourceLang + "&tl=" + targetLang + "&dt=t&q=" + encodeURI(sourceText);

    $.getJSON(url,function(data) {
        const translation = data[0][0][0];
        const translatedSpan = document.createElement('span');
        translatedSpan.textContent = ' ' + '(' + translation + ')' + ' ';
        translatedSpan.classList.add('new-span');
        translatedSpan.style.backgroundColor = translatedColor;
        span.insertAdjacentElement('afterend',translatedSpan);
    });
}

function styleSpansAndAddListeners(textBlock) {
    const spans = textBlock.querySelectorAll('span')
    spans.forEach((span,i) => {
        if(enabled){
            span.style.backgroundColor = i % 2 === 0 ? color1 : color2;
        } else {
            span.style.backgroundColor = offColor;
        }

        span.classList.add('translation-span'); // to be traversed later
        span.addEventListener('click',(e) => {
            e.stopPropagation();
            e.stopImmediatePropagation();
            translate(span);
        })
    })
}

// Function to update feature behavior based on setting
function updateLanguage(language) {
    if(language) {
        targetLanguage = language;
    } else {
        targetLanguage = 'es';
    }
}

// Function to visually disable the extension
function toggleOnOff(isOn) {
    if(isOn) {
        enabled = true;
        updateColors();
    } else {
        enabled = false;
        updateColors(true);
    }
}

// Function that waits for storage to return a color1 and color2 value
function asyncDataFromStorage() {
    return new Promise((resolve,reject) => {
        chrome.storage.sync.get(['color1','color2', 'on'],function(data) {
            if(data.color1 !== undefined) {
                color1 = data.color1;
            }
            if(data.color2 !== undefined) {
                color2 = data.color2;
            }
            if(data.on !== undefined) {
                enabled = data.on;
            }
            resolve();
        });
    });
}

asyncDataFromStorage().then(() => {
    console.log('asyncDataFromStorage resolved, enabled: ', enabled);
    document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li').forEach(element => {
        splitElementsIntoSpans(element);
    });
});

function updateColors(turnOff) {
    if(turnOff) {
        document.querySelectorAll('.translation-span').forEach((span,i) => {
            span.style.backgroundColor = i % 2 === 0 ? offColor : offColor;
        });
    } else {
        document.querySelectorAll('.translation-span').forEach((span,i) => {
            span.style.backgroundColor = i % 2 === 0 ? color1 : color2;
        });
    }
}

// Generic Checks for variables from storage
chrome.storage.sync.get('language',function(data) {
    if(data.language !== undefined) {
        targetLanguage = data.language;
        updateLanguage(data.language);
    }
});

chrome.storage.onChanged.addListener(function(changes,namespace) {
    for(let [key,{oldValue,newValue}] of Object.entries(changes)) {
        if (key === 'language') {
            updateLanguage(newValue);
        } else if (key === 'color1') {
            color1 = newValue;
            updateColors();
        } else  if (key === 'color2') {
            color2 = newValue;
            updateColors();
        } else if (key === 'on') {
            enabled = newValue;
            toggleOnOff(newValue);
        } else { console.log('No key found') }
    }
});