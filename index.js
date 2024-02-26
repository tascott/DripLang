console.log('Hello World!')

//log all the text of all the paragraphs on the page
const paragraphs = document.querySelectorAll('p')
paragraphs.forEach(p => {
    //add class to each paragraph
    p.classList.add('paragraph-translate')
    if(p.textContent === '' || p.textContent.split(' ').length <= 1) {
        return
    }
    //TODO: split the paragraph in to sentences and the sentences in to short phrases
    console.log(p.textContent.split(' ').length + ': ' + p.textContent)
    p.addEventListener('click',() => {
        translate(p);
    })
})

function translate(paragraph) {
    var sourceLang = 'en';
    var targetLang = 'es';
    var sourceText = paragraph.textContent;
    console.log(paragraph.textContent)

    var url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" + sourceLang + "&tl=" + targetLang + "&dt=t&q=" + encodeURI(sourceText);
    console.log(url);

    $.getJSON(url,function(data) {
        console.log(data[0][0][0]);
        // TODO: insert the translation into the paragraph after the original text, in brackets
        // TODO: add a class to the translated text
        // TODO: show some stylised link between the original and the translated text
        paragraph.textContent = paragraph.textContent + ' (' + data[0][0][0] + ')';
    });
}
