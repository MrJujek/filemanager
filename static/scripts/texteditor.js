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

editor.addEventListener('input', () => {
    countLines();
});

countLines();

function saveFile() {
    console.log('Saving file...');
    fetch('/saveFile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            text: document.getElementById('editor').value,
            file_path: document.getElementById('file_path').getAttribute("href")
        })
    }).then(response => response.text())
        .then(
            data => {
                console.log(data)
            }
        )
}

function fontminus() {
    let font = document.getElementById('editor').style.fontSize;
    if (font == "") {
        font = 16;
    }
    font = parseInt(font);
    font -= 1;
    document.getElementById('editor').style.fontSize = font + "px";
    document.getElementById('editor').style.lineHeight = font + "px";
    document.getElementById('linesNumbers').style.fontSize = font + "px";
    document.getElementById('linesNumbers').style.lineHeight = font + "px";
}

function fontplus() {
    let font = document.getElementById('editor').style.fontSize;
    if (font == "") {
        font = 16;
    }
    font = parseInt(font);
    font += 1;
    document.getElementById('editor').style.fontSize = font + "px";
    document.getElementById('editor').style.lineHeight = font + "px";
    document.getElementById('linesNumbers').style.fontSize = font + "px";
    document.getElementById('linesNumbers').style.lineHeight = font + "px";
}

let colors = {
    1: ["#ffffff", "#000000", "#000000"],
    2: ["#000000", "#ffffff", "#ffffff"],
    3: ["#282a3a", "#5d7997", "#ffffff"]
}

function changeColor() {
    let parts = window.getComputedStyle(document.getElementById('editor')).backgroundColor.slice(4, -1).split(', ');
    for (let i = 0; i < parts.length; i++) {
        parts[i] = parseInt(parts[i]).toString(16);
        if (parts[i].length == 1) parts[i] = '0' + parts[i];
    }
    let currentColor = '#' + parts.join('');

    switch (currentColor) {
        case colors[1][0]:
            document.getElementById('editor').style.backgroundColor = colors[2][0];
            document.getElementById('editor').style.color = colors[2][2];
            document.getElementById('linesNumbers').style.backgroundColor = colors[2][0];
            document.getElementById('linesNumbers').style.color = colors[2][1];
            document.getElementById('linesNumbers').style.borderColor = colors[2][1];
            break;
        case colors[2][0]:
            document.getElementById('editor').style.backgroundColor = colors[3][0];
            document.getElementById('editor').style.color = colors[3][2];
            document.getElementById('linesNumbers').style.backgroundColor = colors[3][0];
            document.getElementById('linesNumbers').style.color = colors[3][1];
            document.getElementById('linesNumbers').style.borderColor = colors[3][1];
            break;
        case colors[3][0]:
            document.getElementById('editor').style.backgroundColor = colors[1][0];
            document.getElementById('editor').style.color = colors[1][2];
            document.getElementById('linesNumbers').style.backgroundColor = colors[1][0];
            document.getElementById('linesNumbers').style.color = colors[1][1];
            document.getElementById('linesNumbers').style.borderColor = colors[1][1];
            break;
    }
}

function renameFile() {
    let element = document.createElement("div")
    element.id = "dialogrenamefile"
    element.innerText = "Input new file name:"

    let input = document.createElement("input")
    input.required = true
    element.append(input)

    let buttons = document.createElement("div")
    buttons.classList.add("dialogButtons")

    let create = document.createElement("button")
    create.type = "submit"
    create.innerText = "Rename"
    create.addEventListener("click", () => {
        fetch('/renameFile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                newName: input.value,
                file_path: document.getElementById('file_path').getAttribute("href")
            })
        }).then(response => response.text())
            .then(
                data => {
                    console.log(data)
                    window.location.pathname = data;
                }
            )
    })

    let cancel = document.createElement("div")
    cancel.innerText = "Cancel"
    cancel.addEventListener("click", () => {
        document.getElementById("dialogrenamefile").remove()
    })

    buttons.append(create, cancel)
    element.append(buttons)

    document.body.append(element)
}

function setColorAndFont(editorColor, editorFont) {
    document.getElementById('editor').style.backgroundColor = colors[editorColor][0];
    document.getElementById('editor').style.color = colors[editorColor][2];
    document.getElementById('linesNumbers').style.backgroundColor = colors[editorColor][0];
    document.getElementById('linesNumbers').style.color = colors[editorColor][1];
    document.getElementById('linesNumbers').style.borderColor = colors[editorColor][1];

    document.getElementById('editor').style.fontSize = editorFont + "px";
    document.getElementById('editor').style.lineHeight = editorFont + "px";
    document.getElementById('linesNumbers').style.fontSize = editorFont + "px";
    document.getElementById('linesNumbers').style.lineHeight = editorFont + "px";
}

function savesettings() {
    let parts = window.getComputedStyle(document.getElementById('editor')).backgroundColor.slice(4, -1).split(', ');
    for (let i = 0; i < parts.length; i++) {
        parts[i] = parseInt(parts[i]).toString(16);
        if (parts[i].length == 1) parts[i] = '0' + parts[i];
    }
    let currentColor = '#' + parts.join('');

    let colorToSave

    for (let i = 1; i <= Object.keys(colors).length; i++) {
        if (colors[i][0] == currentColor) {
            colorToSave = i
        }
    }
    let fontSize = document.getElementById('editor').style.fontSize;
    console.log(fontSize.split('px')[0]);

    fetch('/saveUserEditorSettings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            editorFont: parseInt(fontSize.split('px')[0]),
            editorColor: colorToSave
        })
    }).then(response => response.text())
        .then(
            data => {
                console.log(data)
            }
        )
}