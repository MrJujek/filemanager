import express from "express";
import formidable from "formidable";
import { engine } from "express-handlebars";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

dotenv.config();
const app = express()
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('./static'))
app.use(express.urlencoded({
    extended: true
}));
app.use('/favicon.ico', express.static('./static/icons/folder.png'));

app.engine('hbs', engine({ defaultLayout: 'main.hbs' }));
app.set('view engine', 'hbs');
app.set('views', "./views");

interface ContextInterface {
    filePath: PathLinks[]
    directories: FileToPushInterface[]
    files: FileToPushInterface[]
}
interface FileToPushInterface {
    name: string
    obraz: string
    path: string
}
interface PathLinks {
    name: string
    path: string
}
interface EditorData {
    filePath: PathLinks[]
    text: string
}

let context: ContextInterface = {
    filePath: [],
    directories: [],
    files: []
}

let allFiles: string[]
let folderPath: string

const fileToEdit = ["txt", "css", "html", "js", "ts", "json"]

app.get("/", function (req, res) {
    res.redirect("/files/")
});

app.get("/files/*", async function (req, res) {
    folderPath = decodeURI(req.url.slice(6))
    //console.log("folderPath: ", folderPath);

    fs.readdir(path.join("files", folderPath), (err, files) => {
        if (err) console.log(err)
        allFiles = files

        context = {
            filePath: [],
            directories: [],
            files: []
        }

        for (let i = 0; i < folderPath.split("/").length; i++) {
            let toPush = { name: "", path: "" }
            toPush.name = "/" + folderPath.split("/")[i]

            for (let j = 0; j <= i; j++) {
                toPush.path = path.join("/", toPush.path, folderPath.split("/")[j])
            }
            context.filePath.push(toPush)
        }

        if (context.filePath[0].path == context.filePath[1].path) {
            context.filePath = [context.filePath[0]]
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
    })

    form.parse(req, function (err, fields, files) {
        if (err) throw err
        res.redirect(path.join("files", folderPath))
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

        res.redirect(path.join("files", folderPath))
    })
})

app.post('/newFolder', function (req, res) {
    let name = req.query.name
    if (!name) {
        let time = new Date().getTime();
        name = "NewFolder" + time
    }

    let filepath = path.join("./files", folderPath, name.toString())

    if (!fs.existsSync(filepath)) {
        fs.mkdir(filepath, (err) => {
            if (err) throw err

            res.redirect(path.join("files", folderPath))
        })
    } else {
        let time = new Date().getTime();
        name += time.toString()
        filepath = path.join("./files", folderPath, name.toString())
        fs.mkdir(filepath, (err) => {
            if (err) throw err

            res.redirect(path.join("files", folderPath))
        })
    }
})

app.post('/deleteFile', function (req, res) {
    let name = req.query.name
    let filepath = path.join("./files", folderPath, name!.toString())

    fs.unlink(filepath, (err) => {
        if (err) throw err

        res.redirect(path.join("files", folderPath))
    })
});

app.post('/deleteFolder', function (req, res) {
    let name = req.query.name
    let filepath = path.join("./files", folderPath, name!.toString())
    if (fs.existsSync(filepath)) {
        fs.rm(filepath, { recursive: true }, (err) => {
            if (err) throw err

            res.redirect(path.join("files", folderPath))
        })
    }
});

app.post('/renameFolder', function (req, res) {
    let name = req.query.name

    let oldPath = folderPath.split("/")
    oldPath.pop()
    let newPath = oldPath.join("/")

    let filepath = path.join("./files", folderPath)

    if (fs.existsSync(filepath)) {
        console.log("zmiana nazwy");

        fs.rename(filepath, "./files/" + newPath + "/" + name!.toString(), (err) => {
            if (err) console.log(err)
            else {
                res.redirect(path.join("files", newPath, name!.toString()))
            }
        })
    }
});

app.post('/show/*', function (req, res) {
    let url = decodeURI(req.url)
    // console.log("/show url: ", url);

    if (fileToEdit.includes(url.split(".")[url.split(".").length - 1])) {
        res.redirect("/editor" + url.slice(5))
    } else {
        res.sendFile(path.join("/home/ubuntu/Desktop/filemanager/files", url.slice(5)))
    }
});

app.get('/editor/*', function (req, res) {
    let url = decodeURI(req.url)
    let url_path = "./files/" + url.split("/").slice(2, url.split("/").length).join("/");

    let filePath = path.join(url_path);

    let editorData: EditorData = {
        filePath: [],
        text: ""
    }

    for (let i = 0; i < filePath.split("/").length; i++) {
        let toPush = { name: "", path: "/" }
        toPush.name = "/" + filePath.split("/")[i]

        for (let j = 1; j <= i; j++) {
            toPush.path = path.join("/", toPush.path, filePath.split("/")[j])
        }
        editorData.filePath.push(toPush)
    }
    if (editorData.filePath[0].path == editorData.filePath[1].path) {
        editorData.filePath = [editorData.filePath[0]]
    }

    fs.readFile(path.join("/home/ubuntu/Desktop/filemanager/files", url.slice(7)), 'utf8', (err, data) => {
        if (err) console.error(err);

        editorData.text = data;

        res.render('editor.hbs', editorData);
    });
})

app.post('/saveFile', function (req, res) {
    let filepath = (req.body.file_path).split("/").slice(2, (req.body.file_path).split("/").length)

    fs.writeFile("./files/" + filepath, req.body.text, (err) => {
        if (err) throw err
        console.log("plik zapisany");
    })

    //res.end("File saved");
})

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