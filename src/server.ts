import express from "express";
import formidable from "formidable";
import { engine } from "express-handlebars";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";
import { JSONParser } from "formidable/parsers";

dotenv.config();
const app = express()
const PORT = process.env.PORT || 3000;
const cookieparser = require("cookie-parser");
const nocache = require("nocache");
const AdmZip = require('adm-zip');

app.use(express.json());
app.use(express.static('./static'))
app.use(express.urlencoded({
    extended: true
}));
app.use('/favicon.ico', express.static('./static/icons/folder.png'));
app.use(cookieparser())
app.use(nocache())

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
interface TextEditorData {
    filePath: PathLinks[]
    text: string
    editorColor: number
    editorFont: number
    run: boolean
}

interface ImgEditorData {
    filePath: PathLinks[]
    imgPath: string
}

interface LoggedUserSettings {
    login: string
    password: string
    editorColor: number
    editorFont: number
}

let context: ContextInterface = {
    filePath: [],
    directories: [],
    files: []
}

let allFiles: string[]
let folderPath: string

const textFilesToEdit = ["txt", "css", "html", "js", "ts", "json"]
const imgFilesToEdit = ["png", "jpg", "jpeg", "bmp", "ico"]

app.get("/", function (req, res) {
    if (req.cookies.user) {
        res.redirect("/files/")
    } else {
        res.redirect("/signin")
    }
});

app.get("/files/*", async function (req, res) {
    if (!req.cookies.user) {
        res.redirect("/signin")
    } else {
        folderPath = decodeURI(req.url.slice(6))

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
    }
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

    if (textFilesToEdit.includes(url.split(".")[url.split(".").length - 1])) {
        res.redirect("/textEditor" + url.slice(5))
    } else if (imgFilesToEdit.includes(url.split(".")[url.split(".").length - 1])) {
        res.redirect("/imgEditor" + url.slice(5))
    } else {
        res.redirect("/showFile" + url.slice(5))
    }
});

app.get('/showFile/*', function (req, res) {
    let url = decodeURI(req.url)
    console.log("/show url: ", url);

    res.sendFile(path.join("/home/ubuntu/Desktop/filemanager/files", url.slice(9)))
})

app.get('/textEditor/*', function (req, res) {
    if (!req.cookies.user) {
        res.redirect("/signin")
    } else {
        let users = require("../data/users.json")

        let loggedUserSettings: LoggedUserSettings = {
            login: "",
            password: "",
            editorColor: 0,
            editorFont: 0
        }

        for (let i = 0; i < users.users.length; i++) {
            if (JSON.parse(req.cookies.user).login == users.users[i].login) {
                console.log("user found");
                console.log("user: ", users.users[i]);
                loggedUserSettings = users.users[i]
            }
        }

        let url = decodeURI(req.url)
        let url_path = "./files/" + url.split("/").slice(2, url.split("/").length).join("/");

        let filePath = path.join(url_path);

        let textEditorData: TextEditorData = {
            filePath: [],
            text: "",
            editorColor: loggedUserSettings.editorColor,
            editorFont: loggedUserSettings.editorFont,
            run: false
        }

        for (let i = 0; i < filePath.split("/").length; i++) {
            let toPush = { name: "", path: "/" }
            toPush.name = "/" + filePath.split("/")[i]

            for (let j = 1; j <= i; j++) {
                toPush.path = path.join("/", toPush.path, filePath.split("/")[j])
            }
            textEditorData.filePath.push(toPush)
        }
        if (textEditorData.filePath[0].path == textEditorData.filePath[1].path) {
            textEditorData.filePath = [textEditorData.filePath[0]]
        }

        if (url.split(".")[url.split(".").length - 1] == "html") {
            textEditorData.run = true
        }

        fs.readFile(path.join("/home/ubuntu/Desktop/filemanager/files", url.slice(11)), 'utf8', (err, data) => {
            if (err) console.error(err);

            textEditorData.text = data;

            res.render('text_editor.hbs', textEditorData);
        });
    }
})

app.get('/imgEditor/*', function (req, res) {
    if (!req.cookies.user) {
        res.redirect("/signin")
    } else {
        let url = decodeURI(req.url)
        let url_path = "./files/" + url.split("/").slice(2, url.split("/").length).join("/");
        let filePath = path.join(url_path);

        let imgEditorData: ImgEditorData = {
            filePath: [],
            imgPath: url.split("/").slice(2, url.split("/").length).join("/")
        }

        for (let i = 0; i < filePath.split("/").length; i++) {
            let toPush = { name: "", path: "/" }
            toPush.name = "/" + filePath.split("/")[i]

            for (let j = 1; j <= i; j++) {
                toPush.path = path.join("/", toPush.path, filePath.split("/")[j])
            }
            imgEditorData.filePath.push(toPush)
        }

        if (imgEditorData.filePath[0].path == imgEditorData.filePath[1].path) {
            imgEditorData.filePath = [imgEditorData.filePath[0]]
        }

        res.render('img_editor.hbs', imgEditorData);
    }
})

app.get('/runFile/*', function (req, res) {
    let url = decodeURI(req.url)

    res.sendFile(path.join("/home/ubuntu/Desktop/filemanager/files", url.slice(8)))
})

app.post('/saveFile', function (req, res) {
    let filepath = (req.body.file_path).split("/").slice(2, (req.body.file_path).split("/").length).join("/")

    fs.writeFile("./files/" + filepath, req.body.text, (err) => {
        if (err) throw err
        console.log("plik zapisany");
    })

    res.end("File saved");
})

