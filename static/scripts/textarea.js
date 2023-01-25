let lines = document.querySelector("textarea").value.split(/\r\n|\r|\n/).length;
let linesNumbers = document.getElementById("linesNumbers")

for (let i = 0; i < lines; i++) {
    let number = document.createElement("p")
    number.classList.add("lineNumber")
    number.innerHTML = i + 1

    linesNumbers.appendChild(number)
}

document.getElementById("editor").addEventListener("input", function () {
    lines = document.querySelector("textarea").value.split(/\r\n|\r|\n/).length;
    linesNumbers = document.getElementById("linesNumbers")
    linesNumbers.innerHTML = ""

    for (let i = 0; i < lines; i++) {
        let number = document.createElement("p")
        number.classList.add("lineNumber")
        number.innerHTML = i + 1

        linesNumbers.appendChild(number)
    }
})