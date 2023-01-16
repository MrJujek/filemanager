import express from "express";
import formidable from "formidable";
import { engine } from "express-handlebars";
import * as fs from "fs";
import * as path from "path";

const app = express()
const PORT = 3003;

app.use(express.static('./static'))
app.use(express.urlencoded({
    extended: true
}));

app.engine('hbs', engine({ defaultLayout: 'main.hbs' }));
app.set('view engine', 'hbs');
app.set('views', "./views");

interface ContextInterface {
    filePath: string
    directories: FileToPushInterface[]
    files: FileToPushInterface[]
}
interface FileToPushInterface {
    name: string
    obraz: string
    path: string
}

let context: ContextInterface = {
    filePath: "",
    directories: [],
    files: []
}

let allFiles: string[]
let folderPath: string

app.get("/*", async function (req, res) {
    folderPath = req.url
    console.log(context);
    fs.readdir(`./files/${folderPath}`, (err, files) => {
        if (err) throw err
        allFiles = files

        //console.log(allFiles);
        //console.log(folderPath);

        context = {
            filePath: folderPath,
            directories: [],
            files: []
        }

        files.forEach((file) => {
            fs.lstat(`./files${folderPath}/${file}`, (err, stats) => {
                let fileToPush: FileToPushInterface = {
                    name: file,
                    obraz: "unknown.png",
                    path: ""
                }

                if (stats.isDirectory()) {
                    fileToPush.obraz = "folder.png"
                    fileToPush.path = path.join(folderPath, file)

                    context.directories.push(fileToPush)
                } else {
                    fileToPush.obraz = getIcon(file)
                    fileToPush.path = path.join(folderPath, file)

                    context.files.push(fileToPush)
                }
            })
        })

        res.render('filemanager.hbs', context);
    })
})

app.post("/upload", function (req, res) {
    let form = formidable({
        uploadDir: path.join('./files', folderPath),
        keepExtensions: true,
        multiples: true
    });

    form.on('fileBegin', function (name, file) {
        let fileName = file.originalFilename
        for (let i = 0; i < allFiles.length; i++) {
            if (allFiles[i] == file.originalFilename) {
                let time = new Date().getTime();
                let splitted = fileName!.split(".")
                if (splitted.length >= 2) {
                    fileName = splitted[0] + time + "." + splitted[1]
                } else {
                    fileName = splitted[0]
                }
                break;
            }
        }
        file.filepath = path.join('./files', folderPath, fileName!)
        console.log(file.filepath);
    })

    form.parse(req, function (err, fields, files) {
        if (err) throw err
        res.redirect(folderPath)
    });
})

app.post('/newFile', function (req, res) {
    let name = req.query.name
    if (!name) {
        let time = new Date().getTime();
        name = "NewFile" + time
    }

    let splitted = name.toString().split(".")
    let fileName = name
    if (!(splitted.length >= 2)) {
        fileName += ".txt"
    }
    for (let i = 0; i < allFiles.length; i++) {
        if (allFiles[i] == fileName) {
            let time = new Date().getTime();
            let splitted = fileName.split(".")
            fileName = splitted[0] + time + "." + splitted[1]
            break;
        }
    }

    const filepath = path.join("./files", folderPath, fileName.toString())
    fs.writeFile(filepath, "", (err) => {
        if (err) throw err

        res.redirect(folderPath)
    })
})

app.post('/newFolder', function (req, res) {
    let name = req.query.name
    if (!name) {
        let time = new Date().getTime();
        name = "NewFolder" + time
    }

    let filepath = path.join("./files", folderPath, name.toString())
    console.log(filepath);
    if (!fs.existsSync(filepath)) {
        fs.mkdir(filepath, (err) => {
            if (err) throw err

            res.redirect(folderPath)
        })
    } else {
        let time = new Date().getTime();
        name += time.toString()
        filepath = path.join("./files", folderPath, name.toString())
        fs.mkdir(filepath, (err) => {
            if (err) throw err

            res.redirect(folderPath)
        })
    }
})

app.post('/deleteFile', function (req, res) {
    console.log(folderPath);
    let name = req.query.name
    let filepath = path.join("./files", folderPath, name!.toString())

    fs.unlink(filepath, (err) => {
        if (err) throw err

        res.redirect(folderPath)
    })
});

app.post('/deleteFolder', function (req, res) {
    let name = req.query.name
    let filepath = path.join("./files", folderPath, name!.toString())
    if (fs.existsSync(filepath)) {
        fs.rm(filepath, { recursive: true }, (err) => {
            if (err) throw err

            res.redirect(folderPath)
        })
    }
});

app.post('/show/*', function (req, res) {
    let url = req.url
    res.sendFile(path.join("./files", url.slice(5)))
});

const fileIcons = [
    '3ds.png', 'aac.png', 'ai.png',
    'avi.png', 'bmp.png', 'cad.png',
    'cdr.png', 'close.png', 'css.png',
    'dat.png', 'dll.png',
    'dmg.png', 'doc.png', 'eps.png',
    'fla.png', 'flv.png', 'folder.png',
    'gif.png', 'html.png', 'indd.png',
    'iso.png', 'jpg.png', 'js.png',
    'midi.png', 'mov.png', 'mp3.png',
    'mpg.png', 'pdf.png', 'php.png',
    'png.png', 'ppt.png', 'ps.png',
    'psd.png', 'raw.png', 'sql.png',
    'svg.png', 'tif.png', 'txt.png',
    'unknown.png', 'wmv.png', 'xls.png',
    'xml.png', 'zip.png'
]
function getIcon(file: string) {
    let splitted = file.split(".")
    let obraz = "unknown.png"

    for (let i = 0; i < fileIcons.length; i++) {
        if (splitted[splitted.length - 1] == fileIcons[i].split(".")[0]) {
            obraz = String(fileIcons[i])

            return obraz
        }
    }
    return obraz
}

app.listen(PORT, function () {
    console.log("start serwera na porcie " + PORT)
})