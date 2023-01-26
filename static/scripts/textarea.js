let editor = document.getElementById('editor');
let linesNumbers = document.getElementById('linesNumbers');

editor.addEventListener('scroll', () => {
    linesNumbers.scrollTop = editor.scrollTop;
    linesNumbers.scrollLeft = editor.scrollLeft;
});

linesNumbers.addEventListener('scroll', () => {
    editor.scrollTop = linesNumbers.scrollTop;
    editor.scrollLeft = linesNumbers.scrollLeft;
})

let oldLineCount = 0;
function countLines() {
    let lineCount = editor.value.split('\n').length;
    let array = []
    if (oldLineCount != lineCount) {
        for (let i = 0; i < lineCount; i++) {
            array[i] = i + 1;
        }
        linesNumbers.value = array.join('\n');
    }
    oldLineCount = lineCount;
}

editor.addEventListener('change', () => {
    countLines();
});

countLines();