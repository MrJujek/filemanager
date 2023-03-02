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

let globalImgPath = ""
function drawImage(imgPath) {
    globalImgPath = imgPath
    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');

    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight

    let img = new Image();
    img.src = "https://dev.juliandworzycki.pl/showFile/" + imgPath;
    img.onload = function () {
        let drawStartX = 0;
        let drawStartY = 0;
        let drawWidth = img.width;
        let drawHeight = img.height;

        if (drawWidth > canvas.width) {
            let oldWidth = img.width;
            let oldHeight = img.height;
            drawWidth = canvas.width;
            drawHeight = (drawWidth * oldHeight) / oldWidth;
        }
        if (drawHeight > canvas.height) {
            let oldWidth = img.width;
            let oldHeight = img.height;
            drawHeight = canvas.height;
            drawWidth = (drawHeight * oldWidth) / oldHeight;
        }
        drawStartX = (canvas.width - drawWidth) / 2;
        drawStartY = (canvas.height - drawHeight) / 2;

        ctx.drawImage(img, 0, 0, img.width, img.height, drawStartX, drawStartY, drawWidth, drawHeight);
    }
}

function filter(filter, canvasId) {
    console.log("filter");
    console.log("filter: ", filter);
    console.log("canvasId: ", canvasId);
    let imgPath = globalImgPath
    //drawImage(imgPath)

    let canvas
    if (canvasId != undefined) {
        canvas = document.getElementById(canvasId);
    } else {
        canvas = document.getElementById('canvas');
    }
    let ctx = canvas.getContext('2d');
    console.log("ctx: ", ctx);

    switch (filter) {
        case "grayscale":
            let imgData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
            let pixels = imgData.data;
            for (let i = 0; i < pixels.length; i += 4) {

                let lightness = parseInt((pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3);

                pixels[i] = lightness;
                pixels[i + 1] = lightness;
                pixels[i + 2] = lightness;
            }
            ctx.putImageData(imgData, 0, 0);
            break;

        case "invert":
            let imgData2 = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
            let pixels2 = imgData2.data;
            for (let i = 0; i < pixels2.length; i += 4) {

                pixels2[i] = 255 - pixels2[i];
                pixels2[i + 1] = 255 - pixels2[i + 1];
                pixels2[i + 2] = 255 - pixels2[i + 2];
            }
            ctx.putImageData(imgData2, 0, 0);
            break;

        case "sepia":
            let imgData3 = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
            let pixels3 = imgData3.data;
            for (let i = 0; i < pixels3.length; i += 4) {

                let lightness = parseInt((pixels3[i] + pixels3[i + 1] + pixels3[i + 2]) / 3);

                pixels3[i] = lightness + 100;
                pixels3[i + 1] = lightness + 50;
                pixels3[i + 2] = lightness;
            }
            ctx.putImageData(imgData3, 0, 0);
            break;
    }
}

function drawFilters() {
    console.log("drawFilters");
    let imgPath = globalImgPath
    let canvas = document.getElementById('grayscale');
    let ctx = canvas.getContext('2d');
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight

    let img = new Image();
    img.src = "https://dev.juliandworzycki.pl/showFile/" + imgPath;
    img.onload = function () {
        let drawStartX = 0;
        let drawStartY = 0;
        let drawWidth = img.width;
        let drawHeight = img.height;

        if (drawWidth > canvas.width) {
            let oldWidth = img.width;
            let oldHeight = img.height;
            drawWidth = canvas.width;
            drawHeight = (drawWidth * oldHeight) / oldWidth;
        }
        if (drawHeight > canvas.height) {
            let oldWidth = img.width;
            let oldHeight = img.height;
            drawHeight = canvas.height;
            drawWidth = (drawHeight * oldWidth) / oldHeight;
        }
        drawStartX = (canvas.width - drawWidth) / 2;
        drawStartY = (canvas.height - drawHeight) / 2;

        ctx.drawImage(img, 0, 0, img.width, img.height, drawStartX, drawStartY, drawWidth, drawHeight);

        filter("grayscale", "grayscale")
    }

    canvas = document.getElementById('invert');
    ctx = canvas.getContext('2d');
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight

    img = new Image();
    img.src = "https://dev.juliandworzycki.pl/showFile/" + imgPath;
    img.onload = function () {
        let drawStartX = 0;
        let drawStartY = 0;
        let drawWidth = img.width;
        let drawHeight = img.height;

        if (drawWidth > canvas.width) {
            let oldWidth = img.width;
            let oldHeight = img.height;
            drawWidth = canvas.width;
            drawHeight = (drawWidth * oldHeight) / oldWidth;
        }
        if (drawHeight > canvas.height) {
            let oldWidth = img.width;
            let oldHeight = img.height;
            drawHeight = canvas.height;
            drawWidth = (drawHeight * oldWidth) / oldHeight;
        }
        drawStartX = (canvas.width - drawWidth) / 2;
        drawStartY = (canvas.height - drawHeight) / 2;

        ctx.drawImage(img, 0, 0, img.width, img.height, drawStartX, drawStartY, drawWidth, drawHeight);

        filter("invert", "invert")
    }
}