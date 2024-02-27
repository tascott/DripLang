function wrapTextNodesWithSpans(element) {
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
            // This is an element node that is not an <a> tag, recurse
            wrapTextNodesWithSpans(node);
        }
        // If it's an <a> tag or other non-text element, do nothing and leave it intact
    });

    styleSpansAndAddListenters(element);
}

// Apply the function to your paragraph element
console.log('wrapTextNodesWithSpans')
document.querySelectorAll('p').forEach(p => {
    wrapTextNodesWithSpans(p);
});



function translate(span) {
    var sourceLang = 'en';
    var targetLang = 'es';
    var sourceText = span.textContent;
    console.log('SPAN CONTENT:', span.textContent)

    var url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" + sourceLang + "&tl=" + targetLang + "&dt=t&q=" + encodeURI(sourceText);
    console.log(url);

    $.getJSON(url,function(data) {
        console.log(data[0][0][0]);
        // TODO: insert the translation into the span after the original text, in brackets
        // TODO: add a class to the translated text
        // TODO: show some stylised link between the original and the translated text
        span.textContent = span.textContent + ' (' + data[0][0][0] + ')';
        //TODO add a class to the translated text span to stop it being able to be clicked and translated again
    });
}

function styleSpansAndAddListenters(p) {
    const spans = p.querySelectorAll('span')
    spans.forEach((span,i) => {
        if(i % 2 === 0) {
            span.classList.add('even')
        } else {
            span.classList.add('odd')
        }
        span.addEventListener('click',() => {
            translate(span);
        })
    })

}




// Default behavior if the setting hasn't been set yet
let featureEnabled = true;

// Function to update feature behavior based on setting
function updateFeatureBehavior(enabled) {
    if(enabled) {
        // Code to enable the feature
        alert('enabled set!!')
    } else {
        // Code to disable or alter the feature
        alert('disabled set!!')
    }
}

// Check storage for the user's settings
chrome.storage.sync.get('featureEnabled',function(data) {
    if(data.featureEnabled !== undefined) {
        featureEnabled = data.featureEnabled;
        updateFeatureBehavior(featureEnabled);
    }
});


chrome.storage.onChanged.addListener(function(changes,namespace) {
    for(let [key,{oldValue,newValue}] of Object.entries(changes)) {
        if(key === 'featureEnabled') {
            console.log('Feature enabled setting changed, listened in index.js');
            updateFeatureBehavior(newValue);
        }
    }
});