app.post('/renameFile', function (req, res) {
    let filepath = (req.body.file_path).split("/").slice(2, (req.body.file_path).split("/").length).join("/")
    let newName = req.body.newName

    console.log("filepath: ", filepath);
    let newPath = filepath.slice(0, filepath.length - filepath.split("/")[filepath.split("/").length - 1].length) + newName + "." + filepath.split("/")[filepath.split("/").length - 1].split(".")[filepath.split("/")[filepath.split("/").length - 1].split(".").length - 1]
    console.log("newPath: ", newPath);


    if (fs.existsSync("./files/" + filepath)) {
        console.log("zmiana nazwy");

        fs.rename("./files/" + filepath, "./files/" + newPath, (err) => {
            if (err) console.log(err)
            else {
                res.end(path.join("texteditor", newPath))
            }
        })
    }
});

app.post('/renameImage', function (req, res) {
    let filepath = (req.body.file_path).split("/").slice(2, (req.body.file_path).split("/").length).join("/")
    let newName = req.body.newName

    console.log("filepath: ", filepath);
    let newPath = filepath.slice(0, filepath.length - filepath.split("/")[filepath.split("/").length - 1].length) + newName + "." + filepath.split("/")[filepath.split("/").length - 1].split(".")[filepath.split("/")[filepath.split("/").length - 1].split(".").length - 1]
    console.log("newPath: ", newPath);


    if (fs.existsSync("./files/" + filepath)) {
        console.log("zmiana nazwy");

        fs.rename("./files/" + filepath, "./files/" + newPath, (err) => {
            if (err) console.log(err)
            else {
                res.end(path.join("imgeditor", newPath))
            }
        })
    }
});

app.post('/saveImage', function (req, res) {
    let filepath = (req.body.file_path).split("/").slice(2, (req.body.file_path).split("/").length).join("/")
    let imgData = req.body.imgData

    let base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
    //console.log("base64Data: ", base64Data.slice(0, 100));

    //fs.writeFileSync(path.join("/home/ubuntu/Desktop/filemanager/files", filepath), base64Data);

    (async () => {
        const buf = Buffer.from(base64Data, "base64");

        await fs.writeFile(path.join("/home/ubuntu/Desktop/filemanager/files", filepath), buf, err => {
            if (err) {
                console.error(err);
            }

            res.end("Image saved")
        });
    })();

    // console.log("filepath: ", filepath);
    // console.log(path.join("/home/ubuntu/Desktop/filemanager/files", filepath));

    //console.log("imgData: ", imgData);

})

app.post('/saveUserEditorSettings', function (req, res) {
    let cookie = JSON.parse(req.cookies["user"])
    let users = require("../data/users.json")

    for (let i = 0; i < users.users.length; i++) {
        if (cookie.login == users.users[i].login) {
            users.users[i].editorColor = req.body.editorColor
            users.users[i].editorFont = req.body.editorFont
        }
    }

    fs.writeFile("./data/users.json", JSON.stringify(users), (err) => {
        if (err) {
            console.log(err);

            res.end("Error")
            return
        }
        res.end("Success")
        return
    })
})

app.get('/signin', function (req, res) {
    res.render('signin.hbs')
})

app.post('/signin', function (req, res) {
    console.log("login: ", req.body.login)
    console.log("password: ", req.body.password)

    let users = require("../data/users.json")
    console.log("users: ", users.users);

    for (let i = 0; i < users.users.length; i++) {
        if (req.body.login == users.users[i].login && req.body.password == users.users[i].password) {
            res.cookie("user", JSON.stringify({ login: users.users[i].login, editorColor: users.users[i].editorColor, editorFont: users.users[i].editorFont }), { httpOnly: true, maxAge: 20 * 60 * 1000 });

            res.end("Success")
            return
        }
    }
    res.end("Wrong data")

})

app.get('/signup', function (req, res) {
    res.render('signup.hbs')
})

app.post('/signup', function (req, res) {
    let users = require("../data/users.json")

    for (let i = 0; i < users.users.length; i++) {
        if (req.body.login == users.users[i].login) {
            res.end("Wrong data")
            return
        }
    }

    users.users.push({ login: req.body.login, password: req.body.password, editorColor: 1, editorFont: 18 })

    fs.writeFile("./data/users.json", JSON.stringify(users), (err) => {
        if (err) {
            console.log(err);

            res.end("Wrong data")
            return
        }
        res.end("Success")
        return
    })
})

app.post('/zipFiles', function (req, res) {
    console.log("files_to_zip: ", req.body.files_to_zip);
    console.log("file_path: ", req.body.file_path);

    if (req.body.files_to_zip.length < 1) {
        res.end("No files to zip")
        return
    }

    let zip = new AdmZip();
    for (let i = 0; i < req.body.files_to_zip.length; i++) {
        if (fs.lstatSync("." + req.body.file_path + "/" + req.body.files_to_zip[i]).isDirectory()) {
            console.log("folder: ", "." + req.body.file_path + "/" + req.body.files_to_zip[i]);

            zip.addLocalFolder("." + req.body.file_path + "/" + req.body.files_to_zip[i], req.body.files_to_zip[i])
        } else {
            console.log("plik: ", "." + req.body.file_path + "/" + req.body.files_to_zip[i]);

            zip.addLocalFile("." + req.body.file_path + "/" + req.body.files_to_zip[i])
        }
    }

    let time = new Date().getTime();
    let zipName = time + ".zip"

    zip.writeZip(path.join("/home/ubuntu/Desktop/filemanager", req.body.file_path, zipName));

    res.end("Files zipped")
})

app.post('/logout', function (req, res) {
    res.clearCookie("user")
    res.redirect("/")
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