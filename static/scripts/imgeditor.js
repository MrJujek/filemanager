function saveImage() {
    console.log('Saving image...');
    console.log(document.getElementById("canvas").toDataURL("image/png").replace("image/png", "image/octet-stream"));
    // fetch('/saveImage', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({
    //         img: document.getElementById("canvas").toDataURL("image/png").replace("image/png", "image/octet-stream"),
    //         file_path: document.getElementById('file_path').getAttribute("href")
    //     })
    // }).then(response => response.text())
    //     .then(
    //         data => {
    //             console.log(data)
    //         }
    //     )
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

function drawImage(imgPath, filter, canvasId) {
    if (!globalImgPath) {
        globalImgPath = imgPath;
    }

    let canvas = document.getElementById(canvasId);
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

                    let r = pixels3[i];
                    let g = pixels3[i + 1];
                    let b = pixels3[i + 2];

                    pixels3[i] = (r * 0.393) + (g * 0.769) + (b * 0.189);
                    pixels3[i + 1] = (r * 0.349) + (g * 0.686) + (b * 0.168);
                    pixels3[i + 2] = (r * 0.272) + (g * 0.534) + (b * 0.131);
                }
                ctx.putImageData(imgData3, 0, 0);
                break;

            case 'none':
            default:
                break
        }
    }
}

function drawFilters() {
    drawImage(globalImgPath, "grayscale", "grayscale");
    drawImage(globalImgPath, "invert", "invert");
    drawImage(globalImgPath, "sepia", "sepia");
    drawImage(globalImgPath, "none", "none");
}

function filter(filter) {
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    drawImage(globalImgPath, filter, "canvas");
}

function slideFilters() {
    document.getElementById("filters").classList.toggle("hide");
}