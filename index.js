let targetLanguage;
let color1 = 'rgba(0,0,0,0.5)';
let color2 = 'rgba(255,255,255,0.3)';

function splitElementsIntoSpans(element) {
    // Iterate through all child nodes of the element, which will be a paragraph
    Array.from(element.childNodes).forEach((node) => {
        if(node.nodeType === Node.TEXT_NODE) {
            // This is a text node, apply regex and wrap parts in <span>
            const parts = node.nodeValue.match(/[^,;:.]+[,;:.]?|\s+/g);
            if(parts) {
                const spanWrapper = document.createDocumentFragment();
                parts.forEach(part => {
                    if(part.trim() !== '') {
                        const span = document.createElement('span');
                        span.textContent = part;
                        spanWrapper.appendChild(span);
                    } else {
                        // Preserve whitespace
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
        // TODO: add a class to the translated text
        // TODO: show some stylised link between the original and the translated text
        span.textContent = span.textContent + ' (' + data[0][0][0] + ')';
        //TODO add a class to the translated text span to stop it being able to be clicked and translated again
    });
}

function styleSpansAndAddListeners(textBlock) {
    const spans = textBlock.querySelectorAll('span')
    spans.forEach((span,i) => {
        span.style.backgroundColor = i % 2 === 0 ? color1 : color2;
        span.classList.add('translated-span'); // to be traversed later
        span.addEventListener('click',() => {
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

// Function that waits for storage to return a color1 and color2 value
function asyncDataFromStorage() {
    return new Promise((resolve,reject) => {
        chrome.storage.sync.get(['color1','color2'],function(data) {
            if(data.color1 !== undefined) {
                color1 = data.color1;
            }
            if(data.color2 !== undefined) {
                color2 = data.color2;
            }
            resolve();
        });
    });
}

asyncDataFromStorage().then(() => {
    document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li').forEach(element => {
        splitElementsIntoSpans(element);
    });
});

function updateColors() {
    document.querySelectorAll('.translated-span').forEach((span,i) => {
        span.style.backgroundColor = i % 2 === 0 ? color1 : color2;
    });
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
        if(key === 'language') {
            updateLanguage(newValue);
        }
    }
});

chrome.storage.onChanged.addListener(function(changes,namespace) {
    for(let [key,{oldValue,newValue}] of Object.entries(changes)) {
        if(key === 'color1') {
            color1 = newValue;
            updateColors();
        }
        if(key === 'color2') {
            color2 = newValue;
            updateColors();
        }
    }
});