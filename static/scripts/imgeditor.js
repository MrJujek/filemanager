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
        fetch('/renameImage', {
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

